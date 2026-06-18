# Requirements Document: ナースコール機能

## Introduction

病気で子供を隔離しているときに、子供が親をすぐに呼べる即時通知機能。
子供が大きなボタンを押すと、Supabase Edge Functionを経由して親のスマホに即座にWeb Push通知が届く。
既存の5分cronベースの通知では遅すぎるため、専用のEdge Functionでリアルタイム配信を実現する。

さらに「ナースコールモード」により、病気の子供のデバイスをナースコール画面にロックし、
ゲームなどの他機能へのアクセスを防止して安静を促す。

また、親子間のリアルタイムチャットおよび音声通話機能を提供し、
離れた部屋にいても安心してコミュニケーションが取れる環境を実現する。

## Glossary

- **Nurse_Call_System**: ナースコール機能全体のシステム（子供側UI、Edge Function、通知配信、デバイスロックを含む）
- **Child_UI**: 子供が操作するナースコール画面（pages/nurse-call.html）
- **Edge_Function**: Supabase Edge Function（即時Push通知配信用、push-nurse-call）
- **Parent_Device**: 親（admin）のスマホ端末（Web Push通知を受信する）
- **Cooldown_Timer**: スパム防止用のクールダウン制御（クライアント側UIの連打防止＋サーバー側の重複リクエスト拒否）
- **Nurse_Calls_Table**: 呼び出し履歴を保存するSupabaseテーブル（nurse_calls）。カラム: id UUID PK, child_id UUID, child_name TEXT, reason TEXT (nullable), status TEXT ('active'/'resolved'), notification_status TEXT ('pending'/'sent'/'partial'/'failed'), created_at TIMESTAMPTZ, responded_at TIMESTAMPTZ (nullable)
- **Call_Session**: 1回のナースコール呼び出しから解決までのライフサイクル。nurse_calls.idをcall_idとして一意に識別する。チャットメッセージ、Realtimeイベント、音声通話はすべて特定のcall_idに紐付く
- **Reason_Preset**: 呼び出し理由の選択肢（のどかわいた、きもちわるい、トイレ、はなしたい）
- **Realtime_Channel**: Supabase Realtimeを利用した親→子供への応答チャネル。チャネル名にcall_idを含む（例: `nurse-call:{child_id}:{call_id}`）
- **Nurse_Call_Mode**: デバイスロックモード。有効化されたデバイスはナースコール画面以外にアクセスできない
- **Device_Lock**: DB（Device_Settings_Table）を真実のソースとし、localStorageをキャッシュとして使用するデバイスロック状態
- **Device_Settings_Table**: デバイス状態を管理するSupabaseテーブル（device_settings）。nurse_call_modeの真実のソース。カラム: device_id TEXT PK, child_id UUID (FK→children、このデバイスに紐付く子供), nurse_call_mode BOOLEAN, updated_at TIMESTAMPTZ
- **Device_Lock_Cache**: localStorageに保存するデバイスロック状態のキャッシュ。キー: `device_lock_cache`、値: `{nurse_call_mode: boolean, updated_at: string}`。5分間有効
- **Common_JS**: 全ページで読み込まれる共通スクリプト（js/common.js）。リダイレクト制御を担当
- **Chat_System**: ナースコール画面内のリアルタイムテキストチャット機能
- **Chat_Messages_Table**: チャットメッセージを保存するSupabaseテーブル（nurse_call_messages）。カラム: id UUID PK, call_id UUID (FK→nurse_calls.id), child_id UUID, sender_role TEXT ('parent'/'child'), message_text TEXT, created_at TIMESTAMPTZ
- **Quick_Reply**: 子供向けの定型返信ボタン（だいじょうぶ、ありがとう、まだつらい、おなかすいた）
- **Voice_Call_System**: WebRTCベースのブラウザ内音声通話機能（親子間）
- **Voice_Call_State**: 音声通話の状態管理。状態遷移: idle → ringing → connected → ended → idle。Realtimeチャネルで全参加者に状態をブロードキャスト
- **Signaling_Channel**: Supabase Realtimeを利用したWebRTCシグナリングチャネル（SDP/ICE候補の交換）
- **STUN_Server**: NAT越えのためのSTUNサーバー（Google公開STUN等）
- **TURN_Server**: 対称NAT環境でのリレー用TURNサーバー（Metered.ca無料枠等）
- **Offline_Queue**: ネットワーク不通時にナースコールをローカルに保存し、復帰時に自動送信するキュー（localStorage/IndexedDB、最大1件）

