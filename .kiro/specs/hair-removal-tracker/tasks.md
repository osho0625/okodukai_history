# Implementation Plan: 脱毛周期管理アプリ (Hair Removal Tracker)

## Overview

人体図（Body Map）ベースの脱毛周期管理SPAを、バニラHTML/CSS/JavaScriptで実装する。SVGヒートマップ、localStorage永続化、統計ダッシュボード、写真管理を段階的に構築し、各ステップでプロパティベーステストによる正確性検証を行う。

## Priority & MVP

| 優先度 | 範囲 | タスク |
|--------|------|--------|
| P0（MVP） | Body Map + Storage + Record + History | Task 1〜9 |
| P1 | Statistics + Data Management | Task 10〜12 |
| P2 | Photo + Performance | Task 13〜15 |

MVP完了 = Task 9まで完了した時点。マップ表示・記録登録・ヒートマップ・履歴・周期設定が動作する状態で公開可能。

## Tasks

- [x] 1. プロジェクト基盤セットアップ [P0]
  - [x] 1.1 HTMLテンプレートとタブUI構造を作成する
    - `pages/hair-removal-tracker.html` を作成
    - 4タブ構成（マップ/履歴/統計/設定）のハッシュベースルーティング実装
    - メタタグ・viewport設定・既存PWAとの整合性確保
    - Done: HTMLファイルが存在し、4タブ切替が動作し、URL hashが変わる
    - _Requirements: 9.1, 9.2, 9.8_
  - [x] 1.2 CSSファイルを作成しレスポンシブ・ダークモード対応する
    - `css/hair-removal-tracker.css` を作成
    - モバイルファースト・タップターゲット44x44px以上
    - `prefers-color-scheme` によるダークモード対応
    - タブ切替・モーダル・トースト通知のスタイル
    - Done: CSSファイルが存在し、375px幅でレイアウト崩れなし、ダークモードmediaquery存在
    - _Requirements: 9.4, 9.5, 9.6_
  - [x] 1.3 メインJSファイルのモジュール構造を作成する
    - `js/hair-removal-tracker.js` の基本構造（IIFE）
    - タブ切替ロジック・イベントリスナー登録
    - Done: JSファイルが存在し、タブクリックでコンテンツ切替が動作する
    - _Requirements: 9.3_
  - [x] 1.4 TOPページにアイコンリンクを追加する
    - `index.html` に脱毛周期管理アプリへのリンクアイコンを追加
    - Done: index.htmlからhair-removal-tracker.htmlへ遷移できる
    - _Requirements: 9.1_

- [x] 2. Body Mapデータ定義 [P0]
  - [x] 2.1 Body Zoneデータファイルを作成する（前面）
    - `js/body-map-data.js` を作成
    - 前面90〜110ゾーンの定義（id, name, svgPath, side, group）
    - Done: BODY_MAP_DATA.front配列が90〜110件存在し、各要素にid/name/svgPath/side/groupがある
    - _Requirements: 1.3_
  - [x] 2.2 Body Zoneデータファイルを作成する（背面）
    - 背面90〜110ゾーンの定義（id, name, svgPath, side, group）
    - Done: BODY_MAP_DATA.back配列が90〜110件存在し、各要素にid/name/svgPath/side/groupがある
    - _Requirements: 1.4_
  - [x] 2.3 グループ定義を追加する
    - グループ一覧（顔, 首, 胸, 腹, 右腕, 左腕, 右手, 左手, 右脚, 左脚, 右足, 左足, 背中上部, 背中下部, 臀部 など）
    - Done: BODY_GROUPS配列が存在し、各ゾーンのgroupがGROUPS内に含まれる
    - _Requirements: 1.3, 1.4_

