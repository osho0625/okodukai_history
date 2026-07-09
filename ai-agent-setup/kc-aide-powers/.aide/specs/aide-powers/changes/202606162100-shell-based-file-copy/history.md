# 変更履歴: 202606162100-shell-based-file-copy

## 概要

references コピーと rules-distribute global モードの配布をシェルコマンド方式に変更し、AI のコンテキスト消費と実行時間を削減。

## 変更日時

2026-06-16

## 変更内容

| # | 対象ファイル | 変更内容 |
|---|---|---|
| 1 | `skills/using-aide-powers/SKILL.md` | 起動手順2「references 配置」のコピー方式を Read→Write から シェルコマンド（Copy-Item / cp）に変更 |
| 2 | `skills/rules-distribute/SKILL.md` | ステップ2 global モードの配布方式を Read→Write から シェルコマンド（front-matter 結合 + コピー）に変更 |

## 変更理由

- 10ファイルの全文を AI コンテキストに展開する Read→Write 方式は、コンテキスト消費が大きく数ターンかかっていた
- シェルコマンド1回で完結させることでコンテキスト消費をほぼゼロにし、実行時間も大幅に短縮

## 影響範囲

- スキル間インターフェース: 不変
- フラグファイルプロトコル: 不変
- 配布先ファイルの内容・フォーマット: 不変
- skill モード（deploy/cleanup）: 変更なし

## 関連ドキュメント

- change-requirements.md（変更要求定義）
- impact-analysis.md（影響範囲分析）
- approach.md（対応方針書）
- delta-design.md（差分設計書）
