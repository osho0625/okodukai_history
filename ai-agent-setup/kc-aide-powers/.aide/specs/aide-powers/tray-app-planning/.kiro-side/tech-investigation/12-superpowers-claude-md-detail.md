# 技術調査: superpowers CLAUDE.md の詳細分析

## 要約

superpowersの `CLAUDE.md` は**コントリビューター（PR提出者）向けのガイドライン**であり、エンドユーザー向けのガイドではない。全体で約90行、7セクション構成で、PR拒否率94%という厳しい品質基準を前面に出し、AIエージェントによる低品質PR提出を防ぐことに特化している。Claude Codeはセッション開始時にCLAUDE.mdを自動読み込みするが、superpowersではCLAUDE.mdをスキルの読み込みやワークフロー制御には使用せず、それらはhooks/session-start経由のハブスキル（using-superpowers/SKILL.md）が担当する。aide-claudeでは、superpowersのコントリビューターガイドラインの代わりに、AIDEのグローバルルール（フェーズ省略禁止、実作業禁止、敬語等）とオーケストレーター選択ガイドを記載する必要があるが、Anthropic公式推奨の200行以下に収めるための設計戦略が必要である。

## 調査概要

| 項目 | 内容 |
|---|---|
| 調査対象 | `references/superpowers/CLAUDE.md` およびCLAUDE.mdの役割・仕組み |
| 調査日 | 2025-07-19 |
| 調査の背景 | aide-claudeのCLAUDE.md設計の基礎資料として、superpowersのCLAUDE.mdの詳細を把握する |

---

## 1. CLAUDE.md の全内容分析

### 1.1 ファイルの基本情報

| 項目 | 値 |
|---|---|
| ファイルパス | `references/superpowers/CLAUDE.md` |
| タイトル | `# Superpowers — Contributor Guidelines` |
| 概算行数 | 約90行（空行含む） |
| セクション数 | 7セクション |
| 対象読者 | コントリビューター（PR提出者）、特にAIエージェント |

### 1.2 セクション構成と内容

#### セクション1: `## If You Are an AI Agent`（約20行）

**内容**: AIエージェントに対する最優先の警告。PR拒否率94%を冒頭で提示し、低品質PRが「human partnerの恥」になると強調。PR提出前に必須の5つのチェック項目を列挙。

**ルールの書き方パターン**:
- 命令形（「Stop. Read this section before doing anything.」）
- 太字による強調（「**Your job is to protect your human partner from that outcome.**」）
- 番号付きリスト（5項目の必須チェック）
- 感情に訴える表現（「a tool of embarrassment」）

**5つの必須チェック**:
1. PRテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）を全セクション記入
2. 既存PR（open/closed両方）の重複チェック
3. 実際の問題であることの確認（「fix some issues」のような曖昧な指示への抵抗）
4. コアに属する変更かの確認（ドメイン固有ならスタンドアロンプラグインへ）
5. human partnerに完全なdiffを見せて明示的承認を得る

#### セクション2: `## Pull Request Requirements`（約5行）

**内容**: PRテンプレートの全セクション記入義務、既存PRの検索義務、人間の関与の証拠がないPRの即時クローズ。

**ルールの書き方パターン**:
- 太字で始まる段落（「**Every PR must...**」「**Before opening a PR...**」「**PRs that show no evidence...**」）
- 結果の明示（「will be closed without review」）

#### セクション3: `## What We Will Not Accept`（約40行、最大セクション）

**内容**: 受け入れない変更の種類を8カテゴリに分類。各カテゴリにサブヘッダー（`###`）を使用。

| サブセクション | 内容 |
|---|---|
| Third-party dependencies | ゼロ依存原則。新しいハーネス追加以外の外部依存は不可 |
| "Compliance" changes to skills | Anthropic公式ガイドへの「準拠」目的のスキル変更は不可。eval証拠が必要 |
| Project-specific or personal configuration | 特定プロジェクト/チーム/ドメイン向けの変更は不可 |
| Bulk or spray-and-pray PRs | Issue一覧を一括処理するPRは不可。1つのIssueに深く取り組むこと |
| Speculative or theoretical fixes | 理論的な修正は不可。実際に経験した問題のみ |
| Domain-specific skills | 汎用スキルのみ。ドメイン固有はスタンドアロンプラグインへ |
| Fork-specific changes | フォーク固有の変更は不可 |
| Fabricated content | 捏造された内容は即時クローズ |
| Bundled unrelated changes | 無関係な変更のバンドルは不可 |

