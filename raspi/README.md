# おうちブロードキャスト - Raspberry Pi セットアップガイド

## 概要

お小遣い手帳アプリからメッセージを送信すると、リビングのRaspberry Piが日本語で読み上げる。

## 必要なもの

- Raspberry Pi 5 (2GB以上) + Raspberry Pi OS
- スピーカー（USB or 3.5mm）
- Wi-Fi接続

## クイックスタート

### 1. 初期セットアップ（テレビ+キーボードで）

1. Pi 5にmicroSD挿入 → 電源ON → テレビに画面表示
2. 言語: 日本語、Wi-Fi接続、OSアップデート
3. 「設定」→「Raspberry Piの設定」→「インターフェイス」→ SSH有効化

### 2. SSHでPCから接続

```bash
# ラズパイのIPアドレスを確認（テレビ画面のターミナルで）
hostname -I

# PCから接続
ssh pi@<IPアドレス>
```

### 3. セットアップスクリプト実行

```bash
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history/raspi
bash setup.sh
```

### 4. サービス開始

```bash
sudo systemctl start broadcast
```

### 5. テスト

お小遣い手帳アプリの「📢 おうちブロードキャスト」画面からメッセージを送信。
ラズパイのスピーカーから読み上げられれば成功。

## コマンド集

```bash
# サービス状態確認
sudo systemctl status broadcast

# ログ確認（リアルタイム）
journalctl -u broadcast -f

# サービス再起動
sudo systemctl restart broadcast

# サービス停止
sudo systemctl stop broadcast

# 音量調整（0-100）
amixer set Master 80%

# スピーカーテスト
speaker-test -t wav -c 2 -l 1
```

## ファイル構成

```
~/broadcast/
├── venv/                    # Python仮想環境
├── broadcast-listener.py    # メインスクリプト
└── chime.mp3               # チャイム音（任意）
```

## トラブルシューティング

### 音が出ない
```bash
# 出力先確認
aplay -l

# HDMI音声をオフにして3.5mm/USBに切り替え
# /boot/firmware/config.txt に以下を追加:
# dtparam=audio=on
# その後再起動
```

### Realtimeに接続できない
```bash
# ネットワーク確認
ping -c 3 google.com

# DNS確認
nslookup ynecezxnltigplrfzzoh.supabase.co
```

### サービスが起動しない
```bash
# 手動実行でエラー確認
cd ~/broadcast
./venv/bin/python broadcast-listener.py
```
