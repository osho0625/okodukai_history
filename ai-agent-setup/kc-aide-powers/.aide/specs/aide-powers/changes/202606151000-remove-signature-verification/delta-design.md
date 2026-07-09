# 差分設計書（署名検証機構の削除）

## 設計方針

本変更は署名検証・レポート記載項目検証メカニズムを全面的に削除し、進捗確認・進捗更新のみの軽量な機構に置き換えるものである。新規追加は行わず、既存の削除・簡素化が主体。

- 削除対象のスキル・エージェントは完全削除する
- 簡素化対象のスキル・エージェントは署名関連・検証関連を除去し、進捗ファイルの読み書きのみに絞る
- エージェント名称は `phase-report-checker` → `progress-updater` に変更する（役割の変化を反映）
- 各フェーズスキルの前処理・後処理は、テンプレート的な一括パターンで更新する
- `.aide/scripts/create-sig.sh` は削除する

## 分割ファイル索引

| # | ファイル | 内容 |
|---|---|---|
| 1 | [delta-design-core.md](./delta-design-core.md) | コア変更（削除対象、phase-report-check/progress-updater/progress-final-checker の簡素化） |
| 2 | [delta-design-references.md](./delta-design-references.md) | 参照更新（ステアリング、session-handover、progress-file-format、step-history-writer 等） |
| 3 | [delta-design-phase-skills.md](./delta-design-phase-skills.md) | フェーズスキル群の一括パターン変更（30+ファイル） |

## インターフェース影響サマリ

### シグネチャ変更

#### 1. phase-report-check スキルの入力パラメータ変更

| モード | 変更内容 |
|---|---|
| verify → 「進捗確認」 | `progress_file_path`, `skill_name` のみ残す。処理内容が署名検証から進捗状態確認に変更 |
| write → 「進捗更新」 | `required_items`, `report_file_path` を削除。`progress_file_path`, `skill_name`, `changes_dir`, `expected_artifacts` のみ残す |
| fix_open | 変更なし |
| fix_close | 変更なし |

#### 2. progress-updater（旧 phase-report-checker）エージェントの入力パラメータ変更

| モード | 変更内容 |
|---|---|
| verify → 「進捗確認」 | 署名検証関連の step（V3〜V7）を全削除。進捗ファイルの状態確認のみ |
| write → 「進捗更新」 | `required_items`, `report_file_path` を削除。署名生成（W2, W8〜W11）を全削除。成果物存在確認 + 進捗ファイル更新のみ |
| fix_open / fix_close | 変更なし |

#### 3. progress-final-checker エージェントの入力パラメータ変更

| パラメータ | 変更 |
|---|---|
| 既存パラメータ全て | 維持（`workflow_name`, `total_phases`, `progress_file_path`, `skipped_phases`） |
| 処理内容 | 検証手順 B（全署名検証）を削除。ステータステーブルの全前フェーズ完了確認のみ |

### 呼び出し元への影響

| 呼び出し元カテゴリ | ファイル数 | 影響内容 |
|---|---|---|
| フェーズスキル前処理（phase-report-check verify 呼び出し） | 約25ファイル | 呼び出し方法は同じ（mode=verify）。署名チェック結果の記載項目を「進捗確認結果」に変更 |
| フェーズスキル後処理（phase-report-check write 呼び出し） | 約25ファイル | `required_items`, `report_file_path` パラメータの削除。それ以外の呼び出し方は同じ |
| 最終チェックフェーズ（progress-final-checker 起動） | 7ファイル | 呼び出し方は同じ。内部で署名検証が行われなくなるだけ |
| phase-compliance-check を呼んでいるスキル | 0ファイル（現行フェーズスキルは全て phase-report-check 経由） | 削除による影響なし |

### 後方互換性

- **なし**: 署名メカニズムの完全廃止により、旧バージョンとの互換性は保たない
- setup.bat/setup.sh によるグローバル領域への再デプロイが必要

## 更新が必要な設計資料

| ドキュメント | 更新内容 |
|---|---|
| `.aide/specs/aide-powers/doc-index.md` | 変更なし（コア4ファイルが存在しない構成のため影響なし） |
| `.aide/specs/aide-powers/ubiquitous-language.md` | 更新不要（対象用語が登録されていないため） |
