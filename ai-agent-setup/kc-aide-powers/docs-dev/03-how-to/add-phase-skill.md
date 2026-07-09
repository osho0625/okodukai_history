# フェーズスキルを追加する手順

ワークフローのいずれかに新しいフェーズを差し込む、または既存ワークフローへ独立したフェーズスキルを追加する場合の作業手順をまとめる。

機構の説明（フェーズスキルが何か、なぜ Iron Law を持つか等）は本書では扱わない。次を参照。

- フェーズスキル全体の責務とライフサイクル → [第1章 アーキテクチャ](../01-system-platform/00-architecture.md)
- フェーズスキルの一覧と並び → [第2章 02-phase-skills](../02-ai-agent/02-phase-skills/)
- ハブスキル方式と Quick Routing の動作 → [第2章 01-workflows](../02-ai-agent/01-workflows/)

本書は「やり方」だけを書く。

## 1. 成果物

1フェーズスキル追加で必ず作成・更新するもの:

- 新規: `skills/{fs-XXX}/SKILL.md`
- 必要に応じて新規: `skills/{fs-XXX}/{prompt-template}.md`（サブエージェント委譲時のプロンプトテンプレート）
- 更新: 直前フェーズスキル `SKILL.md` の `REQUIRED SUB-SKILL` セクション（次フェーズとして自スキルを指す）
- 更新: 直後フェーズスキル `SKILL.md` の `Called by` または `Integration` セクション（前任として自スキルを記載）
- 更新: `.aide/references/progress-file-format.md`（該当ワークフローのフェーズ表に行を追加）
- ワークフロー先頭フェーズの場合のみ更新: `skills/using-aide-powers/SKILL.md`、`skills/aide-powers-guide/SKILL.md`、`skills/using-aide-powers/references/global-rules.md` の Quick Routing 表（[ワークフロー追加手順](./add-workflow.md) を参照）

## 2. 配置先・命名規則

| 項目 | ルール | 例 |
|---|---|---|
| 配置先 | `skills/{skill-name}/SKILL.md` | `skills/fs-design-phase1-user-req/SKILL.md` |
| スキル名（フォルダ名 = `name`） | `fs-{workflow}-phase{N}-{name}` の小文字ケバブケース | `fs-design-phase1-user-req`, `fs-impl-phase1-gate`, `fs-bugfix-phase5-impl` |
| `{workflow}` 部分 | `planning` / `design` / `impl` / `reverse` / `change` / `bugfix` / `refactoring` のいずれか | `fs-change-phase5-delta-design` |
| `{N}` 部分 | フェーズ番号。0 はワークフロー入口・前提確認系（`fs-change-phase1-analysis` 等）に使用 | `fs-design-phase1-user-req` |
| プロンプトテンプレート | `skills/{skill-name}/{purpose}-prompt.md` | `skills/fs-design-phase1-user-req/user-requirements-architect-prompt.md` |

新規ワークフロー全体を追加する場合は、まず [ワークフロー追加手順](./add-workflow.md) を参照すること。

## 3. SKILL.md の必須セクション

既存の `skills/fs-design-phase1-user-req/SKILL.md` と `skills/fs-impl-phase1-gate/SKILL.md` が代表例。新規ファイルは下記のセクションを **すべて** 持つこと。順序も統一する。

### 3-1. frontmatter（必須）

```yaml
---
name: {スキル名（フォルダ名と完全一致）}
description: "{Use when ... 形式の英語1〜2文。トリガー条件と用途を明示する}"
---
```

`description` はハブスキル / Skill ツールが活性化判定に使う。「Use when」「after」「if」など、どの状況で読まれるかを書く。

### 3-2. タイトル + Overview

```markdown
# {日本語タイトル}（{ワークフロー名} フェーズ{N}）

## Overview

{このフェーズが何をするフェーズかを2〜4行で説明する}

**Core principle:** {このフェーズで絶対に守る一文}
```

### 3-3. The Iron Law

ワークフロー先頭フェーズの場合は **ワークフロー共通 Iron Law** を含める（`fs-impl-phase1-gate` を参照）。
中間フェーズの場合は **フェーズ固有 Iron Law** のみで足りる場合がある（`fs-design-phase1-user-req` を参照）。

最低限、以下の項目は含めること。

- フェーズ省略禁止
- 実作業禁止 / サブエージェント委譲必須（該当する場合）
- ユーザー合意なしの次フェーズ遷移禁止
- `NO FAKE SIGNATURE`（既存スキルと共通の文面を使用）

### 3-4. REQUIRED SUB-SKILL: `rules-distribute` スキル（skill:deploy モード）

既存スキルのブロックをそのままコピーする。skill:deploy 実行・skill:cleanup 実行・存在確認の3点を必ず含める。書き換えるのはスキル名参照のみ。

### 3-5. When to Use

```markdown
## When to Use

**Always:**
- {このフェーズが起動される具体的トリガー}

**Exceptions (ask your human partner):**
- {例外。なければ「なし。このフェーズは省略不可。」と書く}
```

### 3-6. メインプロセス

擬似フロー（既存スキルのコードブロック形式）で記述する。

- ステップ番号を `[ステップN]` で振る
- 進捗ファイル再開チェック（`progress-resume-check`）から開始する
- 各ステップでサブエージェント委譲先を明記する
- 分岐は `├─` `└─` の ASCII フローで書く
- 完了処理（進捗更新・git-commit-workflow・doc-index-maintenance・次フェーズ REQUIRED SUB-SKILL）まで含める

### 3-7. 完了条件