## Requirements

### Requirement 1: 呼び出しボタン表示

**User Story:** 隔離中の子供として、大きくてわかりやすいボタンを押したい。体調が悪くても迷わず操作できるように。

#### Acceptance Criteria

1. WHEN 子供がナースコール画面を開いた時、THE Child_UI SHALL 画面中央に大きな「よんで！」ボタンを表示する
2. THE Child_UI SHALL ボタンを画面幅の80%以上の大きさで表示する
3. THE Child_UI SHALL 理由プリセットボタンを「よんで！」ボタンの下に表示する（のどかわいた、きもちわるい、トイレ、はなしたい）
4. THE Child_UI SHALL 理由を選択せずに「よんで！」ボタンを押すことを許容する

### Requirement 2: 即時Push通知配信

**User Story:** 親として、子供がボタンを押したら即座にスマホに通知を受け取りたい。5分待ちでは体調急変に対応できない。

#### Acceptance Criteria

1. WHEN 子供が「よんで！」ボタンを押した時、THE Nurse_Call_System SHALL Edge_Functionを直接呼び出して即時にPush通知を配信する
2. WHEN Edge_Functionが呼び出された時、THE Edge_Function SHALL 通知対象のadmin端末にWeb Push通知を送信する
3. WHEN 理由が選択されている場合、THE Edge_Function SHALL 通知本文に理由を含める（例: 「🔔 ○○がよんでいます（のどかわいた）」）
4. WHEN 理由が選択されていない場合、THE Edge_Function SHALL 通知本文を「🔔 ○○がよんでいます」とする
5. THE Edge_Function SHALL 呼び出しから5秒以内にHTTPレスポンス（成功または失敗）を返す。端末への通知到達時間はPushサービス（Apple/Google/Mozilla）に依存し、保証しない
6. WHERE game_settingsにnurse_call_notify_targetsリスト（device_idの配列）が設定されている場合、THE Edge_Function SHALL リスト内の端末のみに通知を送信する
7. WHERE nurse_call_notify_targetsが空またはnullの場合、THE Edge_Function SHALL role='admin'の全端末にWeb Push通知を送信する（後方互換デフォルト）
8. WHEN 呼び出しが成功した時、THE Nurse_Call_System SHALL 新しいCall_Sessionを作成し、レスポンスにcall_idを返す

### Requirement 3: クールダウン制御

**User Story:** 親として、子供が連打して大量の通知が来ることを防ぎたい。

#### Acceptance Criteria

1. WHEN 子供が「よんで！」ボタンを押した後、THE Child_UI SHALL 30秒間ボタンを無効化する
2. WHILE クールダウン中、THE Child_UI SHALL 残り秒数をボタン上に表示する
3. WHILE クールダウン中、THE Child_UI SHALL ボタンのタップを無視する
4. WHEN クールダウンが終了した時、THE Child_UI SHALL ボタンを再度有効化する
5. WHEN 同一child_idから30秒以内に再度呼び出しリクエストが届いた時、THE Edge_Function SHALL リクエストを拒否しHTTPステータス429（Too Many Requests）を返す
6. THE Edge_Function SHALL nurse_callsテーブルの最新レコードのcreated_atを参照してサーバー側クールダウンを判定する

### Requirement 4: 呼び出し履歴保存

**User Story:** 親として、子供がいつ・何回呼んだか後から確認したい。

