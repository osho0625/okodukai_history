# Implementation Plan: Pickleball Schedule Manager

## Overview

GAS中間APIとVanilla JSフロントエンドによるピックルボール練習日程・出欠管理アプリの実装計画。
GAS側（response → validation → spreadsheet → github → main）を先に構築し、次にフロントエンド（common.js → app.js → index.html/style.css）を実装、最後に統合する。

## Tasks

- [x] 0. プロジェクト初期セットアップ
  - [x] 0.1 kc_pickleball_club_app/ ディレクトリ構成を整備
    - gas/ ディレクトリ作成（clasp用）
    - package.json 作成（npm init）
    - .gitignore 作成（node_modules等）
  - [x] 0.2 テスト環境セットアップ
    - Vitest + fast-check + jsdom をインストール
    - vitest.config.js 作成
    - tests/ ディレクトリ作成
  - [x] 0.3 clasp設定（GASデプロイ用）
    - .clasp.json 作成
    - gas/.claspignore 作成
  - [x] 0.4 README.md を更新（セットアップ手順・ディレクトリ構成を記載）

- [x] 1. GAS レスポンスビルダーとバリデーション基盤
  - [x] 1.1 response.gs を作成: successResponse() / errorResponse() 関数を実装
    - JSON形式 `{ success, data?, error?: { code, message } }` を返す
    - ContentService.createTextOutput + setMimeType(JSON) を使用
    - _Requirements: 8.3_
  - [x]* 1.2 Property 9: API response format schema のプロパティテストを作成
    - **Property 9: API response format schema**
    - **Validates: Requirements 8.3**
  - [x] 1.3 validation.gs を作成: パラメータバリデーション関数を実装
    - validateSessionParams(date, venue, startTime, endTime) → エラーまたはnull
    - validateAttendanceParams(rowIndex, memberName, status, note) → エラーまたはnull
    - verifyRowContent(sheet, rowIndex, expectedDate, expectedVenue, expectedStartTime) → errorResponseまたはnull
    - _Requirements: 4.4, 4.5, 5.4, 5.5, 6.5, 8.5, 8.6, 13.4, 13.5_
  - [x]* 1.4 Property 6: Session form validation のプロパティテストを作成
    - **Property 6: Session form validation**
    - **Validates: Requirements 4.4, 4.5, 5.5**
  - [x]* 1.5 Property 7: Attendance note length validation のプロパティテストを作成
    - **Property 7: Attendance note length validation**
    - **Validates: Requirements 3.2**
  - [x]* 1.6 Property 8: Row content mismatch detection のプロパティテストを作成
    - **Property 8: Row content mismatch detection**
    - **Validates: Requirements 5.4, 6.5, 8.5, 8.6, 13.4, 13.5**

- [x] 2. GAS スプレッドシート操作
  - [x] 2.1 spreadsheet.gs を作成: スプレッドシート読み込みロジック
    - openById でスプレッドシートを開く
    - getMembers(): ヘッダー行からメンバー名リスト取得
    - getSessions(): 全行を読み込み Practice_Session[] に変換
    - rowToSession() / formatDate() / formatTime() / parseStatus() / parseNote() ヘルパー関数
    - _Requirements: 1.1, 2.1, 7.2, 8.1_
  - [x] 2.2 spreadsheet.gs に書き込みロジックを追加
    - updateAttendanceCell(sheet, rowIndex, memberName, members, status, note): 出欠セル書き込み
    - addSessionRow(sheet, data): 新規行追加
    - updateSessionRow(sheet, rowIndex, data): 既存行更新
    - deleteSessionRow(sheet, rowIndex): 行削除
    - withLock(fn): LockServiceラッパー（10秒タイムアウト）
    - _Requirements: 3.3, 4.2, 5.2, 6.2, 8.2, 13.1, 13.2, 13.3_

