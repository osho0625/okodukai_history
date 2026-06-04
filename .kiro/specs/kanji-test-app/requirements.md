# Requirements Document

## Introduction

漢字50問テストの学習補助アプリ。学校で実施される漢字テスト（範囲内から50問出題）で満点を取るための練習ツール。
漢字の登録、ランダム出題、手書き回答機能を提供し、スマホ上で繰り返し練習できる環境を実現する。
テストモード（本番同様50問連続解答＋見直し）と練習モード（1問ずつ学習）の2つの学習モードを備える。

## Glossary

- **Kanji_App**: 漢字50問テスト学習補助アプリケーション全体
- **Kanji_Registry**: 漢字データの登録・管理を行うモジュール
- **Quiz_Engine**: 登録された漢字からランダムに問題を選出し出題するモジュール
- **Handwriting_Canvas**: Canvas APIを使用した手書き入力エリア
- **Kanji_Entry**: 1つの漢字問題データ（読み仮名、正解の漢字、出題範囲名を含む）
- **Test_Range**: 漢字テストの出題範囲（複数のKanji_Entryをグループ化する単位。範囲名で識別される）
- **Answer_Image**: Handwriting_Canvas上に描かれた手書き回答の画像データ
- **Test_Mode**: 50問連続で解答し、最後に見直し・修正ができるモード（本番テスト形式）
- **Practice_Mode**: 1問ずつ解答し、即座に正誤確認や答えを見ることができるモード（学習形式）
- **Review_Phase**: Test_Modeにおいて全問解答後にスキップした問題や回答済みの問題を見直し・修正できるフェーズ
- **Mode_Selector**: テストモードと練習モードを切り替えるUI要素
- **Admin_Grading**: 管理者（親）がテストモードの手書き回答を採点するモジュール
- **Self_Check**: 練習モードで学習者が自分の手書き回答を正解と見比べて判断する方式
- **Test_Result**: テスト実行結果のデータ（日時、範囲名、得点、採点ステータスを含む）
- **Test_Session**: 進行中のテストの状態データ（回答内容、進行状況、モードを含む）

## Requirements

### Requirement 1: テスト範囲の管理

**User Story:** As a 学習者, I want テスト範囲を作成・編集・削除したい, so that 学校のテスト範囲に合わせてデータを整理できる

#### Acceptance Criteria

1. WHEN 学習者が範囲作成画面で範囲名を入力して保存を押した時, THE Kanji_Registry SHALL 新しいTest_Rangeを作成しlocalStorageに保存する
2. WHEN 学習者が既存のTest_Rangeの編集を選択した時, THE Kanji_Registry SHALL 範囲名の変更を可能にし保存時にlocalStorageを更新する
3. WHEN 学習者が既存のTest_Rangeの削除を選択した時, THE Kanji_Registry SHALL 対象のTest_Rangeと所属する全てのKanji_Entryを削除する
4. IF 範囲名が空の状態で保存が押された場合, THEN THE Kanji_Registry SHALL エラーメッセージを表示し保存を実行しない
5. WHEN アプリ起動時, THE Kanji_Registry SHALL 保存済みの全Test_Rangeを一覧表示する

### Requirement 2: 漢字データの登録

**User Story:** As a 学習者, I want テスト範囲の漢字を登録する, so that 出題対象の漢字リストを準備できる

#### Acceptance Criteria

1. WHEN 学習者が漢字登録画面を開いた時, THE Kanji_Registry SHALL 読み仮名・正解漢字の入力フォームを表示する
2. WHEN 学習者が読み仮名・正解漢字を入力して保存を押した時, THE Kanji_Registry SHALL 入力内容をKanji_Entryとして選択中のTest_Rangeに保存する
3. WHEN 学習者が既存のTest_Rangeを選択した時, THE Kanji_Registry SHALL そのTest_Rangeに属するKanji_Entryの一覧を表示する
4. WHEN 学習者が既存のKanji_Entryを削除した時, THE Kanji_Registry SHALL 対象のKanji_Entryをリストから除外する
5. IF 読み仮名または正解漢字が空の状態で保存が押された場合, THEN THE Kanji_Registry SHALL エラーメッセージを表示し保存を実行しない
6. WHEN 学習者が複数のKanji_Entryを一括登録したい時, THE Kanji_Registry SHALL 改行区切り（1行に「読み仮名,漢字」形式）での一括入力を受け付ける

### Requirement 3: モード選択

**User Story:** As a 学習者, I want テストモードと練習モードを選択したい, so that 目的に応じた学習方法で練習できる

#### Acceptance Criteria

