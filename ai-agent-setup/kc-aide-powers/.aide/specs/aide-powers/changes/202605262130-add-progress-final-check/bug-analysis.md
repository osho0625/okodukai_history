# バグ原因分析

## 分析日
2026-05-27

## 原因の概要
変更WF `202605262130-add-progress-final-check` のコミット `a795e70` で、4つの最終フェーズスキルの Integration セクション（次フェーズスキル参照）は正しく更新されたが、Process > 後処理セクション（AI Agent が実行時に実際に従う手順）の遷移指示が更新されなかった。AI Agent は後処理セクションに従って動作するため、final-check フェーズへの遷移が実行されない。

## 詳細分析

### 原因箇所1: .aide/references/progress-file-format.md
- 現状: 全7WFの final-check 行が **既に追加済み**（ソース版 `skills/using-aide-powers/references/progress-file-format.md` と同一内容）
- 期待: 同上（問題なし）
- 差分: **なし**（バグ報告時点では未追加だったが、現時点では解消済み。ワークフロー開始時のコピー処理で最新版が配置されたと推定）

### 原因箇所2: skills/fs-impl-phase6-doc-generation/SKILL.md の後処理
- 現状: 後処理の項目4が「実装ワークフロー完了をユーザーに報告」で終了
- 期待: 後処理に「次フェーズ遷移（REQUIRED SUB-SKILL: fs-impl-phase7-final-check）」を追加
- 差分: Integration セクションには `REQUIRED SUB-SKILL: fs-impl-phase7-final-check` が記載済みだが、後処理セクションに遷移指示がない
- 比較: fs-planning-phase3-finalize の後処理には「4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-planning-phase4-final-check）」が明記されている

### 原因箇所3: skills/fs-change-phase9-completion/SKILL.md の後処理
- 現状: 後処理の末尾に「※ 変更ワークフロー完了（最終フェーズのため次フェーズ遷移なし）」と明記
- 期待: 「※」行を削除し、「次フェーズ遷移（REQUIRED SUB-SKILL: fs-change-phase10-final-check）」を追加
- 差分: Integration セクションには `次フェーズスキル: REQUIRED SUB-SKILL: fs-change-phase10-final-check` が記載済みだが、後処理セクションが旧記述のまま

### 原因箇所4: skills/fs-bugfix-phase6-doc/SKILL.md の後処理
- 現状: 後処理の項目4が「バグ修正ワークフロー完了」で終了
- 期待: 後処理に「次フェーズ遷移（REQUIRED SUB-SKILL: fs-bugfix-phase7-final-check）」を追加
- 差分: Integration セクションには `次フェーズスキル: REQUIRED SUB-SKILL: fs-bugfix-phase7-final-check` が記載済みだが、後処理セクションに遷移指示がない

### 原因箇所5: skills/fs-refactoring-phase6-doc/SKILL.md の後処理
- 現状: 後処理の項目4が「リファクタリングワークフロー完了」で終了
- 期待: 後処理に「次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check）」を追加
- 差分: Integration セクションには `次フェーズスキル: REQUIRED SUB-SKILL: fs-refactoring-phase7-final-check` が記載済みだが、後処理セクションに遷移指示がない

### 根本原因の構造

コミット `a795e70` では以下の2箇所を更新する必要があった:

| 更新箇所 | 役割 | 更新状況 |
|---|---|---|
| Integration セクション（次フェーズスキル / REQUIRED SUB-SKILL） | スキル間の依存関係の宣言（メタデータ的） | ✅ 更新済み |
| Process > 後処理セクション | AI Agent が実行時に従う実際の手順 | ❌ 未更新 |

AI Agent はフェーズスキル実行時に Process セクションの前処理→Step→後処理を順に実行する。Integration セクションは参照情報であり、後処理セクションに遷移指示がなければ AI Agent は次フェーズに遷移しない。

### 正しく設定されているスキルとの比較

| スキル | 後処理の遷移指示 | 状態 |
|---|---|---|
| fs-planning-phase3-finalize | `4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-planning-phase4-final-check）` | ✅ 正常 |
| fs-design-phase10-program | （未確認だが同様の構造と推定） | ✅ 正常 |
| fs-impl-phase6-doc-generation | `4. 実装ワークフロー完了をユーザーに報告` | ❌ 遷移指示なし |
| fs-change-phase9-completion | `※ 変更ワークフロー完了（最終フェーズのため次フェーズ遷移なし）` | ❌ 遷移指示なし |
| fs-bugfix-phase6-doc | `4. バグ修正ワークフロー完了` | ❌ 遷移指示なし |
| fs-refactoring-phase6-doc | `4. リファクタリングワークフロー完了` | ❌ 遷移指示なし |

## 影響範囲

### 影響を受けるWF・フェーズ

| WF | 影響フェーズ | 影響内容 |
|---|---|---|
| 実装WF | Phase 6 → Phase 7 | final-check が呼ばれない |
| 変更WF | Phase 9 → Phase 10 | final-check が呼ばれない |
| バグ修正WF | Phase 6 → Phase 7 | final-check が呼ばれない |
| リファクタリングWF | Phase 6 → Phase 7 | final-check が呼ばれない |

### 影響を受けないWF

| WF | 理由 |
|---|---|
| 企画WF | fs-planning-phase3-finalize の後処理に遷移指示あり |
| 設計WF | fs-design-phase10-program の後処理に遷移指示あり（推定） |
| 設計逆引きWF | fs-reverse-phase5-optional-phases の後処理に遷移指示あり（推定） |

### progress-resume-check への影響
- progress-file-format.md 自体は正しく更新されているため、progress-resume-check のフェーズ判定ロジックには影響なし
- ただし final-check フェーズが実行されないため、進捗ファイル上で Phase 7（または Phase 10）が永久に `⬜ 未着手` のまま残る

## 起因元ドキュメントフォルダ
`.aide/specs/aide-powers/changes/202605262130-add-progress-final-check/`

（コミット `a795e70` の `Docs:` フッターより特定）

## 修正対象ファイル一覧
1. `skills/fs-impl-phase6-doc-generation/SKILL.md`: 後処理に「次フェーズ遷移（fs-impl-phase7-final-check）」を追加
2. `skills/fs-change-phase9-completion/SKILL.md`: 後処理の「※ 変更ワークフロー完了（最終フェーズのため次フェーズ遷移なし）」を削除し、「次フェーズ遷移（fs-change-phase10-final-check）」を追加
3. `skills/fs-bugfix-phase6-doc/SKILL.md`: 後処理に「次フェーズ遷移（fs-bugfix-phase7-final-check）」を追加
4. `skills/fs-refactoring-phase6-doc/SKILL.md`: 後処理に「次フェーズ遷移（fs-refactoring-phase7-final-check）」を追加
