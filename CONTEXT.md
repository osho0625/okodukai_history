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
| `games-misc.md` | `*tetris*,*blast*,*olimar*` を開いた時 | テトリス・ブラスト・オリマー・ゲームセンター |
| `today-science.md` | `*science*` ファイルを開いた時 | 今日のサイエンス |

## 運用

- 対象ファイルをエディタで開けば自動で該当steeringが読み込まれる
- チャットのみの場合でも `project-overview.md` に指示があるため、Kiroが会話内容から判断して自動で読み込む
- 手動で指定したい場合は `#kanji-test` のように書いてもOK
