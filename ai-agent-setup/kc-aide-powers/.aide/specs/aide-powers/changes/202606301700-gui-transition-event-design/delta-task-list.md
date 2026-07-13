# 差分タスクリスト

## タスクサマリ

- 総タスク数: 16
- 編集済みスキップ: 4ファイル（agents/object-design-qa-agent.md, skills/fs-design-phase8-object/SKILL.md, skills/design-qa-dispatch/SKILL.md, domain-layer-object-designer-prompt.md リネーム）
- 新規作成: 1ファイル（usecase-coverage-reviewer-prompt.md）
- 既存変更: 15ファイル

## 依存関係グラフ

```
D-001 gui-design/SKILL.md ──┐
D-002 gui-designer-prompt.md ├─→ D-005 architecture-qa-agent.md ──→ D-013 fs-design-phase7-ddd（差し戻しルーティング）
D-003 gui-reverse-prompt.md ─┘    D-006 kiro/architecture-qa-agent.md
                                   D-007 kiro/prompts/architecture-qa-agent-prompt.md

D-004 object-design-qa-agent 残2PF反映（独立）

D-008 fs-design-phase6-usecase/SKILL.md ─┐
D-009 usecase-lister-prompt.md            ├─（同一スキル内逐次）
D-010 usecase-coverage-reviewer-prompt.md ┘

D-011 object-designer-prompt.md（mode追加）（独立、SKILL.md編集済みが前提）

D-012 fs-design-phase3-dev-plan ─┐
D-014 fs-design-phase10-program  │
D-015 fs-change-phase2-impl      ├─ doc_index_path追加（全て独立・並列可）
D-016 fs-bugfix-phase2-impl      │
D-017 fs-refactoring-phase4-design┘

D-013 fs-design-phase7-ddd（doc_index_path + 差し戻しルーティング）→ D-005に依存
```

## 並列実行グループ

| グループ | タスク | 条件 |
|---|---|---|
| A（独立・即時着手可） | D-001, D-002, D-003, D-004, D-008, D-009, D-010, D-011, D-012, D-014, D-015, D-016, D-017 | 依存先なし |
| B（D-001〜003完了後） | D-005, D-006, D-007 | gui-design 3セクション追加完了が検証項目の前提 |
| C（D-005完了後） | D-013 | architecture-qa-agent のREJECTED出力フォーマットが確定している必要あり |

---

## タスク一覧

### タスク D-001: gui-design SKILL.md 完了条件拡張 + Red Flags追加
- 種別: 既存変更
- 対象ファイル: `skills/gui-design/SKILL.md`
- 依存先: なし
- 設計参照: delta-design-gui-design.md の §1（完了条件拡張）、§7（Red Flags追加）
- 適用状況: 未対応

---

### タスク D-002: gui-designer-prompt.md createモード3ステップ追加 + 成果物フォーマット追加 + deltaモード拡張
- 種別: 既存変更
- 対象ファイル: `skills/gui-design/gui-designer-prompt.md`
- 依存先: なし
- 設計参照: delta-design-gui-design.md の §2（createモードステップ追加）、§3（成果物フォーマット3セクション追加）、§5（deltaモードステップ2拡張）、§6（deltaモードステップ3拡張）
- 適用状況: 未対応

---

### タスク D-003: gui-reverse-prompt.md 逆引きプロセス3ステップ追加（7→10ステップ化）
- 種別: 既存変更
- 対象ファイル: `skills/gui-design/gui-reverse-prompt.md`
- 依存先: なし
- 設計参照: delta-design-gui-design.md の §4（reverseモード3ステップ追加）
- 適用状況: 未対応

---

### タスク D-004: object-design-qa-agent 残2プラットフォーム反映
- 種別: 既存変更
- 対象ファイル: `agents/kiro/object-design-qa-agent.md`, `agents/kiro/prompts/object-design-qa-agent-prompt.md`
- 依存先: なし
- 設計参照: delta-design-qa-agents.md の REQ-C-005 §1〜§3（doc_index_path追加 + ステップ2考慮漏れ検証追加 + ステップ番号繰り下げ）
- 適用状況: 編集済み（agents/object-design-qa-agent.md）— 残2プラットフォーム反映のみ
- 備考: agents/object-design-qa-agent.md の内容を各プラットフォーム形式に合わせて反映する

---

### タスク D-005: architecture-qa-agent 検証項目拡張 + REJECTED出力フォーマット変更
- 種別: 既存変更
- 対象ファイル: `agents/architecture-qa-agent.md`
- 依存先: D-001, D-002, D-003（gui-design の3セクション定義が確定している必要あり）
- 設計参照: delta-design-qa-agents.md の REQ-C-004 §1（検証項目2-1拡張）、§2（REJECTED出力差し戻し先フォーマット追加）
- 適用状況: 未対応

