# superpowers テスト詳細調査: プロンプトベーステスト

## 要約

superpowersのプロンプトベーステストは2カテゴリに分かれる。**skill-triggering** は「ユーザーがスキル名を言わずに自然な依頼をしたとき、Claudeが適切なスキルを自動選択するか」を検証する。**explicit-skill-requests** は「ユーザーがスキル名を明示的に指定したとき、Claudeが確実にそのスキルを呼び出すか（特にマルチターン会話で失敗しないか）」を検証する。両カテゴリとも `claude -p` コマンドでClaude Codeを非対話実行し、出力JSONから `"name":"Skill"` の呼び出し有無をgrepで判定する構造。aide-claudeでは、この「プロンプト→期待スキル」のマッピングテスト構造を、AIDEのスキル群に対して再利用できる。

---

## 1. tests/skill-triggering/（暗黙的スキルトリガーテスト）

### 1.1 概要

ユーザーがスキル名を一切言及せず、自然言語で依頼したときに、Claudeが文脈から適切なスキルを自動的に選択・呼び出すかを検証するテストカテゴリ。

### 1.2 run-test.sh

- **参照パス**: `references/superpowers/tests/skill-triggering/run-test.sh`
- **目的**: 単一スキルの暗黙トリガーテストを実行するランナー
- **引数**: `<skill-name> <prompt-file> [max-turns]`（デフォルト max-turns=3）
- **実行方法**: `./run-test.sh systematic-debugging ./prompts/systematic-debugging.txt`
- **処理フロー**:
  1. `/tmp/superpowers-tests/{timestamp}/skill-triggering/{skill-name}/` に出力ディレクトリを作成
  2. `claude -p "$PROMPT" --plugin-dir "$PLUGIN_DIR" --dangerously-skip-permissions --max-turns "$MAX_TURNS" --output-format stream-json` で実行
  3. 出力JSONから `"name":"Skill"` と `"skill":"([^"]*:)?{skill-name}"` をgrepで検索
  4. 両方マッチすればPASS、それ以外はFAIL
- **判定ロジック**: スキル名はnamespace付き（`superpowers:skill-name`）でもnamespace無し（`skill-name`）でもマッチする正規表現を使用

### 1.3 run-all.sh

- **参照パス**: `references/superpowers/tests/skill-triggering/run-all.sh`
- **目的**: 全6スキルの暗黙トリガーテストを一括実行
- **テスト対象スキル一覧**:
  1. `systematic-debugging`
  2. `test-driven-development`
  3. `writing-plans`
  4. `dispatching-parallel-agents`
  5. `executing-plans`
  6. `requesting-code-review`
- **処理**: 各スキルに対して `run-test.sh` を呼び出し、PASS/FAIL数を集計。1つでもFAILがあれば exit 1

### 1.4 プロンプトファイル一覧

#### prompts/systematic-debugging.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/systematic-debugging.txt`
- **内容**: テスト失敗のエラーログ（`TypeError: Cannot read property 'value' of undefined`）を貼り付け、「何が問題か調べて直して」と依頼
- **期待スキル**: `systematic-debugging`
- **設計意図**: エラーメッセージ + 修正依頼 → デバッグスキルが自動選択されるか

#### prompts/test-driven-development.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/test-driven-development.txt`
- **内容**: メールアドレスバリデーション機能の要件（@チェック、ドメインのドットチェック等）を列挙し、「実装して」と依頼
- **期待スキル**: `test-driven-development`
- **設計意図**: 明確な仕様 + 実装依頼 → TDDスキルが自動選択されるか

#### prompts/writing-plans.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/writing-plans.txt`
- **内容**: 認証システムの要件（ユーザー登録、JWT、パスワードリセット等）を記述し、「複数ステップが必要」と示唆
- **期待スキル**: `writing-plans`
- **設計意図**: 複雑な要件 + 実装の段階的必要性 → 計画作成スキルが自動選択されるか

#### prompts/dispatching-parallel-agents.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/dispatching-parallel-agents.txt`
- **内容**: 4つの独立したテスト失敗（auth, api, components, utils）を列挙し、「全部調べて」と依頼
- **期待スキル**: `dispatching-parallel-agents`
- **設計意図**: 独立した複数タスク → 並列エージェントディスパッチスキルが自動選択されるか

