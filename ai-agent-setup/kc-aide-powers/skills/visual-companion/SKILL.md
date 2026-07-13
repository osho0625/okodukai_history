---
name: visual-companion
description: "Browser-based visual companion for showing mockups, diagrams, and options via WebSocket server"
---

# Visual Companion Guide

ブラウザベースのビジュアルコンパニオン。モックアップ・図表・選択肢をブラウザに表示し、ユーザーのクリック選択を受け取る。

## Prerequisites

```bash
node --version
```

- **Node.js あり** → 起動フローへ進む
- **Node.js なし** → ユーザーに通知: "Visual companion requires Node.js. Continuing without browser preview (text-only mode)." → このスキルをスキップ

## 仕組み

1. サーバーが `screen_dir` を監視し、最新の HTML ファイルをブラウザに配信する
2. AI が HTML を `screen_dir` に書き込む → ユーザーがブラウザで見る
3. ユーザーがクリック → `state_dir/events` に JSON 記録 → AI が次ターンで読む

**Content fragments（既定）:** `<!DOCTYPE` や `<html` で始まらない HTML は、サーバーがフレームテンプレート（ヘッダー、CSS、選択UI）で自動ラップする。**通常はフラグメントだけ書けばよい。**

**URL ルーティング:**
- `GET /` — screen_dir 内の最新 HTML を自動表示
- `GET /files/{filename}` — 個別ファイルを直接表示
- それ以外 → 404

---

## 起動フロー

### Step 1: プラットフォーム判定

```
OS を確認する
├─ Windows（PowerShell/CMD）→ start-server.bat を使用
├─ macOS / Linux → start-server.sh を使用
└─ WSL → start-server.sh を使用
```

### Step 2: スクリプトのローカルコピー

スキルの `scripts/` ディレクトリからプロジェクトルートの `.aide/brainstorm-server/` にコピーする。

```bash
# scripts/ ディレクトリを探す（fileSearch で "server.cjs" を検索）
# 全ファイルを .aide/brainstorm-server/ にコピー
```

### Step 3: サーバー起動

**bash 環境（macOS / Linux / WSL）:**
```bash
.aide/brainstorm-server/start-server.sh --project-dir .
```

**Windows（PowerShell / CMD）:**
```cmd
.aide/brainstorm-server/start-server.bat --project-dir .
```

⚠️ `cmd /c` を付けない（プロセスが即終了する）。

**起動レスポンス:**
```json
{"type":"server-started","port":52341,"url":"http://localhost:52341",
 "screen_dir":".aide/brainstorm/<session>/content",
 "state_dir":".aide/brainstorm/<session>/state"}
```

`screen_dir` と `state_dir` を保存する。ユーザーに URL を伝える。

### Step 4: 起動確認（必須）

1. `state/server-info` ファイルを読む（存在すればサーバーは起動している）
2. `server-info` の `url` に疎通確認する
3. 両方成功 → 「サーバーは動いている」

⚠️ 「プロセスが見つからない」だけで「終了した」と判断してはならない。`server-info` の存在と URL 疎通で判断する。

### WSL/bash なしの Windows 環境（PowerShell 直接起動）

`start-server.bat` が使えない場合のみ、`node server.cjs` を直接起動する。

| 環境変数 | 必須 | 内容 |
|---|---|---|
| `BRAINSTORM_DIR` | ✅ | セッションディレクトリ（`content/` と `state/` を事前作成） |
| `BRAINSTORM_HOST` | 任意 | バインドホスト。既定 `127.0.0.1` |
| `BRAINSTORM_URL_HOST` | 任意 | ブラウザに見せるホスト名。通常 `localhost` |
| `BRAINSTORM_OWNER_PID` | 推奨 | このPIDが死ぬとサーバも自動終了 |
| `BRAINSTORM_PORT` | 任意 | ポート固定。未指定なら空きポート自動選択 |

