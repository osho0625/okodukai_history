# 新しいワークフローを追加する手順

既存7ワークフロー（企画 / 設計 / 実装 / 設計逆引き / 変更 / リファクタリング / バグ修正）に並ぶ新規ワークフローを追加する場合の作業手順をまとめる。

機構の説明（ワークフローとフェーズスキルの関係、Quick Routing の動作、ハブスキル方式の原理）は本書では扱わない。次を参照。

- ワークフローの責務とライフサイクル → [第1章 アーキテクチャ](../01-system-platform/00-architecture.md)
- 7ワークフローの中身と並び → [第2章 01-workflows](../02-ai-agent/01-workflows/)
- フェーズスキル単体の追加手順 → [add-phase-skill.md](./add-phase-skill.md)

本書は「やり方」だけを書く。

## 1. 成果物

1ワークフロー追加で必ず作成・更新するもの:

- 新規（複数）: `skills/fs-{workflow}-phase{N}-{name}/SKILL.md`（フェーズ数だけ）
- 新規: 各フェーズスキル直下のプロンプトテンプレート（必要な分）
- 更新: `skills/using-aide-powers/SKILL.md`（Quick Routing 表 + 判断テーブル）
- 更新: `skills/aide-powers-guide/SKILL.md`（Quick Routing 表）
- 更新: `skills/using-aide-powers/references/global-rules.md`（Quick Routing 表）
- 更新: `.aide/references/progress-file-format.md`（新ワークフロー用の進捗ファイル定義）
- 更新: `README.md`（ワークフロー一覧表）
- 更新: `docs-dev/00-overview.md`（7ワークフロー一覧表）
- 更新: `docs-dev/02-ai-agent/01-workflows/`（中身解説。第2章責務）
- 必要に応じて新規: `agents/{agent-name}.md`（新ワークフロー固有のレビュー / 実装エージェント）

## 2. 設計の前提

ワークフローを増やす前に、以下を確認すること。

- 既存7ワークフローのいずれにも当てはまらないか（無駄なワークフロー追加は Quick Routing の判断を曇らせる）
- 既存ワークフローへのフェーズ追加で済まないか（[add-phase-skill.md](./add-phase-skill.md) の方が安価）
- ユーザー発話のトリガー語が既存ワークフローと重ならないか（重なる場合は Quick Routing の判断テーブルで分岐ルールを書けるか）

確認の上で本ワークフローが必要と判断できた場合のみ、本書の手順を進める。

## 3. 配置先・命名規則

| 項目 | ルール | 例 |
|---|---|---|
| ワークフロー識別子 | 短い英単語の小文字。プレフィックスなし | `planning`, `design`, `impl`, `reverse`, `change`, `bugfix`, `refactoring` |
| エントリポイントスキル | `fs-{workflow}-phase{N}-{name}` | `fs-bugfix-phase1-analysis`, `fs-impl-phase1-gate` |
| フェーズスキル番号 | 入口を `phase0` または `phase1` から開始。順序通りに連番 | `fs-design-phase1-user-req` → `fs-design-phase2-system-req` → ... |
| 進捗ファイル名 | `{workflow}-progress.md` | `design-progress.md`, `impl-progress.md`, `bugfix-progress.md` |
| 差分設計書名（変更系の場合） | `{purpose}-design.md` | `delta-design.md`, `fix-design.md`, `refactoring-design.md` |

## 4. ワークフロー全体の組み立て手順

### 4-1. フェーズ分割を決める

新ワークフローのフェーズ列を決定し、表にまとめる。

| フェーズ | スキル名 | 入力 | 成果物 | サブエージェント委譲先 |
|---|---|---|---|---|
| phase1 | `fs-{workflow}-phase1-{name}` | ... | ... | ... |
| phase2 | `fs-{workflow}-phase2-{name}` | ... | ... | ... |
| ... | ... | ... | ... | ... |

このフェーズ表を `docs-dev/02-ai-agent/01-workflows/` に持ち込み、第2章で解説する。

### 4-2. フェーズスキルを順次作成する

[add-phase-skill.md](./add-phase-skill.md) の手順を、フェーズ数だけ繰り返す。

各フェーズスキルで必ず行うこと:

- メインプロセスの末尾で次フェーズスキルを `REQUIRED SUB-SKILL: fs-{workflow}-phase{N+1}-{name}` で指定
- 完了処理に `REQUIRED SUB-SKILL: git-commit-workflow` と `REQUIRED SUB-SKILL: doc-index-maintenance` を含める
- 進捗ファイルの更新を含める（`progress-resume-check` で再開可能にする）

