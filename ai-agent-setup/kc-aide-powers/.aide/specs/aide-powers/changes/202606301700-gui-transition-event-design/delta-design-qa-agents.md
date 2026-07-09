# 差分設計書: QAエージェントへの検証観点追加

対象REQ-C: 004, 005

---

## REQ-C-004: architecture-qa-agent への検証観点追加

### 変更対象ファイル

- `agents/architecture-qa-agent.md`（Claude Code / Copilot CLI / VSCode Copilot 等）
- `agents/kiro/architecture-qa-agent.md`（Kiro IDE）
- `agents/kiro/prompts/architecture-qa-agent-prompt.md`（Kiro CLI）

3ファイルに同一の検証項目を追加する。以下は共通の変更内容（各ファイルの形式に合わせて記述）。

---

### 1. 検証項目 2-1 の拡張（GUI設計の要件充足）

#### 変更理由

既存の検証項目 2-1（GUI設計の要件充足）に、画面遷移フロー・イベント制御表・状態遷移図の存在確認と網羅性検証を追加する。これら3セクションのいずれかが欠落している場合はFAILとする。

#### before

```markdown
#### 2-1. GUI設計の要件充足

- 画面構成がユーザー要件のMust項目を全てカバーしているか
- Must要件ごとに、対応する画面・UI要素が存在するか1つずつ確認する
- 画面遷移が要件上のユースケースフローと整合しているか
- 対応する画面が見つからないMust要件があればFAIL
```

#### after

```markdown
#### 2-1. GUI設計の要件充足

- 画面構成がユーザー要件のMust項目を全てカバーしているか
- Must要件ごとに、対応する画面・UI要素が存在するか1つずつ確認する
- 画面遷移が要件上のユースケースフローと整合しているか
- 対応する画面が見つからないMust要件があればFAIL
- 画面遷移フローセクションが存在し、全画面間の遷移条件（遷移元・遷移先・トリガー操作・遷移条件）が網羅されているか。セクション欠落またはMermaid遷移図との不整合があればFAIL
- イベント制御表セクションが存在し、全画面の全操作可能コンポーネントのイベント（画面名・コンポーネント名・イベント種別・処理内容）が網羅されているか。セクション欠落または画面構成のUI要素一覧との不整合があればFAIL
- 状態遷移図セクションが存在し、状態を持つ画面・コンポーネントの状態遷移（対象・状態名・遷移トリガー・遷移条件・遷移先状態）が網羅されているか。セクション欠落または画面構成の「状態」定義との不整合があればFAIL
```

---

### 2. REJECTED出力への差し戻し先フォーマット追加

#### 変更理由

REQ-C-006（fixモード差し戻し機構）を実現するために、QAエージェントのREJECTED出力に「差し戻し先フェーズ名・不足観点」を明示するフォーマットを追加する。

#### before

```markdown
### FAIL項目の修正指示
| # | 対象成果物 | 修正内容 |
|---|---|---|
| 1 | {ファイル名} | {具体的な修正内容: 「何を」「どう直すか」を明記} |
```

#### after

```markdown
### FAIL項目の修正指示
| # | 対象成果物 | 修正内容 | 差し戻し先（該当時のみ） |
|---|---|---|---|
| 1 | {ファイル名} | {具体的な修正内容: 「何を」「どう直すか」を明記} | {差し戻し先フェーズ名と不足観点。当該成果物の修正で解決する場合は「—」} |

**差し戻し先の記載ルール:**
- FAIL原因がgui-design.md自体の不足（セクション欠落・網羅性不足）→ 差し戻し先: `fs-design-phase5-gui（fix）`、不足観点: 具体的に欠落している内容
- FAIL原因がユースケース分析の不足（画面操作レベルのUCが未定義）→ 差し戻し先: `fs-design-phase6-usecase（fix）`、不足観点: 不足しているUC分析の範囲
- FAIL原因がレビュー対象ファイル自体の記述不足 → 差し戻し先: 「—」（当該ファイルの修正で解決）
```

---

## REQ-C-005: object-design-qa-agent への整合性検証観点追加 + 考慮漏れ検証の新規追加

### 変更対象ファイル

- `agents/object-design-qa-agent.md`（Claude Code / Copilot CLI / VSCode Copilot 等）— **編集済み**
- `agents/kiro/object-design-qa-agent.md`（Kiro IDE）— 未編集（同様の変更を適用する）
- `agents/kiro/prompts/object-design-qa-agent-prompt.md`（Kiro CLI）— 未編集（同様の変更を適用する）

---

### 1. 入力に `doc_index_path` を追加

#### 変更理由