- [x] 3. SVG Body Map Renderer [P0]
  - [x] 3.1 BodyMapRenderer.init()を実装する
    - SVGコンテナ初期化・viewBox設定
    - Done: 指定containerId内にSVG要素が生成される
    - _Requirements: 1.5_
  - [x] 3.2 BodyMapRenderer.render()を実装する
    - 全ゾーンのSVGパス生成・描画（初回全描画）
    - Done: SVG内にゾーン数分のpath要素が存在し、data-zone-id属性がある
    - _Requirements: 1.5, 1.6_
  - [x] 3.3 BodyMapRenderer.switchSide()を実装する
    - 前面/背面切替トグルボタン
    - Done: ボタンクリックで表示ゾーンが前面⇔背面に切替わる
    - _Requirements: 1.1, 1.2_
  - [x] 3.4 タップ・長押しイベントバインディングを実装する
    - onZoneTap / onZoneLongPress(500ms) のコールバック登録
    - Done: ゾーンタップでcallback発火、500ms長押しでlongPress callback発火
    - _Requirements: 3.1, 3.9_
  - [x] 3.5 ツールチップ・ゾーン名表示を実装する
    - ホバー/長押し時にゾーン名をツールチップ表示
    - Done: ゾーンにhover/touchでゾーン名が表示され、離すと消える
    - _Requirements: 1.7_

- [x] 4. ヒートマップ色計算エンジン [P0]
  - [x] 4.1 calculateHeatColor()を実装する
    - `calculateHeatColor(elapsedDays, thresholdDays)` → HSL文字列
    - HSL補間: hue 120→0（green→red）、saturation 60%、lightness 50%
    - 未施術 = HSL(0, 0%, 80%)
    - Done: 関数が存在し、0日→HSL(120,60%,50%)、threshold日→HSL(0,60%,50%)を返す
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 4.2 buildColorMap()を実装する
    - `buildColorMap(zones, records, thresholdDays)` → Map<zoneId, hslColor>
    - Done: 全ゾーンに対して色が割り当てられたMapが返る
    - _Requirements: 2.1, 2.6_
  - [x] 4.3 isOverdue()を実装する
    - `isOverdue(elapsedDays, cyclePeriod)` → boolean
    - Done: elapsed > cycle で true を返す
    - _Requirements: 5.3_
  - [x] 4.4 Property 1: ヒートマップ色計算のプロパティテストを書く
    - **Property 1: ヒートマップ色計算の正確性**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  - [x] 4.5 BodyMapRenderer.updateColors()を実装し統合する
    - 色のみ差分更新（fill属性変更のみ）
    - ページロード時・レコード追加/削除時に再計算
    - Done: updateColors呼出でSVG path要素のfillが変わる
    - _Requirements: 2.6_

- [x] 5. Storage Manager実装 [P0]
  - [x] 5.1 レコードCRUDを実装する
    - `getRecords()` / `saveRecord()` / `deleteRecord()`
    - safeSave関数（QuotaExceededError対策）
    - 戻り値: `{ success: boolean, error?: string }`
    - Done: レコード保存→取得→削除の一連が動作し、Quota超過時にsuccessがfalseになる
    - _Requirements: 7.1, 3.6_
  - [x] 5.2 設定の読み書きを実装する
    - `getSettings()` / `saveSettings()`
    - デフォルト設定の初期化
    - Done: 設定保存→取得が動作し、初回はデフォルト値が返る
    - _Requirements: 5.1_
  - [x] 5.3 Property 2: 保存・読込ラウンドトリップのプロパティテストを書く
    - **Property 2: 施術記録の保存・読込ラウンドトリップ**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 3.6**
  - [x] 5.4 レコード検索関数を実装する
    - `getRecordsByZone(zoneId)` / `getRecordsByDateRange(start, end)`
    - Done: ゾーンID指定で該当レコードのみ返る、日付範囲指定で範囲内レコードのみ返る
    - _Requirements: 4.4, 4.5_

- [x] 6. Checkpoint - 基盤確認 [P0]
  - 全テストパス確認。ブラウザでページ表示→Body Map描画→色適用が動作する。

