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

---

# おうちビデオ通話 - Raspberry Pi 受信端末セットアップ

親が外出先からビデオ通話を発信すると、ラズパイが自動応答してテレビに親の顔を映す機能。
読み上げサービス（broadcast）とは別プロセスなので共存できる。

## 必要なもの（追加）

- USBウェブカメラ（マイク内蔵推奨）
- テレビ（HDMI接続）
- スピーカー（読み上げ用と共用可）

## デバイス確認

```bash
# ウェブカメラ
v4l2-ctl --list-devices      # 無ければ: sudo apt install v4l-utils
# マイク（録音デバイス）
arecord -l
# スピーカー（再生デバイス）
aplay -l
```

## キオスク起動（手動テスト）

```bash
cd ~/okodukai_history/raspi
chmod +x video-call-kiosk.sh
./video-call-kiosk.sh
```

- `pages/video-call.html?mode=raspi` を全画面表示し、着信を自動応答する
- カメラ/マイク権限は `--use-fake-ui-for-media-stream` で自動許可
- 終了は `Alt+F4` または SSH から `pkill chromium`

## 自動起動設定（常時受信端末にする）

### 方法A: autostart（デスクトップ環境・簡単）

```bash
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/video-call-kiosk.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=VideoCallKiosk
Exec=/home/pi/okodukai_history/raspi/video-call-kiosk.sh
X-GNOME-Autostart-enabled=true
EOF
```

### 方法B: systemd (--user)

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/video-call-kiosk.service <<'EOF'
[Unit]
Description=Video Call Kiosk
After=graphical-session.target
[Service]
ExecStart=/home/pi/okodukai_history/raspi/video-call-kiosk.sh
Restart=on-failure
[Install]
WantedBy=default.target
EOF
systemctl --user enable --now video-call-kiosk.service
```

## テスト手順

1. まずPC/スマホ2台で先に確認すると切り分けが楽:
   - 親役: `pages/video-call.html` を開いて「でんわする」
   - 子役: `pages/video-call.html?mode=raspi` を開く → 自動応答で繋がる
2. ラズパイでキオスク起動 → 親スマホから発信 → テレビに親が映ればOK
3. 外出先想定: 親スマホをモバイル回線（Wi-Fi OFF）にして発信
   - TURN（metered.ca）は Supabase の `game_settings.broadcast_ice_servers` に設定済みが前提
   - 詳細は `docs/video-call-turn-setup.md`

## トラブルシューティング

### カメラが認識されない
- `v4l2-ctl --list-devices` でデバイスが出るか確認、USBを差し直す
- 複数カメラがある場合はブラウザが別のを選ぶことがある → 不要なカメラを外す

### 映像は出るが音が出ない / マイクが拾わない
- `arecord -l` / `aplay -l` でデバイス確認
- HDMI音声とUSBスピーカーが競合する場合は出力先を明示（`amixer` / PulseAudio設定）

### 着信しても自動応答しない
- URLに `?mode=raspi` が付いているか確認（キオスクスクリプトは付与済み）
- Supabase Realtimeに繋がっているか（`ping supabase`）、シグナリングチャネルは `broadcast-video-call`

### 外出先から繋がらない（同一Wi-Fiでは繋がる）
- TURN未設定/認証エラーの可能性 → `broadcast_ice_servers` を確認
- Chromeの `chrome://webrtc-internals` で candidate に `relay` が出るか確認
