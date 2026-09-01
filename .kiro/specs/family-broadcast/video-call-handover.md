# 📹 おうちビデオ通話 実装引継ぎドキュメント

別チャット/別セッションでビデオ通話機能を実装するための引継ぎ資料。
これを読めば背景・設計・実装手順・注意点が全部わかる。

最終更新: 2026/08/31

---

## 1. ゴール

**「親が外出先（スマホ・モバイル回線）から、家のリビングにいる子供とビデオ通話する」**

- 子供はスマホを持っていない
- リビングに Raspberry Pi 5 + テレビ + USBウェブカメラ + スピーカー を設置
- ラズパイはChromiumキオスクモードで通話ページを常時表示し、着信を自動応答
- 親のスマホはお小遣い手帳アプリ（PWA）から発信
- テレビに親の顔が映り、ウェブカメラで子供を送信、スピーカーで音声

```
[親のスマホ: お小遣い手帳アプリ]  ---WebRTC (TURN経由)--->  [ラズパイ: Chromiumキオスク]
   モバイル回線から発信                                          テレビに親を表示
                                                              ウェブカメラで子供を送信
```

---

## 2. 超重要な前提：ビデオ通話ロジックは既に実装済み

**ゼロから作らない。** ナースコール機能に WebRTC 音声/ビデオ通話が完全実装されている。

### 流用元ファイル
- `js/nurse-call-voice.js` — WebRTC通話モジュール本体（音声+ビデオ、renegotiation対応）
- `pages/nurse-call.html` — 通話UIの実装例（video要素の配置、ボタン制御）

### `js/nurse-call-voice.js` に実装済みの機能
- WebRTC PeerConnection 管理
- 状態機械: idle → ringing → connected → ended → idle
- シグナリング: Supabase Realtime Broadcast（チャネル名 `nurse-voice-call`）
- 音声通話（`getUserMedia({ audio: true })`）
- ビデオ追加（`toggleVideo()` → `getUserMedia({ video: { facingMode: 'user' } })` → `pc.addTrack()`）
- renegotiation（`onnegotiationneeded` で通話中の映像追加時に自動offer/answer再交換）
- 映像受信（`pc.ontrack` で `track.kind === 'video'` 判定 → role別video要素に表示）
- ICE candidateキュー（PeerConnection作成前のcandidateをバッファ）
- バックグラウンド維持（Screen Wake Lock + 無音オーディオループ）
- 公開API: `window.NurseCallVoice.{ init, startCall, acceptCall, endCall, toggleVideo, getState, onStateChange, destroy }`

### role別のvideo/audio要素ID（nurse-call-voice.js内でハードコード）
| role | リモート映像 | ローカル映像 | リモート音声 |
|------|------------|------------|------------|
| 親（admin） | `parentRemoteVideo` | `parentLocalVideo` | `parentRemoteAudio` |
| 子供（user） | `voiceRemoteVideo` | `voiceLocalVideo` | `voiceRemoteAudio` |

詳細仕様は `.kiro/steering/nurse-call.md` の「音声/ビデオ通話」セクション参照。

---

## 3. 最大の技術的ハードル：TURNサーバー（必須）

**外出先から家に繋ぐには TURN サーバーが絶対に必要。**

- ナースコールのデフォルトは Google STUN のみ（`stun:stun.l.google.com:19302`）
- 同一Wi-Fi内（家の別部屋同士）ならSTUNだけで繋がる
- **しかしモバイル回線（4G/5GのCGNAT）↔自宅NAT間はSTUNだけではホールパンチ失敗する**
- 中継（リレー）用の TURN サーバーが必要

### TURN の設定方法
既存コードは `game_settings.nurse_call_ice_servers` (JSONB) からICE構成を読む。
ここにTURN構成を足すだけでコード改修不要:

```json
[
  { "urls": "stun:stun.l.google.com:19302" },
  { "urls": "turn:YOUR_TURN_HOST:3478", "username": "USER", "credential": "PASS" }
]
```

ビデオ通話用に別カラム（例: `broadcast_ice_servers`）を新設してもよい。

### TURNサーバーの選択肢
| 選択肢 | コスト | 難易度 | 備考 |
|--------|--------|--------|------|
| 自前 coturn（VPS） | 月数百円〜 | 中 | さくらVPS/Oracle Cloud無料枠等にcoturn構築。帯域課金に注意 |
| Cloudflare Calls | 従量 | 低 | TURN as a service、無料枠あり |
| metered.ca | 従量/無料枠 | 低 | 無料50GB/月、セットアップ簡単 |
| Twilio TURN | 従量 | 低 | 安定だが割高 |

**推奨: まず metered.ca か Cloudflare の無料枠で動作確認 → 本運用でコスト判断。**
家族利用なら通話頻度は低いので無料枠で足りる可能性が高い。

---

## 4. 実装タスク一覧

### Phase 1: ビデオ通話ページ（アプリ側）
- [ ] `pages/video-call.html` を新規作成
  - `js/nurse-call-voice.js` を流用（またはコピーして `js/broadcast-video.js` として独立）
  - 親用: 大きなリモート映像（テレビ相当）+ 小さいローカル映像（PinP）+ 発信/切断ボタン
  - video要素IDは既存の `parentRemoteVideo` 等に合わせるか、新設して voice.js を調整
- [ ] TOP画面（index.html）の ALL_ICONS に「ビデオ通話」アイコン追加（adminOnly: true）
- [ ] 通話開始時は音声+映像を両方有効にする（ナースコールは音声開始→後から映像追加なので、
      最初から映像ONにするなら startCall/acceptCall の getUserMedia に video: true を追加）

