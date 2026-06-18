# 実装計画: ナースコール機能

## 概要

ナースコール機能をユーザー指定の優先順位で実装する:
1. コア機能（DBテーブル + Edge Function + 呼び出しボタン + Push通知 + 応答）
2. デバイスロックモード
3. チャット機能
4. 音声通話（最後に実装を試みる）

フロントエンドはvanilla JavaScript、Edge FunctionはDeno/TypeScript、テストはfast-checkを使用。

## Tasks

- [x] 1. DBテーブル定義とマイグレーション作成
  - [x] 1.1 `sql/create_nurse_call_tables.sql` を作成し、`nurse_calls`、`nurse_call_messages`、`device_settings` テーブルを定義する
    - nurse_calls: id UUID PK, child_id, child_name, reason, status, notification_status, created_at, responded_at
    - nurse_call_messages: id UUID PK, call_id FK, child_id, sender_role, message_text, created_at
    - device_settings: device_id TEXT PK, child_id UUID, nurse_call_mode BOOLEAN, updated_at
    - 各テーブルのINDEXを含む
    - 自動resolve用pg_cronジョブ（30分無活動でresolved）
    - 90日超過メッセージ自動削除用pg_cronジョブ
    - _Requirements: 4.1, 4.2, 9.4, 9.12, 4.6_
  - [x] 1.2 `sql/alter_game_settings_nurse_call.sql` を作成し、game_settingsにnurse_call関連カラムを追加する
    - nurse_call_enabled BOOLEAN, nurse_call_notify_targets JSONB, nurse_call_child_ids JSONB, nurse_call_ice_servers JSONB
    - _Requirements: 7.1, 2.6, 10.17_

- [x] 2. Supabase Anonymous Auth導入とEdge Function実装
  - [x] 2.1 `supabase/functions/push-nurse-call/index.ts` にEdge Functionを作成する
    - JWT検証（Authorization: Bearer ヘッダー）→ 無効/欠落で401
    - device_id存在確認 + child_id整合性チェック → 不一致で403
    - サーバー側クールダウン判定（nurse_callsの最新created_atから30秒）→ 429
    - nurse_callsにINSERT（notification_status='pending'）→ call_id発行
    - nurse_call_notify_targets設定に基づく通知対象フィルタリング（null/空→role='admin'全端末）
    - Web Push送信（通知メッセージフォーマット: 理由あり/なしの分岐）
    - notification_status更新（sent/partial/failed）
    - レスポンス: `{call_id, notification_status}`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.5, 3.6, 4.1, 8.7, 8.8, 11.3, 11.4, 11.5_
  - [ ]* 2.2 Property 1のテストを書く — 通知メッセージフォーマット
    - **Property 1: 通知メッセージフォーマット**
    - `formatNotificationMessage(childName, reason)` を純粋関数として抽出しテスト
    - **Validates: Requirements 2.3, 2.4**
  - [ ]* 2.3 Property 2のテストを書く — 通知対象フィルタリング
    - **Property 2: 通知対象フィルタリング**
    - `filterNotifyTargets(targets, subscriptions)` を純粋関数として抽出しテスト
    - **Validates: Requirements 2.6, 2.7**
  - [ ]* 2.4 Property 3のテストを書く — サーバー側クールダウン判定
    - **Property 3: サーバー側クールダウン判定**
    - `isCooldownActive(lastCreatedAt, now)` を純粋関数として抽出しテスト
    - **Validates: Requirements 3.5, 3.6, 8.8, 11.9**

