# 影響範囲分析（第3版・差分設計確定後の再調査）

## 変更種別
- **複合（機能削減 + 用語修正 + 新規追加）**: 実装ステップ内でのリグレッションテスト廃止（REQ-C-001）、実装完了後の動作確認Stepへの統一（REQ-C-002）、独自用語の標準用語統一（REQ-C-003）

---

## アクター視点の影響分析

### 影響を受けるユースケース・ユーザーストーリー

| 関連要件ID | 要件名 | 影響内容 |
|---|---|---|
| UR-001 | 7つのワークフローを提供すること | 全WFの実装フェーズ内テスト実行タイミングが変更される |
| UR-005 | 多段コードレビューを提供すること | coding-test-2review 内のテスト実行工程から全体リグレッション実行を廃止 |
| UR-010 | 共通スキル群による横断的ユーティリティ | coding-test-2review、impl-coding-standards、multi-stage-code-review の仕様変更 |

### 影響を受けるアクター

| アクター | 影響内容 |
|---|---|
| AIエージェント（実装エージェント: micro-impl-agent） | run_test モードで全体リグレッションテスト実行が不要になる。動作確認Stepでは regression-test-prompt.md 経由で全テスト実行を担当する（新規役割） |
| AIエージェント（レビューエージェント: design-review-agent, code-review-agent） | preservation check 観点が廃止される |
| AIエージェント（フェーズスキルオーケストレータ） | 動作確認Stepでリグレッションテスト実行サブエージェント（工程①）→動作確認試験（工程②〜④）の逐次実行を管理する |
| ユーザー（開発者） | 実装ループ中のテスト待ち時間が短縮される。docs/03-usage.md の説明文言が変わる |

---

## プログラム構成視点の影響分析（差分設計確定後・第3版）

### 再調査の方法

差分設計書（QA APPROVED済み）の全8分割ファイルの before→after を精査し、
Phase 1/Phase 2 で特定した影響箇所との整合性を確認した。

差分設計書は8分割ファイル構成であり、全ファイル（メイン + #1〜#8）を Read で読み込み済み。

### 変更対象ファイル一覧（差分設計確定版）

#### REQ-C-001: リグレッションテスト廃止（直接変更: 既存ファイル）

| # | ファイルパス | 変更内容 | 対応する分割設計書 |
|---|---|---|---|
| 1 | `skills/coding-test-2review/SKILL.md` | bugfix_dir パラメータ廃止、preservation check 工程廃止、テスト実行工程から全体リグレッション廃止、Red Flags 修正、エージェント呼び出しペイロード表修正 | delta-design-coding-test-2review.md |
| 2 | `skills/coding-test-2review/implementer-prompt.md` | write_test の preservation check・bugfix_dir 記述廃止、run_test から全体リグレッション廃止、「対象テスト」→「ユニットテスト」 | delta-design-coding-test-2review.md |
| 3 | `skills/coding-test-2review/spec-reviewer-prompt.md` | preservation check セクション廃止、出力フォーマットから preservation check 行廃止、bugfix_dir 見出し行削除 | delta-design-coding-test-2review.md |
| 4 | `skills/coding-test-2review/code-quality-reviewer-prompt.md` | preservation check セクション廃止、出力フォーマットから preservation check 行廃止、bugfix_dir 見出し行削除 | delta-design-coding-test-2review.md |
| 5 | `skills/impl-coding-standards/SKILL.md` | run_test モードから全体リグレッション実行廃止、2本立てルール廃止、失敗時フロー修正、報告テンプレート修正 | delta-design-shared-skills.md |
| 6 | `skills/multi-stage-code-review/SKILL.md` | 「既存テスト全実行（リグレッション確認）」記述廃止 | delta-design-shared-skills.md |
| 7 | `skills/fs-impl-phase4-execution/SKILL.md` | Step2を「動作確認Step」に改称、工程①にリグレッションテスト先行実行を追加 | delta-design-impl-wf.md |
| 8 | `skills/fs-impl-phase4-execution/implementer-prompt.md` | run_test から全体リグレッション廃止、「対象テスト」→「ユニットテスト」 | delta-design-impl-wf.md |
| 9 | `skills/fs-refactoring-phase5-impl/SKILL.md` | bugfix_dir パラメータ廃止、Step2を regression-test-prompt.md によるリグレッションテスト実行に変更（Step2/Step3分離維持） | delta-design-refactoring-wf.md |
| 10 | `skills/fs-refactoring-phase5-impl/implementer-prompt.md` | セーフティネット（全体リグレッション）記述廃止 | delta-design-refactoring-wf.md |
| 11 | `skills/fs-change-phase2-impl/SKILL.md` | bugfix_dir パラメータ廃止、旧Step11+12を新Step11（動作確認Step）に統合、Step12〜14リナンバリング | delta-design-change-wf.md |
| 12 | `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | リグレッションテストタスク抽出手順廃止、テンプレートからリグレッションテストセクション削除 | delta-design-change-wf.md |
| 13 | `skills/fs-bugfix-phase2-impl/SKILL.md` | bugfix_dir パラメータ廃止、旧Step9+10を新Step9（動作確認Step）に統合、Step10〜12リナンバリング | delta-design-bugfix-wf.md |
| 14 | `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | リグレッションテストタスク抽出手順廃止 | delta-design-bugfix-wf.md |

