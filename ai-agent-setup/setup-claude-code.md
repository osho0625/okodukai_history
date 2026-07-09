# Claude Code セットアップ手順（家PC・Windows）

Anthropic が提供するターミナルベースのAIコーディングツール「Claude Code」のセットアップ手順です。  
aide-powers との組み合わせで、設計駆動のAI開発ができます。

---

## Claude Code とは

Claude Code はターミナル（コマンドライン）で動くAIコーディングアシスタント。  
プロジェクトのコードを読み、ファイルを編集し、テストを実行し、gitコミットまで自律的にやってくれる。

IDE不要でターミナルだけで完結するのが特徴。VS Code やKiro と併用も可能。

---

## 料金体系と無料利用について

### 重要: Claude Code に完全無料プランはない

Claude Code はインストール自体は無料だが、**使うには有料プラン（最低 $20/月）が必要**。

| プラン | 月額 | Claude Code 利用 | 備考 |
|---|---|---|---|
| Free | $0 | ❌ 利用不可 | Webチャットのみ |
| Pro | $20/月 | ✅ 利用可 | 週間使用量制限あり |
| Max 5x | $100/月 | ✅ 利用可 | Proの5倍の制限 |
| Max 20x | $200/月 | ✅ 利用可 | Proの20倍の制限 |

### 無料で試す方法

1. **サインアップ時の$5 APIクレジット**: Anthropic API アカウント作成時にもらえる無料クレジットで数回試せる
2. **Claude Max ユーザーからのゲストパス**: Max契約者から7日間のゲストパスをもらえる（知り合いが必要）
3. **Ollama経由で無料モデルを使う**: Claude Code のインターフェースを使いつつ、ローカルLLMをバックエンドにする方法もある（品質は落ちる）

### 結論

- 本格的に使うなら Pro $20/月 が最低ライン
- 試すだけなら API の$5 無料クレジットで数回は動かせる
- **完全無料で使いたいなら Kiro（月50クレジット無料）の方が現実的**

---

## 前提条件

- Windows 10 version 1809 以上（64bit）
- インターネット接続
- Anthropic アカウント + 有料プラン or APIキー

### オプション（推奨）

- Git for Windows（Bashツールが使えるようになる）

---

## セットアップ手順

### Step 1: Claude Code をインストール

PowerShell を管理者権限なしで開いて以下を実行:

```powershell
irm https://claude.ai/install.ps1 | iex
```

または WinGet でもインストール可能:

```cmd
winget install Anthropic.ClaudeCode
```

### Step 2: インストール確認

```cmd
claude --version
```

バージョン番号が表示されればOK。

### Step 3: ログイン

```cmd
claude login
```

ブラウザが開くので、Anthropic アカウントでログインする。

- Pro/Max プランに加入済みなら、そのままClaude Code が使える
- API キーを使う場合は環境変数を設定:

```cmd
setx ANTHROPIC_API_KEY "sk-ant-xxxxx..."
```

### Step 4: 動作確認

プロジェクトフォルダに移動して:

```cmd
cd C:\path\to\your\project
claude
```

Claude Code のインタラクティブセッションが起動する。以下を入力:

```
このフォルダに hello.js を作って、Hello World を出力するコードを書いて
```

ファイルが作成されれば成功。

---

## aide-powers をセットアップ

Claude Code に aide-powers を組み込む。

### グローバルインストール

aide-powers リポジトリのルートで `setup.bat` を実行する:

```cmd
REM このフォルダのコピーを使う場合
cd ai-agent-setup\kc-aide-powers
setup.bat

REM または %USERPROFILE%\aide-powers に clone した場合
cd %USERPROFILE%\aide-powers
setup.bat
```

メニューで `2`（Claude Code）を選択。

以下が配置される:
- `%USERPROFILE%\.claude\skills\` — ワークフロースキル群
- `%USERPROFILE%\.claude\agents\` — エージェント定義
- `%USERPROFILE%\.claude\hooks\` — SessionStart hook

### プラグインインストール（推奨・より確実）

```cmd
claude plugin install %USERPROFILE%\aide-powers
```

これが最も確実な方法。SessionStart hook も自動登録される。

### 確認

新しいセッションで以下を入力:

```
TODOアプリを作りたい
```

aide-powers が有効なら、ワークフロー選択から始まる。

---

## Tips

- Claude Code はターミナルツールなので、VS Code やKiro と併用できる
- `claude` コマンドでインタラクティブモード、`claude "質問"` でワンショットモード
- Git リポジトリ内で使うと、ブランチ作成→コード変更→コミットまで自動でやってくれる
- Pro プランの週間制限に達すると一時的に使えなくなる（翌週リセット）

---

## 参考リンク

- Claude Code 公式ドキュメント: https://code.claude.com/docs/en/getting-started
- Claude 料金ページ: https://claude.com/pricing
- Anthropic 公式: https://www.anthropic.com

---

最終更新: 2026年7月
