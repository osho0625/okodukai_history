# Cline Skills Template v2.0

Clineで「Requirements → Architecture → Design → Tasks → 実装 → レビュー」のドキュメント駆動開発プロセスを再現するための汎用テンプレート。

## v2.0 の設計思想

- **コンテキスト効率最優先** — AIが消費するトークンを最小化する設計
- **Core + Detailed 分離** — Core Rules (~70行) は常時読み込み、Detailed Rules は必要時のみ
- **Checklist over Prose** — 文章よりチェックリストを優先
- **No Redundant Rules** — 各ルールは1か所にのみ記述
- **Existing Patterns First** — 新しい設計より既存実装との一貫性を優先
- **Metadata in Artifacts** — 成果物にstatus/version/summaryを付けて高速スキャン

## プロセスフロー

```
ユーザー「〇〇を作って」
  ↓
① Requirements（要件定義 + メタデータ/Summary付き）
  ↓ ユーザー確認
② Architecture Review（チェックリスト形式、変更対象周辺のみ）
  ↓
③ Design（差分ベース引き継ぎ、複数案は必要時のみ）
  ↓ ユーザー確認
④ Task Planning（対象ファイル + やること のみ）
  ↓
⑤ Implementation（実装前チェック必須 + 共通DoD + ミニレビュー）
  ↓
⑥ Final Review（FR/AC + 設計セクションのみ確認）
```

## ディレクトリ構成

```
project/
├── .clinerules                    # Core Rules（常時読み込み ~70行）
├── .cline/
│   └── skills/
│       ├── 01-requirements.md     # 要件定義
│       ├── 02-architecture.md     # アーキテクチャレビュー
│       ├── 03-design.md           # 設計
│       ├── 04-task-planning.md    # タスク分割
│       ├── 05-implementation.md   # 実装 + ミニレビュー
│       └── 06-review.md           # 最終レビュー
├── rules/                         # Detailed Rules（必要時のみ参照）
│   ├── detailed-rules.md          # フェーズ判定・Architecture条件等
│   ├── coding.md                  # コーディング規約（補足）
│   ├── review.md                  # レビュー観点
│   └── testing.md                 # テスト方針
└── docs/specs/{feature-name}/     # 生成される仕様書
```

## 使い方

1. プロジェクトルートにこのテンプレートの中身をコピー
2. Clineが自動的に `.clinerules` を読み込み、開発プロセスに従って動く

```bash
cp .clinerules /path/to/project/
cp -r .cline/ /path/to/project/
cp -r rules/ /path/to/project/
```

## v1.0 → v2.0 の主な変更

| 項目 | v1.0 | v2.0 |
|------|------|------|
| フェーズ間引き継ぎ | 全文サマリ | 差分のみ（■新決定/■残課題） |
| ドキュメント参照 | 全文読み込み | 該当セクションのみ |
| ルール配置 | 重複あり | 1ルール1か所（No Redundant） |
| DoD | タスクごと記述 | 共通DoD + 例外のみ |
| Architecture Review | 文章出力 | チェックリスト |
| Review出力 | 文章 | チェックボックス |
| タスク属性 | Priority/Risk/Estimate/Deps | やること + 対象ファイルのみ |
| コミットメッセージ | タスク毎生成 | ツール任せ（削除） |
| Decision Log | 全判断記録 | 設計変更のみ |
| 成果物 | 本文のみ | メタデータ + Summary付き |
| コンテキスト消費 | ~5KB常時 | ~2KB常時 |

## カスタマイズ

プロジェクトに応じて `rules/` に追加可能:
- `rules/supabase.md` — Supabase固有のベストプラクティス
- `rules/frontend.md` — フロントエンド専用規約
- `rules/release.md` — プロジェクト固有のリリース手順
