# お小遣い手帳 - クイックスタート

## 概要

家族向けお小遣い管理PWA。GitHub Pages + Supabase構成。  
pushすればデプロイ完了（ビルドステップなし）。

公開URL: https://osho0625.github.io/okodukai_history/

---

## 事前準備

1. GitHubアカウントを作成する（https://github.com/signup）
2. リポジトリオーナーにcollaboratorとして招待してもらう（招待メールが届くので承認する）

これが完了すればpush可能になる。

---

## 初回セットアップ

```bash
git clone https://github.com/osho0625/okodukai_history.git
cd okodukai_history
npm install
```

---

## 作業開始

```bash
git checkout main
git pull origin main
git checkout -b MGM260710    # MGM + 日付で作業ブランチを作成
```

mainへの直接コミットは禁止。必ずブランチを切って作業する。

---

## ローカル確認

```bash
npx http-server . -p 8080
```

http://localhost:8080 で動作確認。Supabase接続にはネット環境が必要。

---

## コミット & push

```bash
git add .
git commit -m "feat: ○○を追加"
git push -u origin MGM260710
```

2回目以降は `git push` のみ。

---

## mainへマージ（作業完了時）

```bash
git checkout main
git pull origin main
git merge --no-ff MGM260710
git push origin main
```

`--no-ff` 必須（マージコミットを残すため）。

---

## マージ前の必須更新

mainに入れる前に以下を必ず反映すること:

| 対象 | ファイル | 内容 |
|------|----------|------|
| リリースノート | `pages/release-notes.html` | バージョンを上げて変更内容を追記 |
| キャッシュバージョン | `sw.js` の `CACHE_NAME` | 番号を +1 |
| バージョン表示 | `index.html` 末尾 | 新バージョン番号に更新 |

sw.js のキャッシュバージョンを更新しないとPWAに変更が反映されない。

---

## ディレクトリ構成

| 対象 | パス |
|------|------|
| TOPページ | `index.html` |
| 各機能ページ | `pages/*.html` |
| スタイル | `css/` |
| JS モジュール | `js/` またはページ内 `<script>` |
| 機能仕様 | `.kiro/steering/*.md` |
| バッチ処理 | `scripts/`, `.github/workflows/` |

---

## Git よく使うコマンド

| 操作 | コマンド |
|------|----------|
| 現在のブランチ確認 | `git branch` |
| 変更差分の確認 | `git status` |
| 特定ファイルの変更を取り消す | `git checkout -- ファイル名` |
| 直前のコミットメッセージ修正 | `git commit --amend -m "修正後"` (push前のみ) |

---

## ルール

- mainへの直接コミット禁止。ブランチで作業してマージする
- マージ時は `--no-ff` を付ける
- push前にsw.jsキャッシュバージョンを必ず更新する
- パスワード・APIキーをソースにハードコードしない（Supabase管理）
