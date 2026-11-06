#!/usr/bin/env python3
"""
おうちボタン - Raspberry Pi 物理ボタン → お小遣い手帳 ポイント申請サービス

GPIO に接続した物理ボタンの押下を検知し、Supabase Edge Function
`button-action` を token で叩く。Edge Function 側が token から対象の子・
家事・ポイントを解決し chore_points に status='pending' で申請する（承認制）。

★設計方針（重要）:
  デバイス（ラズパイ）に持たせるのは「token と公開apikey と URL」だけ。
  子供名や家事・ポイントの割り当ては Supabase 側（button_actions テーブル /
  admin.html の管理画面）で管理する。ラズパイのコードを書き換えなくても
  管理画面から割り当て変更・有効無効・クールダウンを制御できる。
  token が漏れても「そのボタンの申請」しかできないため被害は限定的。

配線（BCMピン番号 / 内部プルアップ使用・抵抗不要）:
  ボタン片足 → GPIO（下記 BUTTONS の pin）
  ボタンもう片足 → GND
  ※ 押すと GPIO が GND に落ちる（アクティブLOW）

使い方:
  python3 button-listener.py

環境:
  - Python 3.11+
  - gpiozero (Raspberry Pi OS 同梱 / pip install gpiozero)
  - requests (pip install requests)
  - gTTS (pip install gtts) + mpg123 (apt install mpg123)  ※音声フィードバック用（任意）
"""

import os
import sys
import time
import tempfile
import subprocess
import threading
from datetime import datetime

import requests

# ============================================================
# 接続設定（公開情報のみ。common.js / 既存ラズパイと同じ）
# ============================================================
SUPABASE_URL = "https://ynecezxnltigplrfzzoh.supabase.co"
# 公開（publishable / anon）キー。フロントで既に公開されているものと同一。
# Edge Function 呼び出しの apikey として使うだけで、権限昇格はしない。
SUPABASE_ANON_KEY = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4"

BUTTON_ACTION_URL = f"{SUPABASE_URL}/functions/v1/button-action"

# 再生コマンド（MP3）
PLAYER_CMD = "mpg123"

# ソフト側の最小再受付間隔（秒）。サーバ側 cooldown とは別の二段構え。
LOCAL_DEBOUNCE_SEC = 2.0

# ============================================================
# ボタン割り当て
#   pin   : BCM GPIO番号（物理ピンではない）
#   token : button_actions.token（admin.html で生成した tok_xxx を貼る）
#   voice : 任意。ローカルで即フィードバックしたい場合の読み上げ文。
#           None の場合はサーバ応答メッセージを読み上げる。
#
# ★token だけ admin.html の管理画面からコピーして貼る。
#   子供名/家事/ポイントはサーバ側(button_actions)で管理するのでここには書かない。
# ============================================================
BUTTONS = [
    {"pin": 17, "token": "tok_REPLACE_ME_1", "voice": None},
    {"pin": 27, "token": "tok_REPLACE_ME_2", "voice": None},
]

# ============================================================
# ユーティリティ
# ============================================================

def now():
    return datetime.now().strftime("%H:%M:%S")


def speak(text):
    """日本語で音声合成して再生（失敗しても握りつぶす）"""
    if not text:
        return
    try:
        from gtts import gTTS
        tts = gTTS(text="、" + text, lang="ja", slow=False)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            tmp_path = f.name
            tts.save(tmp_path)
        subprocess.run([PLAYER_CMD, "-q", tmp_path], timeout=30)
        os.unlink(tmp_path)
        print(f"[{now()}] 🔊 読み上げ: {text}")
    except Exception as e:
        print(f"[{now()}] ❌ 読み上げエラー（非致命）: {e}", file=sys.stderr)


# ============================================================
# Edge Function 呼び出し
# ============================================================

def call_button_action(token):
    """button-action Edge Function を叩く。
    戻り値: (ok: bool, speak_text: str)
      ok は「申請できたか（appliedか）」。cooldown/disabled等は ok=False。
    """
    try:
        res = requests.post(
            BUTTON_ACTION_URL,
            headers={"Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY},
            json={"token": token},
            timeout=10,
        )
    except Exception as e:
        print(f"[{now()}] ❌ 通信エラー: {e}", file=sys.stderr)
        return False, "つうしんエラーです"

    # レスポンス本文（JSON）を解釈
    try:
        data = res.json()
    except Exception:
        data = {}

    status = data.get("status")
    if res.status_code == 200 and status == "applied":
        # サーバのメッセージ（例: 「いろはのゴミ出し（2pt）を申請しました」）を優先
        return True, data.get("message") or "しんせいしたよ"

    if res.status_code == 200 and status == "cooldown":
        return False, data.get("message") or "さっき おしたばかりだよ"

    # エラー系（disabled / invalid_token / child_not_found / apply_failed 等）
    err = data.get("error", f"http_{res.status_code}")
    print(f"[{now()}] ⚠️ 申請不可: {err} / {data}", file=sys.stderr)
    err_voice = {
        "disabled": "このボタンは いま つかえません",
        "invalid_token": "ボタンの せっていが ただしくありません",
        "child_not_found": "こどもが みつかりませんでした",
    }.get(err, "ごめんね、しんせいに しっぱいしました")
    return False, err_voice


# ============================================================
# 押下ハンドラ
# ============================================================

_last_press = {}  # pin -> last epoch sec（ローカルデバウンス）


def handle_press(btn):
    pin = btn["pin"]
    if time.time() - _last_press.get(pin, 0) < LOCAL_DEBOUNCE_SEC:
        return
    _last_press[pin] = time.time()

    token = btn["token"]
    print(f"[{now()}] 🔘 押下: GPIO{pin} (token={token[:12]}...)")

    if not token or token.startswith("tok_REPLACE_ME"):
        print(f"[{now()}] ⚠️ GPIO{pin} に token 未設定。BUTTONS を編集してください", file=sys.stderr)
        threading.Thread(target=speak, args=("ボタンが せっていされていません",), daemon=True).start()
        return

    ok, voice_text = call_button_action(token)
    say = btn.get("voice") if (ok and btn.get("voice")) else voice_text
    threading.Thread(target=speak, args=(say,), daemon=True).start()
    print(f"[{now()}] {'✅' if ok else '⏸️'} {voice_text}")


# ============================================================
# メイン
# ============================================================

def main():
    try:
        from gpiozero import Button
    except ImportError:
        print("❌ gpiozero が見つかりません。pip install gpiozero を実行してください。")
        sys.exit(1)

    print(f"[{now()}] 🔘 おうちボタン リスナー起動")
    print(f"[{now()}] 🔗 {BUTTON_ACTION_URL}")

    gpio_buttons = []
    for btn in BUTTONS:
        ready = "OK" if (btn["token"] and not btn["token"].startswith("tok_REPLACE_ME")) else "⚠️token未設定"
        print(f"[{now()}]   GPIO{btn['pin']:>2} → token={btn['token'][:16]}... [{ready}]")
        # bounce_time はハード的チャタリング対策（ソフト LOCAL_DEBOUNCE_SEC と二段構え）
        gb = Button(btn["pin"], pull_up=True, bounce_time=0.1)
        gb.when_pressed = (lambda b: lambda: handle_press(b))(btn)
        gpio_buttons.append(gb)

    print(f"[{now()}] ✅ ボタン待機中... (Ctrl+C で終了)")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n[{now()}] 👋 終了")


if __name__ == "__main__":
    main()
