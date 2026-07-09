#!/usr/bin/env bash
# aide-powers セットアップスクリプト (Linux/Mac/WSL)
# グローバルインストール: 各プラットフォームのホームディレクトリに配置

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "aide-powers セットアップ"
echo "========================"
echo "コピー元: $SCRIPT_DIR"
echo ""
# 第1引数が指定されている場合は非対話モード
if [ -n "$1" ]; then
    choice="$1"
    NON_INTERACTIVE=1
else
    echo "インストール先を選択してください:"
    echo "  1. Kiro IDE / Kiro CLI"
    echo "  2. Claude Code"
    echo "  3. Cursor"
    echo "  4. Copilot CLI"
    echo "  5. VSCode GitHub Copilot"
    echo "  6. Gemini CLI"
    echo "  7. Codex"
    echo "  8. 全部"
    echo "  0. キャンセル"
    echo ""
    printf "選択 [0-8]: "
    read -r choice
fi

# ============================================================
# 共通関数
# ============================================================

cleanup_legacy_skills() {
    # 旧ワークフロー構造のフォルダを削除（フラット化前の残骸）
    local dir="$1"
    [ -d "$dir/design-workflow" ] && rm -rf "$dir/design-workflow"
    [ -d "$dir/bugfix-workflow" ] && rm -rf "$dir/bugfix-workflow"
    [ -d "$dir/change-workflow" ] && rm -rf "$dir/change-workflow"
    [ -d "$dir/impl-workflow" ] && rm -rf "$dir/impl-workflow"
    [ -d "$dir/planning-workflow" ] && rm -rf "$dir/planning-workflow"
    [ -d "$dir/refactoring-workflow" ] && rm -rf "$dir/refactoring-workflow"
    [ -d "$dir/reverse-design-workflow" ] && rm -rf "$dir/reverse-design-workflow"
    [ -d "$dir/skills" ] && rm -rf "$dir/skills"
    # フェーズ構成変更で廃止されたフェーズスキルが残らないよう、phase 単位でワイルドカード削除
    rm -rf "$dir"/fs-planning-phase*
    rm -rf "$dir"/fs-design-phase*
    rm -rf "$dir"/fs-reverse-phase*
    rm -rf "$dir"/fs-impl-phase*
    rm -rf "$dir"/fs-change-phase*
    rm -rf "$dir"/fs-bugfix-phase*
    rm -rf "$dir"/fs-refactoring-phase*
}

