# 影響範囲分析書（更新版 — delta-design QA APPROVED 後の再検討）

## 変更種別
**変更**（既存スキルファイルの書き換え） + 一部追加（REQ-C-004: folder-merge-check への testing/ ルール追加）

---

## アクター視点の影響分析

### 影響するユースケース

| # | ユースケース | 関連要件ID | 影響内容 |
|---|---|---|---|
| 1 | 変更WFの動作確認実行 | UR-001, UR-005 | Step 12 の手順と出力形式が変わる。verification-report.md → testing/ 配下の機能別試験書に移行 |
| 2 | バグ修正WFの動作確認実行 | UR-001, UR-005 | Step 10 の手順と出力形式が変わる。同上 |
| 3 | リファクタリングWFの動作確認実行 | UR-001, UR-005 | Step 3 の手順と出力形式が変わる。同上 |
| 4 | フォルダ統合時の testing/ 取り扱い | UR-024 | 統合時に testing/ 配下を old/ に移動するルール追加 |

### 影響するアクター

| # | アクター | 影響内容 |
|---|---|---|
| 1 | フェーズスキル（fs-change-phase2-impl） | 動作確認ステップの記述と完了条件が変わる |
| 2 | フェーズスキル（fs-bugfix-phase2-impl） | 同上 |
| 3 | フェーズスキル（fs-refactoring-phase5-impl） | 同上 |
| 4 | 動作確認サブエージェント（verification-prompt経由） | プロンプト構造が4段階構造に変わり、出力先が testing/ 配下になる |
| 5 | folder-merge-check スキル | testing/ 配下の移動ルールが追加される |

### 影響しないアクター（確認済み）

| # | アクター | 確認結果 |
|---|---|---|
| 1 | coding-test-2review | verification-report.md / testing/ への参照なし。影響なし |
| 2 | doc-sync | verification-report.md / testing/ への参照なし。影響なし |
| 3 | phase-report-check / phase-compliance-check | verification-report.md / testing/ への参照なし。影響なし |
| 4 | fs-impl-phase5-final-check | testing/manual-test-plan.md を参照するが、これは実装WFの `.aide/specs/{feature_name}/testing/` パスであり、本変更の `{changes_dir}/testing/` とは別パス。混在なし |
| 5 | エンドユーザー | スキルファイルの内部記述変更のみ。ユーザー操作やUI変更なし |

---

## プログラム構成視点の影響分析

### 変更対象ファイル

| # | ファイルパス | 変更内容 | REQ |
|---|---|---|---|
| 1 | `skills/fs-change-phase2-impl/SKILL.md` | Step 12 の動作確認ステップ定義書き換え、成果物テーブル変更 | REQ-C-001, REQ-C-003 |
| 2 | `skills/fs-change-phase2-impl/change-verification-prompt.md` | プロンプト全体を4段階構造に書き換え | REQ-C-002 |
| 3 | `skills/fs-bugfix-phase2-impl/SKILL.md` | Step 10 の動作確認ステップ定義書き換え、成果物テーブル変更 | REQ-C-001, REQ-C-003 |
| 4 | `skills/fs-bugfix-phase2-impl/bugfix-verification-prompt.md` | プロンプト全体を4段階構造に書き換え | REQ-C-002 |
| 5 | `skills/fs-refactoring-phase5-impl/SKILL.md` | Step 3 の動作確認ステップ定義書き換え、成果物テーブル変更 | REQ-C-001, REQ-C-003 |
| 6 | `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | プロンプト全体を4段階構造に書き換え | REQ-C-002 |
| 7 | `skills/folder-merge-check/SKILL.md` | Step 4 移動ルールに testing/ → old/ ルール追加 | REQ-C-004 |

### 依存関係ファイル（参照のみ・変更なし）

| # | ファイルパス | 依存の種類 | 確認結果 |
|---|---|---|---|
| 1 | `skills/fs-impl-phase4-execution/SKILL.md`（Step 2） | リファレンス実装（新構造の正本） | 変更なし。verification-report.md が成果物テーブルに残存するが、これは実装WF固有でスコープ外 |
| 2 | `skills/fs-impl-phase4-execution/impl-verification-prompt.md` | リファレンスプロンプト（新構造の正本） | 変更なし |
| 3 | `skills/doc-sync/SKILL.md` | フォルダ統合後の history.md 更新処理との整合確認 | verification-report.md / testing/ への参照なし。影響なし |
| 4 | `skills/fs-impl-phase5-final-check/SKILL.md` | testing/manual-test-plan.md を参照 | パスが異なる（.aide/specs/{feature_name}/testing/ vs {changes_dir}/testing/）。影響なし |


### シグネチャ変更追跡（インターフェース相当）

本変更はMarkdownスキルファイルの記述統一であり、プログラムコード変更は伴わない。スキルファイルの「インターフェース」に相当する以下の変更点を追跡する。

| # | 変更されるインターフェース | 変更内容 | 参照元の確認結果 |
|---|---|---|---|
| 1 | 成果物テーブル（3WF）: verification-report.md 行 → testing/ 配下2行 | 成果物パスが変わる | 他スキルからの参照なし（各WFのSKILL.md内のみ） |
| 2 | 完了条件（3WF）: verification-report.md 存在 → test-{機能名}-test-plan.md 存在 | 完了判定の対象ファイルが変わる | 後続ステップの状態判定はOK/NG結果のみ参照。ファイルパスを参照しない。影響なし |
| 3 | プロンプト出力先: verification-report.md → {作業フォルダ}/testing/ 配下 | サブエージェントの出力先が変わる | サブエージェントの出力はFS経由で受領。他スキルが直接参照する箇所なし |
| 4 | フェーズレポート記載項目: 動作確認方法/手順/結果 → 動作確認サブエージェントの出力のみ | レポートの記載項目が簡略化 | phase-report-check は固定フォーマットを要求しない。影響なし |
| 5 | folder-merge-check 移動ルール b の対象例: testing/ 追加 | old/ 移動対象の拡張 | 追加のみ（既存対象例に影響なし） |

### 参照関係の整理

```
[リファレンス（変更なし）]
  impl-verification-prompt.md  ←── 4段階構造の正本
  fs-impl-phase4-execution/SKILL.md Step 2  ←── ステップ定義の正本

