#!/bin/bash
# ============================================================
# おうちブロードキャスト - Raspberry Pi セットアップスクリプト
# 
# 使い方: SSHでラズパイに接続して以下を実行
#   curl -sSL https://raw.githubusercontent.com/osho0625/okodukai_history/main/raspi/setup.sh | bash
#
# または、リポジトリをクローンして:
#   git clone https://github.com/osho0625/okodukai_history.git
#   cd okodukai_history/raspi
#   bash setup.sh
# ============================================================

set -e

echo "========================================="
echo "📢 おうちブロードキャスト セットアップ"
echo "========================================="

# 1. システム更新 & 必要パッケージ
echo ""
echo "[1/5] システム更新 & パッケージインストール..."
sudo apt-get update -qq
sudo apt-get install -y -qq python3-pip python3-venv mpg123 > /dev/null 2>&1

# 2. アプリディレクトリ作成
echo "[2/5] アプリディレクトリ作成..."
APP_DIR="$HOME/broadcast"
mkdir -p "$APP_DIR"

# 3. Python仮想環境 & ライブラリ
echo "[3/5] Python環境セットアップ..."
python3 -m venv "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install --quiet gtts supabase

# 4. 読み上げスクリプトをコピー
echo "[4/5] 読み上げサービス配置..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/broadcast-listener.py" ]; then
  cp "$SCRIPT_DIR/broadcast-listener.py" "$APP_DIR/broadcast-listener.py"
else
  echo "  ⚠️  broadcast-listener.py が見つかりません。手動でコピーしてください。"
  echo "  配置先: $APP_DIR/broadcast-listener.py"
fi

# 5. systemdサービス登録
echo "[5/5] 自動起動サービス登録..."
sudo tee /etc/systemd/system/broadcast.service > /dev/null << EOF
[Unit]
Description=おうちブロードキャスト 読み上げサービス
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/venv/bin/python $APP_DIR/broadcast-listener.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable broadcast.service

echo ""
echo "========================================="
echo "✅ セットアップ完了！"
echo ""
echo "次のステップ:"
echo "  1. サービスを開始:"
echo "     sudo systemctl start broadcast"
echo ""
echo "  2. ログを確認:"
echo "     journalctl -u broadcast -f"
echo ""
echo "  3. 音量調整（0-100）:"
echo "     amixer set Master 80%"
echo "========================================="