---

### タスク D-006: architecture-qa-agent Kiro IDE版 反映
- 種別: 既存変更
- 対象ファイル: `agents/kiro/architecture-qa-agent.md`
- 依存先: D-005（同一内容を反映するため）
- 設計参照: delta-design-qa-agents.md の REQ-C-004 §1〜§2
- 適用状況: 未対応

---

### タスク D-007: architecture-qa-agent Kiro CLI版 反映
- 種別: 既存変更
- 対象ファイル: `agents/kiro/prompts/architecture-qa-agent-prompt.md`
- 依存先: D-005（同一内容を反映するため）
- 設計参照: delta-design-qa-agents.md の REQ-C-004 §1〜§2
- 適用状況: 未対応

---


### タスク D-008: fs-design-phase6-usecase SKILL.md fixモード追加 + UC網羅性レビューStep追加 + Step番号繰り下げ
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase6-usecase/SKILL.md`
- 依存先: なし
- 設計参照: delta-design-phase-skills.md の REQ-C-006 §1〜§4（fixモード分岐追加・状態判定変更・Step Fix追加・Integration入力定義追加）、REQ-C-008 §3〜§5（UC網羅性レビューStep追加・Step2完了条件変更・Integrationプロンプトテンプレート追加）
- 適用状況: 未対応
- 備考: REQ-C-006とREQ-C-008の変更が同一ファイルに適用されるため1タスクに統合

---

### タスク D-009: usecase-lister-prompt.md 粒度基準セクション追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase6-usecase/usecase-lister-prompt.md`
- 依存先: なし
- 設計参照: delta-design-phase-skills.md の REQ-C-008 §1（粒度基準変更指示）
- 適用状況: 未対応

---

### タスク D-010: usecase-coverage-reviewer-prompt.md 新規作成
- 種別: 新規作成
- 対象ファイル: `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md`
- 依存先: なし
- 設計参照: delta-design-phase-skills.md の REQ-C-008 §2（新規プロンプトテンプレート全文）
- 適用状況: 未作成

---

### タスク D-011: object-designer-prompt.md mode追加（phase8_{layer-name} / fix）
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase8-object/object-designer-prompt.md`
- 依存先: なし（SKILL.md 編集済みが前提だが、そちらは対応完了）
- 設計参照: delta-design-phase-skills.md の REQ-C-007 §4（プロンプトテンプレートのmode追加）
- 適用状況: 未確認（差分設計で mode 追加が必要と記載あり）
- 備考: 動的レイヤー名（phase8_{layer-name}）に対応するmode判定ロジックの追加が必要。impact-analysis.md 未確認事項#1

---

### タスク D-012: fs-design-phase3-dev-plan doc_index_path パラメータ追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase3-dev-plan/SKILL.md`
- 依存先: なし（design-qa-dispatch 編集済み）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」（design-qa-dispatch呼び出し時にdoc_index_pathを追加で渡す）
- 適用状況: 未対応
- 備考: design-qa-dispatch 呼び出し箇所に doc_index_path パラメータを追加する軽微な変更

---

### タスク D-013: fs-design-phase7-ddd doc_index_path追加 + 差し戻しルーティング新規対応
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase7-ddd/SKILL.md`
- 依存先: D-005（architecture-qa-agent のREJECTED出力に差し戻し先情報が追加されることが前提）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」+ impact-analysis.md「未確認事項 #2」（差し戻しルーティング新規対応）
- 適用状況: 未対応
- 備考: doc_index_path追加（軽微）+ REJECTED出力に差し戻し先がある場合に fs-design-phase6-usecase を fixモードで呼び出すルーティング処理の新規実装が必要

---

### タスク D-014: fs-design-phase10-program doc_index_path パラメータ追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-design-phase10-program/SKILL.md`
- 依存先: なし（design-qa-dispatch 編集済み）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」
- 適用状況: 未対応
- 備考: design-qa-dispatch 呼び出し箇所に doc_index_path パラメータを追加する軽微な変更

---

### タスク D-015: fs-change-phase2-impl doc_index_path パラメータ追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-change-phase2-impl/SKILL.md`
- 依存先: なし（design-qa-dispatch 編集済み）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」
- 適用状況: 未対応
- 備考: design-qa-dispatch 呼び出し箇所に doc_index_path パラメータを追加する軽微な変更

---

### タスク D-016: fs-bugfix-phase2-impl doc_index_path パラメータ追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-bugfix-phase2-impl/SKILL.md`
- 依存先: なし（design-qa-dispatch 編集済み）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」
- 適用状況: 未対応
- 備考: design-qa-dispatch 呼び出し箇所に doc_index_path パラメータを追加する軽微な変更