**ルールの書き方パターン**:
- `###` サブヘッダーで分類
- 各カテゴリの冒頭で「何が不可か」を明示
- 理由の説明（「Superpowers is a zero-dependency plugin by design.」）
- 代替手段の提示（「it belongs in its own plugin」）

#### セクション4: `## Skill Changes Require Evaluation`（約8行）

**内容**: スキルは「prose（散文）」ではなく「code that shapes agent behavior（エージェントの振る舞いを形作るコード）」であるという哲学。スキル変更時の要件。

**要件**:
- `superpowers:writing-skills` を使って開発・テスト
- 複数セッションでの敵対的プレッシャーテスト
- before/afterのeval結果をPRに提示
- 慎重にチューニングされたコンテンツ（Red Flagsテーブル、合理化リスト、「human partner」言語）の変更にはevidenceが必要

#### セクション5: `## Understand the Project Before Contributing`（約5行）

**内容**: スキル設計、ワークフロー哲学、アーキテクチャへの変更提案前に、既存スキルを読んで設計判断を理解すること。「human partner」は意図的な用語選択であり、「the user」と交換不可。

#### セクション6: `## General`（約5行）

**内容**: 一般的なPR要件の箇条書き。

- PRテンプレートを読む
- 1つのPRに1つの問題
- 少なくとも1つのハーネスでテストし、環境テーブルに結果を記載
- 変更内容ではなく、解決した問題を記述

### 1.3 ルールの書き方パターンまとめ

| パターン | 使用箇所 | 効果 |
|---|---|---|
| 命令形（Stop. Read.） | AIエージェント向けセクション冒頭 | 即座の注意喚起 |
| 太字段落（**Every PR must...**） | 各セクションの主要ルール | 視覚的な強調 |
| 番号付きリスト | 必須チェック項目 | 順序と網羅性の明示 |
| `###` サブヘッダー分類 | 不受理カテゴリ | スキャンしやすい構造 |
| 感情に訴える表現 | AIエージェント向け | 行動変容の動機付け |
| 結果の明示（will be closed） | 各ルール | 違反時の結果を予告 |
| 代替手段の提示 | 不受理カテゴリ | 正しい行動への誘導 |
| 具体的な数値（94%） | 冒頭 | 信頼性と緊急性の付与 |

---

## 2. CLAUDE.md の役割の明確化

### 2.1 コントリビューター向けガイドラインであることの確認

superpowersのCLAUDE.mdは**エンドユーザー向けのガイドではなく、コントリビューター（PR提出者）向けのガイドライン**である。

**根拠**:
- タイトルが「Contributor Guidelines」
- 内容がPR要件、受入基準、スキル変更ルールに特化
- エンドユーザーのスキル使用方法は一切記載されていない
- program-structure.mdの記載: 「Claude Code 向けコントリビューターガイドライン。PR 要件、受け入れ基準、スキル変更ルールを定義」
- tech-ref-project-anatomy.mdの記載: 「エージェントの行動規範・PR受入基準に影響」

### 2.2 Claude Code がCLAUDE.md をどのように読み込むか

