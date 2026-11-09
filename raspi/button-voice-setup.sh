#!/bin/bash
# ============================================================
# おうちボタン 音声リスナー - Raspberry Pi セットアップスクリプト
#
# 無線ボタン（ESP32等）→ Supabase button-action 申請 → button_action_logs を
# このラズパイが Realtime 購読して読み上げる（案B / result='applied' のみ）。
#
# 既存の broadcast サービスとは別プロセスなので共存できる。
#
# 使い方:
#   git clone https://github.com/osho0625/okodukai_history.git
#   cd okodukai_history/raspi
#   bash button-voice-setup.sh
# ============================================================

set -e

APP_DIR="$HOME/button-voice"
SERVICE_NAME="button-voice"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "🔘 おうちボタン 音声リスナー セットアップ"
echo "========================================="

echo ""
echo "[1/5] システム更新 & パッケージインストール..."
sudo apt-get update -qq
sudo apt-get install -y -qq python3-pip python3-venv mpg123 alsa-utils > /dev/null 2>&1

echo "[2/5] アプリディレクトリ作成..."
mkdir -p "$APP_DIR"

echo "[3/5] Python環境セットアップ..."
python3 -m venv "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install --quiet gtts supabase

echo "[4/5] 音声リスナー配置..."
if [ -f "$SCRIPT_DIR/button-voice-listener.py" ]; then
  cp "$SCRIPT_DIR/button-voice-listener.py" "$APP_DIR/button-voice-listener.py"
else
  echo "  ❌ button-voice-listener.py が見つかりません: $SCRIPT_DIR"
  exit 1
fi
# チャイム音があれば一緒に配置（任意）
if [ -f "$SCRIPT_DIR/chime.mp3" ]; then
  cp "$SCRIPT_DIR/chime.mp3" "$APP_DIR/chime.mp3"
fi

echo "[5/5] 自動起動サービス登録..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null << EOF
[Unit]
Description=おうちボタン 音声リスナー（button_action_logs 購読）
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/venv/bin/python $APP_DIR/button-voice-listener.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service

echo ""
echo "========================================="
echo "✅ セットアップ完了！"
echo ""
echo "次のステップ:"
echo "  1. サービスを開始:"
echo "     sudo systemctl start ${SERVICE_NAME}"
echo ""
echo "  2. ログを確認:"
echo "     journalctl -u ${SERVICE_NAME} -f"
echo ""
echo "  3. 無線ボタンを押す → スピーカーから読み上げられれば成功"
echo "========================================="
