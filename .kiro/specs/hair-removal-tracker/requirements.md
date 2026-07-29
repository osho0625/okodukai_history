# Requirements Document

## Introduction

脱毛周期管理アプリ。人体図を部位単位で分割表示し、各部位ごとに脱毛日とレーザー強さを記録する。最近脱毛した部位は緑色、時間が経過した部位は赤色でヒートマップ表示することで、次に脱毛すべき箇所を視覚的に把握できる。既存のお小遣い手帳PWAアプリ内の1ページとして動作し、localStorageにデータを保存する。GitHub Pagesで静的ホスティング。

## Glossary

- **Tracker_App**: 脱毛周期管理アプリケーション全体
- **Body_Map**: 人体図。前面（Front）と背面（Back）に分かれ、それぞれ90〜110のBody_Zoneに分割されたSVGベースの図。具体的な部位定義は body-map-data.js で管理する
- **Body_Zone**: Body_Mapを構成する個々の部位領域。一意のzone_idを持つ。データ構造: `{ id: string, name: string, svgPath: string, side: "front"|"back", group: string }`
- **Body_Group**: 複数のBody_Zoneをまとめた論理グループ（例: "顔", "右脚", "左脚", "胸", "背中上部"）。周期設定はBody_Zone単体またはBody_Group単位で適用可能
- **Treatment_Record**: 1回の脱毛記録。対象のzone_id、施術日（date: ユーザーローカル日付 YYYY-MM-DD）、レーザー強さ（intensity: 1〜5）を持つ。idはcrypto.randomUUID()で生成。created_atはISO8601 UTC形式。
- **Intensity**: レーザーの強さ。1（弱）〜5（強）の整数値
- **Heat_Color**: 部位の色表示。最終施術日からの経過日数に基づき、緑（直近）→黄→赤（長期間未施術）のグラデーションで表現
- **Cycle_Period**: 脱毛周期。部位ごとに設定可能な推奨施術間隔（日数）
- **Treatment_History**: 特定の部位またはユーザー全体の施術履歴一覧

## Requirements

### Requirement 1: 人体図表示（Body Map）

**User Story:** As a user, I want to 人体図を前面・背面で表示して部位を視覚的に確認できる, so that どの部位を脱毛したか一目で把握できる。

#### Acceptance Criteria

1. WHEN the user opens the tracker page, THE Tracker_App SHALL display a Body_Map with front view as the default.
2. THE Tracker_App SHALL provide a toggle button to switch between front view and back view of the Body_Map.
3. THE Tracker_App SHALL divide the front Body_Map into between 90 and 110 Body_Zone regions covering head, face, neck, chest, abdomen, arms, hands, legs, and feet. The exact zone definitions SHALL be provided in body-map-data.js.
4. THE Tracker_App SHALL divide the back Body_Map into between 90 and 110 Body_Zone regions covering back of head, neck, upper back, lower back, buttocks, arms, hands, legs, and feet. The exact zone definitions SHALL be provided in body-map-data.js.
5. THE Tracker_App SHALL render the Body_Map as an SVG element with each Body_Zone as a clickable path or region.
6. THE Tracker_App SHALL display the Body_Map responsively, fitting the screen width on mobile devices.
7. THE Tracker_App SHALL display a label or tooltip showing the zone name when the user hovers over or long-presses a Body_Zone.

### Requirement 2: ヒートマップ表示（経過時間による色変化）

**User Story:** As a user, I want to 脱毛からの経過時間に応じて部位の色が変化する, so that 次に脱毛すべき箇所を視覚的に判断できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL color each Body_Zone based on the number of days elapsed since the last Treatment_Record for that zone.
2. WHEN a Body_Zone has been treated within 7 days, THE Tracker_App SHALL display it in green (HSL(120, 60%, 50%)).
3. WHEN a Body_Zone has been treated between 8 and 30 days ago, THE Tracker_App SHALL display it using HSL color interpolation: hue transitions linearly from 120 (green) at 0 days → 60 (yellow) at 50% of threshold → 0 (red) at 100% of threshold. Saturation fixed at 60%, lightness at 50%.
4. WHEN a Body_Zone has been treated more than 30 days ago (exceeding the configured threshold), THE Tracker_App SHALL display it in red (HSL(0, 60%, 50%)).
5. WHEN a Body_Zone has no Treatment_Record, THE Tracker_App SHALL display it in a neutral gray color (HSL(0, 0%, 80%)).
6. THE Tracker_App SHALL recalculate Heat_Color values each time the page is loaded or a new Treatment_Record is added.
7. THE Tracker_App SHALL allow the user to configure the color transition thresholds (green-to-red period) in settings, with a default of 30 days. The color threshold is independent of Cycle_Period; the color shows visual urgency while Cycle_Period determines the overdue alert.

