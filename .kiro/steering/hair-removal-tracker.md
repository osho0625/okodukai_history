---
inclusion: fileMatch
fileMatchPattern: "*hair-removal*"
---

# 脱毛周期管理アプリ (Hair Removal Tracker)

## ファイル構成

- `pages/hair-removal-tracker.html` — メインHTML（4タブ: マップ/履歴/統計/設定）
- `js/hair-removal-tracker.js` — アプリロジック全体（IIFE構成、~2900行）
- `js/body-map-data.js` — Body Zoneデータ（前面15ゾーン/背面13ゾーン/6グループ）
- `css/hair-removal-tracker.css` — スタイル全体（レスポンシブ/ダークモード）
- `tests/hair-removal-tracker/` — テスト（12ファイル、161テスト）

## 概要

人体図（Body Map）ベースの脱毛周期管理SPA。SVGヒートマップで経過日数を可視化し、施術記録・周期管理・統計分析・写真記録・データ管理を提供。

## アーキテクチャ

- バニラHTML/CSS/JS（外部ライブラリなし）
- IIFE構成、`window._HairRemovalTracker` でテスト用エクスポート
- localStorage永続化（キー: `hair_removal_records`, `hair_removal_settings`）
- SVG viewBox: `0 0 400 800`
- ハッシュベースタブルーティング（`#map`, `#history`, `#stats`, `#settings`）

## 主要コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| Color Calculator | HSL補間ヒートマップ色計算（純粋関数） |
| Storage Manager | CRUD/設定/インポート/エクスポート/マージ/リセット |
| BodyMapRenderer | SVG描画/タップ選択・解除/ツールチップ/色更新 |
| TreatmentModal | 施術記録入力UI（単一/バッチ/写真添付） |
| MultiSelectManager | 複数選択モード管理 |
| Statistics Engine | 月別/Top5/平均強度/カバー率/強度分布（純粋関数） |
| PhotoCompressor | Canvas API圧縮/サイズ計算 |
| Filter/Sort | 日付ソート/ゾーンフィルタ/日付範囲フィルタ（純粋関数） |

## データモデル

```javascript
// Treatment_Record
{ id, zone_id, date: "YYYY-MM-DD", intensity: 1-5, memo, photo, created_at: ISO8601 }

// Settings
{ default_cycle_days: 30, color_threshold_days: 30, zone_cycles: {}, group_cycles: {} }

// Body_Zone
{ id, name, svgPath, side: "front"|"back", group }
```

## 周期優先度

`zone_cycles > group_cycles > default_cycle_days`

## テスト

- Vitest + fast-check + jsdom
- 15のプロパティベーステスト（各100+イテレーション）
- パフォーマンステスト（200ゾーン2秒以内、5000レコードでタブ切替500ms以内）
- 統合テスト・エラーハンドリングテスト

## 写真機能

- Canvas APIリサイズ（maxWidth 800px）→ JPEG 0.8品質
- 単体500KB上限、総写真4MB上限
- base64 data URI としてレコードの`photo`フィールドに保存

## Body Map ゾーン構成（v2.37.0〜）

画像ベースの部位分け（人体図の赤丸楕円に準拠）:

**前面15箇所:** 顎〜首、左胸、右胸、左わき、右わき、腹、VIO、左上腕、右上腕、左ひじ下、右ひじ下、左ふともも、右ふともも、左ひざ下、右ひざ下

**背面13箇所:** うなじ、左肩甲骨、右肩甲骨、左上腕、右上腕、腰、左ひじ下、右ひじ下、おしり、左ふともも、右ふともも、左ひざ下、右ひざ下

**グループ:** 顔・首、首、胴体、腕、脚、下半身

## 注意点

- 色計算: `hue = 120 * (1 - elapsed/threshold)`、HSL(120→0, 60%, 50%)
- タップで選択/解除（長押し廃止）— touchstart/mousedownでは選択せず、touchend/mouseupで移動なし判定時にトグル
- ページネーション: 履歴100件/ページ
- 統計キャッシュ: レコード変更時に `invalidateStatsCache()` で破棄