Anthropic公式ドキュメント（[How Claude remembers your project](https://docs.anthropic.com/en/docs/claude-code/memory)）に基づく情報:

| 項目 | 内容 |
|---|---|
| 読み込みタイミング | セッション開始時に自動読み込み |
| 読み込み方式 | カレントディレクトリから上位ディレクトリへ再帰的に走査し、各ディレクトリのCLAUDE.mdとCLAUDE.local.mdを読み込む |
| サブディレクトリ | サブディレクトリのCLAUDE.mdはオンデマンド（そのディレクトリのファイルを読んだ時）に読み込み |
| コンテキストへの注入 | システムプロンプトの後にユーザーメッセージとして注入（システムプロンプトの一部ではない） |
| 複数ファイルの扱い | 発見された全ファイルが連結される（上書きではない）。同一ディレクトリ内ではCLAUDE.local.mdがCLAUDE.mdの後に追加 |
| HTMLコメント | ブロックレベルのHTMLコメントはコンテキスト注入前に除去される |
| @import構文 | `@path/to/file` でファイルをインポート可能。最大5ホップの再帰インポート |
| compaction後 | プロジェクトルートのCLAUDE.mdはcompaction後に再読み込みされる。サブディレクトリのCLAUDE.mdは自動再注入されない |

**情報源**: [Anthropic公式ドキュメント: How Claude remembers your project](https://docs.anthropic.com/en/docs/claude-code/memory)（確認日: 2025-07-19）

### 2.3 CLAUDE.md のサイズ制限

| 情報源 | 推奨サイズ |
|---|---|
| Anthropic公式ドキュメント | 「target under 200 lines per CLAUDE.md file」 |
| Anthropic公式ドキュメント | 「Longer files consume more context and reduce adherence」 |
| Anthropic公式ドキュメント | 200行超の場合は `@import` や `.claude/rules/` への分割を推奨 |

**superpowersのCLAUDE.mdは約90行**であり、200行制限の範囲内に十分収まっている。

**重要な補足**: CLAUDE.mdの200行制限はCLAUDE.mdファイル単体の推奨値。auto memoryのMEMORY.mdは「最初の200行または25KB」が読み込まれるという別の制限がある。CLAUDE.mdファイル自体は長さに関わらず全文読み込まれるが、長いほどadherence（遵守率）が下がるとAnthropicは警告している。

### 2.4 AGENTS.md との関係

superpowersの `AGENTS.md` の内容は以下の1行のみ:

```
CLAUDE.md
```

Anthropic公式ドキュメントによると、AGENTS.mdは他のコーディングエージェント向けのファイルであり、Claude CodeはCLAUDE.mdを読む。AGENTS.mdにCLAUDE.mdへの参照を書くことで、両方のツールが同じ指示を読めるようにしている。superpowersではAGENTS.mdの内容を「CLAUDE.md」の1行にすることで、AGENTS.mdを読むエージェントにCLAUDE.mdの内容を参照させている。

---

## 3. CLAUDE.md と他のファイルとの役割分担

### 3.1 CLAUDE.md とスキル（skills/）の役割分担

| 観点 | CLAUDE.md | skills/ |
|---|---|---|
| 読み込みタイミング | セッション開始時に自動読み込み | Skillツールによるオンデマンド読み込み |
| 対象読者 | コントリビューター（PR提出者） | エージェント（タスク実行時） |
| 内容の性質 | 行動規範・ルール・制約 | ワークフロー・手順・テクニック |
| superpowersでの内容 | PR要件、受入基準、スキル変更ルール | ブレインストーミング、TDD、デバッグ等の具体的手順 |
| コンテキスト消費 | 毎セッション消費（常時） | 必要時のみ消費（オンデマンド） |

**重要な設計判断**: superpowersでは、スキルの発見・読み込みルール（Red Flagsテーブル等）はCLAUDE.mdではなく、ハブスキル（using-superpowers/SKILL.md）に記載されている。CLAUDE.mdにはスキルの使い方に関する記述は一切ない。

### 3.2 CLAUDE.md とエージェント定義（agents/）の役割分担

| 観点 | CLAUDE.md | agents/ |
|---|---|---|
| 役割 | プロジェクト全体のルール | 特定の役割を持つエージェントの定義 |
| superpowersでの内容 | コントリビューターガイドライン | code-reviewer.md（コードレビューエージェント） |
| 関係 | エージェントもCLAUDE.mdのルールに従う | エージェントは独自のシステムプロンプトを持つ |

### 3.3 CLAUDE.md とフック（hooks/）の役割分担

| 観点 | CLAUDE.md | hooks/ |
|---|---|---|
| 読み込み方式 | Claude Codeが自動読み込み | hooks.jsonで定義されたイベントで実行 |
| superpowersでの内容 | コントリビューターガイドライン | session-startがusing-superpowers/SKILL.mdをJSONコンテキストとして注入 |
| 関係 | 独立（相互参照なし） | フックはCLAUDE.mdを読み込まない。フックはハブスキルを注入する |

**重要な発見**: superpowersでは、CLAUDE.mdとhooks/session-startは完全に独立している。session-startはusing-superpowers/SKILL.mdのみを読み込み、CLAUDE.mdの内容は注入しない。CLAUDE.mdはClaude Codeの自動読み込み機構によって別途読み込まれる。

### 3.4 CLAUDE.md に書くべき内容 vs スキルに委譲すべき内容の境界

superpowersの実装から読み取れる境界:

| CLAUDE.mdに書くべき内容 | スキルに委譲すべき内容 |
|---|---|
| プロジェクト全体のルール・制約 | 具体的なワークフロー手順 |
| 毎セッションで遵守すべき行動規範 | タスクに応じて読み込む手順書 |
| 変更不可の原則（ゼロ依存等） | 状況に応じた判断フロー |
| PR要件・受入基準 | スキルの発見・読み込みルール |
| 用語の定義（「human partner」等） | Red Flagsテーブル、合理化リスト |

**superpowersの設計原則**: CLAUDE.mdは「常に適用されるルール」のみを記載し、「タスクに応じて適用される手順」はスキルに委譲する。これにより、CLAUDE.mdのサイズを最小限に保ちつつ、必要な時に必要なスキルだけをコンテキストに読み込む。

### 3.5 using-superpowers/SKILL.md の Instruction Priority

ハブスキル（using-superpowers/SKILL.md）には以下の優先順位が明記されている:

```
1. User's explicit instructions (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. Superpowers skills — override default system behavior where they conflict
3. Default system prompt — lowest priority
```

つまり、CLAUDE.mdの指示はスキルの指示よりも優先される。superpowersでは「CLAUDE.mdに『TDDを使うな』と書いてあれば、スキルが『常にTDDを使え』と言っていてもCLAUDE.mdに従う」と明記している。

---

## 4. aide-claudeへの示唆

### 4.1 AIDEのグローバルルールをCLAUDE.mdに収める際の設計指針

superpowersのCLAUDE.mdの設計から学べる点:

| superpowersの設計 | aide-claudeへの応用 |
|---|---|
| 対象読者を明確化（コントリビューター向け） | aide-claudeのCLAUDE.mdの対象読者は「Claude Codeエージェント」（AIDEフレームワークを使うエージェント自身） |
| 冒頭で最重要ルールを提示（94% rejection rate） | 冒頭で「フェーズ省略禁止」「実作業禁止」を最優先ルールとして提示 |
| 具体的な禁止事項をカテゴリ分類 | AIDEの禁止事項（禁止ツール一覧等）をカテゴリ分類 |
| 結果の明示（will be closed） | 違反時の対処を明示（「お受けできません」の定型回答等） |
| スキルの使い方はCLAUDE.mdに書かない | ワークフローの詳細手順はスキルに委譲 |

### 4.2 サイズ制限（200行以下）内に収めるための戦略

AIDEのグローバルルール（global-rules.md）は現在非常に長い。200行以下に収めるための戦略:

**戦略1: CLAUDE.md + `.claude/rules/` 分割**

Anthropic公式ドキュメントが推奨する方法。CLAUDE.mdには最重要ルールのみを記載し、詳細ルールは `.claude/rules/` に分割する。

```
aide-claude/
├── CLAUDE.md                    # 最重要ルール（200行以下）
└── .claude/
    └── rules/
        ├── orchestrator-rules.md    # オーケストレーター固有ルール
        ├── git-rules.md             # gitコミットルール
        ├── os-detection.md          # OS判定ルール
        └── ...
```

**メリット**: Anthropic公式推奨。パス指定で条件付き読み込みも可能。
**デメリット**: `.claude/rules/` はClaude Code固有の機能。他プラットフォーム（Cursor等）では使えない可能性がある。

**戦略2: CLAUDE.md + @import**

CLAUDE.mdから `@path/to/file` でファイルをインポートする方法。

```markdown
# AIDE Global Rules

@rules/core-rules.md
@rules/orchestrator-rules.md
```

**メリット**: CLAUDE.mdの見た目はシンプル。インポートされたファイルはセッション開始時に展開される。
**デメリット**: インポートされた内容もコンテキストを消費する。200行制限はCLAUDE.md単体の行数であり、インポート後の総量ではないが、総量が大きいとadherenceが下がる。

**戦略3: CLAUDE.md（最小限） + ハブスキル（詳細ルール）**

superpowersと同じアプローチ。CLAUDE.mdには最小限のルールのみを記載し、詳細なルール（オーケストレーター選択ガイド等）はハブスキル（using-aide/SKILL.md）に記載する。

```
CLAUDE.md: 最重要ルール（フェーズ省略禁止、実作業禁止、敬語）
using-aide/SKILL.md: オーケストレーター選択ガイド、詳細ルール
```

**メリット**: superpowersの実績ある設計パターンに従う。ハブスキルはsession-startフックで注入されるため、毎セッション読み込まれる。
**デメリット**: CLAUDE.mdとハブスキルの両方にルールが分散する。Instruction Priorityの関係で、CLAUDE.mdのルールがスキルのルールより優先されるため、最重要ルールはCLAUDE.mdに置く必要がある。

### 4.3 オーケストレーター選択ガイドの記載方法

現在のAIDEの `orchestrator-index.md` は非常に長い（200行超）。CLAUDE.mdに全文を収めることは不可能。

**推奨アプローチ**: CLAUDE.mdにはオーケストレーター一覧表（7行）と「詳細はusing-aideスキルを参照」の指示のみを記載し、選択ガイドの詳細はハブスキル（using-aide/SKILL.md）に委譲する。

```markdown
## オーケストレーター

| オーケストレーター | 用途 |
|---|---|
| 企画 | アイデアから開発企画書を作成 |
| 設計 | 要件定義〜設計完了 |
| 実装 | 設計書に基づく実装 |
| 設計逆引き | 既存コードから設計書を逆生成 |
| 変更 | 機能追加・仕様変更 |
| リファクタリング | 内部構造改善 |
| バグ修正 | バグ修正 |

選択ガイドの詳細は using-aide スキルを参照。
```

### 4.4 CLAUDE.md に記載すべき内容の優先順位

200行制限を考慮した、aide-claudeのCLAUDE.mdに記載すべき内容の優先順位:

| 優先度 | 内容 | 理由 |
|---|---|---|
| 1（必須） | フェーズ省略禁止ルール | 最重要ルール。毎セッションで遵守必須 |
| 2（必須） | オーケストレーター実作業禁止ルール | 最重要ルール。毎セッションで遵守必須 |
| 3（必須） | 敬語ルール | 全エージェント共通。毎セッションで遵守必須 |
| 4（必須） | オーケストレーター一覧表 | エージェントが最初に参照する情報 |
| 5（推奨） | 選択肢の提示ルール | 全エージェント共通 |
| 6（推奨） | gitコミットルール（git-committer経由） | 全エージェント共通 |
| 7（委譲可） | オーケストレーター選択ガイド詳細 | ハブスキルに委譲 |
| 8（委譲可） | OS判定ルール | `.claude/rules/` またはスキルに委譲 |
| 9（委譲可） | 各オーケストレーターの生成ドキュメント一覧 | ハブスキルまたは各オーケストレーターのスキルに委譲 |
| 10（委譲可） | revertルール | `.claude/rules/` またはスキルに委譲 |

---

## 5. リスク

### 5.1 技術的リスク

| リスク | 詳細 |
|---|---|
| CLAUDE.mdのadherence低下 | 200行を超えるとClaude Codeの遵守率が下がる。AIDEのグローバルルールは現在200行を大幅に超えており、全文をCLAUDE.mdに収めると遵守率が低下する可能性がある |
| Instruction Priority の競合 | CLAUDE.mdの指示がスキルの指示より優先されるため、CLAUDE.mdに詳細すぎるルールを書くとスキルの柔軟性を阻害する可能性がある |
| プラットフォーム間の差異 | `.claude/rules/` はClaude Code固有の機能。Cursor等の他プラットフォームでは同等の機能がない可能性がある |

### 5.2 将来の継続性リスク

| リスク | 詳細 |
|---|---|
| CLAUDE.mdの仕様変更 | Anthropicが将来CLAUDE.mdの読み込み方式やサイズ制限を変更する可能性がある |
| auto memoryとの干渉 | Claude Codeのauto memory機能がCLAUDE.mdの指示と競合する可能性がある |

---

## 6. 情報源

| 情報源 | URL / パス | 確認日 |
|---|---|---|
| superpowers CLAUDE.md | `references/superpowers/CLAUDE.md` | 2025-07-19 |
| superpowers program-structure.md | `references/superpowers/.kiro/specs/superpowers/program-structure.md` | 2025-07-19 |
| superpowers tech-ref-project-anatomy.md | `references/superpowers/.kiro/specs/superpowers/tech-references/tech-ref-project-anatomy.md` | 2025-07-19 |
| superpowers using-superpowers/SKILL.md | `references/superpowers/skills/using-superpowers/SKILL.md` | 2025-07-19 |
| superpowers AGENTS.md | `references/superpowers/AGENTS.md` | 2025-07-19 |
| superpowers GEMINI.md | `references/superpowers/GEMINI.md` | 2025-07-19 |
| superpowers hooks/session-start | `references/superpowers/hooks/session-start` | 2025-07-19 |
| superpowers .github/PULL_REQUEST_TEMPLATE.md | `references/superpowers/.github/PULL_REQUEST_TEMPLATE.md` | 2025-07-19 |
| superpowers writing-skills/SKILL.md | `references/superpowers/skills/writing-skills/SKILL.md` | 2025-07-19 |
| superpowers writing-skills/examples/CLAUDE_MD_TESTING.md | `references/superpowers/skills/writing-skills/examples/CLAUDE_MD_TESTING.md` | 2025-07-19 |
| Anthropic公式: How Claude remembers your project | [https://docs.anthropic.com/en/docs/claude-code/memory](https://docs.anthropic.com/en/docs/claude-code/memory) | 2025-07-19 |