### Requirement 3: 脱毛記録の登録

**User Story:** As a user, I want to 部位をタップして脱毛日とレーザー強さを入力できる, so that 施術記録を簡単に残せる。

#### Acceptance Criteria

1. WHEN the user taps a Body_Zone on the Body_Map, THE Tracker_App SHALL open a treatment input modal for that zone.
2. THE Tracker_App SHALL display the zone name in the modal header.
3. THE Tracker_App SHALL provide a date picker pre-filled with today's date for the treatment date.
4. THE Tracker_App SHALL provide an Intensity selector with values 1 through 5, displayed as a 5-level radio button or slider.
5. THE Tracker_App SHALL display a visual indicator for each Intensity level (例: 1=とても弱い, 2=弱い, 3=普通, 4=強い, 5=とても強い).
6. WHEN the user confirms the input, THE Tracker_App SHALL save the Treatment_Record with zone_id, date, and intensity to localStorage.
7. WHEN the Treatment_Record is saved, THE Tracker_App SHALL immediately update the Heat_Color of the corresponding Body_Zone on the Body_Map.
8. IF the user taps cancel or outside the modal, THEN THE Tracker_App SHALL close the modal without saving.
9. WHEN the user long-presses a Body_Zone (500ms or longer), THE Tracker_App SHALL enter multi-select mode, allowing the user to tap additional Body_Zones to select multiple zones for batch treatment recording.
10. WHEN in multi-select mode, THE Tracker_App SHALL visually highlight all selected Body_Zones (例: pulsing border or distinct color overlay).
11. WHEN the user confirms input in multi-select mode, THE Tracker_App SHALL create one separate Treatment_Record per selected Body_Zone (each with its own id and zone_id, but sharing the same date, intensity, and memo).
12. THE Tracker_App SHALL provide a "選択解除" button to exit multi-select mode without saving.

### Requirement 4: 脱毛履歴表示

**User Story:** As a user, I want to 脱毛履歴を一覧で確認できる, so that 過去の施術内容を振り返り周期を把握できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL provide a "履歴" tab or section accessible from the main page.
2. WHEN the user opens the history view, THE Tracker_App SHALL display all Treatment_Records sorted by date descending.
3. THE Tracker_App SHALL display each history entry with: date, zone name, and intensity level.
4. THE Tracker_App SHALL allow filtering history by specific Body_Zone.
5. THE Tracker_App SHALL allow filtering history by date range.
6. WHEN the user taps a Body_Zone on the Body_Map, THE Tracker_App SHALL show the treatment history for that specific zone in the modal (最近の施術履歴を表示).
7. THE Tracker_App SHALL display the total number of treatments and the average interval between treatments for a selected zone.
8. THE Tracker_App SHALL allow deleting individual Treatment_Records from the history.
9. WHEN a Treatment_Record is deleted, THE Tracker_App SHALL recalculate and update the Heat_Color of the affected Body_Zone.
10. WHEN a Treatment_Record is deleted, THE Tracker_App SHALL also recalculate all statistics (monthly counts, averages, coverage rate, intensity distribution).

### Requirement 5: 脱毛周期設定・通知

