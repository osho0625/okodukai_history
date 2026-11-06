#!/bin/bash
# ============================================================
# おうちボタン - Raspberry Pi セットアップスクリプト
#
# GPIO物理ボタン → お小遣い手帳 ポイント申請サービスを常駐登録する。
# 既存の broadcast サービスとは別プロセスなので共存できる。
#
# 使い方: SSHでラズパイに接続して以下を実行
#   git clone https://github.com/osho0625/okodukai_history.git
#   cd okodukai_history/raspi
#   bash button-setup.sh
# ============================================================

set -e

echo "========================================="
echo "🔘 おうちボタン セットアップ"
echo "========================================="

# 1. 必要パッケージ
echo ""
echo "[1/5] パッケージインストール..."
sudo apt-get update -qq
sudo apt-get install -y -qq python3-pip python3-venv mpg123 python3-gpiozero > /dev/null 2>&1

# 2. アプリディレクトリ作成
echo "[2/5] アプリディレクトリ作成..."
APP_DIR="$HOME/button"
mkdir -p "$APP_DIR"

# 3. Python仮想環境 & ライブラリ
#    gpiozero はシステムの lgpio/RPi.GPIO に依存するため system-site-packages で作る
echo "[3/5] Python環境セットアップ..."
python3 -m venv --system-site-packages "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install --quiet gtts requests

# 4. ボタンスクリプトをコピー
echo "[4/5] ボタンサービス配置..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/button-listener.py" ]; then
  cp "$SCRIPT_DIR/button-listener.py" "$APP_DIR/button-listener.py"
else
  echo "  ⚠️  button-listener.py が見つかりません。手動でコピーしてください。"
  echo "  配置先: $APP_DIR/button-listener.py"
fi

# 5. systemdサービス登録
echo "[5/5] 自動起動サービス登録..."
sudo tee /etc/systemd/system/button.service > /dev/null << EOF
[Unit]
Description=おうちボタン ポイント申請サービス
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/venv/bin/python $APP_DIR/button-listener.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable button.service

echo ""
echo "========================================="
echo "✅ セットアップ完了！"
echo ""
echo "配線（BCMピン・内部プルアップ使用・抵抗不要）:"
echo "  ボタン1: GPIO17 (物理11番) ←→ GND (物理9番)"
echo "  ボタン2: GPIO27 (物理13番) ←→ GND (物理14番 など)"
echo ""
echo "次のステップ:"
echo "  1. admin.html の「🔘 IoTボタン管理」でボタンを登録し token を発行"
echo "  2. token を listener に貼る:"
echo "     nano $APP_DIR/button-listener.py   # BUTTONS の token を編集"
echo "     ※ 子供名/家事/ポイントはサーバ側(button_actions)で管理。ここは token だけ"
echo "     ※ 編集したら: sudo systemctl restart button"
echo ""
echo "  3. サービスを開始:"
echo "     sudo systemctl start button"
echo ""
echo "  4. ログを確認（押してみる）:"
echo "     journalctl -u button -f"
echo "========================================="
