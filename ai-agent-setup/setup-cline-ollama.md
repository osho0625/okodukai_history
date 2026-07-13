# Cline セットアップ手順（Windows）

VSCodeで動くAIコーディングエージェント「Cline」のセットアップ手順です。  
接続するLLMを選べます。無料のローカルLLMから有料APIまで、用途に合わせて選択してください。

## LLM接続オプション一覧

| 方式 | 費用 | 品質 | 速度 | ネット接続 | 向いている用途 |
|------|------|------|------|-----------|----------------|
| Ollama（ローカル） | 完全無料 | モデル次第（中） | GPU依存 | 不要 | 完全オフライン・プライバシー重視 |
| Gemini API | 無料枠あり（日250回） | 高い | 速い | 必要 | 日常的なコーディング |
| Groq | 無料枠あり（レート制限） | 中〜高 | 爆速 | 必要 | 短い応答・素早い修正 |
| OpenAI GPT API | 有料（従量課金） | 非常に高い | 速い | 必要 | 高品質を求める場面 |

---

---

## 前提条件

- Windows 10 / 11（64bit）
- RAM 8GB以上（16GB以上推奨）
- ストレージ空き容量 20GB以上
- NVIDIA GPU があると快適（なくてもCPUだけで動作可能）

---

## 全体の流れ

1. VS Code をインストール
2. Ollama をインストール
3. AIモデルをダウンロード
4. コンテキストウィンドウを設定（重要！）
5. Cline拡張機能をインストール
6. ClineをOllamaに接続
7. 動作確認

---

## Step 1: VS Code をインストール

1. https://code.visualstudio.com/ にアクセス
2. 「Download for Windows」をクリック
3. ダウンロードされた `VSCodeUserSetup-x64-*.exe` を実行
4. インストーラーの指示に従ってインストール（全てデフォルトでOK）
5. 「PATHに追加する」にチェックが入っていることを確認

※ 既にVS Codeがインストール済みなら飛ばしてOK

---

## Step 2: Ollama をインストール

Ollama はローカルでAIモデルを動かすためのランタイムです。

1. https://ollama.com/download にアクセス
2. 「Download for Windows」をクリック
3. ダウンロードされた `OllamaSetup.exe` を実行
4. インストーラーに従ってインストール（管理者権限不要、デフォルトでOK）
5. インストール完了後、Ollamaはバックグラウンドで自動起動する

### 動作確認

PowerShell または コマンドプロンプト を開いて以下を実行：

```
ollama --version
```

バージョン番号が表示されればOK（例: `ollama version 0.24.x`）

---

## Step 3: AIモデルをダウンロード

PCのスペックに合わせてモデルを選んでください。

### PCスペック別おすすめモデル

| PCのRAM | GPU VRAM | おすすめモデル | コマンド | DLサイズ |
|---------|----------|----------------|----------|----------|
| 8GB | なし/8GB | Qwen2.5-Coder 7B | `ollama pull qwen2.5-coder:7b` | 約4.7GB |
| 16GB | なし/8-12GB | Qwen2.5-Coder 14B | `ollama pull qwen2.5-coder:14b` | 約9GB |
| 16GB+ | 24GB (RTX 3090/4090等) | Devstral Small 2 24B | `ollama pull devstral-small-2:24b` | 約15GB |
| 16GB+ | 24GB (RTX 3090/4090等) | Qwen3-Coder 30B | `ollama pull qwen3-coder:30b-a3b` | 約19GB |

### どれを選ぶか迷ったら

- GPUがない or よく分からない → `qwen2.5-coder:7b` から始める（一番軽い）
- RAM 16GBある → `qwen2.5-coder:14b` がバランス良い
- ゲーミングPC（RTX 3090/4090）がある → `devstral-small-2:24b` が最高に快適

### ダウンロード実行

PowerShell を開いて以下を実行（モデルによって数分〜30分かかる）：

```
ollama pull qwen2.5-coder:7b
```

（上の表で選んだモデルのコマンドに置き換えてください）

### ダウンロード確認

```
ollama list
```

モデル名が一覧に表示されればOK。

---

## Step 4: コンテキストウィンドウを設定する（超重要！）

**ここが一番大事なステップです。これを飛ばすとClineがまともに動きません。**

