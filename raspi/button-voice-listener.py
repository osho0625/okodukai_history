#!/usr/bin/env python3
"""
おうちボタン 音声リスナー - Raspberry Pi 読み上げサービス（案B / 無線ボタン対応）

無線の電池式ボタン（ESP32等）が Supabase Edge Function `button-action` を叩くと、
サーバ側が chore_points に申請し、同時に button_action_logs へ結果を記録する。
このスクリプトは button_action_logs を Supabase Realtime で購読し、
result='applied'（申請成功）の行が入ったらスピーカーで読み上げる。

GPIO直結の button-listener.py と違い、ボタンがラズパイに繋がっていなくても、
無線ボタンの申請を家じゅうのスピーカーでアナウンスできる。

購読対象:
  テーブル : button_action_logs
  条件     : result == 'applied' のみ読み上げ
             （cooldown / disabled / not_found / error は読み上げない）

使い方:
  python3 button-voice-listener.py

環境:
  - Python 3.11+
  - gTTS (pip install gtts)
  - supabase (pip install supabase)
  - mpg123 (apt install mpg123) - MP3再生用
"""

import os
import sys
import time
import tempfile
import subprocess
import threading
from datetime import datetime

# --- 設定（公開情報のみ。既存ラズパイと同じ） ---
SUPABASE_URL = "https://ynecezxnltigplrfzzoh.supabase.co"
SUPABASE_KEY = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4"

# 読み上げ前に鳴らすチャイム音（なければスキップ）
CHIME_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chime.mp3")

# 再生コマンド（MP3）
PLAYER_CMD = "mpg123"

# 読み上げる result の種類。applied（申請成功）のみを対象にする。
SPEAK_RESULTS = {"applied"}


def now():
    return datetime.now().strftime("%H:%M:%S")


# --- 読み上げ文の組み立て ---
def build_message(record):
    """button_action_logs の1行から読み上げ文を作る。

    カラム（sql/button_actions.sql 参照）:
      label, child_name, chore_name, points, result, created_at
    """
    child = (record.get("child_name") or "").strip()
    chore = (record.get("chore_name") or "").strip()
    points = record.get("points")

    # 子・家事がそろっていれば自然文で、欠けていれば分かる範囲で読む
    if child and chore:
        base = f"{child}が、{chore}を もうしこみました"
    elif chore:
        base = f"{chore}を もうしこみました"
    elif child:
        base = f"{child}が、ポイントを もうしこみました"
    else:
        base = "ポイントの もうしこみが ありました"

    if isinstance(points, int) and points > 0:
        base += f"。{points}ポイントです"

    return base


# --- gTTS で音声合成して再生 ---
def speak(text):
    """テキストを日本語で音声合成して再生（失敗しても握りつぶす）"""
    if not text:
        return
    try:
        from gtts import gTTS

        # スピーカーを先に起こして発話の頭切れを防ぐ（broadcast-listener.py と同方針）
        if os.path.exists(CHIME_FILE):
            subprocess.run([PLAYER_CMD, "-q", CHIME_FILE], timeout=5)
        else:
            try:
                subprocess.run(
                    ["speaker-test", "-t", "sine", "-f", "1", "-l", "1", "-p", "1"],
                    timeout=2,
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
            except Exception:
                pass
            time.sleep(0.3)

        # 先頭に読点を足して前置きの頭切れを吸収
        tts = gTTS(text="、、" + text, lang="ja", slow=False)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            tmp_path = f.name
            tts.save(tmp_path)

        subprocess.run([PLAYER_CMD, "-q", tmp_path], timeout=30)
        os.unlink(tmp_path)
        print(f"[{now()}] 🔊 再生完了: {text}")
    except Exception as e:
        print(f"[{now()}] ❌ 再生エラー（非致命）: {e}", file=sys.stderr)


# --- Supabase Realtime 購読 ---
def main():
    try:
        from supabase import create_client
    except ImportError:
        print("❌ supabase パッケージが見つかりません。pip install supabase を実行してください。")
        sys.exit(1)

    print(f"[{now()}] 🔘 おうちボタン 音声リスナー起動")
    print(f"[{now()}] 🔗 Supabase: {SUPABASE_URL}")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def on_insert(payload):
        """button_action_logs に新しい行が入った時のコールバック"""
        try:
            record = payload.get("record") or payload.get("new", {})
            result = (record.get("result") or "").strip()

            if result not in SPEAK_RESULTS:
                # cooldown / disabled / not_found / error 等は読み上げない
                print(f"[{now()}] ⏭️ スキップ (result={result or 'unknown'})")
                return

            message = build_message(record)
            print(f"[{now()}] 📨 ボタン申請: {message}")
            # 別スレッドで再生（Realtimeコールバックをブロックしない）
            threading.Thread(target=speak, args=(message,), daemon=True).start()
        except Exception as e:
            print(f"[{now()}] ❌ コールバックエラー: {e}", file=sys.stderr)

    channel = client.channel("button-voice-listener")
    channel.on_postgres_changes(
        event="INSERT",
        schema="public",
        table="button_action_logs",
        callback=on_insert,
    )
    channel.subscribe()

    print(f"[{now()}] ✅ Realtime購読開始 - ボタン申請を待機中...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n[{now()}] 👋 終了")
        channel.unsubscribe()


if __name__ == "__main__":
    main()
