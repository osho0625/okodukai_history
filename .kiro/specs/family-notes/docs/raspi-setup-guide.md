# 🍓 Raspberry Pi セットアップガイド

ラズパイが届いたらやること。順番通りにやれば動く。

---

## 買ったもの

- Pi 5 (2GB) スターターキット V4（KSY） — 本体/電源/ケース(ファン付)/SD/HDMIケーブル
- USBウェブカメラ（マイク内蔵）
- 小型スピーカー
- 無線キーボード

---

## Step 1: 組み立て（5分）

1. ケースにPi 5を入れる（ツールレス、パチッとはめるだけ）
2. microSDカード（付属、OS書き込み済み）をPi 5の裏面スロットに差す
3. HDMIケーブルでテレビに接続
4. USBウェブカメラを接続
5. スピーカーを接続（USB or 3.5mm）
6. 無線キーボードのUSBレシーバーを接続
7. 最後に電源アダプタを接続 → 自動で起動する

---

## Step 2: 初期セットアップ（10分）

テレビに画面が出る。

1. **言語**: 日本語を選択
2. **Wi-Fi**: 自宅のSSIDを選んでパスワード入力
3. **OSアップデート**: 聞かれたら「はい」（5〜10分かかる）
4. **再起動**

---

## Step 3: リモートアクセス設定（5分）

毎回テレビとキーボードが要らなくなる設定。

1. 画面左上の「🍓アイコン」→「設定」→「Raspberry Piの設定」
2. 「インターフェイス」タブ
3. **SSH** を「有効」にする
4. **VNC** を「有効」にする（画面共有したい場合）
5. 「OK」で閉じる

### IPアドレスを確認

画面下のタスクバーにWi-Fiアイコンがある。カーソルを乗せるとIPアドレス（例: `192.168.1.xx`）が表示される。メモしておく。

### PCから接続テスト

```
ssh pi@192.168.1.xx
```

パスワードはStep 2で設定したもの。

---

## Step 4: おうちブロードキャスト セットアップ（10分）

SSHでラズパイに接続して以下を実行：

```bash
# リポジトリをクローン
git clone https://github.com/osho0625/okodukai_history.git

# セットアップスクリプトを実行
cd okodukai_history/raspi
bash setup.sh
```

完了したら：

```bash
# サービス開始
sudo systemctl start broadcast

# ログ確認（メッセージ待機中と表示されればOK）
journalctl -u broadcast -f
```

---

## Step 5: テスト

1. スマホでお小遣い手帳アプリを開く
2. 📢アイコン → おうちブロードキャスト画面
3. 「宿題やった？」ボタンを押す
4. ラズパイのスピーカーから読み上げられれば成功！

---

## Step 6: Supabaseテーブル作成（初回のみ）

Supabase Dashboard の SQL Editor で以下を実行：

```sql
CREATE TABLE IF NOT EXISTS alexa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL CHECK (direction IN ('to_alexa', 'from_alexa')),
  message TEXT NOT NULL,
  replied BOOLEAN NOT NULL DEFAULT false,
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alexa_messages_pending
  ON alexa_messages (direction, replied, created_at DESC)
  WHERE replied = false;

ALTER TABLE alexa_messages DISABLE ROW LEVEL SECURITY;
```

Supabase Dashboard → Settings → API → Realtime で `alexa_messages` テーブルのRealtimeを有効にする。

---

## よく使うコマンド

| やること | コマンド |
|----------|---------|
| サービス状態確認 | `sudo systemctl status broadcast` |
| ログ確認（リアルタイム） | `journalctl -u broadcast -f` |
| サービス再起動 | `sudo systemctl restart broadcast` |
| サービス停止 | `sudo systemctl stop broadcast` |
| 音量調整（0-100） | `amixer set Master 80%` |
| スピーカーテスト | `speaker-test -t wav -c 2 -l 1` |
| IPアドレス確認 | `hostname -I` |
| Wi-Fi再接続 | `sudo nmcli device wifi connect "SSID" password "PASS"` |

---

## トラブルシューティング

### 音が出ない
- `aplay -l` で出力デバイス確認
- USB スピーカーなら差し直してみる
- `amixer set Master 80%` で音量を上げてみる

### Realtimeに接続できない
- `ping -c 3 google.com` でネット接続確認
- Wi-Fiが切れていたら再接続

### サービスが起動しない
- 手動で実行してエラー確認: `cd ~/broadcast && ./venv/bin/python broadcast-listener.py`

### テレビに映像が出ない
- HDMIケーブルを差し直す
- テレビの入力切替を確認（HDMI1 or HDMI2）

---

## Step 7: おうちビデオ通話 受信端末セットアップ（任意・10分）

親が外出先からビデオ通話をかけると、ラズパイが自動応答してテレビに親の顔を映す。
読み上げサービスと同じラズパイで共存できる（別プロセス）。

### 前提

- USBウェブカメラ（マイク内蔵）が接続済み（Step 1で接続したもの）
- Supabaseの `game_settings.broadcast_ice_servers` にTURN設定済み（外出先接続に必須）
  - 設定手順は `docs/video-call-turn-setup.md`（metered.ca 無料20GB/月）
- **合言葉認証の設定が必須**（`game_settings.broadcast_call_secret`）
  - 未設定だとラズパイはフェイルセーフで着信を一切自動応答しない（安全側の設計）
  - 設定手順は `docs/video-call-turn-setup.md` の「合言葉認証」参照

### デバイス確認

```bash
v4l2-ctl --list-devices   # ウェブカメラ（無ければ: sudo apt install v4l-utils）
arecord -l                # マイク
aplay -l                  # スピーカー
```

### キオスク起動（手動テスト）

```bash
cd ~/okodukai_history/raspi
chmod +x video-call-kiosk.sh
./video-call-kiosk.sh
```

`pages/video-call.html?mode=raspi` が全画面表示され、着信を自動応答する。

### 自動起動（常時受信端末にする）

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

### テスト

1. 先にPC/スマホ2台で確認すると楽:
   - 親役: `pages/video-call.html` → 「でんわする」
   - 子役: `pages/video-call.html?mode=raspi` → 自動応答で繋がる
2. ラズパイでキオスク起動 → 親スマホから発信 → テレビに親が映ればOK
3. 外出先想定: 親スマホをモバイル回線（Wi-Fi OFF）にして発信

### トラブルシューティング（ビデオ通話）

- **カメラが認識されない**: `v4l2-ctl --list-devices` で確認、USB差し直し
- **着信しても応答しない**: URLに `?mode=raspi` が付いているか、シグナリングチャネルは `broadcast-video-call`、**合言葉（`broadcast_call_secret`）が発信側と一致しているか**（未設定/不一致だと自動応答しない仕様）
- **外出先から繋がらない**: `broadcast_ice_servers`（TURN）を確認、`chrome://webrtc-internals` で `relay` candidate が出るか確認

詳細は `raspi/README.md` の「おうちビデオ通話」セクション参照。
