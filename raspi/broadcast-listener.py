#!/usr/bin/env python3
"""
おうちブロードキャスト - Raspberry Pi 読み上げサービス

Supabase Realtime で alexa_messages テーブルを購読し、
新しいメッセージ（direction='to_alexa'）が来たら gTTS で音声合成して再生する。

使い方:
  python3 broadcast-listener.py

環境:
  - Python 3.11+
  - gTTS (pip install gtts)
  - supabase (pip install supabase)
  - mpg123 (apt install mpg123) - MP3再生用
"""

import os
import sys
import json
import time
import tempfile
import subprocess
import threading
from datetime import datetime

# --- 設定 ---
SUPABASE_URL = "https://ynecezxnltigplrfzzoh.supabase.co"
SUPABASE_KEY = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4"

# 読み上げ前に鳴らすチャイム音（なければスキップ）
CHIME_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chime.mp3")

# 再生コマンド
PLAYER_CMD = "mpg123"

# --- gTTS で音声合成 ---
def speak(text):
    """テキストを日本語で音声合成して再生"""
    try:
        from gtts import gTTS

        # チャイム音を先に再生（ファイルがあれば）
        if os.path.exists(CHIME_FILE):
            subprocess.run([PLAYER_CMD, "-q", CHIME_FILE], timeout=5)

        # 音声合成
        tts = gTTS(text=text, lang='ja', slow=False)
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            tmp_path = f.name
            tts.save(tmp_path)

        # 再生
        subprocess.run([PLAYER_CMD, "-q", tmp_path], timeout=30)

        # 一時ファイル削除
        os.unlink(tmp_path)

        print(f"[{now()}] 🔊 再生完了: {text}")
    except Exception as e:
        print(f"[{now()}] ❌ 再生エラー: {e}", file=sys.stderr)


def now():
    return datetime.now().strftime("%H:%M:%S")


# --- Supabase Realtime 購読 ---
def main():
    try:
        from supabase import create_client
    except ImportError:
        print("❌ supabase パッケージが見つかりません。pip install supabase を実行してください。")
        sys.exit(1)

    print(f"[{now()}] 📢 おうちブロードキャスト リスナー起動")
    print(f"[{now()}] 🔗 Supabase: {SUPABASE_URL}")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def on_insert(payload):
        """新しいメッセージが挿入された時のコールバック"""
        try:
            record = payload.get("record") or payload.get("new", {})
            direction = record.get("direction", "")
            message = record.get("message", "")

            if direction == "to_alexa" and message:
                print(f"[{now()}] 📨 メッセージ受信: {message}")
                # 別スレッドで再生（Realtimeコールバックをブロックしない）
                threading.Thread(target=speak, args=(message,), daemon=True).start()
        except Exception as e:
            print(f"[{now()}] ❌ コールバックエラー: {e}", file=sys.stderr)

    # Realtime購読
    channel = client.channel("broadcast-listener")
    channel.on_postgres_changes(
        event="INSERT",
        schema="public",
        table="alexa_messages",
        callback=on_insert
    )
    channel.subscribe()

    print(f"[{now()}] ✅ Realtime購読開始 - メッセージ待機中...")

    # メインスレッドを維持
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n[{now()}] 👋 終了")
        channel.unsubscribe()


if __name__ == "__main__":
    main()
