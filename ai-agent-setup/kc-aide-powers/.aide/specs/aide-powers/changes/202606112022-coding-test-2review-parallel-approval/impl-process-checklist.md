# 工程チェック表

## 凡例

| 記号 | 意味 |
|---|---|
| ⬜ todo | 未着手 |
| 🔄 in-progress | 実行中 |
| ✅ done | 完了 |
| ❌ failed | 失敗 |
| ➖ skip | 対象外（非プログラム成果物のためスキップ） |

## 工程一覧

### D-001: change-task-planner-prompt.md に行キー生成ルール追記

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-001::implement | 実装 | ✅ done | micro-impl-agent | 追記完了 |
| D-001::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-001::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-001::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS |
| D-001::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

### D-002: bugfix-task-planner-prompt.md に行キー生成ルール追記

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-002::implement | 実装 | ✅ done | micro-impl-agent | 追記完了 |
| D-002::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-002::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-002::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS（差分0件） |
| D-002::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

### D-003: impl-planner-prompt.md に行キー生成ルール追記

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-003::implement | 実装 | ✅ done | micro-impl-agent | 追記完了 |
| D-003::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-003::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-003::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS（差分0件） |
| D-003::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

### D-004: fs-impl-phase2-preparation/impl-planner-prompt.md 削除

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-004::implement | 実装 | ✅ done | micro-impl-agent | ファイル削除完了 |
| D-004::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-004::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-004::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS（ファイル削除確認済み） |
| D-004::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

### D-005: fs-impl-phase2-preparation/SKILL.md 参照先変更（4箇所）

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-005::implement | 実装 | ✅ done | micro-impl-agent | 4箇所参照先変更完了 |
| D-005::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-005::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-005::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS（4箇所全てdelta-design after記述と一致） |
| D-005::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

### D-006: program-structure.md プロンプトテンプレート行更新

| 行キー | 工程 | 状態 | 実行エージェント | output |
|---|---|---|---|---|
| D-006::implement | 実装 | ✅ done | micro-impl-agent | プロンプトテンプレート行更新完了 |
| D-006::write_test | テスト実装 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-006::run_test | テスト実行 | ➖ skip | - | 非プログラム成果物のため対象外 |
| D-006::spec_review | 設計準拠レビュー | ✅ done | design-review-agent | 設計準拠PASS（差分0件、delta-design after記述と完全一致） |
| D-006::quality_review | コード品質レビュー | ➖ skip | - | 非プログラム成果物のため対象外 |

---

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
