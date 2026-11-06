# おうちボタン - Raspberry Pi 物理ボタン セットアップガイド

物理ボタンを押すと、お小遣い手帳に「特定の子の特定の家事を1回分」ポイント申請する（承認制）。
Alexa申請と同じく `chore_points` に `status='pending'` で入り、親が承認して確定する。

## 仕組み

```
[物理ボタン] --(GPIO押下)--> [ラズパイ button-listener.py]
   --(POST token)--> [Edge Function button-action]
   --> button_actions を token で照合 → children 解決
   --> chore_points に pending 申請 + Discord/Push 通知
```

ラズパイが持つのは **token と公開apikeyとURLだけ**。子供名・家事・ポイントの割り当ては
Supabase 側（`button_actions` テーブル / admin.html の「🔘 IoTボタン管理」）で管理する。
ラズパイのコードを書き換えずに、管理画面から割り当て変更・有効無効・クールダウンを制御できる。

## 必要なもの

- Raspberry Pi（既存のブロードキャスト機と共用可。button サービスは別プロセス）
- 物理ボタン（アーケードボタン30mm 推奨。1個150〜600円程度）
- ジャンパー線（メス-メス、100〜300円）
- （任意）スピーカー … 押下フィードバックの音声読み上げ用。既存ブロードキャストと共用可

## 配線（BCMピン・内部プルアップ・抵抗不要）

押すと GPIO が GND に落ちる（アクティブLOW）。片足をGPIO、もう片足をGNDに挿すだけ。

| ボタン | GPIO (BCM) | 物理ピン | GND 物理ピン例 |
|--------|-----------|----------|----------------|
| ボタン1 | GPIO17 | 11番 | 9番 |
| ボタン2 | GPIO27 | 13番 | 14番 |

ピンを増やす場合は `button-listener.py` の `BUTTONS` に追記する（GPIO5/6/13/19/26 などが空きやすい）。

## セットアップ手順

### 1. 事前に管理画面でボタンを登録

1. お小遣い手帳の `admin.html` を開く → 「🔘 IoTボタン管理」セクション
2. ラベル・子・家事・ポイント・クールダウンを設定して登録
3. 発行された `token`（`tok_xxx`）を控える（詳細モーダルからコピー）

### 2. ラズパイにサービスを導入

```bash
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history/raspi
bash button-setup.sh
```

### 3. token を listener に貼る

```bash
nano ~/button/button-listener.py
```

`BUTTONS` の各 `token` を、手順1で控えた `tok_xxx` に置き換える:

```python
BUTTONS = [
    {"pin": 17, "token": "tok_あなたのトークン1", "voice": None},
    {"pin": 27, "token": "tok_あなたのトークン2", "voice": None},
]
```

### 4. サービス開始

```bash
sudo systemctl start button
journalctl -u button -f   # 押してログを確認
```

## 動作確認

- ボタンを押す → ログに `✅ ...を申請しました` が出て、スピーカーがあれば読み上げ
- admin.html の chore_points 承認待ち一覧に申請が出る
- 連続で押すとサーバ側 `cooldown_seconds`（既定30秒）内は `cooldown` で弾かれる

Edge Function 単体の疎通テスト（ボタンなしでも確認可能）:

```bash
curl -X POST "https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/button-action" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4" \
  -d '{"token":"tok_あなたのトークン"}'
```

## コマンド集

```bash
sudo systemctl status button      # 状態
journalctl -u button -f           # ログ（リアルタイム）
sudo systemctl restart button     # 再起動（token編集後に実行）
sudo systemctl stop button        # 停止
```

## ファイル構成

```
~/button/
├── venv/                  # Python仮想環境（--system-site-packages）
└── button-listener.py     # メインスクリプト（token を編集して使う）
```

## トラブルシューティング

### 押しても反応しない
- 配線を確認（GPIO と GND）。`journalctl -u button -f` に `🔘 押下` が出るか
- `BUTTONS` の `token` が `tok_REPLACE_ME` のままになっていないか

### `invalid_token` と出る
- admin.html で発行した token と一致しているか。前後の空白・改行に注意

### `cooldown` で弾かれる
- 仕様通り。短時間の連打を防ぐため。admin.html で `cooldown_seconds` を調整可能

### 音が出ない（読み上げ）
- 読み上げは任意機能。スピーカー・mpg123・gTTS が必要
- 出力先は既存ブロードキャストの手順（`aplay -l` / `amixer`）を参照

### GPIOが使えない / Permission 
- `python3-gpiozero` と lgpio が入っているか（`button-setup.sh` が導入）
- ユーザーが `gpio` グループに属しているか（Raspberry Pi OS は既定でpi所属）
