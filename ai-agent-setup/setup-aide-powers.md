# aide-powers セットアップ手順（家PC・Windows）

AI開発エージェントに「ドキュメント駆動開発」を教えるフレームワーク `aide-powers` を家PCにセットアップする手順です。  
対応プラットフォーム: Kiro IDE / Claude Code / GitHub Copilot / Gemini CLI / Codex

---

## aide-powers とは

「アプリ作って」と言うだけでは、動くけど期待と違うものができあがる。  
aide-powers を入れると、**要件確認 → 設計 → 実装 → レビュー** の正しい手順を AIエージェントが踏むようになり、品質の高いものが作れるようになる。

7つのワークフロー（企画・設計・実装・設計逆引き・変更・リファクタリング・バグ修正）で開発プロセス全体をカバーする。

---

## 前提条件

- Windows 10 / 11（64bit）
- Git for Windows インストール済み（`git clone` と bash 実行に必要）
  - https://gitforwindows.org/
- 使いたいAI開発ツールが1つ以上インストール済み:
  - Kiro IDE
  - Claude Code
  - GitHub Copilot（VSCode）
  - Gemini CLI
  - Codex

---

## 全体の流れ

1. リポジトリを git clone
2. setup.bat を実行してプラットフォームを選択
3. 動作確認

---

## Step 1: リポジトリを準備する

### 方法A: このフォルダのコピーを使う（推奨）

このフォルダ内の `kc-aide-powers/` がクローン済みリポジトリそのもの。  
家PCに `ai-agent-setup/` フォルダごとコピーすれば、すぐに使える。

```cmd
cd ai-agent-setup\kc-aide-powers
```

### 方法B: 社内ネットワークから直接 clone する

社内ネットワーク or VPN に接続した状態で:

```cmd
git clone http://10.110.47.117/kc-apm/kc-aide-powers.git %USERPROFILE%\aide-powers
cd %USERPROFILE%\aide-powers
```

> **注意:** 家のネットワークから 10.110.47.117 にはアクセスできません。  
> VPN接続が必要か、事前にUSB/OneDrive経由でコピーしてください。

---

## Step 2: setup.bat を実行

aide-powers リポジトリのルートで実行:

```cmd
setup.bat
```

メニューが表示されるので、使うプラットフォームの番号を入力:

```
1. Kiro IDE / Kiro CLI
2. Claude Code
3. Cursor
4. GitHub Copilot (CLI + VSCode)
5. Gemini CLI
6. Codex
7. 全部
0. キャンセル
```

迷ったら `7`（全部）を選べば全プラットフォーム分が一括セットアップされる。

### 各プラットフォームの配置先

| プラットフォーム | 配置先 |
|---|---|
| Kiro IDE / Kiro CLI | `~/.kiro/skills/`、`~/.kiro/agents/`、`~/.kiro/steering/` |
| Claude Code | `~/.claude/skills/`、`~/.claude/agents/`、`~/.claude/hooks/` |
| GitHub Copilot | `~/.copilot/skills/`、`~/.copilot/agents/` + VSCode settings 自動編集 |
| Gemini CLI | `gemini extensions link .` で手動リンク |
| Codex | `~/.agents/skills/aide-powers/`、`~/.agents/agents/aide-powers/` |

---

## Step 3: 動作確認

プラットフォームを再起動して、以下のように話しかける:

```
TODOアプリを作りたい
```

aide-powers が正しくインストールされていれば:
- AI Agent が「企画ワークフローを起動します」のようにワークフロー名に言及する
- いきなりコードを書き始めず、要件のヒアリングや計画段階に入る
- 番号付き選択肢でユーザーに次の行動を確認する

いきなりコードを書き始めたら、インストールがうまくいっていない可能性あり。

---

## 更新方法

```cmd
cd %USERPROFILE%\aide-powers
git pull
setup.bat
```

setup を再実行すると、旧バージョンの構造は自動クリーンアップされ最新に更新される。

---

## GitHub Copilot 利用時の追加設定

VSCode の `settings.json` に以下を追加（必須）:

```json
{
  "chat.subagents.allowInvocationsFromSubagents": true
}
```

aide-powers はサブエージェントのネスト呼び出しを使うため、これが `false`（デフォルト）だとワークフローが正常に動作しない。

---

## トラブルシューティング

### git clone できない

- 社内ネットワーク or VPN に接続しているか確認
- `http://10.110.47.117` にブラウザでアクセスできるか確認
- アクセスできない場合は、会社PCで clone してフォルダごとコピーする

### setup.bat で文字化けする

- コマンドプロンプトの文字コードが UTF-8 でない可能性
- `chcp 65001` を実行してから再度 `setup.bat` を実行

### AIエージェントがワークフローを起動しない

- プラットフォーム（Kiro/Claude Code/VSCode）を再起動したか確認
- 配置先ディレクトリにファイルが存在するか確認:
  - Kiro: `%USERPROFILE%\.kiro\skills\using-aide-powers\SKILL.md`
  - Claude Code: `%USERPROFILE%\.claude\skills\using-aide-powers\SKILL.md`

---

## 家PCでのAI開発ツール使い分け

| ツール | 料金 | 用途 | aide-powers対応 |
|---|---|---|---|
| Cline + Ollama | 完全無料 | 軽い作業、オフラインOK、API課金なし | ❌ 非対応 |
| Kiro IDE | 無料（月50クレジット） | 設計駆動開発、aide-powers活用 | ✅ 対応 |
| Claude Code | 最低 $20/月 | ターミナルで本格開発 | ✅ 対応 |
| GitHub Copilot | $10/月〜 | VSCode補完 + エージェント | ✅ 対応 |

### おすすめ構成

- **コスト重視**: Cline + Ollama（完全無料）＋ Kiro（月50クレジット無料）
- **品質重視**: Kiro Pro($20) or Claude Code Pro($20) + aide-powers
- **全部盛り**: 複数併用（aide-powersは全プラットフォームに一括インストール可能）

### セットアップドキュメント一覧

| ドキュメント | 内容 |
|---|---|
| [setup-cline-ollama.md](setup-cline-ollama.md) | Cline + Ollama（完全無料・オフライン対応） |
| [setup-kiro.md](setup-kiro.md) | Kiro IDE（無料枠あり・aide-powers最適） |
| [setup-claude-code.md](setup-claude-code.md) | Claude Code（有料・ターミナル開発） |
| [setup-aide-powers.md](setup-aide-powers.md) | aide-powers（AI開発ワークフロー強化）← このファイル |
| [setup-paid-plan.md](setup-paid-plan.md) | 有料プラン検討ガイド（月5,000円予算） |

---

## 参考リンク

- aide-powers リポジトリ: http://10.110.47.117/kc-apm/kc-aide-powers
- aide-powers ローカルコピー: `kc-aide-powers/`（このフォルダ内）
- aide-powers 詳細ドキュメント: `kc-aide-powers/docs/`
  - `kc-aide-powers/docs/01-about.md` — aide-powers とは
  - `kc-aide-powers/docs/02-getting-started.md` — インストールと初期設定（詳細版）
  - `kc-aide-powers/docs/03-usage.md` — 使い方
  - `kc-aide-powers/docs/04-faq.md` — よくある質問
  - `kc-aide-powers/docs/05-troubleshooting.md` — トラブルシュート

---

最終更新: 2026年7月