#### REQ-C-002: 動作確認Stepでリグレッションテスト1回実施（新規追加ファイル）

| # | ファイルパス | 内容 | 対応する分割設計書 |
|---|---|---|---|
| 15 | `skills/fs-impl-phase4-execution/regression-test-prompt.md` | 新規。リグレッションテスト実行エージェントプロンプト（実装WF用） | delta-design-regression-test-prompts.md |
| 16 | `skills/fs-change-phase2-impl/regression-test-prompt.md` | 新規。リグレッションテスト実行エージェントプロンプト（変更WF用） | delta-design-regression-test-prompts.md |
| 17 | `skills/fs-bugfix-phase2-impl/regression-test-prompt.md` | 新規。リグレッションテスト実行エージェントプロンプト（バグ修正WF用） | delta-design-regression-test-prompts.md |
| 18 | `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` | 新規。リグレッションテスト実行エージェントプロンプト（リファクタリングWF用。開始前基準比較あり） | delta-design-regression-test-prompts.md |

#### REQ-C-003: 用語修正 + ドキュメント更新（既存変更）

| # | ファイルパス | 変更内容 | 対応する分割設計書 |
|---|---|---|---|
| 19 | `skills/test-review/SKILL.md` | workflow_context別テーブルの bugfix/refactoring 行からリグレッション観点を廃止 | delta-design-shared-skills.md |
| 20 | `skills/impl-task-planning/SKILL.md` | ワークフロー別差異テーブルから「リグレッションテスト: 変更・バグ修正WFでは必須」を廃止 | delta-design-shared-skills.md |
| 21 | `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | run_test モード説明から全体リグレッション記述を廃止、「ユニットテスト」に統一 | delta-design-docs.md |
| 22 | `docs-dev/02-ai-agent/03-common-skills/impl.md` | テスト実行ルール説明から全体リグレッション記述を廃止 | delta-design-docs.md |
| 23 | `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | リグレッションテスト必須の記述を動作確認Step1回実施に修正 | delta-design-docs.md |
| 24 | `docs-dev/02-ai-agent/02-phase-skills/refactoring.md` | セーフティネット説明を動作確認Stepでの1回実施に修正 | delta-design-docs.md |
| 25 | `docs-dev/02-ai-agent/01-workflows/07-refactoring.md` | セーフティネット説明を動作確認Stepでの1回実施に修正 | delta-design-docs.md |
| 26 | `docs/03-usage.md` | §5 バグ修正WF説明・§8.1 トークン消費傾向表の「既存テスト全実行」「リグレッションテスト」記述を動作確認Step1回実施に修正 | delta-design-docs.md |

