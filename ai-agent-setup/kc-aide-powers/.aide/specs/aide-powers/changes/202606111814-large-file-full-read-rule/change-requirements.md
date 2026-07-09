# 変更要求定義

## 変更概要

- **変更の目的・背景**:
  メタ開発（aide-powers フレームワーク自体の全FSフルレビュー）作業中に、サブエージェントが長い SKILL.md を読む際、部分ロード（"partially loaded"）や AST 要約モードになり、ファイル後半（レポート記載項目リスト・Integration 等）を読み落とす事象が複数発生した。これにより req_items 漏れの誤検出（false positive）や、削除済み Step の存在誤認（false negative）といった品質問題が起きている。フルレビュー用の review-{N}-{観点名}.md には暫定対策として「読み出しルール（必須・最優先）」を追記済みだが、これはレビュー専用の局所対策にとどまる。読み落とし防止は全エージェント・全工程に共通する課題のため、恒久・汎用ルールとして global-rules（正本）に反映し、AI が誤検出・見逃しを出すことを防ぐ。
- **変更種別**: 追加（global-rules への新規ルール追記）

## 要求事項

### REQ-C-001: 大きいファイルを分割して全行読み出すルールの追記
- **種別**: 追加
- **説明**:
  global-rules の正本（`skills/using-aide-powers/references/global-rules.md`）に、ファイル読み出し時の全行取得を義務付ける恒久ルールを新規セクションとして追記する。ルールの趣旨は次のとおり:
  - コード/ドキュメントファイルを読む際は read_file で全行読むこと。
  - 10k文字を超える等で部分ロード（"partially loaded"）や AST 要約モードになった場合は、start_line/end_line を指定して複数回に分割し、ファイル末尾まで必ず全行取得してから判断すること。
  - read_code の要約モードに頼った読み落としによる誤検出（false positive）・見逃し（false negative）を禁止すること。
  - 適用対象は「コード/ドキュメントファイルを読むあらゆる場面」であり、フルレビュー専用ではなく恒久・汎用ルールとして全エージェント・全工程に適用される。
  暫定対策の先行実装（`.aide/task-plans/report-key-uniqueness/review-7-形式可読.md` 冒頭の「読み出しルール（必須・最優先）」）を文言の参考とすること。
- **受入基準**:
  - AC-001: `skills/using-aide-powers/references/global-rules.md` に、上記趣旨のルールが独立したセクション（見出し付き）として追記されている。
  - AC-002: 追記されたルールに「read_file で全行読む」「部分ロード／AST 要約時は start_line/end_line で分割し末尾まで全行取得する」「read_code 要約モード依存による読み落としを禁止する」の3点が、いずれも明文として含まれている。
  - AC-003: 追記されたルールに、適用対象が「コード/ドキュメントファイルを読むあらゆる場面（恒久・汎用）」である旨が明記されている。
  - AC-004: 追記されたルールに、読み落としによる誤検出（false positive）・見逃し（false negative）を禁止する旨が明記されている。
- **優先度**: 必須

### REQ-C-002: ルール追記の配布反映（version 更新と全プラットフォーム配布）
- **種別**: 追加
- **説明**:
  global-rules 正本へのルール追記は、references 一式のバージョン更新と全プラットフォームへの配布が完了して初めて実際の AI 挙動へ反映される。正本の変更に伴い `skills/using-aide-powers/references/version.json` の version を +1（現行 5 → 6）し updated を更新すること。さらに rules-distribute による全プラットフォーム配布、および `.aide/references/` への反映が行われること。配布先（`.kiro/steering/aide-powers-global-rules.md` 等）は rules-distribute が正本から再生成するため、本要求の中心は「正本への追記＋version 更新＋配布実行」である。
- **受入基準**:
  - AC-005: `skills/using-aide-powers/references/version.json` の version が +1（5 → 6）され、updated が更新されている。
  - AC-006: rules-distribute による配布が実行され、配布先の global-rules（`.kiro/steering/aide-powers-global-rules.md` 等）に REQ-C-001 のルールが反映されている。
  - AC-007: `.aide/references/` 配下の global-rules にも追記内容が反映されている。
- **優先度**: 必須

## 対象外（スコープ外）

- 配布先ファイル（`.kiro/steering/aide-powers-global-rules.md` 等）の手動編集（rules-distribute が正本から再生成するため、手動編集は禁止）。
- 既存の global-rules 内の他ルールの文言変更・再構成。
- ファイル読み出しルールを SKILL 個別（フェーズスキル等）へ重複記載すること（global-rules への一元化で足りる）。
- 読み出しルールを強制する仕組みの実装（ツール改修・自動検証機構の追加等の技術的実現方法）。
- 影響範囲の分析および対応方針の策定（後続工程で実施）。

## 前提条件

- 本変更の対象正本は `skills/using-aide-powers/references/global-rules.md` であり、配布先は rules-distribute により再生成される。
- references 一式のバージョン管理ルール上、正本変更時は version.json の version を +1 しないと配布先へ反映されない（version.json の _comment に明記）。
- ルールが実際の AI 挙動に反映されるのは、正本追記・version 更新・rules-distribute による配布・`.aide/references/` への反映が完了した後である。
- 本リポジトリはメタ開発（aide-powers フレームワーク自体の開発）であり、`user-requirements.md` / `program-structure.md` は存在しない（dev-environment.md §14 参照）。

## 関連する既存要件

- 本リポジトリはメタ開発のため `user-requirements.md` は存在しない。関連する既存ルール・スキルは以下のとおり。
- 既存ルール「ツールマップ参照ルール」「スキルの所在ルール」（`skills/using-aide-powers/references/global-rules.md` 内）: いずれもファイル読み取り（read_file 等）の運用に関わるルールであり、本変更で追記する「全行読み出しルール」と同一ファイル内で整合させる必要がある。
- `skills/rules-distribute/SKILL.md`: 正本から全プラットフォームへルールを配布するスキル。REQ-C-002 の配布反映で利用される。
- `skills/using-aide-powers/references/version.json`: references 一式のバージョン正本。REQ-C-002 の version 更新対象。
- 暫定対策の先行実装 `.aide/task-plans/report-key-uniqueness/review-1〜8-*.md`（特に review-7-形式可読.md 冒頭の「読み出しルール（必須・最優先）」）: 本変更で恒久化するルールの文言の参考。
- 発生元の課題: pending-issues.md の PI-032（大きいファイルは分割して全行読み出すルールを global-rules に追記）。
