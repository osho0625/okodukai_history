#!/bin/bash
# ============================================================
# kiro agent → aide-powers 移行用クリーンアップスクリプト
#
# 削除対象（ファイル単位で明示指定）:
#   - .kiro/steering/aide-powers-global-rules.md
#   - .kiro/agents/*.md (全22ファイル)
#   - AGENTS.md (ルート)
#   - aide-powers-global-rules.agents.md (ルート)
#
# 保持対象:
#   - .kiro/specs/ (仕様書)
#   - .kiro/ フォルダ自体
#   - 上記以外のすべて
# ============================================================

set -e

echo ""
echo "=== kiro agent クリーンアップスクリプト ==="
echo ""
echo "削除対象ファイル一覧:"
echo "  .kiro/steering/aide-powers-global-rules.md"
echo "  .kiro/agents/ 内 22ファイル"
echo "  AGENTS.md"
echo "  aide-powers-global-rules.agents.md"
echo ""

read -p "実行しますか？ (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "キャンセルしました。"
    exit 0
fi

echo ""
DELETED=0
SKIPPED=0

delete_file() {
    local file="$1"
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  削除: $file"
        DELETED=$((DELETED + 1))
    else
        echo "  スキップ: $file (存在しない)"
        SKIPPED=$((SKIPPED + 1))
    fi
}

# --- .kiro/steering 内 ---
echo "[steering]"
delete_file ".kiro/steering/aide-powers-global-rules.md"

# --- .kiro/agents 内 ---
echo "[agents]"
AGENT_FILES=(
    "agent-file-reviewer.md"
    "agent-file-writer.md"
    "common-skill-detail-designer.md"
    "common-skill-detail-reviewer.md"
    "flatten-analyzer.md"
    "flatten-executor.md"
    "flatten-reviewer.md"
    "migration-modifier.md"
    "migration-planner.md"
    "migration-reviewer.md"
    "migration-worker.md"
    "phase-skill-detail-designer.md"
    "phase-skill-detail-reviewer.md"
    "phase-skill-structure-designer.md"
    "phase-skill-structure-reviewer.md"
    "skill-file-reviewer.md"
    "skill-file-writer.md"
    "tech-investigator.md"
    "using-aide-powers-enhancer.md"
    "workflow-design-reviewer.md"
    "workflow-designer.md"
    "workflow-final-reviewer.md"
)

for f in "${AGENT_FILES[@]}"; do
    delete_file ".kiro/agents/$f"
done

# --- ルートファイル ---
echo "[root]"
delete_file "AGENTS.md"
delete_file "aide-powers-global-rules.agents.md"

# --- 空フォルダの削除（中身が空の場合のみ） ---
echo ""
echo "[空フォルダ確認]"
if [ -d ".kiro/agents" ] && [ -z "$(ls -A .kiro/agents 2>/dev/null)" ]; then
    rmdir ".kiro/agents"
    echo "  削除: .kiro/agents/ (空のため)"
else
    [ -d ".kiro/agents" ] && echo "  保持: .kiro/agents/ (まだファイルが残っている)"
fi

if [ -d ".kiro/steering" ] && [ -z "$(ls -A .kiro/steering 2>/dev/null)" ]; then
    rmdir ".kiro/steering"
    echo "  削除: .kiro/steering/ (空のため)"
else
    [ -d ".kiro/steering" ] && echo "  保持: .kiro/steering/ (まだファイルが残っている)"
fi

echo ""
echo "=== 完了: ${DELETED} 件削除, ${SKIPPED} 件スキップ ==="
echo ""