- [x] 3. GAS GitHub連携とメインルーター
  - [x] 3.1 github.gs を作成: GitHub API バックアップ/復元
    - backup(): 全データJSON化 → GitHub PUT API でコミット
    - listBackups(): GitHub Contents APIでbackupsディレクトリ一覧取得
    - getBackupContent(fileName): 特定バックアップの内容取得
    - restoreFromBackup(fileName): 復元前自動バックアップ → スプレッドシート上書き
    - generateBackupFilename(): JST日時からファイル名生成
    - Script Propertiesからトークン取得
    - _Requirements: 9.1-9.5, 10.1-10.6, 8.1_
  - [x]* 3.2 Property 10: Backup filename format のプロパティテストを作成
    - **Property 10: Backup filename format**
    - **Validates: Requirements 9.3**
  - [x] 3.3 main.gs を作成: doGet/doPost ルーターを実装
    - doGet(e): action パラメータでディスパッチ（getSessions, listBackups）
    - doPost(e): action パラメータでディスパッチ（updateAttendance, addSession, updateSession, deleteSession, backup, restore）
    - 不明なactionには INVALID_PARAMS エラーを返す
    - try-catch で UNKNOWN_ERROR をハンドリング
    - _Requirements: 8.1, 8.4_

- [x] 4. Checkpoint - GAS API実装完了
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. フロントエンド基盤（common.js）
  - [x] 5.1 common.js を実装: API通信とユーティリティ
    - GAS_API_URL 定数
    - fetchAPI({ action, method, body }): GASとの通信ラッパー（15秒タイムアウト、AbortController使用）
      - オブジェクト引数形式（将来のheaders/signal/credentials拡張に対応）
    - sortSessions(sessions): date ASC → startTime ASC ソート
    - isPastSession(dateStr, today): 過去日判定
    - formatAttendance(status, note): 出欠表示フォーマット（△の場合のnote処理）
    - countParticipants(attendance): ○+△のカウント
    - validateSessionForm(data): フォーム入力バリデーション
    - validateNote(note): ノート長バリデーション（≤20文字）
    - cacheData(sessions, members) / getCachedData(): LocalStorageキャッシュ
    - getCurrentUser() / setCurrentUser(name): LocalStorageユーザー管理
    - _Requirements: 1.1, 1.3, 2.2, 2.3, 2.4, 4.4, 4.5, 11.1, 11.2_
  - [x]* 5.2 Property 1: Session sorting invariant のプロパティテストを作成
    - **Property 1: Session sorting invariant**
    - **Validates: Requirements 1.1**
  - [x]* 5.3 Property 3: Past session classification のプロパティテストを作成
    - **Property 3: Past session classification**
    - **Validates: Requirements 1.3**
  - [x]* 5.4 Property 4: Attendance display formatting のプロパティテストを作成
    - **Property 4: Attendance display formatting**
    - **Validates: Requirements 2.2, 2.3**
  - [x]* 5.5 Property 5: Participant count calculation のプロパティテストを作成
    - **Property 5: Participant count calculation**
    - **Validates: Requirements 2.4**
  - [x]* 5.6 Property 11: Cache round-trip のプロパティテストを作成
    - **Property 11: Cache round-trip**
    - **Validates: Requirements 11.1**