#### Acceptance Criteria

1. WHEN 呼び出しが実行された時、THE Nurse_Call_System SHALL nurse_callsテーブルに記録を保存し、新しいcall_id（nurse_calls.id）を発行する
2. THE Nurse_Calls_Table SHALL id（UUID PK = call_id）、child_id、child_name、reason（nullable）、status（'active'/'resolved'）、notification_status（'pending'/'sent'/'partial'/'failed'）、created_at、responded_at（nullable）を保存する
3. WHEN 親が応答した時、THE Nurse_Call_System SHALL 対象call_idのresponded_atを更新する
4. THE Nurse_Call_System SHALL 全チャットメッセージ・Realtimeイベント・音声通話を特定のcall_idに紐付けて管理する
5. WHEN 親が「対応完了」ボタンを押した時、THE Nurse_Call_System SHALL 対象call_idのstatusを'resolved'に更新する
6. WHEN call_idのstatusが'active'かつ最後のアクティビティ（responded_at, 最終メッセージ, 最終通話終了）から30分経過した時、THE Nurse_Call_System SHALL 自動的にstatusを'resolved'に更新する

### Requirement 5: 親の応答（いくよ！）

**User Story:** 子供として、親が通知に気づいて来てくれることを画面上で確認したい。不安を和らげるために。

#### Acceptance Criteria

1. WHEN 親が通知をタップした時、THE Nurse_Call_System SHALL `/pages/nurse-call.html?child_id={child_id}&call_id={call_id}` を開き、該当するCall_Sessionの応答UIを表示する
2. WHEN 親がナースコール画面で「いくよ！」ボタンを押した時、THE Nurse_Call_System SHALL Supabase Realtimeで該当call_idのチャネルを通じて子供の画面に応答を送信する
3. WHEN 子供の画面がRealtime応答を受信した時、THE Child_UI SHALL 「いくよ！」メッセージを大きく表示する
4. WHEN 応答を受信した時、THE Nurse_Call_System SHALL nurse_callsテーブルの該当call_idのresponded_atを更新する
5. THE Realtime_Channel SHALL チャネル名に`nurse-call:{child_id}:{call_id}`を使用し、Call_Sessionごとにチャネルを分離する
6. THE Child_UI SHALL 自身のchild_idおよび現在のcall_idと一致するメッセージのみを受け入れ、他のセッション宛のメッセージを無視する
7. WHEN call_idのstatusが'active'の時、THE Nurse_Call_System SHALL 親側画面に「対応完了」ボタンを表示する

### Requirement 6: ナースコールモード（デバイスロック）

**User Story:** 親として、病気の子供がゲームで遊ばずに安静にしてほしい。子供のデバイスをナースコール画面にロックして、休息を促したい。

#### Acceptance Criteria

1. WHEN 管理者がナースコールモードを有効にした時、THE Nurse_Call_System SHALL Device_Settings_Tableの対象device_idのnurse_call_modeをtrueに更新する
2. WHEN ページが読み込まれた時、THE Common_JS SHALL Device_Lock_Cacheを確認し、キャッシュが5分以内であればキャッシュ値を使用する（DBアクセスなし）
3. WHEN Device_Lock_Cacheが5分以上経過しているか存在しない場合、THE Common_JS SHALL Device_Settings_Tableから当該デバイスのnurse_call_mode状態を取得し、Device_Lock_Cacheを更新する
4. WHILE nurse_call_modeがtrueの時、THE Common_JS SHALL 全ページ読み込み時にナースコール画面（pages/nurse-call.html）へリダイレクトする
5. WHILE nurse_call_modeがtrueの時、THE Child_UI SHALL ナースコール画面以外のPWA内ページへのナビゲーションを阻止する
6. WHILE nurse_call_modeがtrueの時、THE Child_UI SHALL ナースコール画面にロック中であることを視覚的に示す（例: 「おやすみモード中」の表示）
7. WHEN 管理者がナースコールモードを解除した時、THE Nurse_Call_System SHALL Device_Settings_Tableの対象device_idのnurse_call_modeをfalseに更新する
8. THE Nurse_Call_System SHALL ナースコールモードの有効/解除を管理者ページ（admin.html）から操作可能にする
9. THE Nurse_Call_System SHALL ナースコールモードの解除に管理者パスワードまたはadmin権限を必要とする
10. THE Nurse_Call_System SHALL localStorageのDevice_Lock_Cacheをキャッシュとしてのみ使用し、DB（Device_Settings_Table）を真実のソースとする
11. IF localStorageが消去された場合（ブラウザ再インストール等）、THEN THE Common_JS SHALL 次回ページ読み込み時にDBから状態を復元し、正しくリダイレクトする
12. THE Device_Lock_Cache SHALL `{nurse_call_mode: boolean, updated_at: ISO8601文字列}` の形式でlocalStorageに保存する

