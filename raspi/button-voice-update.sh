#!/bin/bash
# ============================================================
# おうちボタン 音声リスナー - 更新スクリプト
#
# 会社PC等から GitHub にpushしたコードを、ラズパイに取り込んで再起動する。
#
# 使い方（ラズパイのリポジトリ内で実行）:
#   cd okodukai_history/raspi
#   bash button-voice-update.sh
#
# 初回は button-voice-setup.sh を先に実行しておくこと。
# ============================================================

set -e

APP_DIR="$HOME/button-voice"
SERVICE_NAME="button-voice"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================="
echo "🔄 おうちボタン 音声リスナー 更新"
echo "========================================="

# 1. リポジトリを最新化
if [ -d "$REPO_ROOT/.git" ]; then
  echo ""
  echo "[1/4] リポジトリを最新化 (git pull)..."
  git -C "$REPO_ROOT" pull --ff-only origin main || {
    echo "  ⚠️  git pull に失敗しました。ローカルのファイルで更新を続行します。"
  }
else
  echo ""
  echo "[1/4] gitリポジトリではないため pull はスキップ（ローカルファイルを使用）"
fi

# 2. リスナースクリプトの存在確認
echo "[2/4] 音声リスナーを確認..."
if [ ! -f "$SCRIPT_DIR/button-voice-listener.py" ]; then
  echo "  ❌ button-voice-listener.py が見つかりません: $SCRIPT_DIR"
  echo "     button-voice-setup.sh を先に実行するか、リポジトリ内で実行してください。"
  exit 1
fi

# 3. 配置（バックアップを取ってから上書き）
echo "[3/4] $APP_DIR へ配置..."
mkdir -p "$APP_DIR"
if [ -f "$APP_DIR/button-voice-listener.py" ]; then
  cp "$APP_DIR/button-voice-listener.py" "$APP_DIR/button-voice-listener.py.bak"
  echo "  既存ファイルを button-voice-listener.py.bak にバックアップしました。"
fi
cp "$SCRIPT_DIR/button-voice-listener.py" "$APP_DIR/button-voice-listener.py"

# 4. サービス再起動
echo "[4/4] サービスを再起動..."
if systemctl list-unit-files | grep -q "^${SERVICE_NAME}.service"; then
  sudo systemctl restart "$SERVICE_NAME"
  sleep 1
  if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "  ✅ $SERVICE_NAME サービスが正常に再起動しました。"
  else
    echo "  ❌ サービスが起動していません。ログを確認してください:"
    echo "     journalctl -u $SERVICE_NAME -n 30 --no-pager"
    exit 1
  fi
else
  echo "  ⚠️  $SERVICE_NAME サービスが未登録です。button-voice-setup.sh を先に実行してください。"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ 更新完了！"
echo ""
echo "ログを確認:"
echo "  journalctl -u $SERVICE_NAME -f"
echo "========================================="
