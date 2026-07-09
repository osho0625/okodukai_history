# 影響範囲分析（更新版 — フェーズ6精密分析）

## 変更概要
- 変更種別: 仕様変更（modification）
- 対象要件: REQ-C-001, REQ-C-002, REQ-C-003
- 差分設計QA結果: APPROVED

## シグネチャ変更の全件追跡

| 変更箇所 | 変更内容 | 影響を受ける呼び出し元 | 対応方法 |
|---|---|---|---|
| phase-compliance-check (write) 入力パラメータ | `process_full_text`（SKILL.md Process全文）追加 | 全フェーズスキル（fs-*）45ファイルの後処理セクション | 各フェーズスキルの後処理で、オーケストレータが該当SKILL.mdのProcessセクション全文を渡すよう記述追加（スコープ外・別WF） |
| phase-compliance-check (write) 入力パラメータ | `execution_evidence`（実行証跡）追加 | 全フェーズスキル（fs-*）45ファイルの後処理セクション | 各フェーズスキルの後処理で、オーケストレータが会話履歴から実行証跡を切り出して渡すよう記述追加（スコープ外・別WF） |
| compliance-checker 検証ロジック | 検証項目 i. Process実行証跡照合 追加 | phase-compliance-check (write) 経由でのみ呼ばれる | compliance-checker エージェント定義内で完結。呼び出し元変更不要 |
| compliance-checker 検証ロジック | 検証項目 j. サブエージェント委譲検証 追加 | phase-compliance-check (write) 経由でのみ呼ばれる | compliance-checker エージェント定義内で完結。呼び出し元変更不要 |
| phase-compliance-check 署名手順 | 成果物なしフェーズの署名対象文字列ルール明文化 | フェーズ1系スキル（fs-*-phase1-*）7ファイル | 既存動作（空文字列SHA256固定値）を正式仕様として明文化するのみ。動作変更なし |

### 依存関係テーブル（phase-compliance-check を参照する全ファイル）