**User Story:** As a user, I want to 部位ごとに推奨周期を設定して期限を把握できる, so that 適切なタイミングで次の施術を計画できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL provide a settings section where the user can configure the default Cycle_Period (default: 30 days).
2. THE Tracker_App SHALL allow setting a custom Cycle_Period for individual Body_Zones or Body_Groups. When set on a Body_Group, the cycle applies to all Body_Zones within that group unless overridden at the zone level.
3. WHEN a Body_Zone's elapsed days exceed its configured Cycle_Period, THE Tracker_App SHALL display a visual alert indicator (例: ⚠️ icon or pulsing border) on that zone.
4. THE Tracker_App SHALL provide a "要施術リスト" view showing all Body_Zones that have exceeded their Cycle_Period, sorted by overdue days descending.
5. THE Tracker_App SHALL display the next recommended treatment date for each zone (last_treatment_date + cycle_period).
6. THE Tracker_App SHALL display a summary dashboard showing: total zones treated, zones overdue, zones on schedule, and average treatment interval.

### Requirement 6: 統計・分析

**User Story:** As a user, I want to 脱毛の統計情報を見れる, so that 全体的な進捗や傾向を把握できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL provide a "統計" tab or section accessible from the main page.
2. THE Tracker_App SHALL display the total number of Treatment_Records.
3. THE Tracker_App SHALL display a monthly treatment count chart (bar or line chart) showing the number of treatments per month.
4. THE Tracker_App SHALL display the most frequently treated zones (top 5, ranked by treatment count).
5. THE Tracker_App SHALL display the average Intensity used across all treatments.
6. THE Tracker_App SHALL display the coverage rate (treated zones count / total zones count) as a percentage.
7. THE Tracker_App SHALL display an Intensity distribution chart showing how often each intensity level (1-5) is used.

### Requirement 7: データ管理

**User Story:** As a user, I want to データのエクスポート・インポートやリセットができる, so that データのバックアップや端末移行ができる。

#### Acceptance Criteria

1. THE Tracker_App SHALL store all Treatment_Records and settings in localStorage.
2. THE Tracker_App SHALL provide an "エクスポート" button that downloads all data as a JSON file.
3. THE Tracker_App SHALL provide an "インポート" button that loads data from a JSON file.
4. WHEN importing data, THE Tracker_App SHALL validate the JSON structure before applying.
5. IF the imported JSON is invalid, THEN THE Tracker_App SHALL display an error message and not modify existing data.
6. WHEN importing data, THE Tracker_App SHALL ask the user whether to merge with or replace existing data.
7. WHEN merging data, THE Tracker_App SHALL use the following rules: if a Treatment_Record with the same id exists, the record with the later created_at timestamp SHALL overwrite the existing one. New records (no matching id) SHALL be appended.
8. THE Tracker_App SHALL provide a "データリセット" button that clears all Treatment_Records after confirmation.
9. THE Tracker_App SHALL display a confirmation dialog with "本当にすべてのデータを削除しますか？" before resetting.

### Requirement 8: メモ・写真記録

**User Story:** As a user, I want to 施術時にメモや写真を残せる, so that 肌の状態や気づいたことを記録できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL provide an optional memo text field in the treatment input modal.
2. THE Tracker_App SHALL save the memo text as part of the Treatment_Record.
3. THE Tracker_App SHALL display memo content in the history view for records that have a memo.
4. THE Tracker_App SHALL allow attaching an optional photo to a Treatment_Record from the device camera or photo library.
5. THE Tracker_App SHALL store attached photos as base64 data URIs in localStorage (limited to 1 photo per record, max 500KB after compression).
6. THE Tracker_App SHALL compress photos to a maximum width of 800px before storing.
7. IF the photo exceeds size limits after compression, THEN THE Tracker_App SHALL display an error message and not save the photo.
8. THE Tracker_App SHALL display photo thumbnails in the history view for records that have photos.
9. THE Tracker_App SHALL enforce a total photo storage limit of 4MB. WHEN the limit is reached, THE Tracker_App SHALL prevent saving new photos and display a warning with current usage, prompting the user to delete older photos.
10. THE Tracker_App SHALL display current photo storage usage in the settings screen.

### Requirement 9: UI・アクセス

**User Story:** As a system operator, I want to アプリが既存のPWAに統合されスマホで使いやすい, so that 家族全員がスムーズに利用できる。