- [x] 3. ナースコール画面（子供側UI）の基本実装
  - [x] 3.1 `pages/nurse-call.html` を作成する
    - 大きな「よんで！」ボタン（画面幅80%以上）
    - 理由プリセットボタン（のどかわいた、きもちわるい、トイレ、はなしたい）
    - クールダウンカウントダウン表示
    - エラーメッセージ表示エリア
    - 「いくよ！」応答メッセージ表示エリア
    - Supabase client読み込み + Anonymous Auth初期化
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 5.3, 11.1_
  - [x] 3.2 `js/nurse-call.js` にメインロジックを実装する
    - `ensureAuthSession()`: Anonymous Auth セッション確立（signInAnonymously）
    - `sendCall(reason)`: Edge Function呼び出し（JWT付きfetch）+ call_id受け取り
    - クライアント側クールダウン（30秒、残り秒数表示）
    - オフラインキュー管理（navigator.onLine判定、localStorageに最大1件保存、onlineイベントで自動送信）
    - Realtimeチャネル購読（`nurse-call:{child_id}:{call_id}`）
    - 応答メッセージ受信時の「いくよ！」表示
    - メッセージフィルタリング（自身のchild_id + 現在のcall_idのみ受け入れ）
    - エラーハンドリング（401/403/429/500/ネットワーク切断）
    - _Requirements: 2.1, 3.1-3.4, 5.2, 5.3, 5.5, 5.6, 8.1-8.6, 8.8, 11.1, 11.2_
  - [ ]* 3.3 Property 4のテストを書く — セッション識別子生成
    - **Property 4: セッション識別子生成（チャネル名・URL）**
    - `buildChannelName(childId, callId)`, `buildNotifyUrl(childId, callId)` のround-tripテスト
    - **Validates: Requirements 5.1, 5.5, 11.6**
  - [ ]* 3.4 Property 5のテストを書く — メッセージ受け入れフィルタリング
    - **Property 5: メッセージ受け入れフィルタリング**
    - `shouldAcceptMessage(msg, localState)` のテスト
    - **Validates: Requirements 5.6**
  - [ ]* 3.5 Property 8のテストを書く — オフラインキュー管理
    - **Property 8: オフラインキュー管理**
    - `offlineQueue.push(payload)`, `offlineQueue.peek()` のテスト（最大1件、上書き、round-trip）
    - **Validates: Requirements 8.3, 8.6**

- [ ] 4. 親側UIと応答機能の実装
  - [x] 4.1 `pages/nurse-call.html` に親側UI（クエリパラメータ `child_id` + `call_id` 時）を実装する
    - 「いくよ！」ボタン表示
    - 「対応完了」ボタン表示（statusが'active'の時）
    - Realtimeチャネル購読 + broadcast（response type）
    - nurse_calls.responded_at更新
    - nurse_calls.status='resolved'更新（対応完了時）
    - _Requirements: 5.1, 5.2, 5.4, 5.7, 4.3, 4.5_

- [ ] 5. チェックポイント — コア機能確認
  - Ensure all tests pass, ask the user if questions arise.
  - Edge Function + 呼び出しボタン + Push通知 + 応答の一連フローが動作すること

- [x] 6. デバイスロックモード実装
  - [x] 6.1 `js/common.js` を修正してデバイスロック制御を追加する
    - `document.body.style.visibility = 'hidden'` でフラッシュ防止
    - `checkNurseCallMode()`: device_lock_cacheの確認（5分TTL）→ 期限切れならDB取得
    - nurse_call_mode=true かつ nurse-call.html以外 → リダイレクト
    - asyncラッパーでawait完了後にbody表示
    - localStorageクリア時のDB復元動作
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.10, 6.11, 6.12, 7.7_
  - [x] 6.2 `pages/nurse-call.html` にロック中表示を追加する
    - 「おやすみモード中」の視覚表示
    - 他ページへのナビゲーション阻止
    - _Requirements: 6.5, 6.6_
  - [x] 6.3 `pages/admin.html` にナースコールモード管理UIを追加する
    - ナースコールモードON/OFF切り替え（device_settings更新）
    - admin権限チェック（admin PW/deviceRole必須）
    - nurse_call_enabled ON/OFF切り替え（game_settings更新）
    - 対象child_idリスト設定
    - _Requirements: 6.1, 6.7, 6.8, 6.9, 7.1, 7.5, 7.6, 11.10_
  - [ ]* 6.4 Property 6のテストを書く — デバイスロックキャッシュTTL判定
    - **Property 6: デバイスロックキャッシュTTL判定**
    - `isCacheValid(cache, now)` のテスト
    - **Validates: Requirements 6.2, 6.3**
  - [ ]* 6.5 Property 7のテストを書く — ナースコールモードリダイレクト判定
    - **Property 7: ナースコールモード リダイレクト判定**
    - `shouldRedirect(nurseCallMode, currentPath)` のテスト
    - **Validates: Requirements 6.4, 6.5, 7.7**