```powershell
$projectDir = (Get-Location).Path
$sessionId  = "$PID-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
$sessionDir = Join-Path $projectDir ".aide\brainstorm\$sessionId"
New-Item -ItemType Directory -Force -Path (Join-Path $sessionDir "content"), (Join-Path $sessionDir "state") | Out-Null

$env:BRAINSTORM_DIR       = $sessionDir
$env:BRAINSTORM_HOST      = "0.0.0.0"
$env:BRAINSTORM_URL_HOST  = "localhost"
$env:BRAINSTORM_OWNER_PID = "$PID"

$proc = Start-Process -FilePath node -ArgumentList "server.cjs" `
    -WorkingDirectory ".aide\brainstorm-server" -PassThru `
    -RedirectStandardOutput (Join-Path $sessionDir "state\server.log") `
    -RedirectStandardError (Join-Path $sessionDir "state\server.err")
Set-Content -Path (Join-Path $sessionDir "state\server.pid") -Value $proc.Id

# server-info を待つ（最大6秒）
$info = Join-Path $sessionDir "state\server-info"
for ($i=0; $i -lt 60; $i++) { if (Test-Path $info) { break }; Start-Sleep -Milliseconds 100 }
Get-Content $info -TotalCount 1
```

### セッション終了時（必須）

```powershell
# サーバー停止
$srvPid = Get-Content (Join-Path $stateDir "server.pid")
Stop-Process -Id $srvPid -Force -ErrorAction SilentlyContinue
# スクリプト削除
Remove-Item -Recurse -Force .aide/brainstorm-server/
```

```bash
scripts/stop-server.sh $SESSION_DIR
rm -rf .aide/brainstorm-server/
```

---

## The Loop（基本フロー）

### 1. HTML を書く

- `server-info` の存在を確認（なければ再起動）
- `screen_dir` に新しい HTML ファイルを Write で書く
- ファイル名はセマンティック: `platform.html`, `layout.html`, `layout-v2.html`
- **ファイル名を再利用しない**（毎回新規ファイル）

### 2. ユーザーに伝えて待つ

- URL を毎回リマインドする
- 画面の内容を1行で要約する

**Kiro IDE:**
「ブラウザに表示しました。選択するか、チャットで教えてください。」

**その他のプラットフォーム（待ち受けパターン）:**
```
ブラウザに表示しました。確認してください。
1: ブラウザで選択済み
2: その他（自由記述）
```

### 3. フィードバックを受け取る

- **Kiro IDE:** `fileCreated` Hook が自動トリガー → `state/events` を読む
- **その他:** ユーザーが「1」と答えたら `state/events` を読む
- `state/events` が存在しない場合はテキストフィードバックのみ使用

### 4. 反復 or 次へ

- フィードバックで現画面を変更 → 新バージョンを書く（`layout-v2.html`）
- 現ステップが確定 → 次の質問へ進む

### 5. ブラウザ不要時は待機画面を出す

```html
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Continuing in terminal...</p>
</div>
```

---

## コンテンツ作成

### 選択肢（A/B/C）

```html
<h2>Which layout works better?</h2>
<p class="subtitle">Consider readability and visual hierarchy</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Single Column</h3>
      <p>Clean, focused reading experience</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Two Column</h3>
      <p>Sidebar navigation with main content</p>
    </div>
  </div>
</div>
```

**複数選択:** `<div class="options" data-multiselect>` で複数選択可能。

### カード（ビジュアルデザイン）

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup --></div>
    <div class="card-body"><h3>Name</h3><p>Description</p></div>
  </div>
</div>
```

### モックアップ

```html
<div class="mockup">
  <div class="mockup-header">Preview: Dashboard</div>
  <div class="mockup-body"><!-- content --></div>
</div>
```

### 分割表示（左右並べ）

```html
<div class="split">
  <div class="mockup"><!-- left --></div>
  <div class="mockup"><!-- right --></div>
</div>
```

