# Cline Skills Template

Clineで「Requirements → Architecture → Design → Tasks → 実装 → レビュー」のドキュメント駆動開発プロセスを再現するための汎用テンプレート。

## 思想

- LLMに「どう実装するか」は任せる
- 「どういう手順で進めるか」はSkillで統一する
- LLMを入れ替えても開発品質を一定に保つ
- 各フェーズで前フェーズの成果物を要約し、コンテキストを維持する

## プロセスフロー

```
ユーザー「〇〇を作って」
  ↓
① Requirements（要件定義）
  ↓ ユーザー確認
② Architecture Review（既存構成との整合性チェック）
  ↓
③ Design（設計 — 複数案比較 → 推奨案選択）
  ↓ ユーザー確認
④ Task Planning（タスク分割 — Priority/Risk/Estimate付き）
  ↓
⑤ Implementation（タスク単位で実装 + 各タスク後にミニレビュー）
  ↓
⑥ Final Review（要件・設計との最終乖離チェック）
```

## ディレクトリ構成

```
project/
├── .clinerules                    # グローバルルール（自動読み込み）
├── .clinerules/                   # 追加ルール
│   ├── coding.md                  # コーディング規約
│   ├── review.md                  # レビュー観点
│   └── testing.md                 # テスト方針
├── .cline/
│   └── skills/
│       ├── 01-requirements.md     # 要件定義
│       ├── 02-architecture.md     # アーキテクチャレビュー
│       ├── 03-design.md           # 設計（複数案比較）
│       ├── 04-task-planning.md    # タスク分割
│       ├── 05-implementation.md   # 実装 + ミニレビュー
│       └── 06-review.md           # 最終レビュー
└── docs/specs/{feature-name}/     # 生成される仕様書
```

## 使い方

1. プロジェクトルートにこのテンプレートの中身をコピー
2. Clineが自動的に `.clinerules` を読み込み、開発プロセスに従って動く

```bash
cp .clinerules /path/to/project/
cp -r .cline/ /path/to/project/
mkdir -p /path/to/project/.clinerules
cp rules/*.md /path/to/project/.clinerules/
```

## 設計上の特徴

- 各フェーズ開始時に前フェーズの成果物を5〜10行で要約（コンテキスト消失対策）
- Designで複数案を比較して推奨案を選択（一択で進めない）
- タスクにPriority/Risk/Estimate/Dependenciesを付与
- 各タスク完了後にミニレビューを実施（問題の早期発見）
- 実装失敗時の分析テンプレート（無限ループ防止）
- Release Skillはプロジェクト固有のため含まない（各自で追加）

## カスタマイズ

プロジェクトに応じて追加可能:
- `.cline/skills/supabase.md` — Supabase固有のベストプラクティス
- `.cline/skills/release.md` — プロジェクト固有のリリース手順
- `.cline/skills/frontend.md` — フロントエンド専用規約
