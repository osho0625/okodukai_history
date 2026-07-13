# 影響範囲分析（差分設計後 再精査版）

## 変更種別
両方（新規ファイル追加 + 既存ファイル変更）

## スキル間インターフェース影響確認

### 結論: スキル間IFに変更なし

| 観点 | 影響 | 詳細 |
|---|---|---|
| Input from caller | なし | 変更なし（既存の feature_name, refactoring_dir, doc_index_path, bugfix_dir で足りる） |
| Output to next phase | なし | 変更なし（refactoring_dir のみ） |
| 前フェーズ（phase4）からの呼び出しIF | なし | 呼び出しパラメータに変更なし |
| 後フェーズ（phase6）への遷移IF | なし | 後処理の遷移条件に変更なし |
| REQUIRED SKILL | なし | 追加なし（サブエージェントプロンプトは SKILL ではない） |

### 補足
- 本変更はMarkdownスキル定義ファイルの変更であり、プログラミング言語のシグネチャ変更は発生しない
- refactoring-verification-prompt.md は本スキルディレクトリ内のリソースであり、他スキルから参照されることはない
- 新規生成される verification-report.md は `{refactoring_dir}` 配下に出力されるが、phase6 への遷移IFには影響しない

---

## アクター視点の影響

### 影響を受けるユースケース
| ユースケース | 影響内容 |
|---|---|
| UR-001: 7つのワークフロー提供 | リファクタリングWFの動作検証ステップの品質向上。Step 3 がサブエージェント起動型の体系的な動作確認に変更される |
| UR-005: 多段コードレビュー | coding-test-2review 後の追加検証として、verification-report.md による体系的な検証結果記録が追加される |

### 影響を受けるアクター
| アクター | 影響内容 | 影響度 |
|---|---|---|
| AIエージェント（オーケストレータ） | fs-refactoring-phase5-impl の Step 3 処理フローが変更され、サブエージェント起動・プレースホルダー置換・verification-report.md存在確認・ユーザー承認の新処理が必要になる | 高 |
| AIエージェント（サブエージェント） | refactoring-verification-prompt.md に基づく動作確認試験の実行と verification-report.md の出力が新たに求められる | 高 |
| ユーザー（開発者） | 動作検証の結果が verification-report.md として体系化され、OK/NG 判断を求められるフローに変更される（従来は自由形式の依頼のみ） | 中 |

---

## プログラム構成視点の影響

### 変更対象ファイル
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | 追加 | リファクタリング用動作確認プロンプトテンプレートの新規作成 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | 変更 | Step 3 を「ユーザー動作検証依頼」からサブエージェント起動型の動作確認試験ステップに書き換え。Integration セクションに新ファイルへの参照追加。成果物テーブルに verification-report.md 追加 |

### 更新が必要な設計資料
| 設計資料 | 更新内容 | 優先度 |
|---|---|---|
| program-structure.md | `#### fs-refactoring-phase5-impl` セクションのプロセス行・成果物行・プロンプトテンプレート行を更新 | 必須 |

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 | 対応要否 |
|---|---|---|---|
| `skills/fs-refactoring-phase4-design/SKILL.md` | 後処理から `fs-refactoring-phase5-impl` を次フェーズとして呼び出し | 低（呼び出しIFに変更なし） | 不要 |
| `skills/fs-refactoring-phase6-doc/SKILL.md` | `fs-refactoring-phase5-impl` 完了後に呼ばれる次フェーズ | 低（前フェーズの完了条件を満たせば遷移するため影響なし） | 不要 |
| `skills/impl-coding-standards/SKILL.md` | リファクタリングWFでの利用先として参照 | 低（参照のみ、処理フロー変更による影響なし） | 不要 |
| `skills/fs-refactoring-phase7-final-check/SKILL.md` | 最終チェックで全フェーズ成果物を確認 | 中（新規成果物 verification-report.md が追加されるが、スコープ外） | スコープ外 |
| `skills/coding-test-2review/SKILL.md` | Step 1 で呼ばれるが、Step 3 変更とは独立 | 低（独立した Step のため影響なし） | 不要 |

---

## 既存要件との矛盾確認

### 確認結果: 矛盾なし

| 既存要件 | 確認内容 | 判定 |
|---|---|---|
| UR-001（7WF提供） | リファクタリングWFの品質向上であり、WF構成自体に変更なし | 矛盾なし |
| UR-005（多段コードレビュー） | coding-test-2review の後に追加検証を行うもので、多段レビューの構造を壊さない | 矛盾なし |
| UR-014（中止メカニズム） | Step 3 のNG時差し戻しフローはWF中止とは別メカニズム。中止はfinal-check経由で従来通り | 矛盾なし |
| Q-01（手動検証） | aide-powers自体の検証方法（インストーラ＋ハブスキル発動確認）は変更しない。本変更はaide-powersが扱うプロジェクトの動作確認手法 | 矛盾なし |
| NF-13（自動テストなし） | 本変更はスキル定義Markdownの変更であり、自動テストフレームワーク導入ではない | 矛盾なし |
| C-03（手動検証のみ） | 本変更の検証もインストーラ実行＋ハブスキル発動の手動検証で行う | 矛盾なし |