1. WHEN 学習者がTest_Rangeを選択した時, THE Mode_Selector SHALL テストモードと練習モードの選択UIを表示する
2. WHEN 学習者がテストモードを選択した時, THE Mode_Selector SHALL Test_Modeでの出題を開始する
3. WHEN 学習者が練習モードを選択した時, THE Mode_Selector SHALL Practice_Modeでの出題を開始する
4. THE Mode_Selector SHALL 前回選択したモードをlocalStorageに保存し次回起動時にデフォルト選択として復元する

### Requirement 4: テストモード（出題と回答）

**User Story:** As a 学習者, I want 本番と同じ形式で50問連続で解答したい, so that テスト本番の練習ができる

#### Acceptance Criteria

1. WHEN 学習者がTest_Modeでテスト開始を押した時, THE Quiz_Engine SHALL 該当Test_Range内の全Kanji_Entryをランダム順に並べ替え最大50問を選出して出題を開始する
2. IF 登録されたKanji_Entryが50問未満の場合, THEN THE Quiz_Engine SHALL 登録されている全てのKanji_Entryを出題する
3. THE Quiz_Engine SHALL 同一テスト内で同じKanji_Entryを重複して出題しない
4. WHILE Test_Modeのテストが進行中の間, THE Quiz_Engine SHALL 現在の問題番号と全問題数を画面に表示する
5. WHEN 問題が表示された時, THE Quiz_Engine SHALL 読み仮名を提示し回答入力エリアと「回答する」ボタンと「この問題を飛ばす」ボタンを表示する
6. WHEN 学習者が「回答する」ボタンを押した時, THE Quiz_Engine SHALL 入力された回答を保存し次の問題に進む
7. WHEN 学習者が「この問題を飛ばす」ボタンを押した時, THE Quiz_Engine SHALL 該当問題をスキップ状態として記録し次の問題に進む
8. WHILE Test_Modeのテストが進行中の間, THE Quiz_Engine SHALL 各問題の回答中に正誤判定を表示しない

### Requirement 5: テストモード（見直し・修正フェーズ）

**User Story:** As a 学習者, I want 全問解答後にスキップした問題や回答を見直し修正したい, so that 提出前に回答内容を確認・改善できる

#### Acceptance Criteria

1. WHEN 最後の問題まで到達した時, THE Quiz_Engine SHALL Review_Phaseに移行し全問題の回答状況一覧を表示する
2. WHILE Review_Phaseの間, THE Quiz_Engine SHALL 各問題の状態（回答済み・スキップ）を一覧で識別可能に表示する
3. WHEN 学習者がReview_Phaseで特定の問題を選択した時, THE Quiz_Engine SHALL その問題の回答画面に移動し回答の修正を可能にする
4. WHEN 学習者がReview_Phaseで回答を修正した時, THE Quiz_Engine SHALL 修正後の回答で既存の回答を上書き保存する
5. WHEN 学習者がReview_Phaseで「採点する」ボタンを押した時, THE Quiz_Engine SHALL 全問題の採点を実行し結果画面に遷移する

### Requirement 6: テストモード（採点と結果）

**User Story:** As a 学習者, I want 採点結果を確認して間違いを把握したい, so that 苦手な漢字を特定し重点的に復習できる

#### Acceptance Criteria

1. WHEN テキスト入力で回答された問題の採点が実行された時, THE Quiz_Engine SHALL 正解漢字との文字列一致で自動的に正誤を判定する
2. WHEN 手書き入力で回答された問題の採点が実行された時, THE Quiz_Engine SHALL Answer_Imageを保存し採点ステータスを「管理者採点待ち」に設定する
3. WHEN 結果画面が表示された時, THE Quiz_Engine SHALL 正答数・誤答数・スキップ数・管理者採点待ち数・正答率（正答数÷全問題数×100、スキップも0点扱い）を表示する
4. WHEN 結果画面が表示された時, THE Quiz_Engine SHALL 間違えた問題の一覧（読み仮名と正解漢字）を表示する
5. WHEN 結果画面が表示された時, THE Quiz_Engine SHALL スキップした問題の一覧（読み仮名と正解漢字）を表示する
6. WHEN 管理者がAdmin_Gradingで採点を完了した後, THE Quiz_Engine SHALL テスト結果の正答数・正答率を更新する

### Requirement 7: 練習モード

**User Story:** As a 学習者, I want 1問ずつ回答して正誤を確認し分からない問題は答えを見たい, so that 自分のペースで漢字を学習できる

#### Acceptance Criteria