Ollamaのデフォルト設定ではコンテキストウィンドウ（AIが一度に覚えられる量）が小さすぎて、
Clineが数回やり取りしただけでループしたり止まったりします。

### 手順

1. 好きな場所（デスクトップなど）に `Modelfile` という名前のファイルを作る（拡張子なし）

2. テキストエディタで開いて以下を書く：

**7Bモデルの場合（RAM 8-16GB）：**
```
FROM qwen2.5-coder:7b
PARAMETER num_ctx 32768
```

**14Bモデルの場合（RAM 16GB）：**
```
FROM qwen2.5-coder:14b
PARAMETER num_ctx 32768
```

**24Bモデルの場合（GPU 24GB）：**
```
FROM devstral-small-2:24b
PARAMETER num_ctx 65536
```

**30Bモデルの場合（GPU 24GB）：**
```
FROM qwen3-coder:30b-a3b
PARAMETER num_ctx 65536
```

3. ファイルを保存する

4. PowerShell で `Modelfile` を保存したフォルダに移動して以下を実行：

```
ollama create cline-coder -f ./Modelfile
```

これで `cline-coder` という名前のカスタムモデルが作られます。

5. 確認：

```
ollama list
```

`cline-coder` が一覧に表示されればOK。

---

## Step 5: Cline拡張機能をインストール

1. VS Code を起動
2. 左サイドバーの四角いアイコン（拡張機能）をクリック、または `Ctrl+Shift+X` を押す
3. 検索欄に `Cline` と入力
4. 「Cline」（作者: cline）を見つけて「Install」をクリック
5. インストール完了後、左サイドバーにClineのアイコン（ロボットマーク）が表示される

---

## Step 6: ClineをOllamaに接続する

1. 左サイドバーのClineアイコンをクリックしてパネルを開く
2. パネル右上の歯車アイコン（設定）をクリック
3. 以下を設定：

| 設定項目 | 値 |
|----------|-----|
| API Provider | **Ollama** |
| Base URL | `http://localhost:11434` |
| Model | **cline-coder** （Step 4で作ったカスタムモデル） |

4. モデルが一覧に表示されない場合：
   - Ollamaが起動しているか確認（タスクバーにOllamaアイコンがあるはず）
   - PowerShellで `ollama list` を実行して `cline-coder` が存在するか確認
   - VS Codeを再起動してみる

---

## Step 7: 動作確認

1. VS Code でプロジェクトフォルダを開く（何でもOK）
2. Clineパネルのチャット欄に以下を入力：

```
このフォルダに hello.js というファイルを作って、"Hello World!" とコンソールに出力するコードを書いて
```

3. Clineが計画を提示 → 「Approve」で承認すると実行される
4. ファイルが作成されていれば成功！

---

## トラブルシューティング

### Clineが途中で止まる・ループする

→ コンテキストウィンドウが小さい可能性大。Step 4をやり直す。

### 動作が遅すぎる

→ GPUが使われていない可能性あり。以下を確認：
- NVIDIA GPUのドライバーが最新か確認（https://www.nvidia.com/drivers）
- PowerShellで `ollama ps` を実行し、モデルのサイズとプロセッサを確認
- 「GPU」と表示されていればGPU使用中、「CPU」ならCPUのみで動作中

### モデルが選択肢に出てこない

→ Ollamaが起動していることを確認：
```
ollama list
```
モデルがあるのに表示されない場合はVS Codeを再起動。

### 「out of memory」エラー

→ モデルが大きすぎる。一つ小さいモデルに変更する：
```
ollama rm cline-coder
```
Step 3に戻って小さいモデルを選び直し、Step 4をやり直す。

---

## 使い方のコツ

- **具体的に指示する**：「ブロックスのゲームを作って」より「HTML + JavaScriptでブロックスのボードゲームを作って。21x21のグリッドで、4人のプレイヤーが色違いのピースを配置できるようにして」の方が良い結果が出る
- **段階的に作る**：一度に全部作らせるより、まずベースを作って→機能を追加して→バグを直して、と段階的にやる方が精度が高い
- **Approveボタン**：Clineは毎回「この変更していい？」と聞いてくる。内容を確認してから承認する。間違っていたら「Reject」して指示し直す

---

## 参考リンク