#### prompts/executing-plans.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/executing-plans.txt`
- **内容**: 既存の計画ドキュメントのパスを示し、「実装して」と依頼
- **期待スキル**: `executing-plans`
- **設計意図**: 計画ファイルの存在 + 実装依頼 → 計画実行スキルが自動選択されるか

#### prompts/requesting-code-review.txt
- **参照パス**: `references/superpowers/tests/skill-triggering/prompts/requesting-code-review.txt`
- **内容**: 認証機能の実装完了を報告し、コミット範囲を示して「マージ前にレビューして」と依頼
- **期待スキル**: `requesting-code-review`
- **設計意図**: 実装完了 + レビュー依頼 → コードレビュースキルが自動選択されるか

---

## 2. tests/explicit-skill-requests/（明示的スキルリクエストテスト）

### 2.1 概要

ユーザーがスキル名を明示的に指定して依頼したとき、Claudeが確実にそのスキルのSkillツールを呼び出すかを検証するテストカテゴリ。特に**マルチターン会話後にスキル呼び出しが失敗する問題**（Claudeが会話コンテキストから「もう知っている」と判断してスキルをスキップする問題）の検出に重点を置く。

### 2.2 run-test.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-test.sh`
- **目的**: 単一スキルの明示的リクエストテストを実行するランナー
- **引数**: `<skill-name> <prompt-file> [max-turns]`（デフォルト max-turns=3）
- **skill-triggering版との違い**:
  - テスト用プロジェクトディレクトリを自動作成（`docs/superpowers/plans/auth-system.md` を配置）
  - **premature action検出**: Skillツール呼び出し前に他のツール（TodoWrite以外）が呼ばれていないかチェック。Claudeがスキルをロードせずに作業を始めてしまう失敗モードを検出する
- **判定ロジック**: skill-triggering版と同じ正規表現マッチ + premature action警告

### 2.3 run-all.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-all.sh`
- **目的**: 基本的な明示的リクエストテスト4件を一括実行
- **テストケース一覧**:
  1. `subagent-driven-development` ← `subagent-driven-development-please.txt`
  2. `systematic-debugging` ← `use-systematic-debugging.txt`
  3. `brainstorming` ← `please-use-brainstorming.txt`
  4. `subagent-driven-development` ← `mid-conversation-execute-plan.txt`
- **処理**: 各テストに対して `run-test.sh` を呼び出し、PASS/FAIL数を集計

### 2.4 run-multiturn-test.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-multiturn-test.sh`
- **目的**: 3ターンのマルチターン会話後にスキルが正しくトリガーされるかを検証
- **テストフロー**:
  - Turn 1: 認証システムの計画を依頼（`--max-turns 2`）
  - Turn 2: 計画ファイルの存在を伝え、実行オプションを質問（`--continue`）
  - Turn 3: `"subagent-driven-development, please"` と明示的に依頼（`--continue`）
- **検証ポイント**: Turn 3でSkillツールが呼ばれるか + premature action検出
- **再現する失敗モード**: 会話が長くなるとClaudeがスキル名を「既知の概念」と認識し、Skillツールを呼ばずに自力で実行しようとする問題

### 2.5 run-extended-multiturn-test.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-extended-multiturn-test.sh`
- **目的**: 5ターンの長い会話後にスキルが正しくトリガーされるかを検証（run-multiturn-test.shの拡張版）
- **テストフロー**:
  - Turn 1: ブレインストーミング依頼
  - Turn 2: 技術的な回答（JWT、Email/Password）
  - Turn 3: 計画の作成依頼
  - Turn 4: 計画の確認、実行オプションの質問
  - Turn 5: `"subagent-driven-development, please"` と明示的に依頼
- **検証ポイント**: Turn 5でSkillツールが呼ばれるか
- **設計意図**: より長い会話コンテキストでの失敗を再現

### 2.6 run-haiku-test.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-haiku-test.sh`
- **目的**: Haiku（低コスト）モデルでマルチターンテストを実行し、モデル性能差による失敗を検出
- **run-extended-multiturn-test.shとの違い**:
  - `--model haiku` を全ターンで指定
  - ユーザーの `~/.claude/CLAUDE.md` をテスト環境にコピー（実環境を模倣）
  - ダミー計画ファイルにTask 4（テスト作成）を追加
