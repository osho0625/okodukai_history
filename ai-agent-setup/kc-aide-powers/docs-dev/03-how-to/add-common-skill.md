# 共通スキルを追加する手順

複数のワークフローから呼び出される再利用スキル（`design-gate`, `multi-stage-code-review`, `git-commit-workflow` 等と同列）を追加する場合の作業手順をまとめる。

機構の説明（共通スキルとフェーズスキルの違い、`rules-distribute` の skill モード等）は本書では扱わない。次を参照。

- 共通スキル / メタスキルの責務分担 → [第1章 アーキテクチャ](../01-system-platform/00-architecture.md)
- 共通スキル一覧と中身 → [第2章 03-common-skills](../02-ai-agent/03-common-skills/)
- ルール配布機構 → [第1章 03-platform-bootstrap](../01-system-platform/03-platform-bootstrap/)

本書は「やり方」だけを書く。

## 1. 成果物

1共通スキル追加で必ず作成・更新するもの:

- 新規: `skills/{skill-name}/SKILL.md`
- 必要に応じて新規: `skills/{skill-name}/{purpose}-prompt.md`（サブエージェント委譲時）
- 必要に応じて新規: `skills/{skill-name}/references/{*}.md`（参照ドキュメント）
- 更新: 呼び出し元スキル（フェーズスキル / 他共通スキル）の `Integration` セクション
- 更新: `docs-dev/02-ai-agent/03-common-skills/` の章責務範囲（中身解説は第2章担当）

## 2. 配置先・命名規則

| 項目 | ルール | 例 |
|---|---|---|
| 配置先 | `skills/{skill-name}/SKILL.md` | `skills/design-gate/SKILL.md` |
| スキル名（フォルダ名 = `name`） | 機能名そのものを小文字ケバブケース。`fs-` プレフィックスは付けない | `design-gate`, `multi-stage-code-review`, `git-commit-workflow` |
| 動詞ベースの名前 | 「何をするスキルか」がわかる動詞・名詞句を使う | `doc-sync`, `pending-issues-management`, `progress-resume-check` |
| 禁止接尾辞 | `Manager`, `Handler`, `Util` 等の責務曖昧な接尾辞は禁止（共通用語辞書 §13 参照） | ✗ `commit-manager` → ✓ `git-commit-workflow` |
| 付随ファイル | `skills/{skill-name}/` 直下に配置 | `skills/multi-stage-code-review/spec-reviewer-prompt.md` |
| 参照ファイル | `skills/{skill-name}/references/{*}.md` | `skills/impl-coding-standards/references/python-coding-rules.md` |

フェーズスキル（`fs-*`）と共通スキルの違いを混同しないこと。フェーズスキルはワークフロー内の1フェーズに紐づき、共通スキルはどのワークフローからも呼ばれる横断機能である。

## 3. SKILL.md の必須セクション

`skills/design-gate/SKILL.md` と `skills/multi-stage-code-review/SKILL.md` が代表例。下記のセクションを **すべて** 持つこと。

### 3-1. frontmatter（必須）

```yaml
---
name: {スキル名（フォルダ名と完全一致）}
description: "{Use when ... 形式の英語1〜2文。トリガー条件と用途を明示する}"
---
```

### 3-2. タイトル + Overview

```markdown
# {日本語タイトル}

## Overview

{このスキルが何をするスキルかを2〜4行で説明する}

**Core principle:** {このスキルで絶対に守る一文}
```

### 3-3. The Iron Law

このスキルが守らせる絶対ルールを1〜複数項目で列挙する。`design-gate` の `NO IMPLEMENTATION WITHOUT COMPLETE DESIGN DOCUMENTS`、`multi-stage-code-review` の `NO CODE ACCEPTED WITHOUT BOTH DESIGN COMPLIANCE AND QUALITY REVIEW PASSING` が好例。

### 3-4. When to Use

```markdown
## When to Use

**Always:**
- {このスキルが呼び出される具体的トリガー}

**Exceptions (ask your human partner):**
- {例外。なければ「なし」と書く}
```

### 3-5. メインプロセス

擬似フロー（既存スキルのコードブロック形式）で記述する。共通スキルはフェーズスキルから呼ばれて実作業を担うため、ステップは具体的に書く。

- 入力（呼び出し元から渡されるもの）と出力（成果物）を明示
- 分岐・ループは ASCII フローで書く
- サブエージェントに更に委譲する場合は委譲先エージェント名を明記

### 3-6. 完了条件 / 判定ロジック

ゲート系・判定系の場合は判定基準を表で書く（`design-gate` のドキュメント状態判定が好例）。実作業系の場合は完了条件をチェックリストで書く。

### 3-7. Red Flags - STOP

最低6項目。「省略しよう」「単純だから不要」を停止させる思考パターンを列挙する。

### 3-8. Common Rationalizations

最低5項目。AI が省略を正当化する言い訳と現実をペアで書く。

### 3-9. Integration

```markdown
## Integration

**Required workflow skills:**
- {このスキル内で呼び出す他スキル}

**Called by:**
- {呼び出し元の一覧（ワークフロー名 または フェーズスキル名）}

**Calls:**
- {このスキルから呼び出す他スキル / エージェント}

**Required agents:**
- {このスキルが委譲する agents/ 配下のエージェント名}

**Related skills:**
- {関連スキル（任意）}
```