- Ollama公式: https://ollama.com
- Cline公式GitHub: https://github.com/cline/cline
- VS Code公式: https://code.visualstudio.com
- Ollamaモデル一覧: https://ollama.com/library
- Google AI Studio（Gemini APIキー発行）: https://aistudio.google.com
- Groq Console: https://console.groq.com
- OpenAI Platform: https://platform.openai.com

---

## PCスペックの確認方法

自分のPCのRAMとGPUが分からない場合：

1. `Windowsキー + R` を押す
2. `dxdiag` と入力してEnter
3. 「システム」タブ → 「メモリ」でRAMを確認
4. 「ディスプレイ」タブ → GPUの名前とメモリを確認

---

最終更新: 2026年7月

---

# 他のLLM接続オプション

Ollama以外のLLMに接続する場合、Step 1（VS Code）とStep 5（Cline拡張）は共通。  
Step 2〜4の代わりに以下の手順でAPIを設定する。

---

## オプション A: Gemini API（無料・おすすめ）

Google AI StudioからAPIキーを取得して接続する方式。  
Gemini 2.5 Flashなら日250回まで無料で利用可能。GPT並の品質でGPU不要。

### 手順

1. https://aistudio.google.com/ にGoogleアカウントでログイン
2. 左メニュー「Get API Key」→「Create API Key」でキーを発行
3. 発行されたキーをコピーしておく（`AIza...` で始まる文字列）

### Cline接続設定

| 設定項目 | 値 |
|----------|-----|
| API Provider | **Google Gemini** |
| API Key | 発行したキーを貼り付け |
| Model | **gemini-2.5-flash** |

### 制限

| モデル | 無料枠（1日あたり） | リクエスト/分 |
|--------|---------------------|---------------|
| Gemini 2.5 Flash | 250回/日 | 10回/分 |
| Gemini 2.5 Pro | 100回/日 | 5回/分 |

日常的な開発ならFlashの250回/日で十分足りる。超えたら翌日リセット。

---

## オプション B: Groq（無料・高速）

Groqはクラウド上でLlama等のオープンモデルを爆速で推論するサービス。  
応答速度が非常に速く、短いやり取りに向いている。

### 手順

1. https://console.groq.com/ にアカウント登録
2. 「API Keys」→「Create API Key」でキーを発行
3. キーをコピーしておく

### Cline接続設定

| 設定項目 | 値 |
|----------|-----|
| API Provider | **OpenAI Compatible** |
| Base URL | `https://api.groq.com/openai/v1` |
| API Key | 発行したキーを貼り付け |
| Model | **llama-3.3-70b-versatile** |

### 制限

- リクエスト/分、トークン/日にレート制限あり（プランにより変動）
- 無料枠のリクエスト上限に達すると一時的に使用不可（時間経過でリセット）
- 長いコード生成より、短い質問・修正に向いている

---

## オプション C: OpenAI GPT API（有料・最高品質）

GPT-4o / GPT-4.1 を使う有料オプション。最も安定して高品質な出力が得られる。

### 手順

1. https://platform.openai.com/ にログイン
2. 「API keys」→「Create new secret key」でキーを発行
3. キーをコピーしておく（`sk-...` で始まる文字列）
4. 「Billing」から支払い方法を設定し、クレジットをチャージしておく

### Cline接続設定

| 設定項目 | 値 |
|----------|-----|
| API Provider | **OpenAI** |
| API Key | 発行したキーを貼り付け |
| Model | **gpt-4.1** （高品質）または **gpt-4o-mini**（安い） |

### 料金目安

| モデル | 入力 (1Mトークン) | 出力 (1Mトークン) | 1回のやり取り目安 |
|--------|-------------------|-------------------|-------------------|
| gpt-4.1 | $2.00 | $8.00 | 約$0.01〜0.05 |
| gpt-4o-mini | $0.15 | $0.60 | 約$0.001〜0.005 |

gpt-4o-miniなら1日100回使っても月$10〜15程度。品質とコストのバランスが良い。

---

## 複数LLMの使い分け

Clineの設定は切り替え可能なので、場面に応じて使い分けると効率的：

| 場面 | おすすめ |
|------|----------|
| オフラインで作業したい | Ollama |
| 日常的なコーディング | Gemini API（無料枠） |
| 素早い修正・質問 | Groq |
| 重要な設計・複雑なロジック | GPT API |

Gemini無料枠を使い切ったらGroqに切り替える、大事な場面だけGPTを使う、など柔軟に運用可能。