---

### タスク D-017: fs-refactoring-phase4-design doc_index_path パラメータ追加
- 種別: 既存変更
- 対象ファイル: `skills/fs-refactoring-phase4-design/SKILL.md`
- 依存先: なし（design-qa-dispatch 編集済み）
- 設計参照: impact-analysis.md「スキル間インターフェース変更追跡 §1」
- 適用状況: 未対応
- 備考: design-qa-dispatch 呼び出し箇所に doc_index_path パラメータを追加する軽微な変更

---

## 推奨実行順序

1. **Wave 1（並列実行可）**: D-001, D-002, D-003, D-004, D-008, D-009, D-010, D-011, D-012, D-014, D-015, D-016, D-017
2. **Wave 2（D-001〜003完了後）**: D-005, D-006, D-007
3. **Wave 3（D-005完了後）**: D-013

---

## 網羅性チェック

### delta-design-gui-design.md の変更項目照合

| §番号 | 変更内容 | タスク |
|---|---|---|
| §1 | SKILL.md 完了条件拡張 | D-001 |
| §2 | gui-designer-prompt.md createモードステップ追加 | D-002 |
| §3 | gui-designer-prompt.md 成果物フォーマット3セクション追加 | D-002 |
| §4 | gui-reverse-prompt.md 逆引き3ステップ追加 | D-003 |
| §5 | gui-designer-prompt.md deltaモードステップ2拡張 | D-002 |
| §6 | gui-designer-prompt.md deltaモードステップ3拡張 | D-002 |
| §7 | SKILL.md Red Flags追加 | D-001 |

### delta-design-qa-agents.md の変更項目照合

| 項目 | 変更内容 | タスク |
|---|---|---|
| REQ-C-004 §1 | architecture-qa-agent 検証項目2-1拡張 | D-005, D-006, D-007 |
| REQ-C-004 §2 | architecture-qa-agent REJECTED出力フォーマット変更 | D-005, D-006, D-007 |
| REQ-C-005 §1 | object-design-qa-agent doc_index_path入力追加 | D-004（残2PF） |
| REQ-C-005 §2 | object-design-qa-agent ステップ2考慮漏れ検証追加 | D-004（残2PF） |
| REQ-C-005 §3 | object-design-qa-agent ステップ番号繰り下げ | D-004（残2PF） |
| design-qa-dispatch §1〜§3 | doc_index_path/review_scope入力追加 | 対応済み（編集済み） |

### delta-design-phase-skills.md の変更項目照合

| 項目 | 変更内容 | タスク |
|---|---|---|
| REQ-C-006 §1 | phase6 前処理fixモード分岐追加 | D-008 |
| REQ-C-006 §2 | phase6 状態判定fixモード分岐追加 | D-008 |
| REQ-C-006 §3 | phase6 Step Fix追加 | D-008 |
| REQ-C-006 §4 | phase6 Integration fixモード入力定義追加 | D-008 |
| REQ-C-007 §1 | phase8 Step構成の動的化 | 対応済み（SKILL.md編集済み） |
| REQ-C-007 §2 | phase8 個別レイヤーレビュー呼び出し方式 | 対応済み（SKILL.md編集済み） |
| REQ-C-007 §3 | phase8 全体整合性レビュー検証項目限定 | 対応済み（SKILL.md編集済み） |
| REQ-C-007 §4 | プロンプトテンプレートリネーム + mode追加 | リネーム済み + D-011（mode追加） |
| REQ-C-007 §5 | phase8 Integration更新 | 対応済み（SKILL.md編集済み） |
| REQ-C-008 §1 | usecase-lister-prompt.md 粒度基準追加 | D-009 |
| REQ-C-008 §2 | usecase-coverage-reviewer-prompt.md 新規作成 | D-010 |
| REQ-C-008 §3 | phase6 UC網羅性レビューStep追加 | D-008 |
| REQ-C-008 §4 | phase6 Step2完了条件変更 | D-008 |
| REQ-C-008 §5 | phase6 Integrationプロンプトテンプレート追加 | D-008 |

### impact-analysis.md 依存関係（doc_index_path追加が必要なスキル）照合

| スキル | タスク |
|---|---|
| fs-design-phase3-dev-plan | D-012 |
| fs-design-phase7-ddd | D-013 |
| fs-design-phase8-object | 対応済み（編集済み） |
| fs-design-phase10-program | D-014 |
| fs-change-phase2-impl | D-015 |
| fs-bugfix-phase2-impl | D-016 |
| fs-refactoring-phase4-design | D-017 |

### 漏れ確認結果: **漏れゼロ**