- [x] 7. 施術記録モーダルと登録機能 [P0]
  - [x] 7.1 施術記録モーダルUIを実装する
    - ゾーン名表示ヘッダー
    - 日付ピッカー（デフォルト今日）
    - 強度セレクター（1-5ラジオボタン、ラベル付き）
    - メモテキストフィールド（任意）
    - 確定/キャンセルボタン
    - Done: モーダルが開閉し、全入力要素が表示される
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2_
  - [x] 7.2 単一ゾーンタップ → 記録保存フローを実装する
    - ゾーンタップ → モーダル表示 → 確定 → saveRecord → updateColors
    - キャンセル/外側タップで閉じる
    - Done: タップ→入力→保存でlocalStorageにレコード追加され、ゾーン色が変わる
    - _Requirements: 3.6, 3.7, 3.8_
  - [x] 7.3 複数選択モード（長押し）のUI状態管理を実装する
    - 500ms長押しで複数選択モード開始
    - 選択中ゾーンのハイライト表示（パルス枠 or オーバーレイ）
    - 「選択解除」ボタン表示
    - Done: 長押しでモード遷移し、追加タップでハイライト追加、解除で元に戻る
    - _Requirements: 3.9, 3.10, 3.12_
  - [x] 7.4 複数選択モードの一括保存を実装する
    - N件のゾーンに対し、N件のTreatment_Recordを生成（各レコード独立id/zone_id）
    - Done: 3ゾーン選択→保存で3件のレコードが生成され、全ゾーンの色が更新される
    - _Requirements: 3.11_
  - [x] 7.5 Property 3: 一括登録のプロパティテストを書く
    - **Property 3: 一括登録のレコード数不変量**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 3.11**

- [x] 8. 履歴表示・フィルタ・削除 [P0]
  - [x] 8.1 履歴タブUI（一覧表示）を実装する
    - 全Treatment_Recordsを日付降順で一覧表示
    - 各エントリ: 日付・ゾーン名・強度・メモアイコン
    - Done: 履歴タブ切替でレコード一覧が表示され、日付降順である
    - _Requirements: 4.1, 4.2, 4.3, 8.3_
  - [x] 8.2 フィルタ・ソート純粋関数を実装する
    - `sortRecordsByDate(records, order)`
    - `filterByZone(records, zoneId)`
    - `filterByDateRange(records, startDate, endDate)`
    - Done: 各関数が正しくフィルタ/ソートされた結果を返す
    - _Requirements: 4.4, 4.5_
  - [x] 8.3 フィルタUIを履歴タブに追加する
    - ゾーン選択ドロップダウン・日付範囲ピッカー
    - Done: フィルタ操作で一覧が絞り込まれる
    - _Requirements: 4.4, 4.5_
  - [x] 8.4 Property 4, 5, 6: フィルタ系プロパティテストを書く
    - **Property 4: 履歴ソート順の正確性**
    - **Property 5: ゾーンフィルタの正確性**
    - **Property 6: 日付範囲フィルタの正確性**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 4.2, 4.4, 4.5**
  - [x] 8.5 レコード削除機能を実装する
    - 削除ボタン → 確認 → deleteRecord → ヒートマップ再計算 → 統計キャッシュ破棄
    - Done: 削除後にレコードが消え、ゾーン色が再計算される
    - _Requirements: 4.8, 4.9, 4.10_
  - [x] 8.6 ゾーン別履歴表示（モーダル内）を実装する
    - Body_Zoneタップ時モーダルに最近の施術履歴リスト表示
    - 施術回数・平均間隔の表示
    - Done: モーダルにそのゾーンの直近5件+回数+平均間隔が表示される
    - _Requirements: 4.6, 4.7_
  - [x] 8.7 Property 7: ゾーン統計のプロパティテストを書く
    - **Property 7: ゾーン統計の正確性**（連続する日付差の平均）
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 4.7**

