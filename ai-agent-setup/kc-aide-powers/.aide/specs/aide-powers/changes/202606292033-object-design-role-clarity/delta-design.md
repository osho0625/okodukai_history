# 差分設計書

## 設計方針

approach.md の対応方針に基づき、既存の仕組みへの「追加」のみで全要求事項（REQ-C-001〜003）を実現する。既存のプロセス構造・テンプレート骨格・QA判定ロジックは変更しない。

- REQ-C-001（記載欄追加）: 既存の「技術的実装情報」テーブル（カテゴリ: 内容 の2列テーブル）に「技術調査結果」「参考ドキュメント（URLリンク付き）」の2カテゴリ行を追加する。別セクションとして新設せず、既存テーブルへの行追加として統合する（既存の「該当するカテゴリのみ記載する」運用ルールも継承する）
- REQ-C-002（プロセス追加）: object-design スキルの各モード（create/delta/reverse）の処理手順、および fs-design-phase8-object の phase8_{layer-name}/fix モードの処理手順に、外部連携部分の tech-investigation 実施ステップを追加する
- REQ-C-003（検証項目追加）: object-design-qa-agent 3プラットフォーム版の検証項目K直後に、新規検証項目L「外部連携部分の技術調査結果・公式ドキュメントリンク検証」を追加する。既存の判定基準（FAIL=0 かつ WARNING=0 → APPROVED）の文言は変更しない

本変更は6ファイルにわたり計13箇所の変更点があるため、以下のファイルに分割して記述する（索引のみ、詳細は各ファイル参照）。

## 索引

| ファイル | 対応する変更対象 | 内容 |
|---|---|---|
| `delta-design-object-design-skill.md` | 変更対象1 | `skills/object-design/SKILL.md`（create/delta/reverse各モード処理手順、Integration Related skills、計4箇所） |
| `delta-design-object-designer-prompt.md` | 変更対象2 | `skills/object-design/object-designer-prompt.md`（quality_checkモード品質基準チェック項目、deltaモード手順7、reverseモード手順10・出力テンプレート、計4箇所） |
| `delta-design-phase8-prompt.md` | 変更対象3 | `skills/fs-design-phase8-object/object-designer-prompt.md`（クラス設計の共通要件への技術的実装情報テンプレート新設、phase8_{layer-name}処理手順、fix処理手順手順1、計3箇所） |
| `delta-design-qa-agents.md` | 変更対象4〜6 | `agents/object-design-qa-agent.md` / `agents/kiro/object-design-qa-agent.md` / `agents/kiro/prompts/object-design-qa-agent-prompt.md`（各ファイルの担当範囲・検証項目L新設、計6箇所） |

## 新規追加の設計

該当なし（新規ファイル追加なし。approach.mdで確認済み）

## インターフェース影響サマリ

変更なし。全ての変更はMarkdown記述（テンプレート・処理手順・検証項目リスト）への追加であり、呼び出しパラメータ（mode, feature_name, specs_dir 等）やサブエージェントの入出力シグネチャに変更はない。

## 更新が必要な設計資料

なし（approach.mdで確定済み）。本変更はaide-powers自体のメタ開発であり、変更対象6ファイル自体が設計書を兼ねる（dev-environment.md §14）ため、他の設計資料への波及更新は発生しない。
