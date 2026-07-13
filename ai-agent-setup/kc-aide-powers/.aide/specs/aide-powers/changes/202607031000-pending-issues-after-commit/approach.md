# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応
- **OCP検討結果**: OCP非適用（対象はプログラムコードではなくスキル定義テキストファイル）

## 関連箇所

### 変更対象
| ファイル | 変更内容 |
|---|---|
| `skills/fs-change-phase2-impl/SKILL.md` | Step 13（pending-issues 書き込み忘れチェック）を削除し、後続Step番号をリナンバリング |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | Step 11（pending-issues 書き込み忘れチェック）を削除し、後続Step番号をリナンバリング |
| `skills/fs-refactoring-phase6-doc/SKILL.md` | Step 2（pending-issues 書き込み忘れチェック）を削除し、後続Step番号をリナンバリング |
| `skills/fs-impl-phase5-final-check/SKILL.md` | Step 3（pending-issues の確認と書き込み忘れチェック）を削除 |
| `skills/fs-planning-phase4-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-design-phase11-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-impl-phase7-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-reverse-phase6-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-change-phase3-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-bugfix-phase3-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |
| `skills/fs-refactoring-phase7-final-check/SKILL.md` | 後処理にgitコミット後pending-issues check→present追加 |

### 新規追加
なし（既存ファイルの変更のみ）

## 変更方針の詳細

### 1. 実装フェーズからのpending-issues Step削除
- **方針**: 各WFの実装フェーズスキルからpending-issues check/presentを単独Stepとして実行する記述を削除する。削除に伴う後続Stepのリナンバリングを行う。レポート記載項目のStep番号参照も合わせて更新する
- **理由**: WF本体フロー（設計→実装→レビュー→コミット）に割り込みが発生する問題を根本的に解消するため
- **対象ファイルと削除対象Step**:
  - `fs-change-phase2-impl/SKILL.md`: Step 13（pending-issues 書き込み忘れチェック）→ 旧Step14を新Step13に、旧Step15を新Step14にリナンバリング
  - `fs-bugfix-phase2-impl/SKILL.md`: Step 11（pending-issues 書き込み忘れチェック）→ 旧Step12を新Step11に、旧Step13を新Step12にリナンバリング
  - `fs-refactoring-phase6-doc/SKILL.md`: Step 2（pending-issues 書き込み忘れチェック）→ 旧Step3を新Step2に、旧Step4を新Step3にリナンバリング
  - `fs-impl-phase5-final-check/SKILL.md`: Step 3（pending-issues の確認と書き込み忘れチェック）→ Step 1〜2のみ残る（Step 3が最終Stepのためリナンバリング不要）

### 2. 全7WF final-check後処理へのpending-issues check/present追加
- **方針**: 全7WFの最終フェーズスキルの後処理に、git-commit-workflow完了後にpending-issues check→presentの手順を追加する。実行順序は「git-commit-workflow → pending-issues check → pending-issues present」で統一する
- **理由**: WF完全終了・コミット完了後に集約することで、WF本体フローの一貫性を確保するため
- **追加する手順の定義**:
  1. `pending-issues-management` スキルを check モードで activate（書き込み忘れチェック）
  2. `pending-issues-management` スキルを present モードで activate（既存issuesの提示・検証・削除）
- **配置位置**: 後処理内の git-commit-workflow 完了の直後、次フェーズスキルへの遷移の直前

### 3. 後続Step番号のリナンバリング
- **方針**: Step削除に伴い、後続のStep番号を繰り上げる。レポート記載項目のStep番号参照も合わせて更新する
- **理由**: Step番号の一貫性を維持するため
- **注意点**: program-structure.md にも各WFフェーズスキルのStep情報が記載されているため、差分設計完了後に更新が必要（影響範囲分析で「中」と評価済み）

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 対象はプログラムコードではなくスキル定義テキストファイル（.md）であり、OCP原則やリファクタリングパターンの適用対象ではない。ファイル内容の構造化・再設計は不要で、手順の移動（削除+追加）で要件を満たせる
