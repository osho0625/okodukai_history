# Implementation Plan: 今日のSCP

## Overview

静的HTML + vanilla JavaScript + localStorage のみで構成される日替わりSCP紹介機能の実装。依存順に並べ、各ステップが前のステップの成果物を使用する。

## Tasks

- [ ] 1. SCPデータ定義ファイル作成
  - [x] 1.1 `data/scp-list.js` を作成し `window.SCP_DATA` 配列を定義する
    - ScpEntry形式（id, number, title, url）で初期データ5〜10件を登録
    - urlは `https://scp-jp.wikidot.com/scp-XXX` 形式の完全URL
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 2. SCP選択ロジックモジュール作成
  - [x] 2.1 `js/scp-selector.js` を作成し純粋関数をエクスポートする
    - `hash(str)`: djb2ベースの簡易ハッシュ（正の32bit整数）
    - `selectScp(scpData, viewedIds, override, todayStr)`: 選択ロジック実装（todayStrを引数で受け取る純粋関数、内部でnew Date()等を参照しない）
    - `markViewed(viewedIds, id, scpData)`: 閲覧済み追加（重複・無効ID拒否、scpDataで存在確認）
    - `calcReadRate(scpData, viewedIds)`: 読了率計算（戻り値0.0〜1.0、表示側でMath.round(rate * 100)する）
    - `validateScpEntry(entry)`: エントリバリデーション
    - override優先 → 未閲覧集合から日付シード決定的選択 → 全体から日付シード決定的選択の順
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.4, 4.2, 4.4, 5.4, 5.5, 8.1, 8.2_
  - [ ]* 2.2 Property Test: Selector Determinism
    - **Property 1: Selector Determinism（選択の決定性）**
    - 同一入力（scpData, viewedIds, override, todayStr）で常に同じ結果を返す
    - selectScpはtodayStrを引数で受け取る純粋関数であり、内部でnew Date()等の外部状態を参照しないことを検証
    - **Validates: Requirements 2.2, 3.2, 8.1**
  - [ ]* 2.3 Property Test: Override Priority
    - **Property 2: Override Priority（Override最優先）**
    - 有効なoverrideが存在する場合、常にそのIDを返す
    - **Validates: Requirements 2.1, 6.3, 8.5**
  - [ ]* 2.4 Property Test: Unviewed Priority
    - **Property 3: Unviewed Priority（未閲覧優先選択）**
    - 未閲覧SCPが存在しoverride無しの場合、未閲覧集合から選択される
    - **Validates: Requirements 2.1, 8.2**
  - [ ]* 2.5 Property Test: Viewed List Idempotence
    - **Property 4: Viewed List Idempotence（閲覧リスト冪等性）**
    - markViewedを同じIDで複数回呼んでも1回のみ登録
    - **Validates: Requirements 1.3, 4.2, 8.3**
  - [ ]* 2.6 Property Test: Upper Bound Invariant
    - **Property 5: Upper Bound Invariant（閲覧数上界不変条件）**
    - viewedリスト内のSCP_DATA存在IDの数はSCP_DATA件数以下
    - **Validates: Requirements 4.4, 8.4**
  - [ ]* 2.7 Property Test: Read Rate Correctness
    - **Property 6: Read Rate Correctness（読了率計算の正確性）**
    - `|viewed ∩ dataIds| / |data|` と一致する
    - **Validates: Requirements 5.4, 5.5**
  - [ ]* 2.8 Property Test: Data Schema Validity
    - **Property 7: Data Schema Validity（データスキーマ整合性）**
    - validateScpEntryが正しいエントリでtrue、不正エントリでfalseを返す
    - **Validates: Requirements 7.1, 7.4, 7.5**
  - [ ]* 2.9 Property Test: Invalid ID Rejection
    - **Property 8: Invalid ID Rejection（無効ID拒否）**
    - SCP_DATAに存在しないIDでmarkViewedを呼んでも配列が変化しない
    - **Validates: Requirements 4.2, 4.4**
  - [ ]* 2.10 Unit Test: Corrupted localStorage fallback
    - scp_viewed が不正JSON でも例外にならず空配列で動作継続
    - scp_today が不正JSON でも例外にならず新規選択
    - scp_override が不正JSON でもoverride無視で通常動作
    - _Requirements: 4.5_

- [ ] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. TOP画面にSCPセクション追加
  - [x] 4.1 `index.html` に「今日のSCP」カードセクションを追加
    - `data/scp-list.js` と `js/scp-selector.js` を読み込む
    - localStorage から `scp_today`, `scp_viewed`, `scp_override` を読み取り（不正JSONは安全にフォールバック）
    - `selectScp` で当日のSCPを決定し、カードにSCP番号・タイトルを表示
    - override適用時は `scp_today` も同じIDで更新する
    - カードタップで外部URL（`target="_blank" rel="noopener noreferrer"`）を開く
    - タップ時に `markScpViewed` で閲覧済み登録
    - SCP_DATAが空の場合はセクション非表示
    - 選択結果を `scp_today` に `{date, id}` 形式で保存
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.5_

- [ ] 5. アーカイブページ作成
  - [x] 5.1 `pages/scp-archive.html` を作成する
    - 全SCPを番号・タイトル付きで一覧表示
    - 閲覧済み（✅）と未閲覧（🔒）を視覚的に区別
    - 閲覧済みSCPタップで外部ページを新規タブで開く
    - 未閲覧SCPはタップ不可のロック表示
    - `calcReadRate` で読了率を計算し `Math.round(rate * 100)` でパーセント表示
    - アーカイブ生成時に `viewed.filter(id => scpData.some(s => s.id === id))` で正規化してから表示に使用
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. 管理者Override UI追加
  - [ ] 6.1 `pages/admin.html` にSCP Override セクションを追加する
    - SCP一覧からプルダウンで当日のSCPを選択するUI
    - 指定時に `scp_override` を `{date: "YYYY-MM-DD", id}` 形式で保存
    - 指定時に `scp_today` も同じIDで更新する
    - クリアボタンで `scp_override` を削除（同日中は `scp_today` は残り、そのIDが表示され続ける）
    - 現在の指定状況を表示
    - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 7. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- タスク `*` 付きはオプション（Property Test）でスキップ可能
- 各タスクは前のタスクの成果物に依存する順序で並べている
- テストは `vitest --run` + `fast-check` で実行（既存環境を利用）
- 実装量は小さく、各タスクは短時間で完了する想定