- [x] 9. 周期設定・要施術リスト [P0]
  - [x] 9.1 周期設定UIを実装する（設定タブ内）
    - デフォルト周期入力（30日）
    - グループ別カスタム周期設定UI
    - ゾーン別カスタム周期設定UI（ゾーン設定がグループ設定を上書き）
    - 色閾値設定入力
    - Done: 設定変更がlocalStorageに保存され、再読込で反映される
    - _Requirements: 5.1, 5.2, 2.7_
  - [x] 9.2 getOverdueZones()・getNextTreatmentDate()を実装する
    - 周期超過ゾーン抽出（超過日数降順ソート）
    - 次回施術推奨日計算
    - Done: 各関数が正しい結果を返す
    - _Requirements: 5.3, 5.4, 5.5_
  - [x] 9.3 要施術リストUIを実装する
    - マップタブ内に要施術リスト表示
    - Body_Map上の超過ゾーンに⚠️アイコン/パルス枠
    - Done: 超過ゾーンが一覧表示され、マップ上でも視覚的に識別できる
    - _Requirements: 5.3, 5.4, 5.5_
  - [x] 9.4 Property 8, 9: 要施術リスト・次回施術日のプロパティテストを書く
    - **Property 8: 要施術リストの正確性**
    - **Property 9: 次回施術日計算**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 5.3, 5.4, 5.5**
  - [x] 9.5 サマリーダッシュボード（マップタブ内）を実装する
    - 施術済ゾーン数・超過ゾーン数・スケジュール内ゾーン数・平均施術間隔
    - Done: マップタブ上部にサマリー数値が表示される
    - _Requirements: 5.6_

- [x] 10. Checkpoint - MVP完了確認 [P0]
  - 全テストパス確認。マップ表示→記録→ヒートマップ→履歴→周期管理の一連フローが動作する。

- [x] 11. 統計・分析タブ [P1]
  - [x] 11.1 Statistics Engine純粋関数を実装する
    - `getMonthlyStats(records)`
    - `getTopZones(records, 5)`
    - `getAverageIntensity(records)`
    - `getCoverageRate(records, totalZoneCount)`
    - `getIntensityDistribution(records)`
    - Done: 各関数が正しい集計値を返す
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 11.2 Property 10, 11: 統計集計のプロパティテストを書く
    - **Property 10: 月別集計の合計不変量**
    - **Property 11: 統計集計の正確性**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
  - [x] 11.3 統計タブUI（チャート）を実装する
    - 月別施術数バーチャート（Canvas or SVG）
    - 頻出ゾーンTop5リスト
    - 平均強度・カバー率表示
    - 強度分布チャート
    - Done: 統計タブにグラフと数値が正しく表示される
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 11.4 統計パフォーマンス確認
    - 5,000レコードで統計タブ表示が500ms以内であることを確認
    - 統計キャッシュ機構（レコード変更時にキャッシュ破棄）
    - Done: console.timeで計測し500ms以内、キャッシュhit時は50ms以内
    - _Requirements: 9.9, 9.10_

- [x] 12. データ管理（エクスポート/インポート/リセット） [P1]
  - [x] 12.1 エクスポート機能を実装する
    - JSON形式で全データ（records + settings）をダウンロード
    - Done: ボタンクリックでJSONファイルがダウンロードされ、中身が正しい
    - _Requirements: 7.2_
  - [x] 12.2 validateImportData()を実装する
    - JSONスキーマ検証（id, zone_id, date, intensity, created_at必須）
    - Done: 正しいJSONはvalid=true、不正JSONはvalid=falseとerrors配列を返す
    - _Requirements: 7.4, 7.5_
  - [x] 12.3 mergeRecords()を実装する
    - Map<id>でO(n)マージ、同一idはcreated_at比較で新しい方を採用
    - Done: 重複idは新しい方が残り、ユニークidは全件残る
    - _Requirements: 7.7_
  - [x] 12.4 インポートUIを実装する
    - ファイル選択 → バリデーション → マージ/置換選択ダイアログ → 適用
    - 不正JSON時はエラー表示・既存データ変更なし
    - Done: マージ/置換が選択でき、正常インポート後にデータが反映される
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_
  - [x] 12.5 Property 12, 13: インポート・マージのプロパティテストを書く
    - **Property 12: インポートバリデーション**
    - **Property 13: マージアルゴリズムの正確性**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 7.4, 7.5, 7.7**
  - [x] 12.6 データリセット機能を実装する
    - 確認ダイアログ「本当にすべてのデータを削除しますか？」→ localStorage全クリア
    - Done: 確認後に全データが消え、Body Mapがグレーになる
    - _Requirements: 7.8, 7.9_