| # | ファイルパス | 参照モード | 新パラメータ対応要否 |
|---|---|---|---|
| 1 | skills/fs-bugfix-phase1-report/SKILL.md | verify + write | 要（スコープ外） |
| 2 | skills/fs-bugfix-phase2-analysis/SKILL.md | verify + write | 要（スコープ外） |
| 3 | skills/fs-bugfix-phase3-plan/SKILL.md | verify + write | 要（スコープ外） |
| 4 | skills/fs-bugfix-phase4-design/SKILL.md | verify + write | 要（スコープ外） |
| 5 | skills/fs-bugfix-phase5-impl/SKILL.md | verify + write | 要（スコープ外） |
| 6 | skills/fs-bugfix-phase6-doc/SKILL.md | verify + write | 要（スコープ外） |
| 7 | skills/fs-change-phase1-status/SKILL.md | verify + write | 要（スコープ外） |
| 8 | skills/fs-change-phase2-requirements/SKILL.md | verify + write | 要（スコープ外） |
| 9 | skills/fs-change-phase3-impact/SKILL.md | verify + write | 要（スコープ外） |
| 10 | skills/fs-change-phase4-approach/SKILL.md | verify + write | 要（スコープ外） |
| 11 | skills/fs-change-phase5-delta-design/SKILL.md | verify + write | 要（スコープ外） |
| 12 | skills/fs-change-phase6-impact-review/SKILL.md | verify + write | 要（スコープ外） |
| 13 | skills/fs-change-phase7-task-planning/SKILL.md | verify + write | 要（スコープ外） |
| 14 | skills/fs-change-phase8-impl/SKILL.md | verify + write | 要（スコープ外） |
| 15 | skills/fs-change-phase9-completion/SKILL.md | verify + write | 要（スコープ外） |
| 16 | skills/fs-design-phase1-user-req/SKILL.md | verify + write | 要（スコープ外） |
| 17 | skills/fs-design-phase2-system-req/SKILL.md | verify + write | 要（スコープ外） |
| 18 | skills/fs-design-phase3-dev-plan/SKILL.md | verify + write | 要（スコープ外） |
| 19 | skills/fs-design-phase4-architecture/SKILL.md | verify + write | 要（スコープ外） |
| 20 | skills/fs-design-phase5-gui/SKILL.md | verify + write | 要（スコープ外） |
| 21 | skills/fs-design-phase6-usecase/SKILL.md | verify + write | 要（スコープ外） |
| 22 | skills/fs-design-phase7-ddd/SKILL.md | verify + write | 要（スコープ外） |
| 23 | skills/fs-design-phase8-object/SKILL.md | verify + write | 要（スコープ外） |
| 24 | skills/fs-design-phase9-infra/SKILL.md | verify + write | 要（スコープ外） |
| 25 | skills/fs-design-phase10-program/SKILL.md | verify + write | 要（スコープ外） |
| 26 | skills/fs-impl-phase1-gate/SKILL.md | verify + write | 要（スコープ外） |
| 27 | skills/fs-impl-phase2-preparation/SKILL.md | verify + write | 要（スコープ外） |
| 28 | skills/fs-impl-phase3-gui-mockup/SKILL.md | verify + write | 要（スコープ外） |
| 29 | skills/fs-impl-phase4-execution/SKILL.md | verify + write | 要（スコープ外） |
| 30 | skills/fs-impl-phase5-final-check/SKILL.md | verify + write | 要（スコープ外） |
| 31 | skills/fs-impl-phase6-doc-generation/SKILL.md | verify + write | 要（スコープ外） |
| 32 | skills/fs-planning-phase1-intake-and-init/SKILL.md | verify + write | 要（スコープ外） |
| 33 | skills/fs-planning-phase2-explore/SKILL.md | verify + write | 要（スコープ外） |
| 34 | skills/fs-planning-phase3-finalize/SKILL.md | verify + write | 要（スコープ外） |
| 35 | skills/fs-refactoring-phase1-status/SKILL.md | verify + write | 要（スコープ外） |
| 36 | skills/fs-refactoring-phase2-candidates/SKILL.md | verify + write | 要（スコープ外） |
| 37 | skills/fs-refactoring-phase3-plan/SKILL.md | verify + write | 要（スコープ外） |
| 38 | skills/fs-refactoring-phase4-design/SKILL.md | verify + write | 要（スコープ外） |
| 39 | skills/fs-refactoring-phase5-impl/SKILL.md | verify + write | 要（スコープ外） |
| 40 | skills/fs-refactoring-phase6-doc/SKILL.md | verify + write | 要（スコープ外） |
| 41 | skills/fs-reverse-phase1-program/SKILL.md | verify + write | 要（スコープ外） |
| 42 | skills/fs-reverse-phase2-dev-env/SKILL.md | verify + write | 要（スコープ外） |
| 43 | skills/fs-reverse-phase3-system-req/SKILL.md | verify + write | 要（スコープ外） |
| 44 | skills/fs-reverse-phase4-user-req/SKILL.md | verify + write | 要（スコープ外） |
| 45 | skills/fs-reverse-phase5-optional-phases/SKILL.md | verify + write | 要（スコープ外） |

## 既存要件との矛盾確認

| 確認対象 | 結果 | 備考 |
|---|---|---|
| user-requirements.md | スキップ | 存在しない（設計書ゲートスキップ済み） |
| system-requirements.md | スキップ | 存在しない |
| グローバルルール §4-1（ワークフローの実作業禁止） | 矛盾なし | REQ-C-002 はこのルールの遵守を検証する仕組みであり、ルール自体と整合 |
| グローバルルール §3-1（フェーズ省略禁止） | 矛盾なし | REQ-C-001 はこのルールの遵守を客観的に検証する仕組みであり、ルール自体と整合 |
| PENDING-031（虚偽宣言防止） | 矛盾なし | 本変更で直接対応する課題 |
| progress-file-format.md | 矛盾なし | 成果物なしフェーズの署名ルール（REQ-C-003）は既存動作の明文化であり、フォーマット変更を伴わない |

## テスト対象機能

### 直接テスト対象

