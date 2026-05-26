# Implementation Plan: あそびチケット (Play Ticket)

## 概要

既存のお小遣い管理PWAに「あそびチケット」機能を追加する。Supabaseにticketsテーブルを作成し、`pages/ticket.html`（チケット一覧・使用・履歴）と`pages/admin.html`へのチケット発行セクション追加を実装する。Discord通知連携、Service Workerキャッシュ更新も含む。

## Tasks

- [x] 1. Supabase マイグレーション（ticketsテーブル作成）
  - [x] 1.1 ticketsテーブル・sequence・インデックスのSQLマイグレーションファイルを作成
    - `CREATE SEQUENCE tickets_ticket_no_seq`
    - `CREATE TABLE tickets` (id, ticket_no, owner, duration_minutes, status, created_at, used_at)
    - CHECK制約: owner IN ('かいせい','はるちか','いろは'), duration_minutes BETWEEN 5 AND 480, status IN ('unused','used')
    - `chk_used_ticket_consistency` 制約（status/used_at整合性）
    - sequence ownership設定
    - インデックス: `idx_tickets_owner_status`, `idx_tickets_used_at`, `idx_tickets_status_ticket_no`
    - RLS無効: `ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;`（既存方針に合わせる。deviceRole制御のみで統一）
    - _Requirements: 6.1, 6.2, 8.1, 8.3, 8.4, 9.3_

- [x] 2. pages/ticket.html チケット一覧・使用・履歴ページ作成
  - [x] 2.1 ticket.html の基本HTML構造とCSS作成
    - ヘッダー（戻るボタン、ホームボタン、ページタイトル）
    - タブUI（未使用 / 履歴）
    - チケット一覧コンテナ
    - 確認ダイアログ（モーダル）
    - エラーメッセージ表示エリア
    - チケットカードCSS（紙デザイン再現: ticket-card, ticket-gold-line, ticket-title-en/ja, ticket-no, ticket-desc, ticket-rules, ticket-duration, ticket-meta, ticket-icons）
    - スタンプオーバーレイCSS（stamp-overlay, stamp-animate, @keyframes stampPress）
    - 使用ボタンCSS（use-btn, disabled状態）
    - タブCSS（tab-btn, active状態）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 2.2 initTicketPage / resolveOwner / loadTickets 実装
    - Supabase CDN + common.js読み込み
    - resolveOwner(): URLパラメータ or localStorage "selectedChild" からOwner解決
    - VALID_OWNERS定義とバリデーション（URL改ざん対策: `!VALID_OWNERS.includes(currentOwner)` → null化）
    - loadUnusedTickets(): status='unused' でフィルタ、Owner/Admin分岐、ticket_no昇順
    - loadUsedTickets(): status='used' でフィルタ、used_at降順
    - localStorageキャッシュ保存（ticketCache_unused, ticketCache_used）— load成功時に保存
    - loadCachedTickets(): オフライン時にlocalStorageからキャッシュ読み込み表示
    - showLoadErrorOnce(): エラー重複表示防止
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.3, 4.4_

  - [x] 2.3 renderTicketCard / renderUnusedTickets / renderHistory / groupByOwner 実装
    - esc()関数（XSSエスケープ: &, <, >, " をエスケープ。全DB値に適用）
    - renderTicketCard(): チケットカードHTML生成（動的データ: ticket_no, owner, duration_minutes, status）
    - スタンプオーバーレイ表示（status='used'時のみ）
    - 使用ボタン表示（status='unused' かつ !isAdmin時のみ）
    - renderUnusedTickets(): Admin向けOwner別グループ表示 / Owner向け残数+一覧表示
    - groupByOwner(): チケット配列をowner別にグループ化
    - renderOwnerGroup(): Owner別グループのHTML生成
    - renderHistory(): 使用日時表示、空メッセージ
    - _Requirements: 1.2, 1.3, 2.1〜2.8, 4.1, 4.2, 4.4_

  - [x] 2.4 switchTab / タブ切り替えロジック実装
    - currentTab状態管理（'unused' | 'history'）
    - switchTab(): タブボタンactive切り替え + renderCurrentTab呼び出し
    - _Requirements: 4.1_

  - [x] 2.5 confirmUse / cancelUse / executeUse 実装
    - confirmUse(): 確認ダイアログ表示、多重押し防止（pendingTicketId）
    - cancelUse(): ダイアログ閉じ、pendingTicketIdリセット
    - executeUse(): try/finally構造（finallyでbtn.disabled=false復旧）
    - 原子的UPDATE（status='unused'条件付き）、エラーハンドリング（DB失敗/既に使用済み区別）
    - スタンプ演出: showStampAnimation → 600ms待機 → loadTickets → renderCurrentTab（アニメ完了後に再描画）
    - Discord通知（notifyWithTimeout、fire-and-forget）
    - 使用後の一覧再描画
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.1, 8.2, 8.4_

  - [x] 2.6 オフライン対応実装
    - initTicketPage内: navigator.onLine判定 → localStorageキャッシュ表示
    - disableAllTicketActions(): use-btn, issueBtnをdisabled
    - online/offlineイベントリスナー（復帰時再取得・再有効化、切断時ダイアログ閉じ・無効化）
    - body.classList 'offline' 切り替え
    - _Requirements: 7.4_

  - [ ]* 2.7 Property 1〜4 のプロパティベーステスト作成
    - **Property 1: チケットフィルタリングの正確性**
    - **Property 2: ソート順の正確性**
    - **Property 3: チケット描画に動的データが含まれる**
    - **Property 4: スタンプ表示とステータスの一致**
    - **Validates: Requirements 1.2, 1.3, 1.5, 2.4, 2.5, 2.7, 2.8, 3.4, 4.1, 4.3, 4.4**

