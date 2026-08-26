---
inclusion: fileMatch
fileMatchPattern: "*laq*"
---

# LaQ美術館

## 概要
LaQ作品を写真で記録し、ギャラリーとして鑑賞するアプリ。
作品を壊す前に写真で残しておくことで、子供同士の喧嘩を防止する。

## ページ
- `pages/laq-museum.html` - メインページ（登録 + ギャラリー）

## テーブル構成

### laq_works
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | PK |
| title | TEXT | 作品名（空可、後から管理者が変更可能） |
| author | TEXT | 作者（かいせい/いろは/はるちか） |
| thumbnail_photo_id | UUID | サムネイルに使う写真のID |
| created_at | TIMESTAMPTZ | 登録日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### laq_photos
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | PK |
| work_id | UUID | FK→laq_works.id |
| url | TEXT | Storage公開URL |
| sort_order | INT | 並び順 |
| created_at | TIMESTAMPTZ | 登録日時 |

## Storage
- バケット名: `laq-photos`
- 公開: true
- ファイルサイズ上限: 5MB

## 機能
1. 作品登録: 作者選択 → 写真撮影/選択 → 作品名入力（任意） → サムネイル選択 → 登録
2. ギャラリー: 作者ごとに作品数が多い順で表示、サムネイル＋題名の一覧
3. 作品詳細: 写真スワイプ閲覧
4. 管理者機能: 作品名変更、サムネイル変更、作品削除

## SQL
- `sql/laq_museum_tables.sql` - テーブル作成SQL