| 機能 | テスト内容 | 優先度 |
|---|---|---|
| phase-compliance-check (write) — Process実行証跡照合 | process_full_text と execution_evidence を渡し、各ステップの証跡有無が正しく判定されるか確認 | 高 |
| phase-compliance-check (write) — サブエージェント委譲検証 | 委譲指示がある Process に対し、サブエージェント呼び出し証跡の有無で PASS/FAIL が正しく判定されるか確認 | 高 |
| phase-compliance-check (write) — 成果物なしフェーズ署名 | 成果物0件のフェーズで空文字列SHA256固定値を使用した署名が正しく生成されるか確認 | 中 |
| compliance-checker — 検証項目 I（照合ロジック） | ステップ数と証跡数の不一致時に適切な FAIL 理由が返されるか確認 | 高 |
| compliance-checker — 検証項目 J（委譲検出ロジック） | オーケストレータ自己実行時に FAIL、委譲指示なし時にスキップ（PASS扱い）が正しく動作するか確認 | 高 |

### リグレッションテスト対象

| 機能 | テスト内容 | 優先度 |
|---|---|---|
| phase-compliance-check (verify) — 既存署名検証 | 新パラメータ追加後も、既存の署名検証（前フェーズ署名の改ざんチェック）が正常に動作するか確認 | 高 |
| phase-compliance-check (write) — 既存検証項目 a〜h | 新項目 i, j 追加後も、既存の検証項目（成果物存在確認、ユーザー承認確認、省略なし宣言等）が正常に動作するか確認 | 高 |
| 成果物ありフェーズの署名生成 | 成果物なしフェーズの署名手順明文化が、成果物ありフェーズの署名生成に影響しないか確認 | 中 |

## 説明対象アクター

| アクター | 影響内容 | 説明が必要な理由 |
|---|---|---|
| AIエージェント（オーケストレータ） | 後処理で phase-compliance-check (write) を呼ぶ際に `process_full_text` と `execution_evidence` の2パラメータを新たに提供する必要がある | パラメータ不足で FAIL になるため、全フェーズスキルの後処理記述を更新するまでの移行期間中の動作を理解する必要がある |
| AIエージェント（compliance-checker） | 検証項目 I（Process照合）と J（委譲検証）の新ロジックを実行する | エージェント定義の変更により自動的に適用されるが、FAIL 判定基準の理解が必要 |
| ユーザー | 直接的な操作変更なし。FAIL 時の通知内容が詳細化される | 新しい FAIL 理由（「Step X の実行証跡が不足」「Step X でサブエージェント委譲違反」）の意味を理解する必要がある |

## フェーズ3版からの差分

| 項目 | フェーズ3版 | 更新版 | 変更理由 |
|---|---|---|---|
| シグネチャ変更追跡 | 概要レベルの記載（3行） | 全件追跡テーブル（5件）+ 依存関係テーブル（45ファイル全件列挙） | delta-design.md の before→after を精査し、全シグネチャ変更を網羅的に追跡 |
| 既存要件との矛盾確認 | 記載なし | 6項目の確認結果テーブル | グローバルルール・PENDING課題・progress-file-format.md との整合性を明示的に確認 |
| テスト対象機能 | 記載なし | 直接テスト5件 + リグレッション3件 | 変更箇所ごとのテスト内容と優先度を明確化 |
| 説明対象アクター | 影響度（高/低）のみ | 影響内容 + 説明が必要な理由 | 移行期間中の動作理解や新FAIL理由の説明必要性を明記 |
| 差分設計QA結果 | 記載なし | APPROVED | delta-design.md のQA完了を反映 |
| 依存ファイル列挙方法 | ワークフロー単位のグループ記載 | grep による全件列挙（45ファイル個別） | 漏れなく全依存ファイルを特定するため |

## サマリー

本変更は phase-compliance-check スキルと compliance-checker エージェントの2ファイルを直接変更し、write モードに `process_full_text` と `execution_evidence` の2入力パラメータを追加する。これはドキュメント上の仕様変更であり、プログラムコードのシグネチャ変更ではないが、全フェーズスキル45ファイルの後処理で新パラメータの提供が必要になる（スコープ外・別WFで対応）。既存要件との矛盾はなく、verify モードの既存署名検証への影響もない。