- [x] 3. Checkpoint - ticket.html動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. pages/admin.html にチケット発行セクション追加
  - [x] 4.1 チケット発行UIセクションのHTML/CSS追加
    - 「🎫 チケット発行」セクション（既存の折りたたみパターンに合わせる）
    - Owner選択（select: かいせい / はるちか / いろは）
    - 遊び時間入力（number: 5〜480分）
    - 枚数入力（number: 1〜100）
    - 発行ボタン（#issueBtn）
    - 成功メッセージ表示エリア（#ticketIssueMsg）
    - エラーメッセージ表示エリア（#ticketErrorMsg）
    - _Requirements: 5.1, 5.2, 6.3, 6.6_

  - [x] 4.2 issueTickets関数実装
    - Admin権限ガード（deviceRole確認）
    - バリデーション: owner, duration(5〜480), quantity(1〜100)
    - try/finally構造（finallyでbtn.disabled=false復旧）
    - 一括挿入: Array.from + client.from('tickets').insert(rows).select()
    - Discord通知（notifyWithTimeout）
    - 成功メッセージ表示（3秒後非表示）
    - エラーハンドリング（showTicketError）
    - _Requirements: 5.1, 5.2, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.3_

  - [ ]* 4.3 Property 5〜8 のプロパティベーステスト作成
    - **Property 5: 状態遷移の不変条件**
    - **Property 6: 遊び時間バリデーション**
    - **Property 7: Owner名バリデーション**
    - **Property 8: 発行枚数バリデーション**
    - **Validates: Requirements 3.3, 3.7, 5.2, 6.3, 6.4, 6.6, 8.1, 8.2**

- [x] 5. Discord webhook連携
  - [x] 5.1 notifyWithTimeout関数実装（js/common.jsまたはticket.html内）
    - 3秒タイムアウト付きPromise.race
    - 既存notifyDiscord()関数を利用
    - 失敗時はconsole.warnのみ（UXを止めない）
    - _Requirements: 3.5, 3.6, 6.5_

- [x] 6. ナビゲーション連携
  - [x] 6.1 index.html または child.html からticket.htmlへのリンク追加
    - `pages/ticket.html?owner=かいせい` 形式のリンク
    - _Requirements: 1.1_

  - [ ]* 6.2 Property 9: オフライン時操作禁止のプロパティベーステスト作成
    - **Property 9: オフライン時操作禁止**
    - **Validates: Requirements 7.4**

- [x] 7. sw.js キャッシュ対象追加 + バージョンbump + リリースノート更新
  - [x] 7.1 sw.js の ASSETS配列に `./pages/ticket.html` を追加し（admin.htmlが未登録なら追加）、CACHE_NAME バージョンを +1 する
    - _Requirements: 7.4_

  - [x] 7.2 pages/release-notes.html にあそびチケット機能のリリースノートを追加
    - チケット機能追加、ticketsテーブル追加、管理者発行機能を記載
    - _Requirements: N/A（開発ルール）_

  - [x] 7.3 index.html のバージョン表示を更新
    - _Requirements: N/A（開発ルール）_

- [x] 8. Final checkpoint - 全体動作確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 各タスクは前のタスクの成果物に依存する（順番通りに実装）
- SQLマイグレーションはSupabase SQL Editorで手動実行を想定
- チケットビジュアルはCSS/HTMLのみ（画像不使用）
- Property tests use fast-check library with vitest
- コード変更後は必ず sw.js CACHE_NAME +1, release-notes.html更新, index.htmlバージョン更新を行う
