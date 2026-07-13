# Kiro IDE セットアップ手順（家PC・Windows）

AWSが提供するAI搭載IDE「Kiro」のセットアップ手順です。  
aide-powersとの組み合わせで、設計駆動のAI開発が無料で始められます。

---

## Kiro とは

Kiro はAWS（Amazon）が開発したAI搭載のコードエディタ。VS Codeベースで使い勝手はほぼ同じ。  
特徴は「Spec駆動開発」で、要件→設計→タスク→実装を順序立てて進められること。

aide-powersとの相性が最も良いプラットフォームの一つ。

---

## 無料プランの内容と制限

| 項目 | Free プラン |
|---|---|
| 料金 | $0 |
| クレジット | 50 クレジット / 月 |
| Spec（設計駆動） | クレジットから消費 |
| Vibe（自由チャット） | クレジットから消費 |
| 初回ボーナス | 500クレジット（14日間限定） |
| オーバー課金 | なし（使い切ったら翌月まで停止） |

### クレジットの消費について

- 単純なプロンプト: 1クレジット未満（0.01単位で課金）
- 複雑なタスク: 1〜数クレジット
- 月50クレジットは「毎日1〜2回の質問」程度。ガッツリ使うには少ない

### 有料プラン参考

| プラン | 月額 | クレジット |
|---|---|---|
| Pro | $20 | 1,000 |
| Pro+ | $40 | 2,000 |
| Power | $200 | 10,000 |

---

## 前提条件

- Windows 10 / 11（64bit）
- インターネット接続
- GitHub、Google、または AWS Builder ID アカウント（サインイン用）

---

## セットアップ手順

### Step 1: Kiro をダウンロード

1. https://kiro.dev/downloads/ にアクセス
2. Windows版のインストーラーをダウンロード
3. ダウンロードした `.exe` ファイルを実行
4. インストーラーの指示に従ってインストール（デフォルトでOK）

### Step 2: サインイン

1. Kiro を起動
2. GitHub / Google / AWS Builder ID のいずれかでサインイン
3. 初回ログイン時に500クレジットのボーナスが付与される（14日間有効）

> AWS アカウントは不要。GitHub or Google アカウントがあればOK。

### Step 3: 動作確認

1. 適当なフォルダを開く
2. チャットパネルで以下を入力:

```
hello.js を作って、Hello Worldを出力するコードを書いて
```

3. AIが計画を提示→承認→実行される
4. ファイルが作られたら成功

---

## aide-powers をセットアップ

Kiro に aide-powers を組み込むと、設計駆動ワークフローが強化される。

### グローバルインストール（推奨）

aide-powers リポジトリのルートで `setup.bat` を実行する:

```cmd
REM このフォルダのコピーを使う場合
cd ai-agent-setup\kc-aide-powers
setup.bat

REM または %USERPROFILE%\aide-powers に clone した場合
cd %USERPROFILE%\aide-powers
setup.bat
```

メニューで `1`（Kiro IDE / Kiro CLI）を選択。

以下が配置される:
- `%USERPROFILE%\.kiro\skills\` — ワークフロースキル群
- `%USERPROFILE%\.kiro\agents\` — エージェント定義
- `%USERPROFILE%\.kiro\steering\` — ブートストラップ設定

### 確認

Kiro を再起動して以下を入力:

```
TODOアプリを作りたい
```

aide-powersが有効なら、いきなりコードを書かず「企画ワークフローを起動します」のようにワークフロー選択から始まる。

---

## Tips

- 月50クレジットは少ないので、考えをまとめてから質問する方が効率的
- 初回14日間のボーナス500クレジットで aide-powers の動作感を掴むのがおすすめ
- Spec（設計駆動）モードはクレジット消費が大きい傾向。Vibeモードで軽い質問をする方が節約になる
- VS Code の拡張機能がほぼそのまま使える

---

## 参考リンク

- Kiro 公式: https://kiro.dev
- Kiro ダウンロード: https://kiro.dev/downloads/
- Kiro 料金: https://kiro.dev/pricing/
- Kiro FAQ: https://kiro.dev/faq/

---

最終更新: 2026年7月