最終フェーズは次フェーズを指さず、ワークフロー終了処理（最終 `git-commit-workflow` と `doc-sync` 等）で締める。

### 4-3. 進捗ファイルフォーマットを定義する

`.aide/references/progress-file-format.md` に新ワークフロー用のフェーズ表を追加する。

- フェーズ番号
- スキル名
- 状態列（`⬜ 未着手` / `🔧 作業中` / `✅ 完了` / `⏭️ スキップ`）
- 完了日時列
- 成果物列

`progress-resume-check` 共通スキルがこの定義を参照して再開判定を行うため、漏らさず追加する。

### 4-4. 必要なら共通エージェントを追加

新ワークフロー固有のレビュー / 実装エージェントが必要な場合のみ、[add-agent.md](./add-agent.md) の手順で `agents/` に追加する。既存の `micro-impl-agent` / `design-review-agent` / `code-review-agent` で済むなら追加不要。

## 5. Quick Routing への登録（必須）

新ワークフローの入口を AI Agent から発見可能にするため、ハブスキルとグローバルルールを更新する。

### 5-1. `skills/using-aide-powers/SKILL.md` を更新

以下の3か所を編集する。

1. **「ワークフロー選択ガイド」表**（`### 選択基準` 配下）に新ワークフロー行を追加

   ```
   | 状況 | ワークフロー | エントリポイント |
   |---|---|---|
   | {新ワークフローのトリガー状況} | {新ワークフロー名} | `fs-{workflow}-phase1-{name}` |
   ```

2. **「Quick Routing」表**（`## Quick Routing` 配下）にユーザー発話トリガーを追加

   ```
   | トリガー | スキル |
   |---|---|
   | {日本語トリガー} / {English trigger} | `fs-{workflow}-phase1-{name}` |
   ```

3. **「判断に迷うケース」表** に新ワークフローと既存ワークフローの判別ポイントを追加（重なるトリガーがある場合のみ）

### 5-2. `skills/aide-powers-guide/SKILL.md` を更新

`## ワークフロー選択（Quick Routing）` 表に新ワークフロー行を追加する（5-1 の表と同等内容を反映）。

### 5-3. `skills/using-aide-powers/references/global-rules.md` を更新

`## ワークフロー選択ガイド（Quick Routing）` 表と「ユーザー発話からのルーティング」表に新ワークフロー行を追加する。

このファイルは `rules-distribute` の global モードで各プラットフォームのルールファイル機構（`.kiro/steering/`、`.claude/rules/` 等）に配布される実体。更新後にユーザー側で `setup.bat` 再実行＋ワークスペース起動で再配布される。

### 5-4. `.aide/global-rules.md` を更新（任意）

このリポジトリ内ワークスペースで開発を続ける場合のみ、ローカルの `.aide/global-rules.md` を上記と同じ内容で更新しておく（次回 `using-aide-powers` 起動時に再配置される対象）。

## 6. ドキュメント更新

ワークフロー追加に伴い、以下のユーザー向けドキュメント / 開発者向けドキュメントを更新する。

- [ ] `README.md` の「7つのワークフローで開発プロセス全体をカバー」表に新ワークフロー行を追加
- [ ] `docs-dev/00-overview.md` の「7ワークフロー一覧」表に新ワークフロー行を追加。本文中の「7ワークフロー」表現があれば「8ワークフロー」等に更新
- [ ] `docs-dev/02-ai-agent/01-workflows/` 配下に新ワークフローの詳細解説を追加（第2章責務）
- [ ] 共通用語辞書 `.aide/specs/aide-powers/ubiquitous-language.md` の「2. ワークフロー」セクションに新ワークフロー行を追加

「7ワークフロー」「7つの」という表現は複数箇所に散らばっているため、grep して漏れなく更新する。

## 7. 全体への登録手順（チェックリスト）

新規ワークフローを aide-powers に組み込むための更新作業。順番に潰すこと。

