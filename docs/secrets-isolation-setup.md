# 🔐 秘密情報の隔離（app_secrets）セットアップ

anon key で誰でもSELECTできる `game_settings` / `app_config` から秘密を分離し、
RLSでanonアクセスを禁止した `app_secrets` に集約。取得・照合はすべてEdge Function経由にする。

## 対象の秘密

| キー | 用途 | アクセス方法 |
|------|------|--------------|
| night_password | 夜間ゲーム解除PW | verify-secret（照合のみ） |
| admin_password | 管理者ログインPW | verify-secret（照合のみ） |
| broadcast_call_secret | ビデオ通話の合言葉 | verify-secret（照合のみ） |
| turn_ice_servers | WebRTC TURN認証 | get-ice-servers（取得） |
| gemini_api_key / groq_api_key / openai_api_key | AI APIキー | ai-proxy（サーバー内でのみ使用） |

## 手順

### 1. app_secrets テーブル作成 + 既存秘密の移行

Supabase SQL Editor で `sql/create_app_secrets.sql` を実行。
既存の `game_settings` / `app_config` から値をコピーする。

### 2. Edge Function をデプロイ

```bash
supabase functions deploy verify-secret --no-verify-jwt
supabase functions deploy get-ice-servers --no-verify-jwt
supabase functions deploy ai-proxy --no-verify-jwt
supabase functions deploy set-secret --no-verify-jwt
```

`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL` は各Functionに自動で入る（Supabase標準環境変数）。

### 3. 動作確認（移行後・クリーンアップ前）

- 管理者ログイン（index.html）: 正しいPWで入れるか（verify-secret）
- 夜間PW解除（game.html）: 解除できるか
- ビデオ通話: ラズパイが合言葉一致で自動応答するか（get-ice-servers + verify-secret）
- AI採点/相談（math-olympiad / math-battle / kenka-chat / kanji漢字画像）: 応答が返るか（ai-proxy）
- admin: パスワード/APIキーの再設定ができるか（set-secret）

curl例（照合）:
```bash
curl -X POST ".../functions/v1/verify-secret" -H "apikey: <anon>" \
  -H "Content-Type: application/json" -d '{"key":"night_password","value":"テスト"}'
```

### 4. クリーンアップ（動作確認が完全に済んでから）

`sql/create_app_secrets.sql` 末尾のコメント参照。元テーブルの平文の秘密を削除する:

```sql
UPDATE game_settings SET
  night_password = NULL, admin_password = NULL, broadcast_call_secret = NULL,
  broadcast_ice_servers = NULL, nurse_call_ice_servers = NULL
WHERE id = 1;
DELETE FROM app_config WHERE key IN ('gemini_api_key', 'groq_api_key', 'openai_api_key');
```

## 補足・設計メモ

- **admin認可**: set-secret は現在の admin_password を知っていることを認可条件とする（app_secretsのadmin_passwordと照合）。admin_password未設定の初回のみ認可なしで設定可能。
- **ビデオ通話の合言葉**: 発信側(親スマホ)は video-call.html の「🔑 あいことば」入力欄で1回だけ入力→保存（`localStorage['broadcast_call_secret']` に保持）。以後は自動で使われる。ラズパイは受信した合言葉を verify-secret でサーバー照合し、一致時のみ自動応答。
  - 合言葉を変えたいときは通話ページの「あいことばを変更」から再入力
  - `app_secrets.broadcast_call_secret`（サーバー側の正解）と一致させること
- **TURN/AIキーの限界**: WebRTCのICE構成はブラウザに渡す必要があるため値は最終的にクライアントに届く。ただし `app_secrets` の直接SELECTは塞げるので「テーブルを丸ごと抜かれる」ことは防げる。AIキーは ai-proxy 内でのみ使用しクライアントには渡らない（完全隔離）。
- **anon key 自体**: 公開前提なので隔離対象外。守るのはRLSと秘密の隔離。
