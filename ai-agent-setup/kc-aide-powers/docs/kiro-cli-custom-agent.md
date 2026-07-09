# Kiro CLI カスタムエージェントで aide-powers を使う

Kiro CLI の **カスタムエージェント**（`.kiro/agents/*.json`）を使う場合、
aide-powers の steering ファイル（`aide-powers-bootstrap.md`）と skills
（`skills/using-aide-powers/SKILL.md` など）は **自動では読み込まれません**。
`resources` フィールドに明示追加する必要があります。

> デフォルトエージェント（`/agent swap` で `default` を選んだ場合）を使うときは、
> `.kiro/steering/*.md` と `.kiro/skills/**/SKILL.md` は自動認識されます。
> 本ドキュメントは **カスタムエージェントを使うユーザー向け** です。

---

## 1. なぜ必要か

Kiro CLI の仕様:

| エージェント種別 | `.kiro/steering/*.md` | `.kiro/skills/**/SKILL.md` |
|---|---|---|
| デフォルトエージェント（`default`） | 自動読み込み ✅ | 自動認識 ✅ |
| カスタムエージェント（`.kiro/agents/*.json`） | **自動読み込みされない** ❌ | **自動認識されない** ❌ |

カスタムエージェントでは、`resources` フィールドに明示指定したファイルだけが
コンテキストに含まれます。aide-powers の起点である `aide-powers-bootstrap.md`
を読ませるには、`resources` への追加が必須です。

出典:
- https://kiro.dev/docs/cli/steering
- https://kiro.dev/docs/cli/skills
- https://kiro.dev/docs/cli/custom-agents/configuration-reference

---

## 2. 最小構成（steering のみ）

aide-powers の起点ファイル `aide-powers-bootstrap.md` を読ませるだけの最小設定です。

`.kiro/agents/my-agent.json`:

```json
{
  "name": "my-agent",
  "description": "aide-powers を使うカスタムエージェント",
  "resources": [
    "file://.kiro/steering/**/*.md",
    "file://~/.kiro/steering/**/*.md"
  ]
}
```

この設定で `aide-powers-bootstrap.md`（「skills/using-aide-powers/SKILL.md を読め」という
リマインダ）がエージェントに読み込まれます。その後、エージェントが自発的に
`using-aide-powers/SKILL.md` を読みにいく流れです。

---

## 3. 推奨構成（skills も明示登録）

`aide-powers-bootstrap.md` のリマインダに従って SKILL.md を読みにいく動作は
エージェントの判断に依存します。確実に起動させたい場合は、skills も `resources`
に登録してください。

`.kiro/agents/my-agent.json`:

```json
{
  "name": "my-agent",
  "description": "aide-powers を使うカスタムエージェント",
  "resources": [
    "file://.kiro/steering/**/*.md",
    "file://~/.kiro/steering/**/*.md",
    "skill://.kiro/skills/**/SKILL.md",
    "skill://~/.kiro/skills/**/SKILL.md"
  ]
}
```

`skill://` URI を使うと、SKILL.md のフロントマター（`name`, `description`）のみが
初期注入され、本文はエージェントが必要と判断したときに読み込まれます
（遅延読み込み）。コンテキスト効率と確実性を両立できます。

---

## 4. 完全なエージェント設定例

実運用向けに、tools / hooks / model も設定した例です。

`.kiro/agents/aide-powers-agent.json`:

```json
{
  "name": "aide-powers-agent",
  "description": "aide-powers フレームワークで開発作業を行うオーケストレーター",
  "resources": [
    "file://.kiro/steering/**/*.md",
    "file://~/.kiro/steering/**/*.md",
    "skill://.kiro/skills/**/SKILL.md",
    "skill://~/.kiro/skills/**/SKILL.md"
  ],
  "tools": ["*"],
  "allowedTools": ["read", "write", "shell"],
  "hooks": {
    "agentSpawn": [
      {
        "command": "cat ~/.kiro/steering/aide-powers-bootstrap.md",
        "timeout_ms": 5000
      }
    ]
  },
  "model": "claude-sonnet-4"
}
```

`hooks.agentSpawn` は任意です。これを追加すると、エージェント起動時に
`aide-powers-bootstrap.md` の内容が STDOUT 経由で強制的にコンテキストに
入るため、`resources` の読み込み順に依存しない確実な起動が可能になります。

---

## 5. 配置場所

| ファイル | ローカル配置（このリポジトリ用） | グローバル配置（全プロジェクト用） |
|---|---|---|
| エージェント定義 | `.kiro/agents/my-agent.json` | `~/.kiro/agents/my-agent.json` |
| aide-powers steering | `.kiro/steering/aide-powers-bootstrap.md` | `~/.kiro/steering/aide-powers-bootstrap.md` |
| aide-powers skills | `.kiro/skills/using-aide-powers/` 配下 | `~/.kiro/skills/using-aide-powers/` 配下 |

同名のエージェントがローカルとグローバル両方にある場合、**ローカル優先**（警告付き）。

---

## 6. 検証方法

1. エージェント切り替え:
   ```
   /agent swap
   ```
   作成したカスタムエージェントを選ぶ。

2. aide-powers が認識されているか確認:
   ```
   aide-powers はインストールされていますか？
   ```
   エージェントが `using-aide-powers/SKILL.md` の内容（ワークフロー一覧・起動方法）を
   参照できていれば成功です。

3. スキル呼び出しの確認:
   ```
   設計オーケストレーターを起動してください
   ```
   対応するスキル（fs-design-phase1-user-req など）がロードされることを確認します。

---

## 7. トラブルシューティング

### 「aide-powers を知らない」と返答される

- `resources` の glob パターンを確認してください（`*.md` ではなく `**/*.md`）
- ワークスペースパスに移動した状態でエージェントを起動しているか確認
  （`.kiro/` は通常ワークスペースルート相対で解決されます）

### Skills のメタデータが認識されない

- SKILL.md のフロントマターに `name`（小文字英数字とハイフンのみ、最大64文字）と
  `description`（最大1024文字）が必要です
- 配置パスが `.kiro/skills/<skill-name>/SKILL.md` の階層になっているか確認

### グローバル配置（`~/.kiro/`）が読まれない

- `resources` に `file://~/.kiro/steering/**/*.md` と
  `skill://~/.kiro/skills/**/SKILL.md` の両方を追加しているか確認
- チルダ展開の挙動は Kiro CLI のバージョンに依存します。絶対パスで指定すると確実:
  - Linux/Mac: `file:///home/<username>/.kiro/steering/**/*.md`
  - Windows: `file:///C:/Users/<username>/.kiro/steering/**/*.md`

### AgentSpawn フックがタイムアウトする

- `hooks.agentSpawn[].timeout_ms` を大きくする（デフォルト 30,000ms）
- フックコマンドが対象ファイルを正しく指しているか確認

---

## 参考

- [Kiro CLI Custom Agents 設定リファレンス](https://kiro.dev/docs/cli/custom-agents/configuration-reference/)
- [Kiro CLI Steering](https://kiro.dev/docs/cli/steering/)
- [Kiro CLI Skills](https://kiro.dev/docs/cli/skills/)
- 本リポジトリの設計書: `.kiro/specs/aide-powers/tech-references/session-start-and-distribution-design.md` §1.2.1