### Phase 2: ラズパイ側の受信端末化
- [ ] `raspi/video-call-kiosk.sh` — Chromiumをキオスクモードで video-call.html を全画面表示
  - `chromium-browser --kiosk --autoplay-policy=no-user-gesture-required "https://osho0625.github.io/okodukai_history/pages/video-call.html?mode=raspi"`
- [ ] ラズパイ側は着信自動応答モード（`?mode=raspi` パラメータで判定）
  - 着信検知 → 自動で `acceptCall()` → カメラ+マイク取得
  - role は 'child' 相当（着信自動応答する側）
- [ ] systemd or autostart で Chromium 自動起動設定
- [ ] カメラ・マイク・スピーカーのデバイス確認（`v4l2-ctl --list-devices`, `arecord -l`, `aplay -l`）

### Phase 3: TURNサーバー
- [ ] TURNサービス選定（metered.ca 無料枠推奨）
- [ ] `game_settings` にICE構成を保存（既存 nurse_call_ice_servers 流用 or 新カラム）
- [ ] 外出先（スマホをモバイル回線に切り替え）からの接続テスト

### Phase 4: 発着信フロー
- [ ] シグナリングチャネルをナースコールと分離（`broadcast-video-call` 等の別チャネル名に）
      ※ナースコールと同じ `nurse-voice-call` を使うと混信するので必ず分ける
- [ ] 着信時のラズパイ側UI（自動応答なので最小限、接続状態表示程度）
- [ ] 親側の発信UI（発信ボタン、呼び出し中表示、切断ボタン）

---

## 5. 設計上の注意点

1. **シグナリングチャネル名を必ず分ける**
   - ナースコール: `nurse-voice-call`
   - ビデオ通話: 別名（例 `broadcast-video-call`）にしないと混信する

2. **ラズパイのChromiumはカメラ/マイク権限とautoplayに注意**
   - `--autoplay-policy=no-user-gesture-required` で自動再生許可
   - カメラ/マイク権限はHTTPS必須（GitHub PagesはHTTPSなのでOK）
   - 初回だけ権限許可が必要な場合あり。`--use-fake-ui-for-media-stream` で自動許可も可能（テスト用）

3. **ラズパイ側の自動応答**
   - 親が発信 → ラズパイが着信検知 → 無条件で `acceptCall()`
   - 子供が操作不要で通話開始できるのが理想（テレビに親が映る）

4. **既存のブロードキャスト読み上げ（broadcast.service）と共存**
   - 読み上げサービスとChromiumキオスクは別プロセスなので共存可能
   - ただしスピーカーの音声出力先が競合しないよう注意

5. **プライバシー**
   - ラズパイが常時カメラ起動だと問題。着信時のみカメラ有効化する
   - 通話終了後は必ずカメラ/マイクを stop する（既存コードの cleanup で対応済み）

---

## 6. 関連ファイル・ドキュメント一覧

| ファイル | 内容 |
|----------|------|
| `js/nurse-call-voice.js` | **流用元** WebRTC通話モジュール |
| `pages/nurse-call.html` | 通話UI実装例 |
| `.kiro/steering/nurse-call.md` | ナースコール仕様（WebRTC詳細） |
| `.kiro/steering/family-broadcast.md` | おうちブロードキャスト仕様（ビデオ通話将来計画セクション） |
| `raspi/broadcast-listener.py` | 既存の読み上げサービス（参考） |
| `raspi/setup.sh` | 既存のラズパイセットアップ（参考） |
| `raspi/README.md` | ラズパイセットアップガイド |
| `.kiro/specs/family-notes/docs/raspi-setup-guide.md` | ラズパイ初期設定手順 |

---

## 7. Supabase情報

- URL: `https://ynecezxnltigplrfzzoh.supabase.co`
- anon key: `sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4`（`js/common.js` 参照）
- ICE設定テーブル: `game_settings` (id=1) の `nurse_call_ice_servers` カラム
- Realtimeを使うのでシグナリングチャネルはコード内で完結（テーブル不要）
- 通話履歴を残すなら新テーブル検討（任意）

---

## 8. 作業開始時の最初のステップ（推奨順）

1. `js/nurse-call-voice.js` を熟読（このドキュメントの Section 2 参照）
2. `pages/nurse-call.html` の通話UI部分を読んでvideo要素の使い方を把握
3. metered.ca でTURNアカウント作成、ICE構成を取得
4. `pages/video-call.html` を作成（voice.js流用、最初は同一Wi-Fi内でSTUNのみでテスト）
5. 同一Wi-Fi内で通話成功を確認
6. TURN設定を追加して外出先（モバイル回線）から接続テスト
7. ラズパイのChromiumキオスク + 自動応答を実装
8. リリースノート/CONTEXT/steering/バージョン更新 → TSJブランチ → main --no-ff マージ

---

## 9. 開発ルール（このプロジェクト共通・必読）

`.kiro/steering/project-overview.md` の「🔴 毎回必ずやること」を厳守:

1. `pages/release-notes.html` — バージョン上げてリリース内容追記
2. `sw.js` — `CACHE_NAME` のバージョン +1（現在 v330）
3. `index.html` — 末尾のバージョン表示更新（現在 v2.40.1）
4. `.kiro/steering/project-overview.md` — 構成変更を反映
5. `.kiro/steering/` — 該当機能のsteeringファイル更新（family-broadcast.md）
6. `CONTEXT.md` — インデックス更新
7. `git push` — TSJブランチにコミット → main に `git merge --no-ff`

新規ページを作ったら `sw.js` の ASSETS 配列にも追加すること。
