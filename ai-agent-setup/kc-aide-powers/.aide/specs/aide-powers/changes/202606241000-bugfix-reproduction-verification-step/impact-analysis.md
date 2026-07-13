# 影響範囲分析（差分設計後 再精査版）

## 変更種別
両方（追加 + 変更）

- **追加**: 再現性確認・原因特定Step（新Step 4）の新規挿入、bugfix-investigator-prompt.md の新規作成（REQ-C-001〜004, REQ-C-006）
- **変更**: 既存Step番号の再採番、bugfix-analyzer-prompt.md への入力パラメータ追加（REQ-C-005）

---

## アクター視点の影響

### 影響を受けるユースケース

| ユースケース | 影響内容 |
|---|---|
| UR-001: 7つのワークフロー提供 | バグ修正WF Phase1 の内部Step構成が変更（前処理+9Step+後処理 → 前処理+10Step+後処理） |
| UR-007: 進捗管理機構 | 新Stepに対応するレポート記載項目の追加（再現性判定結果、環境情報収集結果、仮実装ブランチ情報、原因候補） |
| UR-012: エラーハンドリング体系 | 新Stepにおける BLOCKED/NEEDS_CONTEXT/DONE_WITH_CONCERNS の状態遷移定義（既存体系をそのまま適用） |
| UR-014: ワークフロー中止メカニズム | 新Stepにおいても中止可能（既存メカニズムの適用。追加実装不要） |

### 影響を受けるアクター

| アクター | 影響内容 | 影響度 |
|---|---|---|
| AIエージェント（オーケストレータ: fs-bugfix-phase1-analysis） | Step遷移ロジック変更、新サブエージェント呼び出し追加、レポート項目追加 | 高 |
| AIエージェント（サブエージェント: bugfix-analyzer） | 入力パラメータに `investigation_result` が追加される（省略可能） | 中 |
| AIエージェント（サブエージェント: bugfix-investigator）※新規 | 再現性確認・原因特定の専任サブエージェントとして新規追加 | 新規 |
| ユーザー（開発者） | 再現性確認・仮実装に関する対話ポイント追加（再現環境確認、実環境仮実装許可） | 中 |

---

## プログラム構成視点の影響

### 変更対象ファイル

| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/fs-bugfix-phase1-analysis/SKILL.md` | 変更 | 新Step 4挿入、既存Step 4〜9→5〜10番号繰り下げ、遷移ロジック全件更新、レポート記載項目のStep番号更新、Integrationセクション更新 |
| `skills/fs-bugfix-phase1-analysis/bugfix-investigator-prompt.md` | **新規作成** | 再現性確認・原因特定サブエージェントのプロンプトテンプレート全文 |
| `skills/fs-bugfix-phase1-analysis/bugfix-analyzer-prompt.md` | 変更 | 入力情報セクションに `investigation_result` プレースホルダー追加、仮実装コード流用禁止警告追加 |

### 依存関係（変更対象を参照しているファイル）

| ファイル | 依存内容 | 影響度 | 対応要否 |
|---|---|---|---|
| `skills/fs-bugfix-phase2-impl/SKILL.md` | Phase1完了を前提として起動。Phase間インターフェースは bugfix_dir のみ | 低 | 不要（インターフェース変更なし） |
| `skills/using-aide-powers/SKILL.md` | バグ修正WFエントリポイントとして参照 | 低 | 不要（スキル名・起動方法に変更なし） |
| `skills/folder-merge-check/SKILL.md` | fs-bugfix-phase1-analysis から呼び出される | 低 | 不要（呼び出しインターフェース変更なし） |
| `skills/git-commit-workflow/SKILL.md` | 従来通りコミット操作のみの責務。ブランチ操作は委譲しない | 低 | 不要（責務変更なし） |
| `skills/aide-powers-guide/SKILL.md` | バグ修正WF案内として参照 | 低 | 不要（スキル名変更なし） |
| `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` | Phase1のStep構成・プロンプトテンプレート一覧を記述 | 中 | 要（Step構成記述の更新が必要） |
| `docs-dev/02-ai-agent/01-workflows/06-bugfix.md` | バグ修正WF全体のStep概要記述 | 中 | 要（新Step追加に合わせた更新が必要） |
| `.aide/specs/aide-powers/program-structure.md` | プロンプトテンプレート一覧に `bugfix-analyzer-prompt.md — Step4` と記載 | 低 | 要（Step番号更新 + bugfix-investigator-prompt.md 追記） |
| `skills/fs-bugfix-phase1-analysis/SKILL-old.md` | 旧版の参考ファイル | 低 | 不要（参考用旧版であり実運用に影響なし） |

---

## シグネチャ変更追跡結果

### 変更の性質

本変更はスキル定義ファイル（Markdown）の変更であり、プログラムコードのメソッド/関数シグネチャ変更ではない。ただし、AIエージェント間のインターフェースとして以下の変更が存在する。

### インターフェース変更一覧

| インターフェース | before | after | 影響範囲 |
|---|---|---|---|
| bugfix-analyzer-prompt.md 入力パラメータ | feature_name, bugfix_dir, doc_index_path, bug_report_path | feature_name, bugfix_dir, doc_index_path, bug_report_path, **investigation_result** | SKILL.md Step 5（旧Step 4）のサブエージェント呼び出し箇所 |
| SKILL.md プロンプトテンプレート一覧 | 4テンプレート | **5テンプレート**（bugfix-investigator-prompt.md 追加） | Integrationセクション |
| Phase間インターフェース（Phase1→Phase2） | bugfix_dir | bugfix_dir（変更なし） | — |

### 呼び出し箇所の追跡結果

**bugfix-analyzer-prompt.md の呼び出し箇所:**
1. `skills/fs-bugfix-phase1-analysis/SKILL.md` — Step 4（変更後は Step 5）のサブエージェント呼び出し → delta-design.md 変更6 で対応済み
2. `skills/fs-bugfix-phase1-analysis/SKILL.md` — Step 5（変更後は Step 6）のfix モード再実行 → delta-design.md 変更3（遷移ロジック更新）で対応済み

**bugfix-investigator-prompt.md の呼び出し箇所:**
- Grep確認結果: 現時点では delta-design.md 内のみに記述。実装時に新規作成される新ファイルであり、既存ファイルとの依存はない

**その他の参照箇所（更新不要）:**
- `docs-dev/02-ai-agent/02-phase-skills/bugfix.md` — プロンプトテンプレート名の列挙（ドキュメント更新対象だが、シグネチャ変更ではない）
- `.aide/specs/aide-powers/program-structure.md` — 同上
- 過去の変更仕様関連ファイル（`changes/202605271000-*`、`tray-app-planning/`）— 履歴参照のみで実運用影響なし

### 追跡結論

**investigation_result パラメータ追加**に対する全呼び出し箇所の対応が delta-design.md 内で設計済みであり、追跡漏れなし。新パラメータは省略可能（フォールバック対応あり）のため、万一パラメータが渡されなかった場合も既存の原因分析は正常に動作する。

---

## テスト対象機能

### テスト方式

本変更はスキル定義（Markdown）の変更のため、従来の単体テスト・結合テストの対象ではない（system-requirements.md NF-13: 自動テストフレームワーク未導入）。テスト対象機能は「バグ修正ワークフローの実行フロー」として手動シナリオテストで確認する。

### 新規テスト対象

| # | テスト対象 | テスト観点 | テスト手法 |
|---|---|---|---|
| T-1 | 新Step 4（再現性確認・原因特定）の正常フロー | bugfix-investigator-prompt.md が正しく呼び出され、再現性判定結果・原因候補がレポートに記録されること | 手動シナリオテスト |
| T-2 | 再現性あり → 仮実装検証フロー | fix ブランチ作成→仮実装→元ブランチ復帰が正しく動作すること | 手動シナリオテスト |
| T-3 | 再現性なし → 環境要因収集フロー | DONE_WITH_CONCERNS で完了し、環境情報が記録されること | 手動シナリオテスト |
| T-4 | 新Step 4 → 新Step 5 への知見引き継ぎ | investigation_result が bugfix-analyzer-prompt.md に正しく渡されること | 手動シナリオテスト |
| T-5 | NEEDS_CONTEXT 時の再実行 | 不足情報補完後にサブエージェントが再実行されること | 手動シナリオテスト |
| T-6 | BLOCKED 時のユーザー通知 | ユーザーに報告され対応方針確認が行われること | 手動シナリオテスト |

### リグレッションテスト対象

| # | テスト対象 | テスト観点 | リスク |
|---|---|---|---|
| R-1 | Step 3（設計書ゲート）→ Step 4 遷移 | PASS後に新Step 4に正しく遷移すること（Step番号が変わらないため影響低） | 低 |
| R-2 | Step 5（旧Step 4: 原因分析）の正常動作 | Step番号繰り下げ後もサブエージェント呼び出し・完了判定が正常に動作すること | 中 |
| R-3 | Step 6（旧Step 5: ユーザー承認）の遷移 | 承認後にStep 7へ正しく遷移すること | 低 |
| R-4 | Step 9（旧Step 8: レビュー）のFAIL遷移 | FAIL時に再度Step 9へ戻ること（旧: Step 8へ戻る） | 中 |
| R-5 | Step 10（旧Step 9: ユーザー承認）の修正要求遷移 | 修正要求時にStep 9へ戻ること（旧: Step 8へ戻る） | 中 |
| R-6 | 後処理への遷移 | Step 10 完了後に後処理へ正しく遷移すること | 低 |
| R-7 | Phase間インターフェース | Phase1完了後にPhase2が bugfix_dir を受け取り正常起動すること | 低 |

---

## 既存要件との矛盾確認結果

### user-requirements.md との照合

| 要件ID | 照合結果 | 詳細 |
|---|---|---|
| UR-001 | ✅ 矛盾なし | バグ修正WFの内部Step構成変更であり、7つのWF提供という要件に影響しない |
| UR-007 | ✅ 矛盾なし | 新Stepに対応するレポート記載項目が delta-design.md で定義済み。進捗管理機構の拡張として整合 |
| UR-012 | ✅ 矛盾なし | 新StepでBLOCKED/NEEDS_CONTEXT/DONE_WITH_CONCERNS の既存体系をそのまま適用 |
| UR-014 | ✅ 矛盾なし | 新Stepにおいても既存の中止メカニズムが適用可能（final-check中止モード経由） |
| UR-035 | ✅ 矛盾なし | メタ開発（aide-powers自体の開発）ではスキル定義が設計書を兼ねるため、コア4ファイル設計書の更新は不要 |

### system-requirements.md との照合

| 要件/セクション | 照合結果 | 詳細 |
|---|---|---|
| §1.3 バグ修正WF 3フェーズ構成 | ✅ 矛盾なし | Phase数（3フェーズ）に変更なし。Phase1内のStep数のみ変更 |
| §4.1 エラーハンドリング体系 | ✅ 矛盾なし | 既存のBLOCKED/NEEDS_CONTEXT/FAIL体系をそのまま新Stepに適用 |
| §4.2 エラー伝播ルール | ✅ 矛盾なし | サブエージェント→オーケストレータ→ユーザーの伝播経路に変更なし |
| §4.5 中止メカニズム | ✅ 矛盾なし | 新Stepでも既存の中止メカニズムが適用される |
| §5.1 フェーズレポート | ✅ 矛盾なし | 新Step結果は既存フェーズレポート（fs-bugfix-phase1-report.txt）に追記。新ファイル不要 |
| §7.6 NF-16 50行超分割書き込み | ✅ 矛盾なし | bugfix-investigator-prompt.md は長文だが、実装時にWrite+Append分割で対応可能 |
| グローバルルール§4-2 gitコミットはgit-commit-workflow経由 | ✅ 矛盾なし | delta-design.md で明確化済み: ルールはコミット操作に関するものであり、ブランチ操作は対象外 |

### 矛盾確認総合結果

**矛盾なし**。既存要件・システム要件との整合性が確認された。

---

## 説明対象アクター

| アクター | 説明が必要な理由 | 説明内容 |
|---|---|---|
| ユーザー（開発者） | 新しい対話ポイントが追加されるため | ①再現性確認の結果承認 ②本番環境での仮実装許可判断 ③fix ブランチの存在と削除タイミング |
| aide-powers 開発者（メンテナ） | スキル定義の構造変更のため | ①新Step追加の設計意図 ②bugfix-investigator-prompt.md の役割 ③investigation_result パラメータの仕様 |

※ AIエージェントはスキル定義に従って自動的に動作するため、明示的な「説明」の対象外（スキル定義＝説明そのもの）。

---

## 起因元ドキュメントフォルダ

- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（直近コミット ea07cbad / 5cca3b2e / a5938054 のいずれにも Docs: フッターが存在しない）