ステップ2（考慮漏れ検証）で doc-index.md から設計書を辿って機能リストを作成し、設計書との照合を行うために `doc_index_path` を入力パラメータとして追加する。

#### before

```markdown
## 入力

呼び出し元から以下の情報を受け取ります:

- feature_name
- レビュー対象ファイルパスのリスト（object-design-*.md, ubiquitous-language.md）
- 前提成果物ファイルパスのリスト（user-requirements.md, system-requirements.md, gui-design.md, layered-architecture.md）
```

#### after

```markdown
## 入力

呼び出し元から以下の情報を受け取ります:

- feature_name
- レビュー対象ファイルパスのリスト（object-design-*.md, ubiquitous-language.md）
- 前提成果物ファイルパスのリスト（user-requirements.md, system-requirements.md, gui-design.md, layered-architecture.md）
- doc_index_path（doc-index.md のパス。全設計ドキュメントを参照するために使用）
```

#### 適用状況
- `agents/object-design-qa-agent.md`: **編集済み**
- `agents/kiro/object-design-qa-agent.md`: 未編集 — 同様の変更を適用する
- `agents/kiro/prompts/object-design-qa-agent-prompt.md`: 未編集 — 同様の変更を適用する

---

### 2. ステップ2「考慮漏れ検証」の新規追加

#### 変更理由

従来のレビュープロセスはステップ1（読み込み）→ ステップ2（検証項目の実行）→ ステップ3（判定と結果の出力）の3ステップだった。要件定義書・アーキテクチャ設計書から機能リストを抽出し、レビュー対象の設計書に全機能が網羅されているかを検証する「考慮漏れ検証」ステップを新規挿入し、設計漏れの検出精度を向上させる。

#### before

```markdown
## レビュープロセス

### ステップ1: レビュー対象の読み込み

指定されたレビュー対象ファイルおよび前提成果物を全て読み込む。ファイルが存在しない場合はその旨を指摘する。

### ステップ2: 検証項目の実行

以下の検証項目を全て実行する。一部スキップは禁止（DDD不採用の場合の例外あり）。
```

#### after

```markdown
## レビュープロセス

### ステップ1: レビュー対象の読み込み

指定されたレビュー対象ファイルおよび前提成果物を全て読み込む。ファイルが存在しない場合はその旨を指摘する。

### ステップ2: 考慮漏れ検証

- doc_index_path から doc-index.md を読み込み、ユーザー要件（user-requirements.md）、システム要件（system-requirements.md）、アーキテクチャ設計書（layered-architecture.md）を特定して読み込む。
- 上記の設計書より、該当レイヤーの責務に関連する機能リストを作成。
- 機能リストにある機能が全てレビューターゲットとなるオブジェクト設計書に記載があるか確認。漏れがあればFAIL
- パブリックメソッドやクラス設計の記述にその責務について明確に記述されていること。input/outputが明確に指定されており、責務と矛盾がないこと。漏れがあればFAIL
- 各要件や技術調査結果により、処理方法や、パラメータなど、設計や実装にかかる具体的な記述があればその内容が、該当機能の設計記述箇所に記載されていること。漏れがあればFAIL



### ステップ3: 検証項目の実行

以下の検証項目を全て実行する。一部スキップは禁止（DDD不採用の場合の例外あり）。
```

#### 適用状況
- `agents/object-design-qa-agent.md`: **編集済み**
- `agents/kiro/object-design-qa-agent.md`: 未編集 — 同様の変更を適用する（現状はステップ1→ステップ2（検証項目の実行）→ステップ3（判定と結果の出力）の構成。ステップ2として「考慮漏れ検証」を挿入し、既存ステップ2→ステップ3、既存ステップ3→ステップ4 に番号を繰り下げる）
- `agents/kiro/prompts/object-design-qa-agent-prompt.md`: 未編集 — 同様の変更を適用する

---

### 3. ステップ番号の繰り下げ（ステップ2挿入に伴う）

#### 変更理由

ステップ2に「考慮漏れ検証」を挿入したことにより、既存のステップ番号を繰り下げる。

#### before

```markdown
### ステップ2: 検証項目の実行
（... A〜I の検証項目 ...）

### ステップ3: 判定と結果の出力
```

#### after

```markdown
### ステップ3: 検証項目の実行
（... A〜I の検証項目 ...）

### ステップ4: 判定と結果の出力
```