- **設計意図**: 安価なモデルほどスキル呼び出しを省略しやすい傾向の検証

### 2.7 run-claude-describes-sdd.sh

- **参照パス**: `references/superpowers/tests/explicit-skill-requests/run-claude-describes-sdd.sh`
- **目的**: Claudeが先にSDD（subagent-driven-development）を説明した後、ユーザーがそれを要求したときにスキルが呼ばれるかを検証
- **テストフロー**:
  - Turn 1: 計画の実行オプションを質問し、SDDの意味と仕組みを説明させる（`--model haiku --max-turns 3`）
  - Turn 2: `"subagent-driven-development, please"` と依頼（`--continue --max-turns 2`）
- **再現する失敗モード**: Claudeが「自分はSDDを既に説明した＝理解している」と判断し、Skillツールを呼ばずに自力実行しようとする問題
- **設計意図**: 元の失敗シナリオの直接的な再現テスト

### 2.8 プロンプトファイル一覧

#### prompts/subagent-driven-development-please.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/subagent-driven-development-please.txt`
- **内容**: `subagent-driven-development, please`（1行のみ）
- **設計意図**: 最もシンプルな明示的リクエスト。ベースラインテスト

#### prompts/use-systematic-debugging.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/use-systematic-debugging.txt`
- **内容**: `use systematic-debugging to figure out what's wrong`（1行のみ）
- **設計意図**: 「use」キーワード + スキル名の明示的リクエスト

#### prompts/please-use-brainstorming.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/please-use-brainstorming.txt`
- **内容**: `please use the brainstorming skill to help me think through this feature`（1行のみ）
- **設計意図**: 「please use the ... skill」という丁寧な明示的リクエスト

#### prompts/mid-conversation-execute-plan.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/mid-conversation-execute-plan.txt`
- **内容**: 計画ファイルのパスを示した上で `subagent-driven-development, please`
- **設計意図**: コンテキスト情報付きの明示的リクエスト

#### prompts/action-oriented.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/action-oriented.txt`
- **内容**: 計画完了を伝え、「Do subagent-driven development on this」と命令形で依頼。Task 1から開始を指示
- **設計意図**: 命令形 + 具体的な作業指示を含む明示的リクエスト

#### prompts/skip-formalities.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/skip-formalities.txt`
- **内容**: 計画パスを示し、「Don't waste time - just read the plan and start dispatching subagents immediately」
- **設計意図**: 急かすトーン + 即時実行要求。Claudeがスキルをスキップして直接作業を始めやすい状況

#### prompts/after-planning-flow.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/after-planning-flow.txt`
- **内容**: 計画の要約 + 2つの実行オプション提示（Subagent-Driven / Parallel Session）の後に `subagent-driven-development, please`
- **設計意図**: Claudeの過去の応答を模倣したコンテキスト付きリクエスト。会話履歴にSDDの説明が含まれる状況

#### prompts/claude-suggested-it.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/claude-suggested-it.txt`
- **内容**: `[Previous assistant message]` としてClaudeの過去応答（実行オプション提示）を含め、`[Your response]` として `subagent-driven-development, please`
- **設計意図**: Claude自身がSDDを提案した後にユーザーがそれを選択するシナリオ

#### prompts/i-know-what-sdd-means.txt
- **参照パス**: `references/superpowers/tests/explicit-skill-requests/prompts/i-know-what-sdd-means.txt`
- **内容**: ユーザーがSDDの意味を自分で説明（「fresh subagent per task, review between tasks」）した上で実行を依頼
- **設計意図**: ユーザーがスキルの内容を理解していることを示した場合、Claudeが「説明不要＝Skillツール不要」と誤判断しないかの検証

---

## 3. テスト共通の技術的構造

### 3.1 実行基盤

| 要素 | 詳細 |
|---|---|
| 実行コマンド | `claude -p` (Claude Code CLI の非対話モード) |
| 出力形式 | `--output-format stream-json` |
| プラグイン指定 | `--plugin-dir "$PLUGIN_DIR"` (superpowersルートを指定) |
| 権限 | `--dangerously-skip-permissions` (テスト用に全権限許可) |
| タイムアウト | `timeout 300` (5分、skill-triggeringのみ) |
| マルチターン | `--continue` フラグで前のターンを継続 |

