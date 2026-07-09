# AI エージェント開発環境セットアップ

家PCでAI開発環境を構築するためのドキュメントとツール一式です。  
自分の開発効率化と、子供のエンジニア教育の両方を目的としています。

---

## 何ができるようになるか

- AIエージェントに自然言語で指示してコードを書いてもらう
- 設計駆動開発（要件→設計→実装→レビュー）をAIと一緒に進める
- 子供が「〇〇作りたい」と言ったら、AIと一緒にプログラミング体験ができる

---

## ドキュメントの読み方

### まず最初に読むもの

| ドキュメント | 内容 | こんな時に |
|---|---|---|
| [setup-cline-ollama.md](setup-cline-ollama.md) | Cline + Ollama セットアップ | 無料でとりあえずAI開発を始めたい |

### 本格的に使いたくなったら

| ドキュメント | 内容 | こんな時に |
|---|---|---|
| [setup-kiro.md](setup-kiro.md) | Kiro IDE セットアップ | 設計駆動のAI開発がしたい（無料枠あり） |
| [setup-claude-code.md](setup-claude-code.md) | Claude Code セットアップ | ターミナルで本格的にAI開発したい（有料） |
| [setup-aide-powers.md](setup-aide-powers.md) | aide-powers セットアップ | AIに設計プロセスを踏ませたい |

### お金を払って本格運用するとき

| ドキュメント | 内容 | こんな時に |
|---|---|---|
| [setup-paid-plan.md](setup-paid-plan.md) | 有料プラン検討ガイド | 月5,000円でベストな構成を知りたい |

---

## おすすめの進め方

### Phase 1: 無料で体験（初日）

1. [setup-cline-ollama.md](setup-cline-ollama.md) に沿って Cline + Ollama をセットアップ
2. 「Hello World を作って」等の簡単な指示で動作確認
3. 子供と一緒に試してみる

### Phase 2: 設計駆動を試す（1週目）

1. [setup-kiro.md](setup-kiro.md) に沿って Kiro IDE をインストール
2. 初回ボーナス500クレジット（14日間）を使って aide-powers を体験
3. [setup-aide-powers.md](setup-aide-powers.md) で aide-powers をセットアップ
4. 「TODOアプリを作りたい」で設計駆動開発の流れを体験

### Phase 3: 有料プランに移行（2週目以降）

1. [setup-paid-plan.md](setup-paid-plan.md) を読んで構成を決定
2. Kiro Pro ($20/月) にアップグレード
3. Cline + Ollama は無制限のサブ環境として継続利用

---

## ツール構成の全体像

```
┌─────────────────────────────────────────────────┐
│  家PC AI開発環境                                  │
├─────────────────────────────────────────────────┤
│                                                   │
│  [メイン] Kiro IDE + aide-powers                  │
│    ├ 設計駆動開発（企画→設計→実装→レビュー）      │
│    ├ 月1,000クレジット（Pro $20/月）              │
│    └ 子供の教育にも最適（GUI・可視化）            │
│                                                   │
│  [サブ] Cline + Ollama（VS Code）                 │
│    ├ 完全無料・無制限                             │
│    ├ オフライン動作OK                             │
│    ├ 軽い質問・試行錯誤用                         │
│    └ クレジット節約したい時に                     │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## フォルダ構成

```
ai-agent-setup/
├── README.md                  ← このファイル（全体説明）
├── setup-cline-ollama.md      ← Cline + Ollama セットアップ手順
├── setup-kiro.md              ← Kiro IDE セットアップ手順
├── setup-claude-code.md       ← Claude Code セットアップ手順
├── setup-aide-powers.md       ← aide-powers セットアップ手順
├── setup-paid-plan.md         ← 有料プラン検討ガイド
└── kc-aide-powers/            ← aide-powers リポジトリ本体（git clone済み）
```

---

## 各ツールの比較

| ツール | 料金 | ネット | aide-powers | 子供向け | 用途 |
|---|---|---|---|---|---|
| Cline + Ollama | 無料 | 不要 | ❌ | ○ | 軽いコード生成、試行錯誤 |
| Kiro IDE (Free) | 無料 | 必要 | ✅ | ◎ | 月50クレジットで設計駆動を体験 |
| Kiro IDE (Pro) | ¥3,250/月 | 必要 | ✅ | ◎ | 月1,000クレジットで本格利用 |
| Claude Code | ¥3,250/月〜 | 必要 | ✅ | △ | ターミナル開発（上級者向け） |

---

## 注意事項

- `kc-aide-powers/` は社内Gitサーバーからクローンしたもの。更新するには社内ネットワーク接続が必要
- Kiro / Claude Code はインターネット接続が必須（クラウドのAIモデルを利用するため）
- Cline + Ollama のみオフライン動作可能

### aide-powers の更新方法

社内ネットワークに接続できる環境（会社PC or VPN）で:

```cmd
cd kc-aide-powers
git pull
setup.bat
```

社内ネットワークに接続できない場合:
1. 会社PCで `git pull` して最新化
2. `kc-aide-powers/` フォルダをUSB or OneDrive で家PCにコピー
3. コピー先で `setup.bat` を実行

---

最終更新: 2026年7月
