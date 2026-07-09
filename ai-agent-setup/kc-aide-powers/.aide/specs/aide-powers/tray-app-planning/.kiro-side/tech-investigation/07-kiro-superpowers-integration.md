# 調査: Kiro の superpowers 構成への追加可否

## 調査概要

- **調査対象**: Kiro IDE を superpowers 構成（スキルシステム + サブエージェント + プラグイン配布）に追加できるか
- **調査日**: 2025年（Web検索による最新情報確認済み）
- **調査の背景**: aide-for-claude-code プロジェクトで、superpowers の既存6プラットフォームに加えて Kiro を追加対応する

## 要約

Kiro は superpowers 構成への追加が **条件付きで可能** である。Kiro は Agent Skills 標準（agentskills.io）をネイティブサポートしており、SKILL.md 形式のスキルをそのまま利用できる。サブエージェント機構も IDE・CLI 両方で利用可能。プラグインシステムは Kiro 独自のものはないが、スキルのインポート機能（GitHub URL / ローカルフォルダ）で配布可能。セッション開始フックは IDE のフック機能で対応可能。superpowers の既存パターン（Gemini CLI 向けの `@` 参照方式）に近い形で統合できる見込み。

---

## 調査結果

### 1. Kiro のプラグインシステム

**結論: superpowers の `.claude-plugin/` に直接相当する仕組みはない**

- Kiro には Claude Code の `.claude-plugin/` や Cursor の `.cursor-plugin/` に相当するプラグインマニフェスト形式は存在しない
- ただし、Kiro は以下の仕組みでカスタマイズを配布できる:
  - **スキルのインポート機能**: Kiro IDE のパネルから GitHub URL またはローカルフォルダからスキルをインポート可能
  - **グローバルスキル**: `~/.kiro/skills/` に配置すれば全ワークスペースで利用可能
  - **ワークスペーススキル**: `.kiro/skills/` に配置すればプロジェクト固有で利用可能
  - **グローバルステアリング**: `~/.kiro/steering/` に配置すれば全ワークスペースで利用可能
  - **AGENTS.md**: ワークスペースルートまたは `~/.kiro/steering/` に配置可能

**superpowers への影響**:
- `.claude-plugin/plugin.json` 形式のプラグインマニフェストは不要
- 代わりに、git clone + ファイルコピー方式（現在の kiro 版 AIDE の setup.sh/setup.bat と同様）で配布する
- superpowers の Codex 向けパターン（symlink 方式）に近い