### システム要件影響確認

| システム要件 | 影響 | 判定 |
|---|---|---|
| §1.3 7つのワークフロー | リファクタリングWFのフェーズ数(7)に変更なし | 影響なし |
| §4.1 エラー分類 | Step 3 のNG時差し戻しは既存のエラー伝播ルールに準拠 | 影響なし |
| §4.2 エラー伝播ルール | サブエージェント→FS→ユーザーの伝播パターンに準拠 | 影響なし |
| §5.1 フェーズレポート | fs-refactoring-phase5-report.txt のStep 3記載項目が変更されるが、フォーマット方針自体に影響なし | 影響なし |
| §7.6 ファイル書き込み制約 | refactoring-verification-prompt.md は50行超のため分割書き込みルール適用 | 実装時に準拠 |

---

## テスト対象機能

### テスト方針
本変更はMarkdownスキル定義ファイルの変更であるため、自動テストは不可能。手動検証により正しさを確認する。

### テスト対象一覧

| # | テスト対象 | 確認内容 | 確認方法 |
|---|---|---|---|
| T-1 | refactoring-verification-prompt.md の構成 | 他3FSのverification-prompt.mdと同パターンのセクション構成であること | ファイル目視確認（セクション1〜9が揃っていること） |
| T-2 | プレースホルダー定義 | FSが実データで置き替えるパラメータが7個定義されていること | ファイル目視確認 |
| T-3 | リファクタリング固有試験観点 | 外部振る舞い保持試験がメイン検証項目として定義されていること | ファイル目視確認 |
| T-4 | verification-report.md 出力フォーマット | 3種類の試験テーブル（セーフティネット・外部振る舞い保持・リグレッション）が定義されていること | ファイル目視確認 |
| T-5 | SKILL.md Step 3 書き換え | タイトル・処理フロー・完了条件・状態判定が差分設計通りに変更されていること | before/after 差分確認 |
| T-6 | SKILL.md 成果物テーブル | verification-report.md が追加されていること | ファイル目視確認 |
| T-7 | SKILL.md Integration セクション | refactoring-verification-prompt.md への参照が追加されていること | ファイル目視確認 |
| T-8 | program-structure.md 更新 | fs-refactoring-phase5-impl セクションのプロセス行・成果物行・テンプレート行が更新されていること | before/after 差分確認 |
| T-9 | 実動作確認（統合） | リファクタリングWFのStep 3到達時にサブエージェントが起動し、verification-report.mdが出力され、ユーザー承認フローが動作すること | 次回リファクタリングWF実行時に手動確認 |

---

## 説明対象アクター

### 変更内容の周知が必要なアクター

| # | アクター | 説明すべき内容 | 説明のタイミング |
|---|---|---|---|
| A-1 | ユーザー（開発者） | リファクタリングWFのStep 3が「単なる依頼」から「体系的な動作確認試験→承認」フローに変更されたこと。OK/NG判定を求められるようになること | コミットメッセージ、および次回リファクタリングWF使用時 |
| A-2 | AIエージェント（オーケストレータ） | Step 3 でプレースホルダー置換→サブエージェント起動→結果受領→verification-report.md存在確認→ユーザー承認の新処理フロー | SKILL.md の Step 3 記述自体が説明（setup.bat再実行でグローバル反映後、自動適用） |
| A-3 | AIエージェント（サブエージェント） | refactoring-verification-prompt.md の試験実行手順に従い、3種類の試験（セーフティネット・外部振る舞い保持・リグレッション）を実行してverification-report.mdを出力すること | refactoring-verification-prompt.md 自体が説明（Step 3 実行時にプロンプトとして渡される） |

---

## スコープ外として扱う影響

| 影響 | 理由 |
|---|---|
| fs-refactoring-phase7-final-check の成果物確認範囲 | verification-report.md が新規追加されるが、delta-design.mdで明示的にスコープ外と定義済み |
| 他3FSのverification-prompt.mdへの変更 | change-requirements.md で明示的にスコープ外 |
| リファクタリングWFの他Step・他フェーズへの変更 | change-requirements.md で明示的にスコープ外 |

---

## 起因元ドキュメントフォルダ
- パス: なし
- コミットハッシュ: a5938054094232c2ca57cc24dc2a873be4a2e33c
- コミットメッセージ1行目: docs: FS report-style migration - full quality review cycle, key uniqueness, DDD-independent glossary, phase2 passthrough
- 検証結果: Docs: フッターなし