1. WHEN 学習者がPractice_Modeでテスト開始を押した時, THE Quiz_Engine SHALL 該当Test_Range内の全Kanji_Entryをランダム順に並べ替えて出題を開始する
2. THE Quiz_Engine SHALL 同一Practice_Mode内で同じKanji_Entryを重複して出題しない
3. WHEN 問題が表示された時, THE Quiz_Engine SHALL 読み仮名を提示し回答入力エリアと「回答する」ボタンと「答えを見る」ボタンを表示する
4. WHEN テキスト入力で「回答する」ボタンが押された時, THE Quiz_Engine SHALL 正解漢字との文字列一致で自動的に正誤を判定し結果を表示する
5. WHEN 手書き入力で「回答する」ボタンが押された時, THE Quiz_Engine SHALL 正解漢字を表示し「合ってた」「間違ってた」ボタンによるSelf_Checkを提示する
6. WHEN 学習者がSelf_Checkで「合ってた」ボタンを押した時, THE Quiz_Engine SHALL 該当問題を正解として記録する
7. WHEN 学習者がSelf_Checkで「間違ってた」ボタンを押した時, THE Quiz_Engine SHALL 該当問題を不正解として記録する
8. WHEN 学習者が「答えを見る」ボタンを押した時, THE Quiz_Engine SHALL 回答を入力せずに正解漢字を表示し該当問題を不正解として記録する
9. WHEN 正誤判定が表示された後, THE Quiz_Engine SHALL 「次の問題へ」ボタンを表示し次の問題に進めるようにする
10. WHEN 該当Test_Range内の全問の出題が完了した時, THE Quiz_Engine SHALL 正答数・誤答数・正答率を結果画面に表示する
11. WHILE Practice_Modeのテストが進行中の間, THE Quiz_Engine SHALL 現在の問題番号と全問題数を画面に表示する

### Requirement 8: 手書き入力

**User Story:** As a 学習者, I want スマホ画面上で漢字を手書きして回答したい, so that 実際のテストと同様に書く練習ができる

#### Acceptance Criteria

1. WHEN 出題画面が表示された時, THE Handwriting_Canvas SHALL タッチ操作で文字を描画できるCanvasエリアを表示する
2. WHILE 学習者がCanvas上をなぞっている間, THE Handwriting_Canvas SHALL 指の軌跡をリアルタイムに描画する
3. WHEN 学習者がクリアボタンを押した時, THE Handwriting_Canvas SHALL Canvas上の描画内容を全て消去する
4. WHEN 学習者が回答確定を押した時, THE Handwriting_Canvas SHALL 描画内容をAnswer_Imageとして保存し正解漢字と並べて表示する
5. THE Handwriting_Canvas SHALL 線の太さを漢字が書きやすい太さ（3px以上）で描画する

### Requirement 9: 回答モード切替

**User Story:** As a 学習者, I want テキスト入力と手書き入力を切り替えたい, so that 場面に応じて使いやすい方法で回答できる

#### Acceptance Criteria

1. WHEN 出題画面が表示された時, THE Quiz_Engine SHALL テキスト入力モードと手書き入力モードの切替ボタンを表示する
2. WHEN 学習者がモード切替ボタンを押した時, THE Quiz_Engine SHALL 回答入力エリアを選択されたモードに切り替える
3. THE Quiz_Engine SHALL 選択された回答モードをlocalStorageに保存し次回起動時に復元する

### Requirement 10: データ永続化

**User Story:** As a 学習者, I want 登録した漢字データが消えないでほしい, so that 繰り返し練習に使える

#### Acceptance Criteria

1. THE Kanji_Registry SHALL 全てのKanji_EntryをlocalStorageに保存する
2. WHEN アプリを再起動した時, THE Kanji_Registry SHALL 前回保存したKanji_Entryを復元して表示する
3. WHEN 学習者がデータエクスポートを実行した時, THE Kanji_Registry SHALL 登録データをJSON形式でダウンロード可能にする
4. WHEN 学習者がJSONファイルをインポートした時, THE Kanji_Registry SHALL ファイル内のKanji_Entryを読み込み登録する
5. WHEN インポートしたデータに既存のTest_Rangeと同名の範囲が含まれる場合, THE Kanji_Registry SHALL 「上書き」と「別名で保存」の選択肢を提示する
6. WHEN 学習者が「上書き」を選択した時, THE Kanji_Registry SHALL 既存Test_Range配下のKanji_Entryを全て削除しインポートデータで置換する

### Requirement 11: 手書き回答画像の永続化

**User Story:** As a 学習者, I want 手書き回答がブラウザを閉じても消えないでほしい, so that 管理者が後から採点できる

#### Acceptance Criteria