チェックリスト形式で「このフェーズの終了条件」を列挙する。後続フェーズの前提となる成果物・ユーザー合意・進捗ファイル更新を漏らさないこと。

### 3-8. Red Flags - STOP

「省略しよう」「単純だから不要」と AI が思考した瞬間に停止させるためのテーブル。最低6項目。既存スキルの文面を流用してよい。

### 3-9. Common Rationalizations

AI が省略を正当化する言い訳と、それに対する現実をペアにしたテーブル。最低5項目。

### 3-10. Integration

```markdown
## Integration

**Called by:**
- {呼び出し元（前任フェーズスキル名 または ワークフロー名）}

**Completion:**
1. {完了条件1}
2. **REQUIRED SUB-SKILL:** Use aide-powers:git-commit-workflow
3. **REQUIRED SUB-SKILL:** Use aide-powers:doc-index-maintenance
4. **REQUIRED SUB-SKILL:** Use aide-powers:{次フェーズスキル名}

**Related skills:**
- {利用する共通スキル}
```

### 3-11. グローバルルール参照（必須）

既存スキルの文面をそのまま使用する。`.aide/references/global-rules.md` の遵守を必須化する宣言。

## 4. 付随ファイル（プロンプトテンプレート）

サブエージェントへの委譲指示を持つフェーズの場合、`skills/{skill-name}/{purpose}-prompt.md` を作成する。

必須項目:

- 役割宣言（このサブエージェントが何者か）
- 入力（呼び出し元から渡されるパラメータ一覧）
- 担当範囲 / 担当外
- プロセス（ステップ列挙）
- 出力（成果物のパスと形式）
- 完了報告フォーマット（Status: `DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED`）

## 5. 全体への登録手順（チェックリスト）

新規フェーズスキルを aide-powers に組み込むための更新作業。順番に潰すこと。

- [ ] `skills/{fs-XXX}/SKILL.md` を作成（§3 の全セクションを満たす）
- [ ] 必要なら `skills/{fs-XXX}/{*-prompt}.md` を作成
- [ ] **直前フェーズスキル**の SKILL.md を編集し、メインプロセス末尾の `REQUIRED SUB-SKILL` 行を新スキル名へ差し替え
- [ ] **直後フェーズスキル**の SKILL.md を編集し、`Integration` の `Called by:` に新スキル名を追記
- [ ] `.aide/references/progress-file-format.md` の該当ワークフローのフェーズ一覧に新フェーズ行を追加（フェーズ番号・状態・成果物の列）
- [ ] `docs-dev/02-ai-agent/02-phase-skills/` に解説ファイルを追加（一覧責務は第2章）
- [ ] ワークフロー入口フェーズを増やす場合のみ、ハブスキルの Quick Routing を更新（[add-workflow.md](./add-workflow.md) §3）
- [ ] 50 行超の SKILL.md を書く場合は Write（先頭50行）+ Append（残り）で分割書き込み

## 6. 動作確認手順

ローカルの `setup.bat` / `setup.sh` で配布した上で、最低限以下を確認する。

- [ ] `setup.bat` を再実行し、対象プラットフォームに新スキルがコピーされたことを目視確認
  - Kiro: `%USERPROFILE%\.kiro\skills\{fs-XXX}\SKILL.md` が存在
  - Claude Code: `%USERPROFILE%\.claude\skills\{fs-XXX}\SKILL.md` が存在
  - Copilot: `%USERPROFILE%\.copilot\skills\{fs-XXX}\SKILL.md` が存在
- [ ] 該当プラットフォームで新規セッションを開始し、ハブスキル経由で当該ワークフローに入る
- [ ] 直前フェーズの `REQUIRED SUB-SKILL` から新スキルが activate されることを確認
- [ ] 新スキルの skill:deploy 実行後に `aide-powers-skill--{fs-XXX}--*` が配置先（`.kiro/steering/` 等）に作成されることを確認
- [ ] 新スキル完了時に skill:cleanup が実行され、上記ファイルが削除されることを確認
- [ ] 完了処理が `git-commit-workflow` → `doc-index-maintenance` → 次フェーズ呼び出しの順で実行されることを確認

## 7. 注意事項・落とし穴

- **ワークフロー実作業禁止**: フェーズスキル本体に Write / Edit の実作業を書かない。実作業はサブエージェント（プロンプトテンプレート経由）か共通スキル経由で行う。
- **進捗ファイル例外**: 進捗ファイルの更新だけはワークフロー側で直接行ってよい（`fs-design-phase1-user-req` の `NO PROGRESS FILE EDIT EXCEPT BY THIS WORKFLOW` 参照）。それ以外を直接編集しない。
- **rules-distribute は省略禁止**: `global` モードと `skill:deploy` モードは別物。global が済んでいても skill:deploy は毎回実行する。完了時 `skill:cleanup` も忘れない。
- **`NO FAKE SIGNATURE`**: Integration や Iron Law をコピペで埋めるだけで終わらせない。実際にスキル内容と整合しているか自分で読み返す。
- **既存スキル名の再利用禁止**: フェーズ番号を入れ替えただけの別スキルを作ると、Quick Routing と REQUIRED SUB-SKILL のリンクが壊れる。新規追加と既存名変更は別作業として扱う。
- **進捗ファイルフォーマット同期忘れ**: フェーズ追加だけして `progress-file-format.md` を更新しないと、`progress-resume-check` が新フェーズを認識せず無限ループする。
- **第2章のドキュメント**: 一覧責務は第2章。本書（第3章）にスキルの中身を解説しない。