### Requirement 7: アクセスとナビゲーション

**User Story:** 親として、ナースコール機能は必要な時だけアクセス可能にし、有効時はアプリ内から簡単に遷移できるようにしたい。

#### Acceptance Criteria

1. THE Nurse_Call_System SHALL ナースコール機能のON/OFF（nurse_call_enabled）をgame_settingsで管理する
2. WHILE nurse_call_enabledがtrueの時、THE Nurse_Call_System SHALL TOP画面（index.html）にナースコールへのリンクを表示する
3. WHILE nurse_call_enabledがtrueの時、THE Nurse_Call_System SHALL 子供ページ（child.html）にナースコールへのリンクを表示する
4. WHILE nurse_call_enabledがfalseの時、THE Nurse_Call_System SHALL ナースコールへのリンクを全ページで非表示にする
5. THE Nurse_Call_System SHALL admin画面からnurse_call_enabledのON/OFFを切り替え可能にする
6. WHERE 特定の子供のみナースコールを有効にする設定がある場合、THE Nurse_Call_System SHALL 対象child_idリストをgame_settingsに保存する
7. WHILE Device_Settings_Tableでnurse_call_modeがtrueのデバイスでアプリを開いた時、THE Common_JS SHALL 自動的にナースコール画面へリダイレクトする

### Requirement 8: エラーハンドリング

**User Story:** 子供として、通知が送れなかった時に何が起きたか分かりたい。

#### Acceptance Criteria

1. IF Edge_Functionの呼び出しに失敗した場合、THEN THE Child_UI SHALL 「おくれなかったよ。もういちどおしてね」とメッセージを表示する
2. IF ネットワーク接続がない場合、THEN THE Child_UI SHALL 「ネットがつながっていないけど、つながったらおくるね」とメッセージを表示する
3. IF ネットワーク接続がない状態で子供が「よんで！」ボタンを押した場合、THEN THE Nurse_Call_System SHALL 呼び出しリクエストをOffline_Queueに保存する（最大1件）
4. WHEN ネットワーク接続が回復した時、THE Nurse_Call_System SHALL Offline_Queueに保存された呼び出しリクエストを自動的にEdge_Functionに送信する
5. WHILE Offline_Queueに未送信の呼び出しが存在する場合、THE Child_UI SHALL 「つながったらおくるよ」と表示する
6. THE Offline_Queue SHALL 最大1件の未送信呼び出しのみ保持し、重複キューイングを防止する（再押下時は既存キューを上書き）
7. IF Edge_Functionで通知配信に失敗した場合、THEN THE Edge_Function SHALL エラーログを記録し、HTTPステータス500を返す
8. IF Edge_Functionがクールダウン中のリクエストを受信した場合、THEN THE Edge_Function SHALL HTTPステータス429を返し、THE Child_UI SHALL 「まだおくれないよ。すこしまってね」とメッセージを表示する

### Requirement 9: チャット機能

