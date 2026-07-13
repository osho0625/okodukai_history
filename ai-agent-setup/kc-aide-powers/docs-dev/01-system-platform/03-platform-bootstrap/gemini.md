# Gemini CLI のブートストラップ

Gemini CLI は、プロジェクトルートに置かれた `GEMINI.md` を会話開始時に展開する。
そのファイル内に `@import` 行を書いておくと、参照先ファイルの内容が AI Agent のコンテキストに自動で展開される。
aide-powers はこの機能に乗ってハブスキルとツールマップを起動時注入する。

## 1. インストール先パス

Gemini CLI は他プラットフォームと異なり「コピー」ではなく **エクステンション機構** で aide-powers を取り込む。

| 配布物 | 配置先 |
|---|---|
| リポジトリ全体 | `gemini extensions link` 先のシンボリックリンク扱い |
| `GEMINI.md` | リポジトリルート（リンクされたエクステンションのルート） |
| `gemini-extension.json` | リポジトリルート（エクステンションメタデータ） |
| `.aide/references/gemini-tools.md` | 通常の `.aide/references/` 配置（ハブスキルが配置） |

`setup.bat` / `setup.sh` の選択肢「4. Gemini CLI」は実際にはコピー処理を行わない。次のコマンドのみを案内表示する。

```
cd <aide-powers リポジトリのパス>
gemini extensions link .
```

ローカル開発用にリポジトリをそのまま「リンクされたエクステンション」として登録する形を取る。
リモートインストールは `gemini extensions install <repository-url>` で行う。

## 2. 起動メカニズム

```mermaid
flowchart LR
    OPEN[Gemini CLI 起動] --> GM[GEMINI.md を読込]
    GM -->|@import 展開| HUB["skills/using-aide-powers/SKILL.md<br/>本文を展開"]
    GM -->|@import 展開| TM[".aide/references/gemini-tools.md<br/>本文を展開"]
    HUB --> AI((AI Agent))
    TM --> AI
    AI -->|activate_skill| OTHER[他スキル]
```

### `GEMINI.md` の中身

```markdown
@./skills/using-aide-powers/SKILL.md
@./.aide/references/gemini-tools.md
```

Gemini CLI はこの2行を見ると、`@./` で始まる相対パスを「ファイル内容のインクルード」と解釈する。結果として、AI Agent は会話開始時点で次の2点を持った状態になる。

- ハブスキル `using-aide-powers/SKILL.md` の全文（STEP 1〜3 + Quick Routing）
- Gemini CLI 用ツールマップ（Claude Code 標準ツール名 → Gemini CLI ツール名の対応表）

ハブスキル本文がコンテキストに乗っているため、`activate_skill` 等のスキル呼び出しを待たずに、AI Agent はハブスキルの STEP 1〜3 を実行できる。

### Skill ツールの呼び方

Gemini CLI のスキル呼び出しツールは **`activate_skill`** である。Claude Code の `Skill` や Kiro IDE の `discloseContext` とは別名。スキル本文では `Skill` で書かれているため、AI Agent はツールマップ `gemini-tools.md` を読んで `Skill` → `activate_skill` の変換を行ってからスキルを呼ぶ。

`GEMINI.md` の `@import` で `gemini-tools.md` も併せて展開しているのは、ハブスキル本文を実行するために必要なツール変換情報を、起動と同時に届けるため。

### エクステンション機構

`gemini-extension.json` はエクステンションのメタデータファイル。Gemini CLI はこれを読んでエクステンションの存在と設定を認識する。`gemini extensions link .` を実行するとリポジトリへのシンボリックリンクが Gemini CLI のエクステンション登録領域に作られ、以降のセッションで自動的にエクステンションが有効化される。

## 3. ルール配置先

| モード | 配置ファイル | 形式特徴 |
|---|---|---|
| global | プロジェクトルート `aide-powers-global-rules.gemini.md` + `GEMINI.md` の `@import` 行 | プレーン Markdown |
| skill | プロジェクトルート `aide-powers-skill--{skill-name}--{YYYYMMDDHHmm}.gemini.md` + `GEMINI.md` の `@import` 行 | プレーン Markdown |

`rules-distribute` は Gemini CLI 配置時、`.gemini.md` 拡張子のファイルをプロジェクトルートに書き出し、`GEMINI.md` 本体には対応する `@import` 行を1行追加する。これにより `GEMINI.md` 経由でルールファイルが起動時インクルードされる。

`skill:cleanup` 実行時は、`aide-powers-skill--*.gemini.md` ファイルの削除と同時に、`GEMINI.md` から該当 `@import` 行も削除する必要がある。これは Gemini CLI 配置のみの特殊事項で、他プラットフォームのファイル削除だけで済む処理に対し、リファレンス側の整理が追加で必要になる。

## 4. 特殊事項

### 4.1 ハブスキル全文の事前展開

Claude Code 同様、Gemini CLI もハブスキル本文を起動時に AI Agent のコンテキストへ展開する点が特徴。Kiro IDE の「ブートストラップ短文 → スキル呼び出しでハブスキル本文」という2段経路と異なり、1段で本文まで届く。スキル呼び出しのオーバーヘッドが省ける。

### 4.2 ツールマップを並列インクルード

Gemini CLI は `Skill` を `activate_skill` と呼ぶ等、Claude Code と用語が異なるツールが多い。ハブスキル本文だけを展開しても AI Agent はそれを実行できない。そのため `GEMINI.md` の `@import` でツールマップを並列インクルードしている。これにより、ハブスキル本文を読みつつ、ツール名を変換しながら実行できる状態が同時に整う。

### 4.3 リンクとリモートインストールの2方式

Gemini CLI のエクステンションには2つの取り込み方がある。

| 方式 | コマンド | 用途 |
|---|---|---|
| リンク | `gemini extensions link <path>` | リポジトリをローカルに置いたままシンボリックリンクで登録。aide-powers 自体を編集しながら使う場合 |
| リモートインストール | `gemini extensions install <repository-url>` | Git リポジトリ URL を指定してエクステンション領域へクローン。利用エンジニア向け |

aide-powers の setup スクリプトは案内表示のみで、実コマンドはユーザーが手動実行する。これは Gemini CLI のエクステンション管理が `gemini` コマンド側に閉じているため。

### 4.4 `GEMINI.md` の追記運用

`GEMINI.md` はユーザーがプロジェクト固有の指示を書き加える運用も想定されたファイル。aide-powers の2行（`@./skills/using-aide-powers/SKILL.md` と `@./.aide/references/gemini-tools.md`）はファイル先頭に置かれており、ユーザーは以降に独自の指示を追記できる。`rules-distribute` のルールファイル `@import` も末尾追記の形で増えていく。