[変更対象]
  change-verification-prompt.md  ──→ impl-verification-prompt.md を参考に書き換え
  bugfix-verification-prompt.md  ──→ 同上
  refactoring-verification-prompt.md  ──→ 同上

  fs-change-phase2-impl/SKILL.md Step 12  ──→ fs-impl-phase4-execution/SKILL.md Step 2 を参考に書き換え
  fs-bugfix-phase2-impl/SKILL.md Step 10  ──→ 同上
  fs-refactoring-phase5-impl/SKILL.md Step 3  ──→ 同上

  folder-merge-check/SKILL.md Step 4  ──→ testing/ の old/ 移動ルール追加

[確認済み非影響]
  coding-test-2review  ──→ 参照なし
  doc-sync  ──→ 参照なし
  phase-report-check / phase-compliance-check  ──→ 参照なし
  fs-impl-phase5-final-check  ──→ 別パス（.aide/specs/{feature_name}/testing/）を参照。本変更とは無関係
```

---

## 後続ステップへの影響分析

### 変更WF: Step 12 → Step 13（設計書反映）

| 確認項目 | 結果 |
|---|---|
| Step 13 が verification-report.md を入力として使用するか | 使用しない。doc-sync が delta-design.md を入力として使用 |
| Step 13 の発火条件に完了条件変更の影響があるか | なし。Step 12 → Step 13 の遷移は「OK＋承認」のみで判定 |

### バグ修正WF: Step 10 → Step 11（設計書反映）

| 確認項目 | 結果 |
|---|---|
| Step 11 が verification-report.md を入力として使用するか | 使用しない。doc-sync が fix-design.md を入力として使用 |
| Step 11 の発火条件に完了条件変更の影響があるか | なし。Step 10 → Step 11 の遷移は「OK＋承認」のみで判定 |

### リファクタリングWF: Step 3 → 後処理

| 確認項目 | 結果 |
|---|---|
| 後処理が verification-report.md を入力として使用するか | 使用しない。後処理は phase-report-check のみ |
| 後処理の発火条件に完了条件変更の影響があるか | なし。Step 3 → 後処理の遷移は「OK＋承認」のみで判定 |

---

## 既存要件との整合確認

### user-requirements.md との整合

| 関連要件 | 整合状況 |
|---|---|
| UR-001（7つのWF提供） | ✅ 整合。3WFの動作確認ステップが改善されるが、WF自体の提供に影響なし |
| UR-005（多段コードレビュー） | ✅ 整合。動作確認はレビュー体系の一部であり、構造の統一は品質向上に寄与 |
| UR-007（進捗管理機構） | ✅ 整合。フェーズレポートの記載項目変更は phase-report-check のフォーマットに影響しない |
| UR-024（folder-merge-check） | ✅ 整合。testing/ 配下の old/ 移動ルールは UR-024 の目的（フォルダ統合判定）を拡張する |

### system-requirements.md との整合

| 関連要件 | 整合状況 |
|---|---|
| §1.3 7つのWF | ✅ 整合。WF構成に変更なし |
| §3.2 .aide/specs/ 構造 | ✅ 整合。testing/ は各WFの作業フォルダ（changes/, bugfix/, refactoring/）内に配置。.aide/specs/ 直下の構造変更なし |
| §4.1 エラー分類 | ✅ 整合。OK/NG判定ロジック維持 |
| §4.2 エラー伝播ルール | ✅ 整合。サブエージェント→FS→ユーザーの伝播に変更なし |
| §5.1 フェーズレポート | ✅ 整合。レポート記載項目の簡略化はフォーマット要件に違反しない |

### 矛盾・懸念事項

なし。本変更は既存要件との矛盾を生じない。

---

## テスト対象機能の特定

### 直接変更する機能（動作確認必須）

| # | 機能 | 確認内容 |
|---|---|---|
| 1 | 変更WF動作確認ステップ（Step 12） | change-verification-prompt.md のプレースホルダー埋込→サブエージェント起動→結果受領→testing/ 配下ファイル存在確認が正しく機能すること |
| 2 | バグ修正WF動作確認ステップ（Step 10） | bugfix-verification-prompt.md のプレースホルダー埋込→サブエージェント起動→結果受領→testing/ 配下ファイル存在確認が正しく機能すること |
| 3 | リファクタリングWF動作確認ステップ（Step 3） | refactoring-verification-prompt.md のプレースホルダー埋込→サブエージェント起動→結果受領→testing/ 配下ファイル存在確認が正しく機能すること |
| 4 | folder-merge-check 統合処理（Step 4） | testing/ フォルダが存在する作業フォルダの統合時に、testing/ が old/{日付}/testing/ に正しく移動されること |

### 影響を受ける可能性がある機能（リグレッション確認対象）

| # | 機能 | 確認内容 | リスク |
|---|---|---|---|
| 1 | 後続ステップの遷移（Step 13/11/後処理） | 動作確認OK後の後続ステップが正しく起動すること | 低（OK/NG結果のみ参照） |
| 2 | coding-test-2review との連携 | 実装ループ→動作確認の遷移が正しく機能すること | 低（verification-report.md への参照なし） |
| 3 | NG時の差し戻し | 動作確認NG時に正しいステップへ差し戻されること | 低（状態判定ロジック不変） |

---

## 説明対象アクターの特定

| # | アクター | 影響の有無 | 説明の必要性 |
|---|---|---|---|
| 1 | エンドユーザー（開発者） | なし | 不要。スキルファイル内部の記述変更のみ。ユーザー操作・UI変更なし |
| 2 | オーケストレータ（AIエージェント） | あり | 不要。スキルactivate時に新しいSKILL.mdが読み込まれるため、自動的に新構造に従う |
| 3 | 動作確認サブエージェント | あり | 不要。新しいverification-prompt.mdがプロンプトとして渡されるため、自動的に新構造に従う |

**結論**: 本変更はスキルファイルの記述統一であり、明示的な説明や周知が必要なアクターは存在しない。

---

## 起因元ドキュメントフォルダの特定

### git blame 結果

| 変更対象ファイル | 直近コミット | Docs: フッター |
|---|---|---|
| `skills/fs-change-phase2-impl/SKILL.md` | `884dfc1` | `Docs: .aide/specs/aide-powers/changes/202606251930-change-wf-phase2-step12-verification/` |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | `884dfc1` | 同上 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | `9f224f1` | `Docs: .aide/specs/aide-powers/changes/202606291930-refactoring-wf-verification-step-enhancement/` |

### 起因元フォルダ

| # | パス | 備考 |
|---|---|---|
| 1 | `.aide/specs/aide-powers/changes/202606251930-change-wf-phase2-step12-verification/` | 変更WF・バグ修正WFの動作確認ステップを導入したWF |
| 2 | `.aide/specs/aide-powers/changes/202606291930-refactoring-wf-verification-step-enhancement/` | リファクタリングWFの動作確認ステップを導入したWF |

**判定**: 起因元フォルダが2件存在する。本変更は両起因元WFの後続改善であるため、フォルダ統合判定（folder-merge-check）の対象となりうる。

---

## 影響範囲サマリー

| 項目 | 値 |
|---|---|
| 変更種別 | 変更（+ 一部追加） |
| 影響ユースケース数 | 4件 |
| 影響アクター数 | 5件（+ 確認済み非影響5件） |
| 変更対象ファイル数 | 7件 |
| 依存関係ファイル数 | 4件（全て変更なし確認済み） |
| 起因元ドキュメントフォルダ | 2件（上記参照） |
| OK/NG判定ロジックへの影響 | なし（既存ロジック維持） |
| 後続ステップ判定への影響 | なし（OK/NG結果のみ参照。ファイルパス不参照） |
| 外部振る舞い変更 | なし（内部構造の統一のみ） |
| 既存要件との矛盾 | なし |
| 説明対象アクター | なし（自動的に新構造に従う） |