copy_with_confirm() {
    # 置き換え方式のため上書き確認は行わない（最新版を無条件で上書き配布）
    local src="$1"
    local dst="$2"
    mkdir -p "$dst"
    cp -r "$src"/* "$dst"/
    echo "  コピー完了: $dst"
}

# ============================================================
# 1. Kiro IDE / Kiro CLI
# ============================================================
install_kiro() {
    echo ""
    echo "--- Kiro IDE / Kiro CLI ---"
    local KIRO_DIR="$HOME/.kiro"

    if [ ! -d "$KIRO_DIR" ]; then
        echo "  警告: $KIRO_DIR が見つかりません。作成します。"
        mkdir -p "$KIRO_DIR"
    fi

    # 旧構造クリーンアップ
    cleanup_legacy_skills "$KIRO_DIR/skills"

    # steering ブートストラップのコピー（リポジトリ内テンプレートから）
    echo "  steering ブートストラップをコピー中..."
    mkdir -p "$KIRO_DIR/steering"
    if [ -f "$SCRIPT_DIR/steering/aide-powers-bootstrap.md" ]; then
        cp "$SCRIPT_DIR/steering/aide-powers-bootstrap.md" "$KIRO_DIR/steering/aide-powers-bootstrap.md"
        echo "  コピー完了: $KIRO_DIR/steering/aide-powers-bootstrap.md"
    else
        echo "  警告: $SCRIPT_DIR/steering/aide-powers-bootstrap.md が見つかりません"
    fi

    # skills のコピー
    echo "  skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$KIRO_DIR/skills"

    # agents のコピー（Kiro用: agents/kiro/ を配置）
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents/kiro" "$KIRO_DIR/agents"

    echo "  Kiro IDE / Kiro CLI: 完了"
}

# ============================================================
# 2. Claude Code
# ============================================================
install_claude_code() {
    echo ""
    echo "--- Claude Code ---"
    local CLAUDE_DIR="$HOME/.claude"

    # hooks のコピー
    echo "  hooks/ をコピー中..."
    mkdir -p "$CLAUDE_DIR"
    copy_with_confirm "$SCRIPT_DIR/hooks" "$CLAUDE_DIR/hooks"

    # 旧構造クリーンアップ
    cleanup_legacy_skills "$CLAUDE_DIR/skills"

    # skills のコピー
    echo "  skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$CLAUDE_DIR/skills"

    # agents のコピー
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents" "$CLAUDE_DIR/agents"

    # rules のコピー（ブートストラップ）
    echo "  rules/ をコピー中..."
    mkdir -p "$CLAUDE_DIR/rules"
    cp "$SCRIPT_DIR/rules/aide-powers-bootstrap.md" "$CLAUDE_DIR/rules/aide-powers-bootstrap.md"
    echo "  コピー完了: $CLAUDE_DIR/rules/aide-powers-bootstrap.md"

    echo ""
    echo "  注意: hooks による SessionStart 注入はプラグインインストール時のみ有効です。"
    echo "  手動コピーでは hooks は機能しません。"
    echo "  プラグインとしてインストールする場合は以下を実行してください:"
    echo "    claude plugin install $SCRIPT_DIR"
    echo ""
    echo "  Claude Code: 完了"
}

# ============================================================
# 3. Cursor
# ============================================================
install_cursor() {
    echo ""
    echo "--- Cursor ---"
    local CURSOR_DIR="$HOME/.cursor"

    mkdir -p "$CURSOR_DIR/rules"
    echo "  rules/ をコピー中..."
    cp "$SCRIPT_DIR/rules/aide-powers-bootstrap.mdc" "$CURSOR_DIR/rules/aide-powers-bootstrap.mdc"
    echo "  コピー完了: $CURSOR_DIR/rules/aide-powers-bootstrap.mdc"

    echo "  Cursor: 完了"
}

# ============================================================
# 4. Copilot CLI
# ============================================================
install_copilot_cli() {
    echo ""
    echo "--- Copilot CLI ---"
    local COPILOT_DIR="$HOME/.copilot"

    # 旧構造クリーンアップ
    cleanup_legacy_skills "$COPILOT_DIR/skills/aide-powers"

    # skills のコピー
    echo "  skills/ をコピー中..."
    mkdir -p "$COPILOT_DIR/skills/aide-powers"
    copy_with_confirm "$SCRIPT_DIR/skills" "$COPILOT_DIR/skills/aide-powers"

    # agents のコピー
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents" "$COPILOT_DIR/agents"

    # hooks のコピー
    echo "  hooks/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/hooks" "$COPILOT_DIR/hooks"

    # instructions のコピー（ブートストラップ）
    echo "  instructions/ をコピー中..."
    mkdir -p "$COPILOT_DIR/instructions"
    cp "$SCRIPT_DIR/instructions/aide-powers-bootstrap.instructions.md" "$COPILOT_DIR/instructions/aide-powers-bootstrap.instructions.md"
    echo "  コピー完了: $COPILOT_DIR/instructions/aide-powers-bootstrap.instructions.md"

    echo ""
    echo "  Copilot CLI: 完了"
}

# ============================================================
# 5. VSCode GitHub Copilot
# ============================================================
install_vscode_copilot() {
    echo ""
    echo "--- VSCode GitHub Copilot ---"
    local COPILOT_DIR="$HOME/.copilot"

    # 旧構造クリーンアップ
    cleanup_legacy_skills "$COPILOT_DIR/skills/aide-powers"

    # skills のコピー
    echo "  skills/ をコピー中..."
    mkdir -p "$COPILOT_DIR/skills/aide-powers"
    copy_with_confirm "$SCRIPT_DIR/skills" "$COPILOT_DIR/skills/aide-powers"

    # agents のコピー
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents" "$COPILOT_DIR/agents"

    # hooks のコピー
    echo "  hooks/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/hooks" "$COPILOT_DIR/hooks"

    # VSCode settings.json に hookFilesLocations を追加
    echo "  VSCode settings.json に hooks 検索パスを追加中..."
    local VSCODE_SETTINGS
    if [ "$(uname -s)" = "Darwin" ]; then
        VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
    else
        VSCODE_SETTINGS="$HOME/.config/Code/User/settings.json"
    fi

    if [ -f "$VSCODE_SETTINGS" ]; then
        if grep -q "chat.hookFilesLocations" "$VSCODE_SETTINGS"; then
            if ! grep -q '~/.copilot/hooks' "$VSCODE_SETTINGS"; then
                # 既存の hookFilesLocations に追加（簡易的な sed 置換）
                sed -i.bak 's/"chat.hookFilesLocations"[[:space:]]*:[[:space:]]*{/"chat.hookFilesLocations": {\n    "~\/.copilot\/hooks": true,/' "$VSCODE_SETTINGS"
                echo "  完了: chat.hookFilesLocations に ~/.copilot/hooks を追加"
            else
                echo "  既に設定済み: ~/.copilot/hooks"
            fi
        else
            # hookFilesLocations が存在しない場合、ファイル末尾の } の前に追加
            sed -i.bak '$ s/}$/,\n  "chat.hookFilesLocations": {\n    "~\/.copilot\/hooks": true\n  }\n}/' "$VSCODE_SETTINGS"
            echo "  完了: chat.hookFilesLocations を追加"
        fi
    else
        echo "  警告: $VSCODE_SETTINGS が見つかりません（VSCode未インストール？）"
    fi

    echo ""
    echo "  VSCode GitHub Copilot: 完了"
}

# ============================================================
# 6. Gemini CLI
# ============================================================
install_gemini() {
    echo ""
    echo "--- Gemini CLI ---"
    echo ""
    echo "  Gemini CLI ではエクステンションとしてインストールします。"
    echo ""
    echo "  ローカル開発（リンク）:"
    echo "    cd $SCRIPT_DIR"
    echo "    gemini extensions link ."
    echo ""
    echo "  リモートインストール:"
    echo "    gemini extensions install <repository-url>"
    echo ""
    echo "  Gemini CLI: 案内完了"
}

# ============================================================
# 7. Codex
# ============================================================
install_codex() {
    echo ""
    echo "--- Codex ---"
    local AGENTS_DIR="$HOME/.agents/skills/aide-powers"

    # 旧構造クリーンアップ
    cleanup_legacy_skills "$AGENTS_DIR"

    # skills のコピー
    echo "  skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$AGENTS_DIR"

    # agents のコピー（~/.agents/agents/ に配置）
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents" "$HOME/.agents/agents/aide-powers"

    echo ""
    echo "  Codex: 完了"
}

# ============================================================
# メイン処理
# ============================================================
case "$choice" in
    1) install_kiro ;;
    2) install_claude_code ;;
    3) install_cursor ;;
    4) install_copilot_cli ;;
    5) install_vscode_copilot ;;
    6) install_gemini ;;
    7) install_codex ;;
    8)
        install_kiro
        install_claude_code
        install_cursor
        install_copilot_cli
        install_vscode_copilot
        install_gemini
        install_codex
        ;;
    0)
        echo "キャンセルしました。"
        exit 0
        ;;
    *)
        echo "無効な選択です。"
        exit 1
        ;;
esac

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "各プラットフォームを再起動してスキルを有効化してください。"

if [ -z "$NON_INTERACTIVE" ]; then
    echo ""
    echo "何かキーを押してください..."
    read -n 1
fi
exit 0