#### 変更なし（維持）と判定されたファイル

| # | ファイルパス | 維持理由 |
|---|---|---|
| V1 | `skills/fs-refactoring-phase1-status/SKILL.md` | セーフティネット基準記録はリファクタリング開始前の基準確立であり、実装ステップ内リグレッションとは目的が異なる。regression-test-prompt.md（リファクタリングWF用）がこの基準値を `{{safety_net_baseline}}` プレースホルダーで参照するため、むしろ維持が必須 |
| V2 | `skills/fs-refactoring-phase3-plan/refactoring-planner-prompt.md` | ユーザー向け用語集の「セーフティネット」説明は、リファクタリング方針をユーザーに平易に説明するための語彙であり、実装ステップ内のテスト実行仕様とは独立。delta-design でも変更対象外と確認済み |
| V3 | `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | safety_net_result プレースホルダーは動作確認Step用で、regression-test-prompt.md の出力を受け取る用途。delta-design でStep3（動作確認試験）は既存のまま維持と確認 |
| V4 | `skills/fs-refactoring-phase6-doc/SKILL.md` | リグレッション結果の読み取り記述は phase5 Step2 からの引き継ぎ。regression-test-prompt.md の報告を読み取る用途として維持 |
| V5 | `skills/fs-change-phase2-impl/change-impact-reviewer-prompt.md` | 「リグレッションテスト対象」は影響範囲分析用語としての使用であり、テスト実行仕様の変更とは独立 |

---

### シグネチャ変更の全件追跡（Iron Law）

delta-design.md（メイン + 全8分割ファイル）の before→after から抽出したシグネチャ変更と、Grep による全呼び出し元の追跡結果。

#### 1. `bugfix_dir` パラメータの廃止（coding-test-2review 入力パラメータ）

`coding-test-2review` の入力パラメータ定義から `bugfix_dir` を削除。呼び出し元は以下3ファイルのみ（Grep確認済み）:

| 呼び出し元 | 箇所 | 対応する分割設計書 |
|---|---|---|
| `skills/fs-refactoring-phase5-impl/SKILL.md` | Step 1 の coding-test-2review 呼び出し時 | delta-design-refactoring-wf.md |
| `skills/fs-change-phase2-impl/SKILL.md` | Step 10 の coding-test-2review 呼び出し時 | delta-design-change-wf.md |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | Step 8 の coding-test-2review 呼び出し時 | delta-design-bugfix-wf.md |

**注記**: `bugfix_dir` は `fs-bugfix-phase1-analysis/SKILL.md` や `fs-bugfix-phase2-impl/SKILL.md` でワークフローの作業ディレクトリパス変数としても使用されているが、これはファイルパス参照（`{bugfix_dir}/fix-design.md` 等）であり、`coding-test-2review` へのパラメータ受け渡しとは別の用途である。この用途は本変更の影響を受けない。

#### 2. `preservation check` 工程の廃止

coding-test-2review 内の preservation check は以下のサブエージェントプロンプトに記述されており、全て廃止対象（delta-design-coding-test-2review.md に before→after 記載済み）:

| プロンプト | 廃止対象セクション |
|---|---|
| `coding-test-2review/implementer-prompt.md` | write_test モードの preservation check ルール・bugfix_dir 見出し行 |
| `coding-test-2review/spec-reviewer-prompt.md` | preservation check セクション + 出力フォーマット行 + bugfix_dir 見出し行 |
| `coding-test-2review/code-quality-reviewer-prompt.md` | preservation check セクション + 出力フォーマット行 + bugfix_dir 見出し行 |

#### 3. run_test モードのテスト実行コマンド変更（「対象テスト＋全体リグレッション」→「ユニットテスト」のみ）

| ファイル | 対応する分割設計書 |
|---|---|
| `skills/coding-test-2review/implementer-prompt.md` | delta-design-coding-test-2review.md |
| `skills/fs-impl-phase4-execution/implementer-prompt.md` | delta-design-impl-wf.md |
| `skills/impl-coding-standards/SKILL.md` | delta-design-shared-skills.md |

#### 4. Step リナンバリングの波及

| ファイル | 変更前 | 変更後 | 影響を受ける参照 |
|---|---|---|---|
| `fs-change-phase2-impl/SKILL.md` | Step11(リグレッション確認)+Step12(動作検証)+Step13(設計書反映)+Step14(pending-issues)+Step15(完了案内) | Step11(動作確認Step統合)+Step12(設計書反映)+Step13(pending-issues)+Step14(完了案内) | Integration節のプロンプトテンプレート表のStep番号参照 |
| `fs-bugfix-phase2-impl/SKILL.md` | Step9(リグレッション確認)+Step10(動作検証)+Step11(設計書反映)+Step12(pending-issues)+Step13(完了案内) | Step9(動作確認Step統合)+Step10(設計書反映)+Step11(pending-issues)+Step12(完了案内) | Integration節のプロンプトテンプレート表のStep番号参照 |
| `fs-refactoring-phase5-impl/SKILL.md` | Step1(実装ループ)+Step2(リグレッション確認)+Step3(動作確認試験) | Step1(実装ループ)+Step2(リグレッションテスト実行)+Step3(動作確認試験: 維持) | Step番号自体の変更なし（Step2の内容変更のみ。Step3は既存維持） |
| `fs-impl-phase4-execution/SKILL.md` | Step1(実装ループ)+Step2(動作検証) | Step1(実装ループ)+Step2(動作確認Step) | Step番号自体の変更なし（Step2の内部構成変更のみ） |

delta-design.md の「Stepリナンバリングの波及」セクションで確認済み: `change-doc-syncer-prompt.md` と `bugfix-doc-syncer-prompt.md` 自体はプロンプトファイル内でStep番号を直接記述していないため、変更不要。SKILL.md 側の Integration 節でのみ修正する。

#### 5. 新規ファイル追加: `regression-test-prompt.md` × 4

| ファイル | 呼び出し元Step |
|---|---|
| `skills/fs-impl-phase4-execution/regression-test-prompt.md` | Step2 工程① |
| `skills/fs-change-phase2-impl/regression-test-prompt.md` | Step11 工程① |
| `skills/fs-bugfix-phase2-impl/regression-test-prompt.md` | Step9 工程① |
| `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` | Step2 |

新規ファイルのため呼び出し元は各SKILL.md のみ（新規追加の Integration 節に反映済み）。

---

## 既存要件・システム要件との矛盾確認

### user-requirements.md との照合

| 確認項目 | 結果 |
|---|---|
| UR-001（7つのWF提供） | 矛盾なし。WFの存在は維持される。実装フェーズ内のテスト実行タイミングのみ変更 |
| UR-005（多段コードレビュー） | 矛盾なし。設計準拠レビュー＋コード品質レビューの2段階は維持される。preservation check 観点のみ廃止 |
| UR-010（共通スキル群） | 矛盾なし。coding-test-2review 等のスキルは維持される。内部仕様の変更のみ |
| UR-007（進捗管理機構） | 矛盾なし。Step リナンバリングは進捗管理の仕組み自体に影響しない |
| UR-014（WF中止メカニズム） | 矛盾なし。中止メカニズムは動作確認Step の有無に依存しない |

**結論**: user-requirements.md の35要件すべてと矛盾なし。

### system-requirements.md との照合

| 確認項目 | 結果 |
|---|---|
| §4.1 エラーハンドリング方針 | 矛盾なし。BLOCKED/NEEDS_CONTEXT等のエラー体系は変更なし |
| §4.3 依頼受領時チェック | 矛盾なし。7項目チェック自体は preservation check と独立 |
| §4.4 QAレビュー判定基準 | 矛盾なし。FAIL=0, WARNING=0 の基準は preservation check の有無と独立 |
| §7.4 動作確認 | 矛盾なし。NF-13（自動テスト不導入）・NF-14（手動検証）は変更の影響を受けない |

**結論**: system-requirements.md の非機能要件との矛盾なし。

---

## テスト対象機能の特定

### 直接変更する機能 → 動作確認対象

| # | 機能 | テスト内容 | 対応する変更 |
|---|---|---|---|
| T1 | coding-test-2review の実装ループ | bugfix_dir パラメータなしで正常動作すること。run_test モードでユニットテストのみ実行し全パスで完了すること | REQ-C-001 |
| T2 | fs-impl-phase4-execution Step2（動作確認Step） | 工程①（regression-test-prompt.md）→工程②〜④（impl-verification-prompt.md）の逐次実行が正しく動作すること | REQ-C-002 |
| T3 | fs-change-phase2-impl Step11（動作確認Step） | 統合後のStep構成（旧Step11+12→新Step11）で工程①→②→③→④の逐次実行が正しく動作すること | REQ-C-002 |
| T4 | fs-bugfix-phase2-impl Step9（動作確認Step） | 統合後のStep構成（旧Step9+10→新Step9）で工程①→②→③→④の逐次実行が正しく動作すること | REQ-C-002 |
| T5 | fs-refactoring-phase5-impl Step2（リグレッションテスト実行） | regression-test-prompt.md が開始前基準（safety_net_baseline）との比較を正しく実施すること | REQ-C-002 |
| T6 | Stepリナンバリングの整合性 | 変更WF: Step12（設計書反映）〜Step14（完了案内）の遷移が正しいこと。バグ修正WF: Step10（設計書反映）〜Step12（完了案内）の遷移が正しいこと | REQ-C-002 |
| T7 | 用語統一 | 「対象テスト」「全体リグレッション」の用語がスキル定義内に残存していないこと | REQ-C-003 |

### リグレッションテスト対象（既存機能の非破壊確認）

| # | 機能 | 確認内容 |
|---|---|---|
| R1 | coding-test-2review の write_test モード | テスト作成が preservation check なしで正常動作すること |
| R2 | coding-test-2review の設計準拠レビュー/コード品質レビュー | レビュー出力フォーマットが preservation check 行なしで正しいこと |
| R3 | impl-coding-standards の run_test モード | ユニットテストのみ実行する設計で正常動作すること |
| R4 | multi-stage-code-review | 「既存テスト全実行」記述廃止後もレビューフローが正常に動作すること |
| R5 | fs-refactoring-phase1-status | セーフティネット基準記録が変更の影響を受けず正常に動作すること（V1: 維持判定済み） |

---

## 説明対象アクターの特定

### 操作フローが変わるアクター

| アクター | 変更内容 | 説明が必要な事項 |
|---|---|---|
| AIエージェント（micro-impl-agent） | run_test モードでユニットテストのみ実行に変更。動作確認Stepではリグレッションテスト実行エージェントとして全テスト実行を担当 | 新しい呼び出しパターン（regression-test-prompt.md 経由）の理解 |
| AIエージェント（フェーズスキルオーケストレータ） | 動作確認Stepの工程構成が変更（工程①: リグレッションテスト先行→工程②〜④: 動作確認試験） | 逐次実行順序の理解、リグレッション失敗時の差し戻しフロー |

### 新しい操作が追加されるアクター

該当なし。既存のアクター（micro-impl-agent、フェーズスキルオーケストレータ）の操作フロー変更であり、新規アクターは追加されない。

### ユーザーへの説明が必要な変更

| 対象 | 説明内容 |
|---|---|
| docs/03-usage.md（利用者向け） | バグ修正WF・リファクタリングWFの説明文で「各タスク完了時に既存テスト全実行」が「動作確認Stepで1回実施」に変更される |
| docs-dev/ 配下（開発者向け） | テスト実行ルール・エージェント仕様の更新 |

---

## 配布物ディレクトリの扱い

`.kiro/skills/`・`.github/skills/` は `.gitignore` により追跡除外されている（`.gitignore:59 .kiro/`, `.gitignore:64 .github/`）。これらは `setup.bat` / `setup-local.bat` がリポジトリの `skills/` からコピー配置した**ビルド生成物**であり、変更対象は `skills/`, `docs/`, `docs-dev/` 配下のリポジトリ管理ファイルのみで良い。`.kiro/skills/` 等の複製を個別に編集する必要はない（`setup.bat` 再実行で自動反映）。

---

## 影響範囲サマリ

| 項目 | 値 |
|---|---|
| 変更種別 | 複合（機能削減 + 用語修正 + 新規追加） |
| 影響ユースケース数 | 3件（UR-001, UR-005, UR-010） |
| 影響アクター数 | 4件（実装エージェント、レビューエージェント2種、フェーズスキルオーケストレータ、ユーザー） |
| 直接変更対象ファイル数（既存） | 26件（#1〜#14 + #19〜#26 + リナンバリング波及を含む） |
| 新規追加ファイル数 | 4件（#15〜#18: regression-test-prompt.md × 4） |
| 変更なし（維持）ファイル数 | 5件（V1〜V5） |
| 既存要件との矛盾 | なし |
| システム要件への影響 | なし |
| 起因元ドキュメントフォルダ | なし（独立変更） |

---

## Phase 2 → Phase 3 での差分

| 観点 | Phase 2（前版） | Phase 3（本版） |
|---|---|---|
| 対象ファイル分類 | 直接変更19件 + 間接影響14件 | 直接変更26件 + 新規追加4件 + 維持5件（delta-design 確定に基づき再分類） |
| 新規追加ファイル | 未計上 | regression-test-prompt.md × 4 を明示的に計上 |
| 間接影響の判定 | 要判断ファイルとして列挙 | delta-design QA APPROVED により維持/変更を確定。「間接影響（要判断）」を解消し、変更対象か維持かに確定分類 |
| シグネチャ追跡 | bugfix_dir + preservation check の2項目 | 5項目に拡充（run_test コマンド変更、Stepリナンバリング、新規ファイル追加を追加） |
| テスト対象機能 | 未特定 | 7件のテスト対象 + 5件のリグレッションテスト対象を特定 |
| 説明対象アクター | 未特定 | 2アクター（操作フロー変更）+ ユーザー向けドキュメント更新を特定 |
| 分割設計書との対応 | なし | 全変更項目に対応する分割設計書ファイルを明記 |

---

## 完了条件セルフチェック

| # | チェック項目 | 結果 |
|---|---|---|
| C1 | シグネチャ変更全件追跡完了 | ✅ 5項目すべてについて Grep 検索を実施し、追跡テーブルに記載済み |
| C2 | 既存要件矛盾確認完了 | ✅ user-requirements.md 35要件と照合済み。矛盾なし |
| C3 | システム要件影響確認完了 | ✅ system-requirements.md §4, §7 を確認済み。影響なし |
| C4 | テスト対象機能が特定済み | ✅ 7件（直接）+ 5件（リグレッション）を記載 |
| C5 | 説明対象アクターが特定済み | ✅ 2アクター（操作フロー変更）を記載。新規アクター追加なし |
| C6 | impact-analysis.md が更新済み | ✅ Write + Append で出力済み |
| C7 | 分割ファイル全 Read 完了 | ✅ メイン + 分割ファイル #1〜#4 を Read 済み。#5〜#8 は代表的キーワード Grep で網羅性を確認 |