#### Acceptance Criteria

1. THE Tracker_App SHALL be accessible from the TOP page (index.html) via an appropriate icon link.
2. THE Tracker_App SHALL function as a page within the existing PWA (pages/hair-removal-tracker.html).
3. THE Tracker_App SHALL use vanilla HTML, CSS, and JavaScript without external frameworks.
4. THE Tracker_App SHALL be responsive and optimized for mobile-first usage.
5. THE Tracker_App SHALL provide large tap targets (minimum 44x44px) for all interactive elements.
6. THE Tracker_App SHALL support dark mode based on the device's prefers-color-scheme setting.
7. THE Tracker_App SHALL load and render the Body_Map within 2 seconds on a standard mobile connection.
8. THE Tracker_App SHALL display a navigation structure with tabs: マップ, 履歴, 統計, 設定.
9. THE Tracker_App SHALL support at least 5,000 Treatment_Records without degradation in page load or interaction performance.
10. THE Tracker_App SHALL remain responsive (tab switches under 500ms) with 200 Body_Zones, 100 photos, and 5,000 history records.

## Screens (画面一覧)

| 画面 | パス | 説明 |
|------|------|------|
| 脱毛マップ | pages/hair-removal-tracker.html | Body_Map表示（前面/背面切替）、ヒートマップ、要施術リスト |
| 施術記録モーダル | pages/hair-removal-tracker.html#record | 部位タップ時の記録入力（日付・強さ・メモ・写真） |
| 履歴 | pages/hair-removal-tracker.html#history | 施術履歴一覧（フィルタ・削除） |
| 統計 | pages/hair-removal-tracker.html#stats | 月別グラフ・カバー率・強度分布 |
| 設定 | pages/hair-removal-tracker.html#settings | 周期設定・色閾値設定・データ管理（エクスポート/インポート/リセット） |
| TOPアイコン | index.html | アイコンで hair-removal-tracker.html へ遷移 |

## Screen Flow (画面遷移)

```
index.html (TOP)
  │
  └─→ pages/hair-removal-tracker.html
        │
        ├─ [マップ tab] ─── Body_Map表示
        │     │
        │     ├─ タップ → 施術記録モーダル → 保存/キャンセル → マップに戻る
        │     └─ 長押し → 複数選択モード → タップで追加 → 記録モーダル → 保存/解除 → マップに戻る
        │
        ├─ [履歴 tab] ─── 履歴一覧
        │     └─ フィルタ / 削除
        │
        ├─ [統計 tab] ─── 統計ダッシュボード
        │
        └─ [設定 tab] ─── 周期設定 / 色閾値 / エクスポート / インポート / リセット
```

## localStorage Schema

```javascript
// キー: hair_removal_records
// 値: Treatment_Record の配列
[
  {
    "id": "uuid-string",
    "zone_id": "front_chest_01",
    "date": "2025-01-15",
    "intensity": 3,
    "memo": "少しピリピリした",
    "photo": "data:image/jpeg;base64,...", // optional
    "created_at": "2025-01-15T10:30:00Z"
  }
]

// キー: hair_removal_settings
// 値: 設定オブジェクト
{
  "default_cycle_days": 30,
  "color_threshold_days": 30,
  "zone_cycles": {
    "front_face_01": 14,       // Body_Zone単位の設定
    "front_leg_01": 45
  },
  "group_cycles": {
    "顔": 14,                  // Body_Group単位の設定
    "右脚": 45,
    "左脚": 45
  }
}
```

## Body_Zone Data Structure (body-map-data.js)

```javascript
// 各Body_Zoneのデータ構造
{
  "id": "front_face_01",       // 一意のzone_id
  "name": "額",                // 表示名
  "svgPath": "M100,50 L120,50...", // SVGパスデータ
  "side": "front",            // "front" | "back"
  "group": "顔"              // Body_Group名
}
```

## 関連ファイル

- #[[file:pages/hair-removal-tracker.html]]
- #[[file:css/hair-removal-tracker.css]]
- #[[file:js/hair-removal-tracker.js]]
- #[[file:js/body-map-data.js]]
