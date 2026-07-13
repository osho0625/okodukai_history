# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応
- **OCP検討結果**: 既存変更が必要（設計書テキストの誤記修正であり、OCP原則の適用対象外）

## 関連箇所

### 変更対象
| ファイル | クラス/メソッド | 変更内容 |
|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` (L2377) | fs-change-phase2-impl プロセス行 | Step名一覧を SKILL.md 実体と一致させる（15 Step → 15 Step、名称修正） |
| `.aide/specs/aide-powers/program-structure.md` (L2401) | fs-bugfix-phase2-impl プロセス行 | Step名一覧を SKILL.md 実体と一致させる（13 Step → 13 Step、名称修正） |
| `.aide/specs/aide-powers/program-structure.md` (L2291) | fs-impl-phase4-execution プロセス行 | Step名一覧を SKILL.md 実体と一致させる（Step2 名称修正） |

### 新規追加
| ファイル | クラス/メソッド | 追加内容 |
|---|---|---|
| なし | — | — |

## 変更方針の詳細

### REQ-C-001: fs-change-phase2-impl プロセス行の修正
- **方針**: L2377 のプロセス行を以下に置換する
  - `前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: リグレッションテスト結果の確認・報告（セーフティネット） → Step12: 動作検証・ユーザー確認 → Step13: 設計書反映 → Step14: pending-issues 書き込み忘れチェック → Step15: 変更完了の案内 → 後処理`
- **理由**: SKILL.md の実体（正）に設計書の記載（誤）を合わせる単純な誤記修正

### REQ-C-002: fs-bugfix-phase2-impl プロセス行の修正
- **方針**: L2401 のプロセス行を以下に置換する
  - `前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: リグレッションテスト結果の確認・報告（セーフティネット） → Step10: 動作検証・ユーザー確認 → Step11: 設計書反映 → Step12: pending-issues 書き込み忘れチェック → Step13: バグ修正完了の案内 → 後処理`
- **理由**: SKILL.md の実体（正）に設計書の記載（誤）を合わせる単純な誤記修正

### REQ-C-003: fs-impl-phase4-execution プロセス行の修正
- **方針**: L2291 のプロセス行を以下に置換する
  - `前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作検証・ユーザー確認 → 後処理`
- **理由**: SKILL.md の実体（正）に設計書の記載（誤）を合わせる単純な誤記修正

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 今回の変更は設計書（program-structure.md）内のテキスト修正であり、実行コードの変更ではない。OCP原則やリファクタリングの対象となる「コード構造」が存在しないため、リファクタリングは検討の余地なく不要。プロセス定義の正確性維持は、今後も「実体（SKILL.md）変更時に設計書を同期更新する」という運用で対処される。