#### 適用状況
- `agents/object-design-qa-agent.md`: **編集済み**（ただし現在のファイルではステップ3が「検証項目の実行」、ステップ3が「判定と結果の出力」と記載されている — 実質的に番号が1つずつ繰り下がっている）
- `agents/kiro/object-design-qa-agent.md`: 未編集 — 同様の変更を適用する
- `agents/kiro/prompts/object-design-qa-agent-prompt.md`: 未編集 — 同様の変更を適用する

---

## design-qa-dispatch への doc_index_path / review_scope 入力追加

### 変更対象ファイル

- `skills/design-qa-dispatch/SKILL.md` — **編集済み**

### 変更理由

object-design-qa-agent がステップ2（考慮漏れ検証）で doc-index.md を参照する必要があるため、design-qa-dispatch の入力パラメータに `doc_index_path` を追加する。また、個別レイヤーレビュー（REQ-C-007）でレビュー範囲を限定する必要があるため `review_scope` を追加する。これらのパラメータは design-qa-dispatch を経由して各QAレビューアーに渡される。

---

### 1. 入力パラメータへの追加

#### before

```markdown
**入力:**
- mode: `"design-workflow"` / `"delta-design"`
- affected_domains: 影響を受ける設計領域のリスト（delta-design モードの場合）
- target_reviewer: 呼び出すQAレビューアー名（design-workflow モードの場合）
- review_target_files: レビュー対象ファイルパスのリスト
- prerequisite_files: 前提成果物ファイルパスのリスト
- feature_name: フィーチャー名
```

#### after

```markdown
**入力:**
- mode: `"design-workflow"` / `"delta-design"`
- affected_domains: 影響を受ける設計領域のリスト（delta-design モードの場合）
- target_reviewer: 呼び出すQAレビューアー名（design-workflow モードの場合）。「設計領域 → QAレビューアー 対応表」に記載されたQAレビューアーのいずれかを指定する:
  - `requirements-qa-agent` — 要件定義レビュー（ゲート1）
  - `architecture-qa-agent` — アーキテクチャレビュー（ゲート2）
  - `object-design-qa-agent` — オブジェクト設計レビュー（ゲート3）
  - `final-design-qa-agent` — 最終設計レビュー（ゲート4）
- review_target_files: レビュー対象ファイルパスのリスト
- prerequisite_files: 前提成果物ファイルパスのリスト
- feature_name: フィーチャー名
- doc_index_path: doc-index.md のパス（QAレビューアーが全設計ドキュメントを参照するために使用）
- review_scope:（オプション）レビュー範囲の限定指示（例: 特定レイヤーのみ、全体整合性のみ）
```

---

### 2. Step 3 の各QAレビューアーへの渡し情報に追加

#### before

```markdown
**Step 3:** QAレビューアーの呼び出し（差分設計モード）
- 選択された全てのQAレビューアーエージェントを Task で呼び出す
- 各QAレビューアーに以下を渡す:
  - レビュー対象ファイル（review_target_files）
  - 前提成果物ファイル（prerequisite_files）
  - feature_name
```

#### after

```markdown
**Step 3:** QAレビューアーの呼び出し（差分設計モード）
- 選択された全てのQAレビューアーエージェントを Task で呼び出す
- 各QAレビューアーに以下を渡す:
  - レビュー対象ファイル（review_target_files）
  - 前提成果物ファイル（prerequisite_files）
  - feature_name
  - doc_index_path（QAレビューアーが関連設計ドキュメントを自律的に参照するため）
  - review_scope（指定されている場合）
```

---

### 3. Input from caller セクションへの追記

#### before

```markdown
**Input from caller:**
- mode（"design-workflow" / "delta-design"）
- affected_domains（影響を受ける設計領域のリスト、delta-design モードの場合）
- target_reviewer（呼び出すQAレビューアー名、design-workflow モードの場合）
- review_target_files（レビュー対象ファイルパスのリスト）
- prerequisite_files（前提成果物ファイルパスのリスト）
- feature_name（フィーチャー名）
```

#### after

```markdown
**Input from caller:**
- mode（"design-workflow" / "delta-design"）
- affected_domains（影響を受ける設計領域のリスト、delta-design モードの場合）
- target_reviewer（呼び出すQAレビューアー名、design-workflow モードの場合。許容値: requirements-qa-agent / architecture-qa-agent / object-design-qa-agent / final-design-qa-agent）
- review_target_files（レビュー対象ファイルパスのリスト）
- prerequisite_files（前提成果物ファイルパスのリスト）
- feature_name（フィーチャー名）
- doc_index_path（doc-index.md のパス。QAレビューアーが全設計ドキュメントを確認するために使用）
- review_scope（オプション。レビュー範囲の限定指示）
```

#### 適用状況
- `skills/design-qa-dispatch/SKILL.md`: **編集済み**
