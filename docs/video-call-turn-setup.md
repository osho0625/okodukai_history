# 📹 おうちビデオ通話 TURNサーバー設定ガイド

外出先（親スマホのモバイル回線）から自宅のラズパイに繋ぐには **TURNサーバーが必須**。
同一Wi-Fi内のテストだけならSTUNのみ（デフォルト）で動くので、まずはそれで動作確認 → その後TURNを追加する。

推奨は **metered.ca Open Relay**（無料枠 20GB/月）。家族利用の通話頻度なら無料枠で十分。

---

## 1. metered.ca で無料アカウント作成

1. https://www.metered.ca/tools/openrelay/ にアクセス
2. 無料アカウントを作成（Free plan: TURN 20GB/月）
3. ダッシュボードで **アプリ名（サブドメイン）** と **API Key** を取得
4. 「TURN Credentials」または API から ICE サーバー一覧（urls / username / credential）を取得

metered は TURN の username/credential が期限付きで発行されるため、
固定の credential を長期利用したい場合はダッシュボードの静的クレデンシャル or API 取得を利用する。

---

## 2. 取得した ICE 構成を Supabase に登録

`game_settings` テーブル（id=1）に `broadcast_ice_servers` カラム（JSONB）を用意して保存する。
このアプリのコード（`js/broadcast-video.js`）は起動時にこの値を読み込む。

### カラム追加（未作成の場合、Supabase SQL Editor で1回だけ実行）

```sql
alter table game_settings add column if not exists broadcast_ice_servers jsonb;
```

### ICE 構成を保存

```sql
update game_settings
set broadcast_ice_servers = '[
  { "urls": "stun:stun.l.google.com:19302" },
  { "urls": "stun:stun.relay.metered.ca:80" },
  { "urls": "turn:標準のTURN_HOST:80", "username": "取得したUSERNAME", "credential": "取得したCREDENTIAL" },
  { "urls": "turn:標準のTURN_HOST:443", "username": "取得したUSERNAME", "credential": "取得したCREDENTIAL" },
  { "urls": "turns:標準のTURN_HOST:443?transport=tcp", "username": "取得したUSERNAME", "credential": "取得したCREDENTIAL" }
]'::jsonb
where id = 1;
```

- `turn:...:443` と `turns:...:443?transport=tcp` を含めると、厳しいファイアウォール下でも繋がりやすい
- `broadcast_ice_servers` が未設定の場合はナースコール用 `nurse_call_ice_servers` を流用する（コード側で対応済み）

---

## 3. 接続テスト手順

1. **同一Wi-Fi内**: 親スマホとラズパイ（またはPC2台）を同じWi-Fiに繋ぎ、STUNのみで通話成功を確認
2. **外出先想定**: 親スマホを **モバイル回線（Wi-Fi OFF）** に切り替えて発信
   - TURN未設定だとここで繋がらない → TURN設定後に再テスト
3. 繋がらない時は Chrome の `chrome://webrtc-internals` で ICE candidate に `relay` が出ているか確認

---

## 4. 他の無料/低コスト選択肢

| サービス | 無料枠 | 備考 |
|----------|--------|------|
| metered.ca Open Relay | TURN 20GB/月 | セットアップ簡単・推奨 |
| Cloudflare Calls (Realtime) | 無料枠あり・従量 | TURN as a service |
| 自前 coturn (VPS) | VPS代のみ（月数百円〜） | Oracle Cloud無料枠等に構築可能・帯域に注意 |

いずれの場合も、取得した ICE 構成を上記 `broadcast_ice_servers` に入れるだけでコード改修不要。