### 3-10. グローバルルール参照（任意）

フェーズスキルでは必須だが、共通スキルでは呼び出し元のフェーズスキルが既に参照しているため省略可。ただし独立して呼ばれる可能性がある場合は記載すること。

## 4. `rules-distribute` の skill モード対応

`rules-distribute` スキルの skill:deploy モードは「aide-powers の全スキル」が対象（フェーズスキルだけではない）。新規共通スキルを呼び出す側で skill:deploy / skill:cleanup の責任を持つこと。

- フェーズスキル経由で共通スキルを呼ぶ場合: フェーズスキル側の skill:deploy / skill:cleanup でカバーされる
- 共通スキル単独で呼ばれる場合（メタスキルとして直接活性化される場合）: 共通スキル自身に skill:deploy / skill:cleanup の手順を含めるか、呼び出し元が責任を持つかを明示する

詳細は `skills/rules-distribute/SKILL.md` の「ステップ3: skill モード」を参照。

## 5. 付随ファイル（プロンプトテンプレート / references）

### プロンプトテンプレート

サブエージェントへの委譲を持つ共通スキルの場合（`multi-stage-code-review` の `spec-reviewer-prompt.md` 等）、以下を持つ `.md` を `skills/{skill-name}/` 直下に配置する。

- 役割宣言
- 入力（パラメータ一覧）
- 担当範囲 / 担当外
- プロセス
- 出力
- 完了報告フォーマット（4ステータス: `DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED`）

### references

スキルが参照する補助ドキュメント（コーディング規約、フォーマット定義等）は `skills/{skill-name}/references/{*}.md` に置く。SKILL.md 本体は短く保ち、肥大化する規約類は references に逃がす（`impl-coding-standards` が好例）。

## 6. 全体への登録手順（チェックリスト）

新規共通スキルを aide-powers に組み込むための更新作業。順番に潰すこと。

- [ ] `skills/{skill-name}/SKILL.md` を作成（§3 の全セクションを満たす）
- [ ] 必要なら `skills/{skill-name}/{*-prompt}.md` を作成
- [ ] 必要なら `skills/{skill-name}/references/{*}.md` を作成
- [ ] **呼び出し元のフェーズスキル / 共通スキル**を編集し、`Integration` の `Calls:` または `Required workflow skills:` に新スキル名を追記
- [ ] **呼び出し元のメインプロセス**に新スキルの呼び出しステップを差し込む（既存ステップ番号を保ちながら挿入）
- [ ] `docs-dev/02-ai-agent/03-common-skills/` に解説ファイルを追加（一覧・中身は第2章責務）
- [ ] 50 行超の SKILL.md を書く場合は Write（先頭50行）+ Append（残り）で分割書き込み

ハブスキル（`using-aide-powers` / `aide-powers-guide`）と global-rules.md の更新は **不要**。共通スキルは Quick Routing の対象外。
ハブスキルの更新が必要になるのはワークフロー入口を持つフェーズスキルだけ（[add-workflow.md](./add-workflow.md) 参照）。

## 7. 動作確認手順

- [ ] `setup.bat` / `setup.sh` を再実行し、対象プラットフォームに新スキルがコピーされたことを目視確認
- [ ] 該当プラットフォームで新規セッションを開始し、新スキルを呼び出すワークフローを実行
- [ ] 呼び出し元から `Use aide-powers:{skill-name}` で activate されることを確認
- [ ] サブエージェント委譲がある場合、プロンプトテンプレートが読み込まれて期待通りの委譲が走ることを確認
- [ ] 新スキルが skill:deploy 対象になっている場合、`aide-powers-skill--{skill-name}--*` ファイルが配置されることを確認
- [ ] スキル完了時に skill:cleanup されていることを確認
- [ ] 既存ワークフロー全体を1サイクル流して、回帰がないことを確認

## 8. 注意事項・落とし穴

- **`fs-` プレフィックスを付けない**: 共通スキルは Quick Routing の対象外。`fs-` を付けるとフェーズスキル扱いされ Quick Routing 表に紛れ込む。
- **責務曖昧な命名禁止**: `Manager` / `Handler` / `Util` 等の汎用接尾辞は禁止（共通用語辞書 §13）。「動詞 + 対象」の形にする（`doc-sync`, `pending-issues-management` 等）。
- **複数ワークフローからの呼び出しを前提にする**: 1ワークフロー固有の処理ならフェーズスキルにする方が適切。共通スキルは複数のフェーズスキル / 他共通スキルから呼ばれる前提で設計する。
- **メインプロセス内で別ワークフローを起動しない**: 共通スキルはあくまで横断機能。ワークフローの起動・遷移はフェーズスキル側の責務。
- **rules-distribute スキル自身を共通スキルから呼ばない**: rules-distribute の skill:deploy / skill:cleanup はフェーズスキルか直接呼び出されるメタスキルが担当する。共通スキルから rules-distribute を呼ぶと配置責任が曖昧になる。
- **agents/ との混同**: 名前付きエージェント（`agents/`）と共通スキル（`skills/`）は別物。レビュー・実装・QAなど「役割人格」を持つものは agents/、手順・ゲート・規約配布など「処理手順」は skills/。境界が不明な場合は [add-agent.md](./add-agent.md) と読み比べて選ぶこと。
- **第2章のドキュメント**: スキルの中身解説は第2章。本書（第3章）に解説を書かない。