- [ ] フェーズ分割表を確定
- [ ] 全フェーズスキル（`skills/fs-{workflow}-phase{N}-{name}/SKILL.md`）を作成（[add-phase-skill.md](./add-phase-skill.md) §3）
- [ ] フェーズ間の `REQUIRED SUB-SKILL` 連鎖を全て張る
- [ ] 必要に応じて共通エージェントを追加（[add-agent.md](./add-agent.md)）
- [ ] `.aide/references/progress-file-format.md` に新ワークフロー進捗フォーマットを追加
- [ ] `skills/using-aide-powers/SKILL.md` の Quick Routing 3表を更新（§5-1）
- [ ] `skills/aide-powers-guide/SKILL.md` の Quick Routing 表を更新（§5-2）
- [ ] `skills/using-aide-powers/references/global-rules.md` の Quick Routing 2表を更新（§5-3）
- [ ] `README.md` のワークフロー表を更新
- [ ] `docs-dev/00-overview.md` のワークフロー表と本文を更新
- [ ] `docs-dev/02-ai-agent/01-workflows/` に新ワークフローの解説を追加
- [ ] `.aide/specs/aide-powers/ubiquitous-language.md` のワークフロー一覧を更新

## 8. 動作確認手順

### 8-1. ローカル配布確認

- [ ] `setup.bat` / `setup.sh` を再実行
- [ ] 対象プラットフォームの skills/ にフェーズスキル一式がコピーされたことを目視
- [ ] 対象プラットフォームのルールファイル機構（`.kiro/steering/aide-powers-global-rules.md` 等）を開き、新 Quick Routing 行が反映されているか確認

### 8-2. ハブスキル経由のルーティング確認

- [ ] 新規セッションを開始
- [ ] 新ワークフローのトリガー語をユーザー発話として投げる（例: 新ワークフローのトリガーに合わせた発話）
- [ ] AI Agent がエントリポイントスキル `fs-{workflow}-phase1-{name}` を activate することを確認
- [ ] 既存ワークフローのトリガー語が誤って新ワークフローに引っ張られていないことも確認（回帰）

### 8-3. フェーズ連鎖確認

- [ ] 入口フェーズから最終フェーズまで一通り流す
- [ ] 各フェーズで skill:deploy / skill:cleanup が走ることを確認
- [ ] `REQUIRED SUB-SKILL` の連鎖が切れずに次フェーズへ遷移することを確認
- [ ] 進捗ファイル（`{workflow}-progress.md`）が各フェーズで更新されることを確認
- [ ] 最終フェーズ完了で `git-commit-workflow` が呼ばれることを確認

### 8-4. 再開確認

- [ ] 中間フェーズで一旦終了
- [ ] 新規セッションでハブスキルを起動
- [ ] `progress-resume-check` が中間フェーズを認識し、続きから再開できることを確認

## 9. 注意事項・落とし穴

- **Quick Routing の重複**: 既存ワークフローと同じトリガー語を割り当てると、AI Agent の判断が分裂する。重なる場合は「判断に迷うケース」表に判別ポイントを必ず追加する。
- **3か所の Quick Routing 表の同期**: `using-aide-powers/SKILL.md` / `aide-powers-guide/SKILL.md` / `using-aide-powers/references/global-rules.md` の3か所はそれぞれ別系統で配布される。1か所だけ更新するとプラットフォームによって挙動が変わる。
- **`progress-file-format.md` の同期忘れ**: フォーマット未追加だと `progress-resume-check` が新ワークフローを認識できず、再開時に `START_FRESH` 扱いで初期化され進捗が消える。
- **「7ワークフロー」リテラルの更新漏れ**: README / overview / 共通用語辞書に「7ワークフロー」「7つの」が散在している。grep して全箇所を更新する。
- **gitコミットの分割禁止**: ワークフロー1件 = コミット1回（global-rules §4-2）。ワークフロー追加作業も例外ではない。`add-workflow` 作業全体を1コミットにまとめる。`git-commit-workflow` スキル経由で行うこと。
- **`rules-distribute` の global モード再実行**: `global-rules.md` を更新したら、開発者自身も自分のワークスペースで `rules-distribute` を global モードで再実行し、ローカルの `.kiro/steering/aide-powers-global-rules.md` 等を最新化する。古いルールが残ったまま動作確認すると Quick Routing の挙動を誤認する。
- **エントリポイントスキルの `description`**: ハブスキルの Quick Routing 表に追加するだけでなく、エントリポイントスキル自身の frontmatter `description` も「Use when ...」形式で活性化条件を明示する。Skill ツールの活性化判定はこの description にも依存する。
- **第2章のドキュメント**: ワークフローの中身解説は第2章。本書（第3章）に解説を書かない。