- [x] 6. フロントエンド アプリケーションロジック（app.js）
  - [x] 6.1 app.js を作成: AppState と画面遷移制御
    - AppState オブジェクト定義:
      ```
      { currentUser: null, sessions: [], members: [], offline: false, loading: false, screen: "main" }
      ```
    - init(): 初期化処理（Current_User確認 → データ取得 → 画面表示）
    - showScreen(name): メンバー選択 / メイン / フォーム / 設定 画面切替
    - fetchAndRender(): API取得 → AppState更新 → キャッシュ保存 → 描画
    - handleOffline(): オフラインモード切替（キャッシュ → AppState → 読み取り専用描画）
    - _Requirements: 7.1, 7.3, 11.2, 11.3, 11.4_
  - [x] 6.2 app.js にメンバー選択画面を実装
    - renderMemberSelection(members): メンバーリストをボタン表示
    - handleMemberSelect(name): AppState更新 → LocalStorage保存 → メイン画面遷移
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 6.3 app.js にSession_List（メイン画面）を実装
    - renderSessionList(): AppStateから描画（sortは事前にcommon.jsで実施）
    - buildSessionCard(session, currentUser): 1つのセッションカードDOM生成
    - buildAttendanceRow(attendance, currentUser): 出欠行DOM生成
    - 過去セッションは opacity 低下で視覚区別
    - Current_Userの出欠セルをハイライト
    - 出欠タップ → ステータス選択UI表示
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1_
  - [x]* 6.4 Property 2: Session rendering completeness のプロパティテストを作成
    - **Property 2: Session rendering completeness**
    - jsdom環境で実行
    - **Validates: Requirements 1.2, 2.1**
  - [x] 6.5 app.js に出欠登録機能を実装
    - showAttendanceSelector(session, memberName): ○/×/△ 選択UI
    - handleAttendanceChange(rowIndex, memberName, status, note):
      - API成功 → AppState.sessions内の該当出欠を更新 → renderSessionList()で再描画
      - エラー時: AppState変更なし、エラーメッセージ表示
    - △選択時のnote入力モーダル（最大20文字）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 6.6 app.js にSession_Form（追加/編集）を実装
    - renderSessionForm(mode, session?): 追加/編集フォームを表示
    - handleSessionSubmit(formData, mode, rowIndex?): バリデーション → API呼び出し → fetchAndRender()で全体再取得
    - 編集時: expectedDate/expectedVenue/expectedStartTime を送信
    - バリデーションエラー表示
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 6.7 app.js に削除機能を実装
    - showDeleteConfirm(session): 確認ダイアログ（日付/会場/時刻表示）
    - handleDelete(rowIndex, expectedDate, expectedVenue, expectedStartTime): API呼び出し → fetchAndRender()
    - ROW_MISMATCH時: リフレッシュ提案
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 6.8 app.js に設定画面（ユーザー変更・バックアップ/復元）を実装
    - renderSettings(): ユーザー変更ボタン、バックアップボタン、復元ボタン
    - handleUserChange(): メンバー選択画面へ戻る
    - handleBackup(): backup API呼び出し → 完了/エラー表示
    - handleRestore(): listBackups API → 一覧表示 → 選択 → getBackupContent APIでpreviewデータ取得 → 確認ダイアログ → restore API → fetchAndRender()
    - _Requirements: 7.4, 7.5, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7. Checkpoint - フロントエンドロジック完了
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. HTML/CSS 統合とレスポンシブ対応
  - [x] 8.1 index.html を実装: メインHTMLページ構造
    - 各画面のコンテナ要素（member-select, session-list, session-form, settings, error-banner）
    - ARIAラベル、セマンティックHTML
    - common.js と app.js の読み込み
    - _Requirements: 12.4_
  - [x] 8.2 style.css を実装: ダークテーマ + レスポンシブデザイン
    - CSS Variables を先頭で定義:
      ```
      --bg, --bg-surface, --text, --text-muted, --border,
      --primary, --success, --warning, --danger,
      --radius, --max-width
      ```
    - ダークカラーテーマ（既存デザイントークン準拠）
    - 320px〜1920px レスポンシブ対応
    - Session_Listの横スクロール（モバイル時）
    - 過去セッションのopacity制御
    - Current_User出欠ハイライト
    - オフラインバナー / 読み取り専用バッジ
    - 出欠ボタンのタップ領域確保（モバイル、最低44x44px）
    - _Requirements: 1.3, 2.5, 11.3, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9. エラーハンドリング・ローディング・オフライン対応の統合
  - [x] 9.1 フロントエンドのエラー表示を統合実装
    - エラーコード別のメッセージマッピング（ROW_MISMATCH, WRITE_CONFLICT, etc.）
    - リトライボタンの動作実装
    - ROW_MISMATCH時の自動リフレッシュ提案
    - WRITE_CONFLICT時のリトライUI
    - _Requirements: 1.5, 3.5, 5.4, 6.5, 13.5, 13.6_
  - [x] 9.2 ローディング状態の実装
    - AppState.loading による通信中UI制御
    - スピナー表示（通信中）
    - ボタン無効化（二重送信防止）
    - fetchAPI呼び出し前後でloading状態を切替
  - [x] 9.3 オフラインモードの統合実装
    - API失敗検出 → キャッシュ表示切替
    - 「オフラインデータ（{lastFetched}時点）」バナー
    - 書き込み操作の無効化
    - 手動リフレッシュボタン
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 10. Final checkpoint - 全テスト実行と最終確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- タスクに `*` が付いたものはオプション（プロパティテスト）でスキップ可能
- GAS側のコードは `kc_pickleball_club_app/gas/` ディレクトリに作成（claspでデプロイ可能な構成）
- フロントエンドのテスト対象関数は common.js に集約し、Node.js (Vitest + fast-check) でテスト可能にする
- Property 2（Session rendering completeness）はDOMのテストが必要なため、jsdom環境でVitestを実行（vitest.config.js の environment: 'jsdom' 設定で対応）
- 各プロパティテストは最低100イテレーション実施
- AppState は常に Single Source of Truth とし、UI更新は必ず AppState 経由で行う
- fetchAPI はオブジェクト引数形式（将来の拡張に備える）
