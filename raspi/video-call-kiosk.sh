#!/bin/bash
# おうちビデオ通話 ラズパイ受信端末（Chromiumキオスク）起動スクリプト
#
# 使い方:
#   1. カメラ/マイク/スピーカーの接続確認
#        v4l2-ctl --list-devices   # ウェブカメラ
#        arecord -l                # マイク（録音デバイス）
#        aplay -l                  # スピーカー（再生デバイス）
#   2. このスクリプトを実行（GUI環境が必要）
#        ./video-call-kiosk.sh
#   3. 自動起動は systemd or ~/.config/autostart/ に登録（下部コメント参照）
#
# ?mode=raspi で着信自動応答モードになる。
# 親がお小遣い手帳アプリのビデオ通話から発信すると自動で応答してテレビに映る。

set -e

URL="https://osho0625.github.io/okodukai_history/pages/video-call.html?mode=raspi"

# 画面スリープ/スクリーンセーバー無効化
if command -v xset >/dev/null 2>&1; then
  xset s off
  xset -dpms
  xset s noblank
fi

# Chromium の実行ファイル名はOSにより chromium / chromium-browser
CHROMIUM_BIN="chromium-browser"
if ! command -v "$CHROMIUM_BIN" >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium"
fi

exec "$CHROMIUM_BIN" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --use-fake-ui-for-media-stream \
  --start-fullscreen \
  "$URL"

# ------------------------------------------------------------------
# 自動起動設定（どちらか一方）
#
# [A] autostart（デスクトップ環境がある場合・簡単）
#   mkdir -p ~/.config/autostart
#   cat > ~/.config/autostart/video-call-kiosk.desktop <<'EOF'
#   [Desktop Entry]
#   Type=Application
#   Name=VideoCallKiosk
#   Exec=/home/pi/okodukai_history/raspi/video-call-kiosk.sh
#   X-GNOME-Autostart-enabled=true
#   EOF
#
# [B] systemd (--user)
#   ~/.config/systemd/user/video-call-kiosk.service を作成:
#   [Unit]
#   Description=Video Call Kiosk
#   After=graphical-session.target
#   [Service]
#   ExecStart=/home/pi/okodukai_history/raspi/video-call-kiosk.sh
#   Restart=on-failure
#   [Install]
#   WantedBy=default.target
#   その後:
#   systemctl --user enable --now video-call-kiosk.service
#
# 注意:
# - --use-fake-ui-for-media-stream はカメラ/マイク権限を自動許可する（テスト・キオスク用途向け）。
#   本番でも常時プロンプトが出ないようにこれを使うのが実用的。
# - 読み上げサービス(broadcast.service)とは別プロセスなので共存可能。
#   ただしスピーカー出力先が競合する場合は ALSA/PulseAudio の設定を確認する。
# ------------------------------------------------------------------