**情報源**:
- [Kiro Skills 公式ドキュメント](https://kiro.dev/docs/skills/) — 確認日: 調査時点
- [Kiro Steering 公式ドキュメント](https://kiro.dev/docs/steering/) — 確認日: 調査時点

---

### 2. Kiro のスキルシステム

**結論: Agent Skills 標準（agentskills.io）をネイティブサポート。SKILL.md 形式がそのまま使える**

- Kiro は [Agent Skills 標準](https://agentskills.io/) をサポートしている
- スキルの仕組み:
  - **自動発見**: 起動時にスキルの `name` と `description` のみを読み込み（メタデータのみ）
  - **オンデマンド読み込み**: ユーザーのリクエストが description にマッチした場合、または `/` スラッシュコマンドで明示的に呼び出した場合に全文を読み込み
  - **プログレッシブ・ディスクロージャー**: 参照ファイル（scripts/, references/ 等）はスキル本文から参照された場合のみ読み込み
- スキルの配置場所:
  - ワークスペース: `.kiro/skills/`
  - グローバル: `~/.kiro/skills/`
  - ワークスペーススキルが同名のグローバルスキルより優先される
- SKILL.md のフロントマター:
  - `name`（必須）: フォルダ名と一致する必要あり。小文字・数字・ハイフンのみ（最大64文字）
  - `description`（必須）: いつ使うかの説明（最大1024文字）
  - `license`, `compatibility`, `metadata`（任意）

**superpowers への影響**:
- superpowers の `skills/` ディレクトリをそのまま Kiro の `~/.kiro/skills/superpowers/` にコピーまたは symlink すれば動作する可能性が高い
- Codex 向けの symlink パターン（`ln -s ~/.codex/superpowers/skills ~/.agents/skills/superpowers`）と同様のアプローチが使える
- Kiro IDE のスキルインポート機能（GitHub URL 指定）でも配布可能

**情報源**:
- [Kiro Skills 公式ドキュメント](https://kiro.dev/docs/skills/) — 確認日: 調査時点
- [Kiro 0.9 ブログ: Custom subagents, skills](https://kiro.dev/blog/custom-subagents-skills-and-enterprise-controls/) — 2026年2月5日公開
- [Kiro CLI 1.24 Changelog: Skills](https://kiro.dev/changelog/cli/1-24/) — 確認日: 調査時点

---

### 3. Kiro IDE でのブートストラップ方式

**結論: 3つの候補があり、開発しながら試験して確定する方針**

**注意**: 当初検討していたフック方式（`Prompt Submit` トリガー等）は、毎ターン発火する懸念があるため採用しない。代わりに以下の3候補を検討する。

#### 候補1: `inclusion: always` のステアリングファイル
- `~/.kiro/steering/aide-bootstrap.md` を `inclusion: always` で配置
- aide-claude のオーケストレーターインデックス相当の内容を記述
- **メリット**: 確実に毎セッションで読み込まれる。最もシンプルで確実
- **デメリット**: 常にコンテキストを消費する。ステアリングファイルのサイズ制限に注意が必要
- **実装難易度**: 低

#### 候補2: AGENTS.md に記述
- ワークスペースルートまたは `~/.kiro/steering/` に `AGENTS.md` を配置
- Kiro は AGENTS.md を常時読み込み（inclusion モード設定不可、常に always 扱い）
- **メリット**: AGENTS.md 標準に準拠。他のツール（Claude Code 等）との互換性が高い
- **デメリット**: inclusion モードの制御ができない（常に全文読み込み）
- **実装難易度**: 低

#### 候補3: Kiro Powers としてバンドル
- aide-claude を Kiro Power として配布（POWER.md + steering/ 構成）
- キーワードベースのアクティベーションで必要時のみ読み込み
- **メリット**: コンテキスト効率が良い。ワンクリックインストール。配布が容易
- **デメリット**: Powers は現時点で Kiro IDE 専用（CLI 未対応）。agents/ や skills/ を Powers バンドルに含められない
- **実装難易度**: 中（Powers の仕様に合わせた構造変換が必要）

#### 方針
- **開発しながら試験して確定する**。3つの候補はいずれも技術的に実現可能であり、実際に動作させて比較する必要がある
- 候補1（`inclusion: always`）を最初の実装ターゲットとし、候補2・3は並行して検証する
- 詳細な Powers 仕様は「追加調査: Kiro Powers の詳細仕様」セクションを参照

**情報源**:
- [Kiro Steering 公式ドキュメント](https://kiro.dev/docs/steering/) — 確認日: 調査時点
- [Kiro Powers 公式ドキュメント](https://kiro.dev/docs/powers/) — 確認日: 調査時点
- [Kiro Hooks 公式ドキュメント](https://kiro.dev/docs/hooks/) — 確認日: 調査時点

---

### 4. Kiro のサブエージェント機構

**結論: IDE・CLI 両方でサブエージェント機構が利用可能**

#### Kiro IDE のサブエージェント
- Kiro IDE 0.9 でカスタムサブエージェントが導入された
- `invokeSubAgent` ツールでカスタムエージェントを名前指定で呼び出し可能
- サブエージェントは独立したコンテキストで実行され、並列タスク実行が可能
- カスタムエージェント定義の配置場所:
  - グローバル: `~/.kiro/agents/`
  - ワークスペース: `.kiro/agents/`

#### Kiro CLI のサブエージェント
- Kiro CLI 1.23 で `subagent` ツールが導入された
- カスタムエージェント設定を使ってサブエージェントを生成可能
- サブエージェントはコアツール（ファイル読み書き、シェルコマンド、MCP ツール）にアクセス可能
- カスタムエージェントは JSON 設定ファイルで定義:
  ```json
  {
    "name": "my-agent",
    "description": "A custom agent for my workflow",
    "tools": ["read","write"],
    "allowedTools": ["read"],
    "resources": ["file://README.md", "skill://.kiro/skills/**/SKILL.md"],
    "prompt": "You are a helpful coding assistant",
    "model": "claude-sonnet-4"
  }
  ```
- 配置場所:
  - グローバル: `~/.kiro/agents/`
  - ワークスペース: `.kiro/agents/`

**superpowers への影響**:
- superpowers の `agents/code-reviewer.md` を Kiro の `~/.kiro/agents/` に配置すれば、サブエージェントとして呼び出し可能
- ただし、Kiro IDE の `invokeSubAgent` と Claude Code の `Task` ツールではパラメータ形式が異なる可能性がある
- Kiro CLI の `subagent` ツールは Claude Code の `Task` ツールに近い機能を持つ
- superpowers のスキルで `Task` ツールを参照している箇所は、Kiro のツール名にマッピングする必要がある

**情報源**:
- [Kiro 0.9 ブログ](https://kiro.dev/blog/custom-subagents-skills-and-enterprise-controls/) — 2026年2月5日公開
- [Kiro CLI 1.23 Changelog](https://kiro.dev/changelog/cli/1-23/) — 2025年12月18日公開
- [Kiro CLI Custom Agents 公式ドキュメント](https://kiro.dev/docs/cli/custom-agents/creating/) — 確認日: 調査時点

---

### 5. Kiro のツール名マッピング

**結論: ツール名マッピングが必要。Kiro 固有のツール名対応表を作成する必要がある**

superpowers のスキルは Claude Code のツール名で記述されている。Kiro のツール名との対応表:

| superpowers（Claude Code）ツール名 | Kiro IDE ツール名 | Kiro CLI ツール名 | 備考 |
|---|---|---|---|
| `Read` | `readFile`, `readMultipleFiles`, `readCode` | `read` | Kiro IDE は複数の読み取りツールを持つ |
| `Write` | `fsWrite` | `write` | |
| `Edit` | `strReplace` | 要確認 | |
| `Bash` | `executePwsh` | `bash` / `shell` | Kiro IDE は PowerShell ベース |
| `Grep` | `grepSearch` | `grep` | |
| `Glob` | `fileSearch` | `glob` | |
| `Task` (subagent) | `invokeSubAgent` | `subagent` | |
| `Skill` | `discloseContext` | スキルは自動読み込み | |
| `TodoWrite` | 要確認 | 要確認 | |
| `WebSearch` | `remote_web_search` | 要確認 | |
| `WebFetch` | `webFetch` | 要確認 | |

**superpowers への影響**:
- Gemini CLI 向けの `references/gemini-tools.md` と同様に、`references/kiro-tools.md` を作成する必要がある
- Kiro IDE と Kiro CLI でツール名が異なるため、両方のマッピングが必要になる可能性がある
- `using-superpowers` スキルの「Platform Adaptation」セクションに Kiro の記述を追加する

**情報源**:
- 現在のワークスペースの Kiro IDE ツール一覧（実環境から確認）
- [Kiro CLI 1.23 Changelog](https://kiro.dev/changelog/cli/1-23/) — grep, glob ツールの追加

---

### 6. Kiro での配布方法

**結論: git clone + ファイルコピー方式が最も現実的。スキルインポート機能も補助的に利用可能**

#### 推奨配布方法

1. **git clone + symlink 方式**（Codex パターンに類似）:
   ```bash
   git clone https://github.com/obra/superpowers.git ~/.kiro/superpowers
   
   # スキルの symlink
   ln -s ~/.kiro/superpowers/skills ~/.kiro/skills/superpowers
   
   # エージェントのコピー
   cp ~/.kiro/superpowers/agents/*.md ~/.kiro/agents/
   ```

2. **ステアリングファイルによるブートストラップ**:
   - `~/.kiro/steering/superpowers-bootstrap.md` を `inclusion: always` で配置
   - `using-superpowers` スキルの内容を含め、セッション開始時に自動読み込み

3. **Kiro IDE のスキルインポート機能**:
   - GitHub URL を指定してスキルを個別にインポート
   - ただし、一括インポートには向かない

#### セットアップスクリプト例

```bash
#!/bin/bash
# superpowers for Kiro セットアップスクリプト
SUPERPOWERS_DIR="$HOME/.kiro/superpowers"

# 1. リポジトリのクローン
git clone https://github.com/obra/superpowers.git "$SUPERPOWERS_DIR"

# 2. スキルの symlink
mkdir -p "$HOME/.kiro/skills"
ln -sf "$SUPERPOWERS_DIR/skills" "$HOME/.kiro/skills/superpowers"

# 3. エージェントのコピー
mkdir -p "$HOME/.kiro/agents"
cp "$SUPERPOWERS_DIR/agents/"*.md "$HOME/.kiro/agents/"

# 4. ブートストラップ用ステアリングファイルの配置
cp "$SUPERPOWERS_DIR/.kiro/steering/superpowers-bootstrap.md" "$HOME/.kiro/steering/"

echo "Kiro を再起動してください"
```

**superpowers への影響**:
- `.kiro/` ディレクトリ配下に Kiro 固有のインストール手順（`INSTALL.md`）を作成する
- Codex の `.codex/INSTALL.md` パターンに準拠
- ブートストラップ用ステアリングファイル（`inclusion: always`）を作成して、セッション開始時のコンテキスト注入を代替する

**情報源**:
- [Kiro Skills 公式ドキュメント](https://kiro.dev/docs/skills/) — インポート機能の説明
- [Kiro Steering 公式ドキュメント](https://kiro.dev/docs/steering/) — グローバルステアリングの説明
- superpowers の `.codex/INSTALL.md` — 既存の配布パターン

---

## 代替手段

| 方式 | メリット | デメリット |
|---|---|---|
| git clone + symlink | 更新が容易（git pull のみ）、Codex パターンと統一 | symlink の作成が必要 |
| git clone + ファイルコピー | シンプル、Windows でも動作 | 更新時に再コピーが必要 |
| Kiro IDE スキルインポート | GUI で簡単、公式サポート | 一括インポート不可、エージェントは対象外 |
| ステアリングファイルのみ | 最もシンプル | スキルの自動発見が使えない |

---

## リスク

### 技術的リスク
- **ツール名の不一致**: Kiro IDE と Claude Code でツール名が大きく異なるため、スキル内のツール参照が正しく動作しない可能性がある。ツールマッピングファイルの作成と、`using-superpowers` スキルへの Kiro 記述追加が必要
- **サブエージェントの互換性**: Kiro IDE の `invokeSubAgent` と Claude Code の `Task` ツールのパラメータ形式の違いにより、サブエージェント関連スキル（`subagent-driven-development`, `dispatching-parallel-agents`）の動作に影響がある可能性

### 将来の継続性リスク
- **Kiro のスキルシステムは比較的新しい**: Kiro 0.9（2026年2月）で導入されたばかりであり、API や仕様が変更される可能性がある
- **Agent Skills 標準への準拠**: Kiro は agentskills.io 標準をサポートしているため、標準が安定すれば互換性は維持される見込み

### ライセンスリスク
- 特になし。superpowers は MIT ライセンスであり、Kiro への配布に制約はない

---

## 実現可能性の総合評価

| 項目 | 評価 | 理由 |
|---|---|---|
| 実現可能性 | **条件付き可能** | スキルシステムとサブエージェントは対応可能。ツールマッピングとブートストラップの作成が必要 |
| 実装の難易度 | **中** | ツールマッピングファイルの作成、インストールスクリプトの作成、ブートストラップ用ステアリングファイルの作成が必要 |
| 既存パターンとの類似性 | **Codex パターンに近い** | symlink 方式 + INSTALL.md の組み合わせ |
| コスト | **無料** | Kiro の無料プランでもスキル・ステアリング・エージェント機能は利用可能 |


---

## 追加調査: Kiro Powers の詳細仕様

### 調査概要

- **調査対象**: Kiro Powers の詳細仕様。aide-claude の Kiro 向け配布・ブートストラップ手段としての利用可否
- **調査日**: 2025年（Web検索による最新情報確認済み）
- **調査の背景**: Kiro IDE でのブートストラップ方式として、`inclusion: always` のステアリングファイル、AGENTS.md、Kiro Powers の3候補を検討中。Powers の詳細仕様を把握する必要がある

### 要約

Kiro Powers は POWER.md + steering/ + mcp.json の3要素で構成されるバンドル形式で、キーワードベースの動的アクティベーションが特徴。**MCPサーバーなしの「Knowledge Base Power」（ステアリングのみ）が公式にサポートされている**ため、aide-claude をドキュメント・ステアリング専用の Power として配布することは技術的に可能。ただし、**Powers バンドルに agents/ や skills/ ディレクトリを含める仕組みは存在しない**ため、サブエージェント定義やスキルの配布は Powers 外で別途行う必要がある。Powers は現時点で **Kiro IDE 専用**（CLI 対応は coming soon）。プライベートリポジトリからのインストールはローカルパス経由で可能。

---

### 1. POWER.md の構造と仕様

#### フロントマターのフィールド一覧

公式ドキュメントおよび power-builder の POWER.md（公式テンプレート）に基づく。**フロントマターには以下の5フィールドのみが存在する**:

| フィールド | 必須/任意 | 説明 |
|---|---|---|
| `name` | **必須** | 小文字ケバブケース識別子（例: `"aide-claude"`） |
| `displayName` | **必須** | 人間が読める表示名（例: `"AIDE for Claude Code"`） |
| `description` | **必須** | 説明文（最大3文）。Power の用途を記述 |
| `keywords` | 任意（推奨） | アクティベーション用キーワード配列（例: `["orchestrator", "design", "planning"]`） |
| `author` | 任意 | 作成者名または組織名 |

**重要**: `version`, `tags`, `repository`, `license` 等のフィールドは**存在しない**。使用してはならない。

**情報源**: [Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/) — 確認日: 調査時点、[power-builder POWER.md](https://github.com/kirodotdev/powers/blob/main/power-builder/POWER.md) — 確認日: 調査時点

#### POWER.md の本文構造

フロントマターの後に、以下の2つのパートで構成される:

1. **オンボーディング指示**: Power が初めてアクティベートされた際にエージェントが実行するセットアップ手順（依存関係の検証、フックの作成等）
2. **ステアリング指示**: ワークフローやベストプラクティスの記述。シンプルな Power は POWER.md 内に直接記述、複雑な Power は steering/ ディレクトリの別ファイルにマッピング

#### サイズ制限

- **公式ドキュメントにサイズ制限の明示的な記載はない**
- 実例として、power-builder の POWER.md は **755行・20.7KB** であり、大きなファイルも許容されている
- ただし、power-builder 自身が「POWER.md が約500行を超える場合は steering/ ディレクトリに分割することを推奨」と記載している
- **推測**: コンテキストウィンドウの効率を考慮すると、POWER.md 本体は500行以下に抑え、詳細は steering/ に分割するのが実用的

**情報源**: [power-builder POWER.md](https://github.com/kirodotdev/powers/blob/main/power-builder/POWER.md) — 755行・20.7KB の実例

---

### 2. Powers でサブエージェント定義（agents/*.md）を配布できるか

**結論: 不可能。Powers バンドルに agents/ ディレクトリを含める仕組みは存在しない**

#### 調査結果

- Powers のディレクトリ構造は以下の3要素のみで構成される:
  - `POWER.md`（必須）
  - `mcp.json`（MCP サーバーを使う場合のみ）
  - `steering/`（任意。ワークフロー別のステアリングファイル）
- `agents/` ディレクトリは Powers の仕様に含まれていない
- 公式ドキュメント、power-builder テンプレート、GitHub リポジトリの既存 Powers いずれにも `agents/` を含む例はない
- カスタムエージェント定義（`~/.kiro/agents/` または `.kiro/agents/`）は Powers とは独立した仕組み（IDE 0.9 で導入）

#### 代替手段

1. **POWER.md のオンボーディングセクションで agents/ のセットアップを指示する**: Power のオンボーディング手順として、エージェントにカスタムエージェント定義ファイルの作成を指示できる（Supabase Power がフックファイルを作成するのと同様のパターン）
2. **セットアップスクリプトで別途配布する**: git clone + ファイルコピー方式で agents/ を `~/.kiro/agents/` に配置する
3. **steering/ 内にエージェント定義のテンプレートを含め、オンボーディング時にコピーさせる**: 間接的だが実現可能

**情報源**: [Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/)、[kirodotdev/powers GitHub リポジトリ](https://github.com/kirodotdev/powers) — 確認日: 調査時点

---

### 3. Powers でスキル（skills/*/SKILL.md）を配布できるか

**結論: 不可能。Powers バンドルに skills/ ディレクトリを含める仕組みは存在しない**

#### 調査結果

- Powers と Skills は Kiro の**別々の仕組み**である:
  - **Powers**: POWER.md + mcp.json + steering/ で構成。キーワードベースの動的アクティベーション。MCP サーバーの動的ロードが主目的
  - **Skills**: SKILL.md + 参照ファイルで構成。Agent Skills 標準（agentskills.io）に準拠。description ベースの自動発見
- Powers が Skills を内包する仕組みは存在しない
- Powers の steering/ ディレクトリは Skills の代替として機能する（ワークフロー別のコンテキスト読み込み）が、Skills の `name`/`description` フロントマターやスラッシュコマンド機能は使えない

#### Powers と Skills の機能比較

| 機能 | Powers (steering/) | Skills (SKILL.md) |
|---|---|---|
| アクティベーション | キーワードマッチ（POWER.md frontmatter） | description マッチ + スラッシュコマンド |
| 動的読み込み | POWER.md 内のマッピングで指定 | 自動発見（name + description のみ先読み） |
| MCP サーバー統合 | あり（mcp.json） | なし |
| 配布方法 | Powers パネル / GitHub URL / ローカルパス | スキルインポート / ファイルコピー |
| 標準準拠 | Kiro 独自 | Agent Skills 標準（agentskills.io） |
| CLI 対応 | 未対応（coming soon） | 対応（Kiro CLI 1.24〜） |

#### 代替手段

- agents/ と同様に、POWER.md のオンボーディングセクションで skills/ のセットアップを指示する
- セットアップスクリプトで別途配布する

**情報源**: [Kiro Skills 公式ドキュメント](https://kiro.dev/docs/skills/)、[Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/) — 確認日: 調査時点

---

### 4. Powers のキーワードベースアクティベーション

#### キーワードマッチの仕組み

- POWER.md フロントマターの `keywords` フィールドに定義したキーワード配列でマッチングが行われる
- ユーザーの会話にキーワードが含まれると、Kiro がそれを検出して Power をアクティベートする
- アクティベーション時に POWER.md の内容と MCP ツールがコンテキストに読み込まれる
- 会話のトピックが変わると、不要になった Power はデアクティベートされる（例: Stripe → Supabase への切り替え）

#### aide-claude の7つのオーケストレーターをキーワードで選択的にアクティベートできるか

**条件付きで可能だが、Powers の設計思想とは合わない**

- Powers は「1つの Power = 1つのツール/フレームワーク」の粒度で設計されている
- aide-claude の7つのオーケストレーターを7つの別々の Power として配布することは技術的には可能だが:
  - 各 Power が独立してアクティベート/デアクティベートされるため、オーケストレーター間の連携が困難
  - ハブスキル（`using-superpowers` 相当）のような常時アクティブな統括機構を Powers で実現するのは難しい
- **推奨**: aide-claude 全体を1つの Power として配布し、steering/ 内にオーケストレーター別のファイルを配置する方が適切

#### 常時アクティブにする方法

- **Powers には `inclusion: always` に相当する常時アクティブ機能はない**
- Powers は本質的にキーワードベースの動的アクティベーションであり、常時アクティブは設計思想に反する
- 常時アクティブが必要な場合は、Powers ではなく `inclusion: always` のステアリングファイルまたは AGENTS.md を使用すべき

**情報源**: [Introducing Kiro powers ブログ](https://kiro.dev/blog/introducing-powers/) — 2025年12月3日公開、[Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/) — 確認日: 調査時点

---

### 5. Powers の配布方法

#### インストール方法一覧

| 方法 | 説明 | 用途 |
|---|---|---|
| **kiro.dev マーケットプレイス** | kiro.dev/powers でブラウズ → Install クリック → IDE が開いてワンクリック完了 | キュレーション済みパートナー Powers |
| **IDE パネルから直接** | Powers パネル → Power を選択 → Install | キュレーション済みパートナー Powers |
| **公開 GitHub URL** | Powers パネル → Add power from GitHub → リポジトリ URL 入力 | コミュニティ Powers |
| **ローカルパス** | Powers パネル → Add power from Local Path → POWER.md を含むディレクトリ選択 | 自作 Powers / プライベート Powers |

#### プライベートリポジトリからの配布

- **直接的なプライベートリポジトリ URL 指定は未確認**（公式ドキュメントに明示的な記載なし）
- 公式ドキュメントの記載: 「Private repositories require users to have access permissions」（プライベートリポジトリはアクセス権限が必要）
- **実用的な方法**: プライベートリポジトリをローカルに clone し、「Add power from Local Path」でインストール
- 公式ブログの記載: 「Teams with private powers can import from local directories or private repos」

#### 社内限定での配布方法

1. **ローカルパス方式**: 社内リポジトリを clone → ローカルパスからインストール
2. **MDM / エンドポイント管理**: グローバルステアリング（`~/.kiro/steering/`）と同様に、MDM ソリューションやグループポリシーで配布可能（ただし Powers 自体の MDM 配布は未確認。ステアリングファイルの MDM 配布は公式ドキュメントに記載あり）
3. **社内 GitHub / GitLab**: プライベートリポジトリに Power を配置し、チームメンバーが clone + ローカルパスインストール

#### ワンクリックインストールの仕組み

- kiro.dev/powers のページで「Install」ボタンをクリックすると、Kiro IDE が開き、インストール確認ダイアログが表示される
- IDE 内の Powers パネルからも直接インストール可能
- インストール時に MCP サーバーが含まれる場合、`~/.kiro/settings/mcp.json` の Powers セクションに自動登録される
- API キーや環境変数が必要な場合は、初回使用時にプロンプトが表示される

**情報源**: [Install powers 公式ドキュメント](https://kiro.dev/docs/powers/installation/) — 確認日: 調査時点、[Introducing Kiro powers ブログ](https://kiro.dev/blog/introducing-powers/) — 2025年12月3日公開

---

### 6. Powers の制約事項

#### Kiro IDE 専用か、Kiro CLI でも使えるか

- **現時点では Kiro IDE 専用**
- 公式ブログの記載: 「Today, powers work in Kiro IDE. We're building toward a future where powers work across any AI development tool—Kiro CLI, Cline, Cursor, Claude Code, and beyond.」
- Powers は IDE 0.7（2025年12月3日）で導入された
- **CLI 対応は「coming soon」** であり、具体的なリリース時期は未公表
- 将来的には Powers MCP サーバーを通じて他のツール（Cline, Cursor 等）でも利用可能になる計画

#### MCPサーバーなしの Powers（ステアリングのみ）は作成可能か

- **可能。公式に「Knowledge Base Power」として定義されている**
- 公式ドキュメントの Create powers ページに「Documentation-only power」の例が明示されている:
  ```
  power-react-patterns/
  ├── POWER.md              # No MCP servers needed
  └── steering/
      ├── component-patterns.md
      └── hooks-patterns.md
  ```
- power-builder の POWER.md にも「Knowledge Base Power」のパターンが詳細に記載されている
- 実例: kirodotdev/powers リポジトリの `power-builder` は MCP サーバーなしの Knowledge Base Power
- 実例: `aws-transform` も MCP Servers: None と記載されている

#### その他の制約事項

- **Powers バンドルに含められるのは POWER.md + mcp.json + steering/ のみ**: agents/, skills/, hooks/, scripts/ 等は含められない
- **キーワードアクティベーションのみ**: `inclusion: always` のような常時アクティブ機能はない
- **MCP サーバー名の自動ネームスペース化**: インストール時にサーバー名が `power-{name}-{server-name}` に変換される（名前衝突防止）
- **更新は手動**: Powers パネルから「Check for updates」で更新確認・適用

**情報源**: [Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/) — 確認日: 調査時点、[Introducing Kiro powers ブログ](https://kiro.dev/blog/introducing-powers/) — 2025年12月3日公開、[kirodotdev/powers GitHub リポジトリ](https://github.com/kirodotdev/powers) — 確認日: 調査時点

---

### 7. aide-claude を Kiro Power として配布する場合の設計案

#### 推奨構造

```
aide-claude-power/
├── POWER.md                          # フロントマター + オンボーディング + ステアリングマッピング
└── steering/
    ├── orchestrator-index.md         # オーケストレーター選択ガイド
    ├── planning-orchestrator.md      # 企画オーケストレーター
    ├── design-orchestrator.md        # 設計オーケストレーター
    ├── impl-orchestrator.md          # 実装オーケストレーター
    ├── reverse-design-orchestrator.md # 設計逆引きオーケストレーター
    ├── change-orchestrator.md        # 変更オーケストレーター
    ├── refactoring-orchestrator.md   # リファクタリングオーケストレーター
    ├── bugfix-orchestrator.md        # バグ修正オーケストレーター
    └── global-rules.md              # グローバルルール
```

#### POWER.md フロントマター案

```yaml
---
name: "aide-claude"
displayName: "AIDE for Claude Code"
description: "ドキュメント駆動開発フレームワーク。企画・設計・実装・変更・リファクタリング・バグ修正の7つのオーケストレーターで開発プロセスを体系化"
keywords: ["設計", "企画", "実装", "リファクタリング", "バグ修正", "変更", "オーケストレーター", "ドキュメント駆動", "design", "planning", "implementation", "refactoring", "bugfix"]
author: "aide-claude"
---
```

#### 課題と制約

1. **agents/ が配布できない**: aide-claude のサブエージェント定義（40以上のエージェント）は Powers バンドルに含められない。オンボーディングセクションでセットアップスクリプトの実行を指示するか、steering/ 内にエージェント定義を含めてオンボーディング時にコピーさせる必要がある
2. **常時アクティブにできない**: aide-claude はセッション全体を通じてアクティブである必要があるが、Powers はキーワードベースの動的アクティベーション。「設計」「実装」等のキーワードが会話に含まれない場合、Power がアクティベートされない可能性がある
3. **CLI 未対応**: Kiro CLI ユーザーは Powers を利用できない

#### 総合評価

| 項目 | 評価 |
|---|---|
| aide-claude の配布手段としての適合性 | **条件付きで可能だが、最適ではない** |
| Knowledge Base Power としての実現可能性 | **可能**（MCPなしの Power は公式サポート） |
| agents/ の配布 | **不可能**（Powers バンドル外で別途配布が必要） |
| skills/ の配布 | **不可能**（Powers バンドル外で別途配布が必要） |
| 常時アクティブ | **不可能**（キーワードアクティベーションのみ） |
| CLI 対応 | **未対応**（coming soon） |

**結論**: Kiro Powers は aide-claude の**補助的な配布手段**としては有用だが、**主要なブートストラップ手段としては制約が多い**。`inclusion: always` のステアリングファイルまたは AGENTS.md の方が、aide-claude のユースケース（常時アクティブ、サブエージェント定義の配布）には適している。Powers は将来的に CLI 対応やクロスプラットフォーム対応が進んだ段階で再評価する価値がある。

**情報源**:
- [Kiro Powers 公式ドキュメント](https://kiro.dev/docs/powers/) — 確認日: 調査時点
- [Create powers 公式ドキュメント](https://kiro.dev/docs/powers/create/) — 確認日: 調査時点
- [Install powers 公式ドキュメント](https://kiro.dev/docs/powers/installation/) — 確認日: 調査時点
- [Introducing Kiro powers ブログ](https://kiro.dev/blog/introducing-powers/) — 2025年12月3日公開
- [Kiro IDE Changelog 0.7](https://kiro.dev/changelog/ide/0-7/) — Powers 導入バージョン
- [kirodotdev/powers GitHub リポジトリ](https://github.com/kirodotdev/powers) — 確認日: 調査時点
- [power-builder POWER.md](https://github.com/kirodotdev/powers/blob/main/power-builder/POWER.md) — 公式テンプレート
- [Kiro Steering 公式ドキュメント](https://kiro.dev/docs/steering/) — inclusion モードの詳細
- [Kiro Powers: Architectural Overview (Medium)](https://ashishkasaudhan.medium.com/kiro-powers-architectural-overview-and-development-integration-09069e441a68) — 2026年2月18日公開