- [x] 13. 写真記録機能 [P2]
  - [x] 13.1 PhotoCompressor.compress()を実装する
    - Canvas APIで画像リサイズ（maxWidth 800px）
    - toDataURL('image/jpeg', 0.8) で圧縮
    - 結果が500KB超ならnull返却
    - Done: 大きい画像が800px以下に縮小され、500KB以内のbase64が返る
    - _Requirements: 8.5, 8.6, 8.7_
  - [x] 13.2 PhotoCompressor.getBase64Size()とストレージ使用量計算を実装する
    - 全レコードの写真サイズ合計を計算
    - Done: 正しいバイト数が返る
    - _Requirements: 8.10_
  - [x] 13.3 Property 14, 15: 写真圧縮・ストレージ使用量のプロパティテストを書く
    - **Property 14: 写真圧縮制約**
    - **Property 15: 写真ストレージ使用量計算**
    - Done: テストが存在し、100イテレーション以上でパスする
    - **Validates: Requirements 8.5, 8.6, 8.10**
  - [x] 13.4 写真添付UIを施術記録モーダルに追加する
    - カメラ/フォトライブラリからの写真選択ボタン
    - 圧縮 → Base64保存
    - 総写真ストレージ4MB制限チェック・警告表示
    - Done: 写真添付→保存→レコードにphotoフィールドが入る、4MB超過で警告が出る
    - _Requirements: 8.4, 8.5, 8.9, 8.10_
  - [x] 13.5 設定画面に写真ストレージ使用量表示を追加する
    - 現在の使用量/4MB をバー表示
    - Done: 設定タブに使用量が表示される
    - _Requirements: 8.10_
  - [x] 13.6 履歴画面に写真サムネイル表示を追加する
    - 写真付きレコードにサムネイル表示
    - タップで拡大表示
    - Done: 写真付きレコードにサムネが見え、タップで大きく表示される
    - _Requirements: 8.8_

- [x] 14. パフォーマンス最適化 [P2]
  - [x] 14.1 Body_Map初期ロードパフォーマンスを確認・最適化する
    - 200ゾーンのSVG描画が2秒以内
    - Done: Performance.now()計測で2秒以内
    - _Requirements: 9.7_
  - [x] 14.2 タブ切替パフォーマンスを確認・最適化する
    - 5,000レコード・200ゾーンでのタブ切替500ms以内
    - 統計キャッシュのhit/miss確認
    - Done: 全タブ切替が500ms以内
    - _Requirements: 9.9, 9.10_

- [x] 15. 統合テスト・最終確認 [P2]
  - [x] 15.1 全コンポーネントのE2E動作確認を行う
    - 全タブ間の遷移
    - レコード追加→ヒートマップ更新→統計反映→履歴表示のフロー
    - エクスポート→インポートのラウンドトリップ
    - Done: 全主要フローが手動確認で正常動作する
    - _Requirements: 全体_
  - [x] 15.2 エラーハンドリング動作確認を行う
    - トースト通知・モーダル内エラー・確認ダイアログ
    - localStorage容量超過シミュレーション
    - Done: 各エラーケースで適切なUI表示がされる
    - _Requirements: 全体_

- [x] 16. Final checkpoint - 全テスト通過確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Property Tests は全て必須。純粋関数の正確性保証に不可欠
- テスト環境: Vitest + fast-check + jsdom
- テストファイルは `tests/hair-removal-tracker/` 配下に配置
- MVP（P0）完了でマップ・記録・履歴・周期管理が使える状態になる
- P1完了で統計・データ管理が追加される
- P2完了で写真・パフォーマンス最適化が完了する