**User Story:** 親子として、ナースコール画面内で簡単なテキストメッセージをやり取りしたい。呼び出し以外にも「お水持ってきて」「もうすぐ行くよ」など細かいコミュニケーションを取りたい。

#### Acceptance Criteria

1. WHILE nurse_call_enabledがtrueかつユーザーがnurse-call.html上にいる時、THE Chat_System SHALL チャットUIを表示する（nurse_call_modeのロック状態に関わらず利用可能）
2. THE Chat_System SHALL 親と子供の双方向テキストメッセージ送受信をSupabase Realtimeで実現する
3. WHEN メッセージが送信された時、THE Chat_System SHALL Chat_Messages_Tableに記録を保存する（現在のcall_idを含む）
4. THE Chat_Messages_Table SHALL id（UUID PK）、call_id（UUID FK→nurse_calls.id）、child_id、sender_role（'parent'/'child'）、message_text、created_atを保存する
5. THE Chat_System SHALL 子供側にQuick_Replyボタンを表示する（だいじょうぶ、ありがとう、まだつらい、おなかすいた）
6. WHEN 子供がQuick_Replyボタンをタップした時、THE Chat_System SHALL 対応するテキストを現在のcall_idに紐付けて即座に送信する
7. THE Chat_System SHALL 親側にテキスト入力フィールドと送信ボタンを表示する
8. THE Chat_System SHALL 子供側にもテキスト入力フィールドを表示し、自由入力を許容する
9. WHEN 新しいメッセージを受信した時、THE Chat_System SHALL チャットエリアを自動スクロールして最新メッセージを表示する
10. THE Chat_System SHALL メッセージを吹き出し形式で表示する（送信者により左右に配置）
11. THE Chat_System SHALL 画面表示時に現在のcall_idに紐付くメッセージ履歴のみを読み込む（最大50件。他のCall_Sessionのメッセージは表示しない）
12. THE Nurse_Call_System SHALL 90日を超えたnurse_call_messagesレコードを自動削除する（Supabase cronジョブまたはDBポリシーで実施）

### Requirement 10: 音声通話（オプション機能）

**User Story:** 親として、離れた部屋にいる病気の子供と直接話したい。別アプリに切り替えずにナースコール画面内で通話したい。

#### Acceptance Criteria

1. WHILE nurse_call_enabledがtrueかつユーザーがnurse-call.html上にいる時、THE Voice_Call_System SHALL 親側画面に「でんわする」ボタンを表示する（nurse_call_modeのロック状態に関わらず利用可能）
2. WHEN 親が「でんわする」ボタンを押した時、THE Voice_Call_System SHALL 現在のcall_idに紐付けてSignaling_Channelを通じて子供側に着信を通知する
3. WHEN 子供側が着信を受信した時、THE Child_UI SHALL 大きな「でんわにでる」ボタンを表示する（自動応答は行わない。iPhoneのマイクパーミッション制約のため）
4. WHEN 子供が「でんわにでる」ボタンをタップした時、THE Voice_Call_System SHALL マイクパーミッションを要求し、通話を開始する
5. IF マイクパーミッションが初回要求の場合、THEN THE Voice_Call_System SHALL パーミッションプロンプトの前に「マイクをつかっていい？」と案内を表示する
6. THE Voice_Call_System SHALL WebRTCのPeerConnectionを使用してブラウザ間で音声ストリームを確立する
7. THE Voice_Call_System SHALL STUN_Serverを利用してNAT越えを試行する
8. WHERE STUN接続が失敗する環境の場合、THE Voice_Call_System SHALL TURN_Serverを利用してリレー接続にフォールバックする
9. WHILE 通話中、THE Voice_Call_System SHALL 親側と子供側の両方に「きる」ボタンを表示する
10. WHEN いずれかの側が「きる」ボタンを押した時、THE Voice_Call_System SHALL PeerConnectionを切断し通話を終了する
11. THE Voice_Call_System SHALL Signaling_ChannelにSupabase Realtime（Broadcastチャネル）を使用する
12. THE Voice_Call_System SHALL SDP offerとanswerの交換をSignaling_Channel経由で行う
13. THE Voice_Call_System SHALL ICE候補の交換をSignaling_Channel経由で行う
14. IF マイクへのアクセスが拒否された場合、THEN THE Voice_Call_System SHALL 「マイクが使えないよ」とメッセージを表示する
15. IF WebRTC接続が確立できない場合、THEN THE Voice_Call_System SHALL 「つながらなかったよ。もういちどためしてね」とメッセージを表示する
16. WHILE 通話中、THE Voice_Call_System SHALL 通話時間を画面に表示する
17. THE Voice_Call_System SHALL ICE構成にSTUN/TURNサーバーのURLをgame_settingsから取得する

