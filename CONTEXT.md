# お小遣い手帳 - 開発コンテキスト

プロジェクトドキュメントは `.kiro/steering/` に移行しました。

## Steering Files 構成

| ファイル | 読み込み条件 | 内容 |
|----------|-------------|------|
| `project-overview.md` | 常に自動 | プロジェクト概要・テーブル構成・開発ルール・Git・注意点 |
| `kanji-test.md` | `*kanji*` ファイルを開いた時 | 漢字50問テスト |
| `puyo-battle.md` | `*puyo*` ファイルを開いた時 | ぴくぴく対戦 + ぷよゲーム |
| `math-olympiad.md` | `*math*` ファイルを開いた時 | 算数オリンピック + 算数バトル |
| `suika-rpg.md` | `*suika*` ファイルを開いた時 | すいかが食べたい（3D RPG） |
| `tickets.md` | `*ticket*` ファイルを開いた時 | あそびチケット |
| `trpg.md` | `*trpg*` ファイルを開いた時 | クトゥルフTRPG |
| `games-misc.md` | `*tetris*,*blast*,*olimar*,*arcade*` を開いた時 | テトミン・ピクミンブラスト・オリマー・ゲームセンター |
| `board-games.md` | `*cockroach*,*quarto*,*quoridor*,*memory-game*,*blokus*` を開いた時 | ごきぶりポーカー・クアルト・コリドール・神経衰弱・ブロックス |
| `today-science.md` | `*science*` ファイルを開いた時 | 今日のサイエンス |
| `today-scp.md` | `*scp*` ファイルを開いた時 | 今日のSCP |
| `nurse-call.md` | `*nurse*` ファイルを開いた時 | ナースコール |
| `chores.md` | `*chore*` ファイルを開いた時 | お手伝いリスト |
| `family-notes.md` | `*family-notes*,*family_notes*` を開いた時 | 家族メモ帳 |
| `texas-holdem.md` | `*texas*,*holdem*,*poker-guide*` を開いた時 | テキサスホールデム ルールガイド |
| `family-settlement.md` | `*settlement*` ファイルを開いた時 | 家庭内精算機能 |
| `recipe.md` | `*recipe*` ファイルを開いた時 | 家族レシピ管理 |
| `hair-removal-tracker.md` | `*hair-removal*` ファイルを開いた時 | 脱毛周期管理アプリ |

| `family-news.md` | `*news*` ファイルを開いた時 | ファミリーニュース |
| `laundry-notification.md` | `*laundry*` ファイルを開いた時 | 洗濯通知アプリ |
| `travel-plans.md` | `*travel*,*trip*` ファイルを開いた時 | 旅行計画（新婚旅行・家族鉄道旅行） |

## 機能一覧

| 機能 | ページ | 概要 |
|------|--------|------|
| お小遣い管理 | index.html, child.html | アカウント管理・ポイント・入出金・演出 |
| 漢字50問テスト | pages/kanji-test.html | 学年別漢字テスト・手書き認識 |
| ぴくぴく対戦 | pages/puyo-battle.html | ぷよぷよ風リアルタイム対戦 |
| 算数オリンピック | pages/math-olympiad.html | 学年別算数問題 |
| レシピ | pages/recipe.html | 家族レシピ管理（6タブ: レシピ/素材検索/献立/買い物/設定） |
| 家庭内精算 | pages/settlement.html | 固定費折半・立替精算（5タブ） |
| お手伝いリスト | pages/chores.html | 家事タスク管理・ポイント連携 |
| 家族メモ帳 | pages/family-notes.html | 共有メモ・ドキュメント |
| ナースコール | pages/nurse-call.html | 体温記録・通話 |
| ゲームセンター | pages/arcade.html | 各種ミニゲーム集 |
| テキサスホールデム | pages/texas-holdem.html | ルールガイド |
| チップ預かり所 | pages/poker-chips.html | ポーカーチップ管理・交換所 |
| あそびチケット | pages/tickets.html | チケット発行・消費 |
| 脱毛周期管理 | pages/hair-removal-tracker.html | Body Map（前面15/背面13ゾーン）・タップ選択・ヒートマップ・施術記録・統計・写真管理 |
| ファミリーニュース | pages/news.html | RSSニュースアグリゲーター（テック・ゲーム・おでかけ） |
| 旅行計画 | .kiro/specs/family-notes/docs/honeymoon-trip.md, .kiro/specs/family-notes/docs/family-train-trip.md | 新婚旅行（台湾/沖縄）・家族鉄道旅行（サンライズ瀬戸） |

## CSS構成

| ファイル | 用途 |
|----------|------|
| `css/index.css` | TOPページ（index.html）のスタイル |
| `css/kanji-test.css` | 漢字テスト |
| `css/puyo-escape.css` | ぷよ脱出演出 |
| `css/texas-holdem.css` | テキサスホールデム ルールガイド |
| `css/hair-removal-tracker.css` | 脱毛周期管理アプリ |
| `css/news.css` | ファミリーニュース |

## 運用

- 対象ファイルをエディタで開けば自動で該当steeringが読み込まれる
- チャットのみの場合でも `project-overview.md` に指示があるため、Kiroが会話内容から判断して自動で読み込む
- 手動で指定したい場合は `#kanji-test` のように書いてもOK

## 編集ルール

- 詳細な仕様・テーブル構成・機能説明は `.kiro/steering/` 内の該当mdファイルを編集すること
- この CONTEXT.md はインデックスのみ。詳細情報はここに書かず、steeringファイルに記載する
- steeringファイルの追加・変更時はこの表も更新すること
- push時は必ず以下を更新すること:
  - `pages/release-notes.html` — バージョン番号を上げてリリース内容を追記
  - `.kiro/steering/` — 該当機能のsteeringファイルに仕様変更を反映
  - `CONTEXT.md` — steeringファイルや機能の追加・変更があればインデックスを更新

## 関連プロジェクト

| プロジェクト | リポジトリ | 概要 |
|-------------|-----------|------|
| ピックルボール練習日管理 | [kc_pickleball_club_app](https://github.com/osho0625/kc_pickleball_club_app) | 京セラピックルボールクラブの練習日程・出欠管理アプリ（GAS + スプレッドシート連携） |
| Cline Skills Template | ai-agent-setup/cline-skills-template/ | AIエージェント向けドキュメント駆動開発テンプレート v2.0 |