- [x] 7. ナビゲーション連携（TOP・子供ページ）
  - [x] 7.1 `index.html` と `pages/child.html` にナースコールリンクを条件付き表示する
    - game_settings.nurse_call_enabled=true時のみ表示
    - nurse_call_child_idsが設定されている場合、対象child_idのみ表示
    - _Requirements: 7.2, 7.3, 7.4, 7.6_

- [ ] 8. チェックポイント — デバイスロック確認
  - Ensure all tests pass, ask the user if questions arise.
  - デバイスロックモードON/OFF、リダイレクト動作、管理者UI操作が正常動作すること

- [x] 9. チャット機能実装
  - [x] 9.1 `js/nurse-call-chat.js` にチャットモジュールを実装する
    - `init(callId, childId, senderRole)`: 初期化 + Realtimeチャネルのchatイベント購読
    - `sendMessage(text)`: nurse_call_messagesにINSERT + broadcast
    - `sendQuickReply(presetKey)`: Quick Replyテキスト送信（だいじょうぶ、ありがとう、まだつらい、おなかすいた）
    - `loadHistory(callId, limit=50)`: 現在のcall_idに紐付くメッセージ履歴取得
    - メッセージ受信時のコールバック + 自動スクロール
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8, 9.9, 9.11_
  - [x] 9.2 `pages/nurse-call.html` にチャットUIを追加する
    - 吹き出し形式メッセージ表示（sender_roleで左右配置）
    - 子供側: Quick Replyボタン + テキスト入力フィールド
    - 親側: テキスト入力フィールド + 送信ボタン
    - 自動スクロール
    - _Requirements: 9.5, 9.7, 9.8, 9.9, 9.10, 9.11_

- [ ] 10. チェックポイント — チャット確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. 音声通話実装（WebRTC）
  - [x] 11.1 `js/nurse-call-voice.js` に音声通話モジュールを実装する
    - Voice_Call_State状態機械: idle→ringing→connected→ended→idle
    - `startCall()`: 親側から発信（state=ringing broadcast）、既に通話中なら拒否
    - `acceptCall()`: 子供側応答（マイクパーミッション要求 + PeerConnection作成）
    - WebRTCシグナリング: SDP offer/answer + ICE候補の交換（Realtime Broadcast経由）
    - ICE構成: game_settings.nurse_call_ice_serversから取得（STUN + TURN fallback）
    - `endCall()`: PeerConnection切断 + state=ended broadcast
    - 通話タイマー表示
    - エラーハンドリング（マイク拒否、接続失敗、通話中断）
    - _Requirements: 10.1-10.21_
  - [x] 11.2 `pages/nurse-call.html` に音声通話UIを追加する
    - 親側: 「でんわする」ボタン
    - 子供側: 「でんわにでる」ボタン（着信時表示）+ マイクパーミッション案内
    - 通話中: 「きる」ボタン + 通話時間表示
    - エラーメッセージ表示
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.9, 10.14, 10.15, 10.16_
  - [ ]* 11.3 Property 9のテストを書く — 音声通話状態機械
    - **Property 9: 音声通話状態機械**
    - `VoiceCallStateMachine.transition(event)` の有効遷移・無効遷移テスト
    - **Validates: Requirements 10.18, 10.20, 10.21**

- [ ] 12. テスト基盤セットアップとプロパティテスト実行
  - [ ]* 12.1 `tests/nurse-call.property.test.js` を作成し、全プロパティテスト（Property 1-9）をまとめて実行可能にする
    - fast-checkライブラリ使用
    - 各プロパティ最低100イテレーション
    - テスト対象の純粋関数をインポート可能な形式で整備
    - _Requirements: 全般_

- [ ] 13. 最終チェックポイント — 全機能確認
  - Ensure all tests pass, ask the user if questions arise.
  - 全Requirements（1-11）のカバレッジ確認

## Notes

- `*` 付きタスクはオプション（スキップ可能、MVP高速化のため）
- 各タスクは対応するRequirementsを参照して追跡可能
- チェックポイントで段階的に動作確認
- 音声通話（タスク11）は最後に実装 — WebRTC接続が家庭内LANで成功するか試行
- common.jsの修正はawaitパターン + body非表示でフラッシュ防止を確実にする
- Edge Functionは `supabase/functions/push-nurse-call/index.ts` に配置（Supabase CLIデプロイ用）
