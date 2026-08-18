# @jcsholdem 投稿収集ツール

2024/7/15 (JST) の @jcsholdem の投稿を可能な限り収集します。

## 対象

- 本人投稿
- リポスト
- リプライ
- 画像付き投稿

## 情報源

| 情報源 | 方式 | 備考 |
|--------|------|------|
| Wayback Machine CDX API | 自動 | twitter.com/x.com 両方検索 |
| Nitter アーカイブ | 自動 | Wayback経由で検索 |
| archive.today | 自動 | アーカイブURL一覧取得 |
| Google/Bing検索 | 手動URL生成 | ブラウザで確認 |
| X検索 | 手動URL生成 | ログイン必要 |

## 使い方

```bash
cd tools/x-archive-collector
node collect-tweets.js
```

## 出力

`jcsholdem_2024-07-15.csv` に以下の形式で出力:

```
投稿日時,URL,本文,画像URL
```

- BOM付きUTF-8 (Excel互換)
- 画像URLが複数ある場合は `|` 区切り

## 制限事項

- X API (旧Twitter API) は有料プランが必要なため、本ツールではアーカイブサービスを使用
- Wayback Machine にアーカイブされていない投稿は自動収集不可
- archive.today の結果は手動確認が必要な場合あり
- 手動検索URLを使ってブラウザで追加確認を推奨

## X API を使う場合

Bearer Token を環境変数に設定して `--use-api` フラグで実行:

```bash
export X_BEARER_TOKEN=your_token_here
node collect-tweets.js --use-api
```