### 3.2 判定ロジック（共通）

```bash
SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
if grep -q '"name":"Skill"' "$LOG_FILE" && grep -qE "$SKILL_PATTERN" "$LOG_FILE"; then
    # PASS
fi
```

- `"name":"Skill"`: Skillツールが呼び出されたか
- `"skill":"..."`: 期待するスキル名がパラメータに含まれるか
- namespace付き（`superpowers:skill-name`）にも対応する正規表現

### 3.3 explicit-skill-requests固有: premature action検出

```bash
FIRST_SKILL_LINE=$(grep -n '"name":"Skill"' "$LOG_FILE" | head -1 | cut -d: -f1)
# Skillツール呼び出し前に他のツール（TodoWrite以外）が呼ばれていないかチェック
```

Claudeがスキルをロードせずに直接作業を始める失敗モードを検出する仕組み。

---

## 4. aide-claudeへの示唆

### 4.1 テスト構造の再利用

| superpowers の構造 | aide-claude での対応 |
|---|---|
| `tests/skill-triggering/` | AIDEのスキル（設計、実装、レビュー等）に対する暗黙トリガーテスト |
| `tests/explicit-skill-requests/` | AIDEのスキル名を明示的に指定した場合のテスト |
| `prompts/*.txt` | AIDEのユースケースに合わせたプロンプトファイル群 |
| `run-test.sh` | 共通テストランナー（判定ロジックはほぼそのまま流用可能） |
| `run-all.sh` | 全スキルの一括テスト |

### 4.2 マルチターンテストの重要性

explicit-skill-requestsカテゴリの主要な発見は、**マルチターン会話でスキル呼び出しが失敗する問題**である。aide-claudeでも以下のテストが必要:

- 設計フェーズの会話後に実装スキルを呼ぶテスト
- レビュー結果の議論後にリファクタリングスキルを呼ぶテスト
- 長い会話コンテキストでのスキル呼び出し安定性テスト

### 4.3 premature action検出の採用

aide-claudeでは、オーケストレーターがサブエージェントに委譲すべき作業を自力で始めてしまう問題が想定される。explicit-skill-requestsのpremature action検出ロジックは、この問題の検出に直接応用できる。

### 4.4 モデル差テストの考慮

run-haiku-test.shが示すように、低コストモデルほどスキル呼び出しを省略しやすい。aide-claudeでも複数モデルでのテストを検討すべき。

---

## 5. 参照ファイル一覧

### skill-triggering（8ファイル）
- `references/superpowers/tests/skill-triggering/run-all.sh`
- `references/superpowers/tests/skill-triggering/run-test.sh`
- `references/superpowers/tests/skill-triggering/prompts/systematic-debugging.txt`
- `references/superpowers/tests/skill-triggering/prompts/test-driven-development.txt`
- `references/superpowers/tests/skill-triggering/prompts/writing-plans.txt`
- `references/superpowers/tests/skill-triggering/prompts/dispatching-parallel-agents.txt`
- `references/superpowers/tests/skill-triggering/prompts/executing-plans.txt`
- `references/superpowers/tests/skill-triggering/prompts/requesting-code-review.txt`

### explicit-skill-requests（15ファイル）
- `references/superpowers/tests/explicit-skill-requests/run-all.sh`
- `references/superpowers/tests/explicit-skill-requests/run-test.sh`
- `references/superpowers/tests/explicit-skill-requests/run-multiturn-test.sh`
- `references/superpowers/tests/explicit-skill-requests/run-extended-multiturn-test.sh`
- `references/superpowers/tests/explicit-skill-requests/run-haiku-test.sh`
- `references/superpowers/tests/explicit-skill-requests/run-claude-describes-sdd.sh`
- `references/superpowers/tests/explicit-skill-requests/prompts/subagent-driven-development-please.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/use-systematic-debugging.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/please-use-brainstorming.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/mid-conversation-execute-plan.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/action-oriented.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/skip-formalities.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/after-planning-flow.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/claude-suggested-it.txt`
- `references/superpowers/tests/explicit-skill-requests/prompts/i-know-what-sdd-means.txt`