> 運用注記: 家庭内LAN環境ではSTUNのみで接続可能なケースが多い。Metered.ca無料枠にはTURN接続時間の制限あり。TURN接続量増加時は有料プラン移行が必要。game_settingsからICE設定変更可能なため運用中にサーバー切替可能。
18. THE Voice_Call_System SHALL Voice_Call_Stateを管理し、状態（idle/ringing/connected/ended）をRealtimeチャネルでブロードキャストする
19. THE Voice_Call_System SHALL 音声通話を現在のcall_idに紐付けて管理する
20. IF Voice_Call_Stateが'ringing'または'connected'の時に新たな通話発信が試行された場合、THEN THE Voice_Call_System SHALL 発信を拒否し「いま通話中です」とメッセージを表示する
21. WHEN 通話が終了した時、THE Voice_Call_System SHALL Voice_Call_Stateを'idle'に戻す

### Requirement 11: セキュリティとアクセス制御

**User Story:** 親として、ナースコール機能が不正に利用されないよう、現実的なアクセス制御を施したい。

> 注記: 本機能ではSupabase Anonymous Authを導入し、JWT（Bearer token）による認証を行う。これはナースコール機能固有のインクリメンタルなセキュリティ改善であり、既存の他機能（anon key + RLS無効）には影響しない。device_idはデバイス識別子としてのみ使用し、認証はJWTが担う。

#### Acceptance Criteria

1. WHEN アプリが初回起動した時、THE Nurse_Call_System SHALL Supabase Anonymous Auth (`signInAnonymously()`) でセッションを確立し、JWTをローカルに保持する
2. WHEN 呼び出しリクエストを送信する時、THE Child_UI SHALL Authorization: Bearer {JWT} ヘッダーを付与する
3. WHEN Edge_Functionがリクエストを受信した時、THE Edge_Function SHALL Authorization headerのJWTを検証し、無効または欠落の場合はHTTPステータス401を返す
4. WHEN JWTが有効な場合、THE Edge_Function SHALL リクエストに含まれるdevice_idがDevice_Settings_Tableに存在し、child_idが当該device_idに紐付くchild_idと一致することを検証する
5. IF device_idが存在しない、またはchild_idが紐付けと一致しない場合、THEN THE Edge_Function SHALL HTTPステータス403を返しリクエストを拒否する
6. THE Realtime_Channel SHALL チャネル名に`nurse-call:{child_id}:{call_id}`を含め、Call_Sessionごとにチャネルを分離する
7. THE Realtime_Channel SHALL 有効なJWTを持つクライアントのみがチャネルに接続（subscribe）できるよう、Supabase Realtimeの認証ベースアクセス制御を適用する
8. WHEN チャットメッセージが保存される時、THE Chat_System SHALL メッセージに有効なcall_id、child_id、sender_roleを関連付ける
9. THE Nurse_Call_System SHALL レート制限（Requirement 3のクールダウン制御）を主要な濫用防止策として適用する
10. THE Nurse_Call_System SHALL admin権限を持つユーザーのみがナースコールモードの有効/解除を操作できるよう制限する