1. WHEN 手書き入力で回答が確定された時, THE Quiz_Engine SHALL Answer_ImageをlocalStorageに保存する
2. WHEN アプリを再起動した時, THE Quiz_Engine SHALL 未採点のAnswer_Imageを復元して管理者採点画面に表示可能にする
3. WHEN 管理者がAdmin_Gradingで採点を完了した後, THE Quiz_Engine SHALL 採点済みAnswer_Imageを削除する
4. THE Quiz_Engine SHALL Test_Resultを保持し、採点済みAnswer_Imageを保持しない

### Requirement 12: 間違い問題の再出題

**User Story:** As a 学習者, I want 間違えた問題だけ再テストしたい, so that 苦手な漢字を集中的に練習できる

#### Acceptance Criteria

1. WHEN 結果画面で「間違いだけ再テスト」ボタンが押された時, THE Quiz_Engine SHALL 直前のテストで誤答した問題およびスキップした問題で新しいテストを開始する
2. WHEN 全問正解した場合, THE Quiz_Engine SHALL 「満点！」メッセージを結果画面に表示する

### Requirement 13: 管理者採点

**User Story:** As a 管理者, I want テストモードで手書き回答された問題を後から採点したい, so that 学習者の手書き漢字の正誤を正確に判定できる

#### Acceptance Criteria

1. WHEN 管理者が採点画面を開いた時, THE Admin_Grading SHALL 未採点のテスト結果一覧を表示する
2. WHEN 管理者が特定のテスト結果を選択した時, THE Admin_Grading SHALL 手書き回答のAnswer_Imageと正解漢字を並べて表示する
3. WHEN 管理者が各問題に対して「正解」ボタンを押した時, THE Admin_Grading SHALL 該当問題を正解として記録する
4. WHEN 管理者が各問題に対して「不正解」ボタンを押した時, THE Admin_Grading SHALL 該当問題を不正解として記録する
5. WHEN 管理者がテスト全問の採点を完了した時, THE Admin_Grading SHALL PendingGradingTestを削除し採点済みTestResultをlocalStorageに保存する
6. THE Admin_Grading SHALL 採点済みテストと未採点テストをステータスで区別して一覧表示する
7. THE Admin_Grading SHALL 採点結果（日時、範囲名、得点、採点ステータス）をTest_ResultとしてlocalStorageに永続的に保存する
8. WHEN アプリを再起動した時, THE Admin_Grading SHALL 保存済みのTest_Result履歴を復元して表示する

### Requirement 14: 進行中テストの自動保存

**User Story:** As a 学習者, I want テスト中にブラウザが閉じても回答が失われないでほしい, so that 中断しても続きから再開できる

#### Acceptance Criteria

1. WHEN 回答が入力された時, THE Quiz_Engine SHALL 現在のTest_Session（回答内容、進行状況、モード）をlocalStorageに自動保存する
2. WHEN アプリ再起動時に未完了のTest_Sessionが存在する時, THE Quiz_Engine SHALL 中断したテストの再開を提案するダイアログを表示する
3. WHEN 学習者が再開を選択した時, THE Quiz_Engine SHALL 保存されたTest_Sessionから中断時点の状態を復元しテストを再開する
4. WHEN 学習者が再開を拒否した時, THE Quiz_Engine SHALL 保存されたTest_Sessionを破棄し通常のトップ画面を表示する
5. WHEN テストが正常に完了した時, THE Quiz_Engine SHALL 保存されたTest_SessionをlocalStorageから削除する
6. THE Quiz_Engine SHALL Test_ModeとPractice_Modeの両方でTest_Sessionの自動保存を実行する

### Requirement 15: テスト完了通知

**User Story:** As a 管理者, I want テストが完了したときに通知を受け取りたい, so that すぐに採点作業に取りかかれる

#### Acceptance Criteria

1. WHEN 学習者がテストモードで採点を実行した時, THE Quiz_Engine SHALL Supabaseのpush_messagesテーブルにtarget_role='admin'で通知メッセージをINSERTする
2. WHEN 学習者がテストモードで採点を実行した時, THE Quiz_Engine SHALL Discord Webhookに即時通知を送信する
3. WHEN 管理者がTOP画面を表示した時, THE Kanji_App SHALL 未採点テスト（PendingGradingTest）の件数をバッジとして表示する
4. WHEN 管理者が未採点テストを全て採点完了した時, THE Kanji_App SHALL バッジ表示を消去する
5. IF ネットワークが利用不可の場合, THEN THE Quiz_Engine SHALL 通知送信をスキップしテスト結果の保存は正常に完了する

## Non-Functional Requirements

1. **対応端末**
   - iOS Safari 最新版
   - Android Chrome 最新版

2. **永続化方式**
   - localStorageを使用する

3. **ネットワーク**
   - テスト実施はオフライン可能。通知送信時のみネットワーク必要

4. **認証**
   - ユーザー認証は実装しない
