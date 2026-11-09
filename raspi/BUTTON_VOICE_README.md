# おうちボタン 音声リスナー（案B / 無線ボタン対応）

無線の電池式ボタン（ESP32等）を押すと、お小遣い手帳にポイント申請が入り、
その申請をリビングのラズパイが読み上げる。ボタンがラズパイに繋がっていなくてOK。

## 全体の流れ

```
[電池式ESP32ボタン] --Wi-Fi--> [Supabase button-action Edge Function]
                                  ├─ chore_points に pending 申請（承認制）
                                  └─ button_action_logs に result='applied' 記録
                                              │ Realtime 配信
                                              ▼
[ラズパイ button-voice-listener.py] ── applied を検知 ──> スピーカーで読み上げ
```

GPIO直結の `button-listener.py`（押した本人のラズパイがその場で読む）とは別物。
こちらは **無線ボタンの申請を Realtime 購読して読む** 常駐サービス。
既存の `broadcast` サービスとも別プロセスなので全部共存できる。

## 読み上げ対象

- `button_action_logs` の `result='applied'`（申請成功）**のみ** 読み上げる
- `cooldown` / `disabled` / `invalid_token` / `error` は読み上げない（`SPEAK_RESULTS` で制御）

読み上げ文は `child_name` / `chore_name` / `points` から組み立てる。
例: 「いろはが、ゴミ出しを もうしこみました。2ポイントです」

## 前提: Supabase 側で Realtime を有効化（初回1回だけ）

`button_action_logs` が Realtime 配信対象でないと、リスナーは何も受信しない。
Supabase の SQL Editor で以下を1回実行する。

```sql
-- sql/enable_realtime_button_action_logs.sql の内容
ALTER TABLE button_action_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE button_action_logs;
```

既に追加済みならエラーになるが無視してよい。

## ラズパイ初回セットアップ

```bash
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history/raspi
bash button-voice-setup.sh
sudo systemctl start button-voice
```

## 会社PCからの更新運用（GitHub経由・SSH不要）

コードはGitHub上で編集してpushし、ラズパイは `git pull` で取り込む。

### 会社PC側（ブラウザだけでOK）

1. GitHub で `raspi/button-voice-listener.py` を開いて編集 → コミット（ブラウザ上の鉛筆アイコン）
   - ローカルにcloneしているならローカル編集 → `git push` でも可

### ラズパイ側（取り込み＆再起動）

```bash
cd ~/okodukai_history/raspi
bash button-voice-update.sh
```

`button-voice-update.sh` が自動でやること:
1. `git pull --ff-only origin main`
2. 最新 `button-voice-listener.py` を `~/button-voice/` へ配置（既存は `.bak` に退避）
3. `button-voice` サービスを再起動し、起動確認

### 完全無人化したい場合（任意）

ラズパイで `git pull` すら打ちたくないなら、cron で定期 pull → 差分があれば再起動、も可能。
必要になったら追加する。

## 動作確認

無線ボタンがまだ無くても、Edge Function を直接叩けばテストできる:

```bash
curl -X POST "https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/button-action" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4" \
  -d '{"token":"tok_あなたのトークン"}'
```

`result='applied'` が返れば、数秒後にラズパイが読み上げるはず。

## コマンド集

```bash
sudo systemctl status button-voice      # 状態
journalctl -u button-voice -f           # ログ（リアルタイム）
sudo systemctl restart button-voice     # 再起動
sudo systemctl stop button-voice        # 停止
```

## トラブルシューティング

### 申請しても読み上げない
- `journalctl -u button-voice -f` に `📨 ボタン申請` が出るか確認
  - 出ない → Realtime 未有効の可能性。上記の有効化SQLを実行したか確認
  - `⏭️ スキップ (result=cooldown)` 等が出る → 仕様通り（applied以外は読まない）
- ネットワーク確認: `ping -c 3 ynecezxnltigplrfzzoh.supabase.co`

### 音が出ない
- `aplay -l` で出力先確認。既存 broadcast サービスと同じ音声設定
- 音量: `amixer set Master 80%`

### サービスが起動しない
```bash
cd ~/button-voice
./venv/bin/python button-voice-listener.py   # 手動実行でエラー確認
```
