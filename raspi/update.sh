#!/bin/bash
# ============================================================
# おうちブロードキャスト - 更新スクリプト
#
# 最新の broadcast-listener.py を取り込んでサービスを再起動する。
#
# 使い方（ラズパイのリポジトリ内で実行）:
#   cd okodukai_history/raspi
#   bash update.sh
#
# リポジトリをクローンしていない場合は、まず setup.sh を実行してください。
# ============================================================

set -e

APP_DIR="$HOME/broadcast"
SERVICE_NAME="broadcast"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================="
echo "🔄 おうちブロードキャスト 更新"
echo "========================================="

# 1. リポジトリを最新化（gitリポジトリ内で実行された場合のみ）
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

# 2. 読み上げスクリプトが存在するか確認
echo "[2/4] 読み上げスクリプトを確認..."
if [ ! -f "$SCRIPT_DIR/broadcast-listener.py" ]; then
  echo "  ❌ broadcast-listener.py が見つかりません: $SCRIPT_DIR"
  echo "     setup.sh を先に実行するか、リポジトリ内で実行してください。"
  exit 1
fi

# 3. アプリディレクトリへコピー（バックアップを取ってから上書き）
echo "[3/4] $APP_DIR へ配置..."
mkdir -p "$APP_DIR"
if [ -f "$APP_DIR/broadcast-listener.py" ]; then
  cp "$APP_DIR/broadcast-listener.py" "$APP_DIR/broadcast-listener.py.bak"
  echo "  既存ファイルを broadcast-listener.py.bak にバックアップしました。"
fi
cp "$SCRIPT_DIR/broadcast-listener.py" "$APP_DIR/broadcast-listener.py"

# 3b. speaker-test（頭切れ対策で使用）が無ければ導入を試みる
if ! command -v speaker-test > /dev/null 2>&1; then
  echo "  speaker-test が見つかりません。alsa-utils を導入します（頭切れ対策に使用）..."
  sudo apt-get install -y -qq alsa-utils > /dev/null 2>&1 || {
    echo "  ⚠️  alsa-utils の導入に失敗しました。speaker-test なしでも動作します（0.3秒待機でフォールバック）。"
  }
fi

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
  echo "  ⚠️  $SERVICE_NAME サービスが登録されていません。setup.sh を先に実行してください。"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ 更新完了！"
echo ""
echo "ログを確認:"
echo "  journalctl -u $SERVICE_NAME -f"
echo "========================================="
