---
inclusion: fileMatch
fileMatchPattern: "*news*"
---

# ファミリーニュース

## 概要

技術ニュース＋子供向けゲーム・おでかけ情報を集約するRSSニュースアグリゲーター。GitHub Pages上でフロントエンドのみ動作。プッシュ通知のみSupabase + GitHub Actions基盤を利用。

## ページ

- `pages/news.html` — メインページ
- `css/news.css` — 専用スタイル

## モジュール構成

| ファイル | 責務 |
|----------|------|
| `js/news-feed-parser.js` | RSS/Atom XML解析、HTMLサニタイズ、SHA-256 ID生成 |
| `js/news-feed-service.js` | CORS Proxy経由フィード取得、プロキシフォールバック |
| `js/news-article-store.js` | 記事キャッシュ、重複排除、容量管理 |
| `js/news-favorite-store.js` | お気に入り管理 |
| `js/news-setting-store.js` | 設定・フィードソース管理 |
| `js/news-app.js` | UI制御、タブ切替、イベントハンドリング |
| `scripts/news-notify.js` | GitHub Actions用：RSS差分→Push通知 |

## localStorageキー

- `family-news-feeds` — FeedSource一覧
- `family-news-favorites` — お気に入り記事（上限100件）
- `family-news-cache` — 記事キャッシュ（上限200件、30日有効）
- `family-news-settings` — 設定（プロキシ候補リスト、debugLog）

## デフォルトフィードソース

テック: Hacker News, Publickey, Zenn, Qiita, はてブテクノロジー
ゲーム: Minecraft公式, 任天堂, ファミ通
おでかけ: Googleニュース（アスレチック公園）, はてブ検索

## データモデル

### FeedSource
```
{ id, name, url, category, enabled, lastSuccessAt, errorCount, lastError, lastErrorAt }
```

### Article
```
{ id(SHA-256), title, url, publishedAt, description(200字サニタイズ済), sourceName, sourceId, sourceCategory, fetchedAt }
```

### FavoriteArticle（description除外）
```
{ id, title, url, sourceName, sourceCategory, publishedAt, savedAt }
```

## テスト

- `tests/news-feed-parser.test.js` — 29件
- `tests/news-article-store.test.js` — 35件
- `tests/news-feed-service.test.js` — 19件
- `tests/news-setting-store.test.js` — 45件
- `tests/news-favorite-store.test.js` — 23件
- `tests/news-property.test.js` — 18件（PBT: fast-check）

## GitHub Actions

- `.github/workflows/news-notify.yml` — 毎朝07:00 JST（cron: 0 22 * * * UTC）

## Supabaseテーブル

- `push_subscriptions.news_notification_enabled` — ニュース通知ON/OFF（Boolean）
- `news_last_check` — フィード差分管理（feed_url, last_article_ids, checked_at）
