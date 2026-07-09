#!/usr/bin/env bash
# aide-powers ローカルセットアップスクリプト (Linux/Mac/WSL)
# カレントディレクトリ（またはプロジェクトパス）の .kiro/skills/ 等にコピー
# チーム共有用（リポジトリにコミット可能）

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 引数チェック
if [ -z "$1" ]; then
    TARGET_DIR="$(pwd)"
else
    TARGET_DIR="$(cd "$1" && pwd)"
fi

echo ""
echo "aide-powers ローカルセットアップ"
echo "================================"
echo "コピー元: $SCRIPT_DIR"
echo "コピー先: $TARGET_DIR"
echo ""
echo "インストール先を選択してください:"
echo "  1. Kiro IDE（.kiro/skills/ + .kiro/agents/ + .kiro/steering/）"
echo "  2. Claude Code（.claude-plugin/ 形式）"
echo "  3. VSCode Copilot（.github/skills/ 形式）"
echo "  4. 全部"
echo "  0. キャンセル"
echo ""
# 第2引数が指定されている場合は非対話モード（APM 経由等）
if [ -n "$2" ]; then
    choice="$2"
    NON_INTERACTIVE=1
else
    printf "選択 [0-4]: "
    read -r choice
    NON_INTERACTIVE=0
fi

# ============================================================
# 共通関数
# ============================================================

copy_with_confirm() {
    # 置き換え方式のため上書き確認は行わない（最新版を無条件で上書き配布）
    local src="$1"
    local dst="$2"
    mkdir -p "$dst"
    cp -r "$src"/* "$dst"/
    echo "  コピー完了: $dst"
}

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

# ============================================================
# 1. Kiro IDE ローカル
# ============================================================
install_kiro_local() {
    echo ""
    echo "--- Kiro IDE ローカル ---"
    local KIRO_DIR="$TARGET_DIR/.kiro"

    # 旧構造・廃止フェーズスキルのクリーンアップ（置き換え方式）
    cleanup_legacy_skills "$KIRO_DIR/skills"

    # skills のコピー
    echo "  skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$KIRO_DIR/skills"

    # agents のコピー（Kiro用: agents/kiro/ を配置）
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents/kiro" "$KIRO_DIR/agents"

    # steering のコピー
    echo "  steering/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/steering" "$KIRO_DIR/steering"

    # AGENTS.md のコピー
    if [ -f "$SCRIPT_DIR/AGENTS.md" ]; then
        echo "  AGENTS.md をコピー中..."
        if [ -f "$TARGET_DIR/AGENTS.md" ]; then
            if [ "$NON_INTERACTIVE" = "1" ]; then
                # 非対話モード: 自動上書き
                echo "  上書き: AGENTS.md（非対話モード）"
                cp "$SCRIPT_DIR/AGENTS.md" "$TARGET_DIR/AGENTS.md"
            else
                printf "  既存の AGENTS.md を上書きしますか？ [y/N]: "
                read -r yn
                case "$yn" in
                    [Yy]*) cp "$SCRIPT_DIR/AGENTS.md" "$TARGET_DIR/AGENTS.md" ;;
                    *) echo "  スキップ: AGENTS.md" ;;
                esac
            fi
        else
            cp "$SCRIPT_DIR/AGENTS.md" "$TARGET_DIR/AGENTS.md"
        fi
        echo "  完了"
    fi

    echo "  Kiro IDE ローカル: 完了"
}

# ============================================================
# 2. Claude Code ローカル（.claude-plugin 形式）
# ============================================================
install_claude_local() {
    echo ""
    echo "--- Claude Code ローカル ---"

    # 旧構造・廃止フェーズスキルのクリーンアップ（置き換え方式）
    cleanup_legacy_skills "$TARGET_DIR/skills"

    # skills のコピー
    echo "  skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$TARGET_DIR/skills"

    # agents のコピー
    echo "  agents/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/agents" "$TARGET_DIR/agents"

    # hooks のコピー
    echo "  hooks/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/hooks" "$TARGET_DIR/hooks"

    # .claude-plugin のコピー
    echo "  .claude-plugin/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/.claude-plugin" "$TARGET_DIR/.claude-plugin"

    # rules のコピー（ブートストラップ）
    echo "  .claude/rules/ をコピー中..."
    mkdir -p "$TARGET_DIR/.claude/rules"
    cp "$SCRIPT_DIR/rules/aide-powers-bootstrap.md" "$TARGET_DIR/.claude/rules/aide-powers-bootstrap.md"
    echo "  コピー完了: $TARGET_DIR/.claude/rules/aide-powers-bootstrap.md"

    echo "  Claude Code ローカル: 完了"
}

# ============================================================
# 3. VSCode Copilot ローカル（.github/skills/ 形式）
# ============================================================
install_copilot_local() {
    echo ""
    echo "--- VSCode Copilot ローカル ---"

    # 旧構造・廃止フェーズスキルのクリーンアップ（置き換え方式）
    cleanup_legacy_skills "$TARGET_DIR/.github/skills"

    # skills のコピー
    echo "  .github/skills/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/skills" "$TARGET_DIR/.github/skills"

    # hooks のコピー
    echo "  .github/hooks/ をコピー中..."
    copy_with_confirm "$SCRIPT_DIR/hooks" "$TARGET_DIR/.github/hooks"

    # instructions のコピー（ブートストラップ）
    echo "  .github/instructions/ をコピー中..."
    mkdir -p "$TARGET_DIR/.github/instructions"
    cp "$SCRIPT_DIR/instructions/aide-powers-bootstrap.instructions.md" "$TARGET_DIR/.github/instructions/aide-powers-bootstrap.instructions.md"
    echo "  コピー完了: aide-powers-bootstrap.instructions.md"

    echo "  VSCode Copilot ローカル: 完了"
}

# ============================================================
# メイン処理
# ============================================================
case "$choice" in
    1) install_kiro_local ;;
    2) install_claude_local ;;
    3) install_copilot_local ;;
    4)
        install_kiro_local
        install_claude_local
        install_copilot_local
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
echo "=== ローカルセットアップ完了 ==="
echo ""
echo "プロジェクト $TARGET_DIR にローカル設定を配置しました。"
echo "リポジトリにコミットすればチームで共有できます。"
exit 0