### Pros/Cons

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

### ワイヤーフレーム部品

```html
<div class="mock-nav">Logo | Home | About | Contact</div>
<div style="display:flex;">
  <div class="mock-sidebar">Navigation</div>
  <div class="mock-content">Main content area</div>
</div>
<button class="mock-button">Action Button</button>
<input class="mock-input" placeholder="Input field">
<div class="placeholder">Placeholder area</div>
```

### タイポグラフィ

- `h2` — ページタイトル
- `h3` — セクション見出し
- `.subtitle` — 副題
- `.section` — コンテンツブロック
- `.label` — 小さいラベル

---

## ブラウザイベント

`$STATE_DIR/events` に JSON Lines で記録される。新画面を push すると自動クリアされる。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"b","text":"Option B - Hybrid","timestamp":1706000115}
```

最後の `choice` が最終選択。クリックパターンから迷いを読み取ることもできる。

---

## md-to-html ユーティリティ

Markdown ファイルをブラウザ確認用 HTML に変換する CLI（[marked](https://github.com/markedjs/marked) ベース、GFM フル対応）。

### 使い方

```bash
node .aide/brainstorm-server/md-to-html.cjs --md <mdファイル> --out <出力HTML> [--title <タイトル>] [--options "A:OK,B:修正"]
```

| 引数 | 必須 | 内容 |
|---|---|---|
| `--md` | ✅ | 変換対象の Markdown ファイルパス |
| `--out` | ✅ | 出力先 HTML パス（通常 `$SCREEN_DIR/<name>.html`） |
| `--title` | 任意 | ページタイトル（省略時は md ファイル名） |
| `--options` | 任意 | 選択肢ボタン `"A:label1,B:label2"` 形式 |

### 例

```bash
node .aide/brainstorm-server/md-to-html.cjs \
  --md .aide/specs/feature/delta-design.md \
  --out .aide/brainstorm/<session>/content/confirm.html \
  --title "差分設計 確認" \
  --options "A:OK,B:修正したい"
```

### 対応記法

marked (GFM) フル対応: 見出し、段落、リスト（ネスト対応）、テーブル、コードブロック、インラインコード、太字、イタリック、取り消し線、リンク、画像、引用、水平線、タスクリスト等。

---

## トラブルシューティング: ERR_CONNECTION_REFUSED

**典型原因:** サーバーが死んでいるのに `server.pid` / `server-info` が残っている。

### 予防

1. URL を案内する前に必ず疎通確認する
2. `state/server-info` を毎回読み直す（古い URL を再利用しない）
3. `BRAINSTORM_OWNER_PID` を設定してゾンビ防止

### 復旧

1. `server.pid` のプロセス生存確認 → 居なければ「サーバー死亡」確定
2. `state/server.log` / `state/server.err` で原因確認
3. 古い `server.pid` / `server-info` を削除
4. 新セッションで再起動 → 新しい URL をユーザーに提示

---

## デザインのコツ

- 質問に合わせてフィデリティを調整（レイアウト → ワイヤーフレーム、ビジュアル → ポリッシュ）
- 各画面に質問を明記する（「Pick one」ではなく「Which layout feels more professional?」）
- 1画面 2〜4 選択肢まで
- 実コンテンツが重要な場面では実画像を使う（Unsplash 等）

---

## リファレンス

| ファイル | 内容 |
|---|---|
| `scripts/server.cjs` | サーバー本体 |
| `scripts/start-server.sh` | bash 起動ラッパー |
| `scripts/start-server.bat` | Windows 起動ラッパー |
| `scripts/stop-server.sh` | 停止スクリプト |
| `scripts/frame-template.html` | フレームテンプレート（CSS リファレンス） |
| `scripts/helper.js` | クライアント側ヘルパー |
| `scripts/md-to-html.cjs` | Markdown → HTML 変換 |
| `scripts/marked.min.js` | marked ライブラリ（バンドル同梱） |
