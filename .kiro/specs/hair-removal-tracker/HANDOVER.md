# 引継ぎ: 脱毛周期管理アプリ (hair-removal-tracker)

## 現在の状態

全タスク完了 + UI改善 + Supabase DB化完了。v2.33.0+。

## 主な変更履歴（直近）

1. **Supabase DB化**: localStorage → Supabase (`hair_removal_records`, `hair_removal_settings` テーブル)
2. **人物切替**: りょうすけ/めぐみの2人分をDB上で分離管理
3. **前面/背面同時表示**: トグル廃止、両面を縦並びで常時表示
4. **なぞり選択**: タッチドラッグ/マウスドラッグで複数ゾーン選択
5. **タップ動作**: 選択トグル + ゾーン情報パネル（前回施術日・経過日数・履歴）表示
6. **記録ボタン**: 選択後「記録する」ボタンでのみモーダル起動（タップ直接記録は廃止）
7. **admin限定**: TOPアイコンは🪒でアイコン列に配置、admin のみ表示
8. **ヒートマップ修正**: CSS fill オーバーライド問題解消、refreshColorsをStorageManager経由に変更

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/hair-removal-tracker.html` | メインHTML (人物セレクター/タブUI/モーダル/情報パネル) |
| `css/hair-removal-tracker.css` | スタイル全体 (レスポンシブ/ダークモード/情報パネル) |
| `js/hair-removal-tracker.js` | アプリロジック全体 (IIFE、~3100行) |
| `js/body-map-data.js` | Body Zoneデータ (前面107/背面96ゾーン) |
| `sql/hair_removal_tables.sql` | Supabaseテーブル定義SQL |
| `tests/hair-removal-tracker/` | テスト（12ファイル、161テスト） |

## Supabase テーブル

### hair_removal_records
- id: UUID (PK)
- person: TEXT ('りょうすけ' | 'めぐみ')
- zone_id: TEXT
- date: DATE
- intensity: INT (1-5)
- memo: TEXT (nullable)
- photo: TEXT (nullable)
- created_at: TIMESTAMPTZ

### hair_removal_settings
- person: TEXT (PK, 'りょうすけ' | 'めぐみ')
- default_cycle_days: INT (default 30)
- color_threshold_days: INT (default 30)
- zone_cycles: JSONB
- group_cycles: JSONB
- updated_at: TIMESTAMPTZ

## 技術メモ

- JSはIIFE構成、`window._HairRemovalTracker` でテスト用エクスポート
- **データ永続化: Supabase**（`client` は common.js で初期化済み）
- メモリキャッシュ: `_recordsCache`, `_settingsCache`（人物切替時にリセット）
- `loadPersonData()` でSupabaseから非同期ロード → `refreshColors()` で色適用
- SVG描画: `initDualBodyMap()` でDOM直接操作（BodyMapRenderer依存排除）
- 色適用: `refreshColors()` が `StorageManager.getRecords()/getSettings()` からキャッシュを参照
- なぞり選択: `initSwipeSelection()` でtouchstart/touchmove/touchend + mouse系イベント
- タップ判定: 移動なし = タップ → `toggleSwipeSelection()` + `showZoneInfoPanel()`
- 色計算: HSL補間 (hue 120→0, sat 60%, light 50%)、閾値 = `color_threshold_days`
- 周期優先度: zone_cycles > group_cycles > default_cycle_days
- admin限定: TOPページの🪒アイコン（`#hair-removal-icon`）は `deviceRole === 'admin'` で表示
- SW: キャッシュにhair-removal関連ファイルを登録済み

## テスト状況

- 161テスト通過（12テストファイル、Property 1〜15）
- テスト環境: Vitest + fast-check + jsdom
- ⚠️ テストはlocalStorage版のStorageManagerを前提としているため、Supabase版との乖離あり

## 今後の改善案

- テストをSupabase版に対応させる（モックSupabaseクライアント）
- ゾーン別の周期設定UI（現在はSupabase直接のみ）
- PWA対応の強化（オフライン時のキャッシュ戦略）
- 通知機能（要施術ゾーンのリマインダー）
