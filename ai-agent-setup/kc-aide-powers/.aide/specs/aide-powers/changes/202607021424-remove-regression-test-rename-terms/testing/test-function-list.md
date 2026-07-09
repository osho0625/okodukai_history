# 動作確認対象機能リスト

## 前提

本バグ修正の対象は全てMarkdownスキル定義ファイル（`regression-test-prompt.md` 4ファイル、`SKILL.md` 4ファイル）であり、GUIやAPIを持つアプリケーションではない。
ここでの「ユーザー」とは、aide-powersフレームワークを実際に使ってワークフロー（バグ修正WF／変更WF／実装WF／リファクタリングWF）を実行する開発者（AI Agentのオーケストレータ、またはワークフローを起動する人間）を指す。
「操作」とは、各ワークフローの動作確認Stepにおける工程①（リグレッションテスト実行）を実行すること、およびSKILL.mdのIntegration節・Step本文を確認することを指す。

修正前は、`regression-test-prompt.md` に「## 委譲先エージェント」独自セクションがあり `micro-impl-agent (aide-powers agent)`（実装専任エージェント）が委譲先として固定されていた。また呼び出し元の `SKILL.md` のIntegration節にも同様に `micro-impl-agent (aide-powers agent)` という具体名が明記されていた。修正後はこれらの固定記述が解消され、委譲先を固定しない汎用的な記述に統一されている。

---

## 機能1: バグ修正WF 動作確認Step 工程①（リグレッションテスト実行）

- **機能名**: バグ修正WF リグレッションテスト実行（fs-bugfix-phase2-impl Step9 工程①）
- **機能概説**: バグ修正ワークフローの動作確認Stepにおいて、既存テスト全実行（リグレッションテスト）を実行する工程。regression-test-prompt.mdの内容をプレースホルダー置換した上でサブエージェントに渡し、実行結果を報告させる。
- **機能詳細**:
  - `skills/fs-bugfix-phase2-impl/regression-test-prompt.md` は、冒頭見出し「# リグレッションテスト実行エージェント（バグ修正WF用）」から始まり、説明文の後に「### タスク情報」「### 実行モード」「### テスト実行コマンド（必須）」「### 開発環境情報」「## テスト実行ルール」「## 報告フォーマット」「## 出力」が、コードブロックに入れ子にされることなくファイルのトップレベル構造として一続きに並んでいる。
  - 「## 委譲先エージェント」セクション（`micro-impl-agent (aide-powers agent)` の指定）は存在しない。
  - 「## プレースホルダー（FSが実データで置き替える）」独自セクションは存在しない（プレースホルダー`{{dev_environment_path}}`はタスク情報／開発環境情報の各項目に直接埋め込まれている）。
  - `skills/fs-bugfix-phase2-impl/SKILL.md` のIntegration節には「**呼び出すサブエージェント（Step 9 工程①）:**」という見出しがあり、「委譲先は具体的なエージェント名で固定しない」旨の説明文が続く。「呼び出す名前付きエージェント」という見出しでの `micro-impl-agent (aide-powers agent)` 指定は工程①に関しては存在しない。
  - 同SKILL.mdの「プロンプトテンプレート」欄の `regression-test-prompt.md` の説明に `micro-impl-agent 用` の記載はなく、「汎用のサブエージェント用」と記載されている。
  - coding-test-2review経由（Step8）で呼び出される `micro-impl-agent (aide-powers agent)` の記載（実装専任の正当な用途）は変更されず残っている。
- **アクション・イベント制御**:
  - 条件: バグ修正WFがStep8（タスク実装ループ）を完了し、Step9（動作確認Step）に到達したとき
  - 処理: オーケストレータが `regression-test-prompt.md` のプレースホルダーを実データで置き替え、汎用のサブエージェントを起動してリグレッションテストを実行させる
  - 遷移先: 全パス確認後、工程②（試験書作成）へ進む。失敗があればStep8へ差し戻し
- **関連タスク**: B-001（regression-test-prompt.mdの構造統一）, B-005（SKILL.mdのIntegration節・プロンプトテンプレート欄の委譲先固定記述解消）

---

## 機能2: 変更WF 動作確認Step 工程①（リグレッションテスト実行）

- **機能名**: 変更WF リグレッションテスト実行（fs-change-phase2-impl Step11 工程①）
- **機能概説**: 変更ワークフローの動作確認Stepにおいて、既存テスト全実行（リグレッションテスト）を実行する工程。バグ修正WFと同じ構造パターンで、委譲先を固定しない。
- **機能詳細**:
  - `skills/fs-change-phase2-impl/regression-test-prompt.md` は、冒頭見出し「# リグレッションテスト実行エージェント（変更WF用）」から始まり、機能1と同一の構造（「## 委譲先エージェント」「## プレースホルダー」セクションなし、コードブロック入れ子なし）を持つ。プロンプト本文には `{{changes_dir}}` 変数と「呼び出し元ワークフロー: 変更WF（fs-change-phase2-impl Step11）」の記載が含まれる。
  - `skills/fs-change-phase2-impl/SKILL.md` のIntegration節には「**呼び出すサブエージェント（Step 11 工程①）:**」の見出しがあり、委譲先を固定しない旨の説明文が続く。
  - 「プロンプトテンプレート」欄の `regression-test-prompt.md` の説明が「汎用のサブエージェント用」になっている。
  - coding-test-2review経由（Step10）で呼び出される `micro-impl-agent (aide-powers agent)` の記載（正当な用途）は変更されていない。
- **アクション・イベント制御**:
  - 条件: 変更WFがStep10（タスク実装ループ）を完了し、Step11（動作確認Step）に到達したとき
  - 処理: オーケストレータが `regression-test-prompt.md` のプレースホルダーを実データで置き替え、汎用のサブエージェントを起動してリグレッションテストを実行させる
  - 遷移先: 全パス確認後、工程②（試験書作成）へ進む。失敗があればStep10へ差し戻し
- **関連タスク**: B-002（regression-test-prompt.mdの構造統一）, B-006（SKILL.mdのIntegration節・プロンプトテンプレート欄の委譲先固定記述解消）

---

## 機能3: 実装WF 動作確認Step 工程①（リグレッションテスト実行）

- **機能名**: 実装WF リグレッションテスト実行（fs-impl-phase4-execution Step2 工程①）
- **機能概説**: 実装ワークフローの動作確認Stepにおいて、既存テスト全実行（リグレッションテスト）を実行する工程。他WFと同一の構造パターンで、委譲先を固定しない。
- **機能詳細**:
  - `skills/fs-impl-phase4-execution/regression-test-prompt.md` は、冒頭見出し「# リグレッションテスト実行エージェント（実装WF用）」から始まり、機能1・機能2と同一の構造を持つ。プロンプト本文には `{{spec_dir}}` 変数と「呼び出し元ワークフロー: 実装WF（fs-impl-phase4-execution Step2）」の記載が含まれる。
  - `skills/fs-impl-phase4-execution/SKILL.md` のIntegration節には「**呼び出すサブエージェント（Step 2 工程①）:**」の見出しがあり、委譲先を固定しない旨の説明文が続く。
  - 「プロンプトテンプレート」欄の `regression-test-prompt.md` の説明が「汎用のサブエージェント用」になっている。
  - coding-test-2review経由（Step1）で呼び出される `micro-impl-agent (aide-powers agent)` の記載（正当な用途）は変更されていない。
- **アクション・イベント制御**:
  - 条件: 実装WFがStep1（タスク実装ループ）を完了し、Step2（動作確認Step）に到達したとき
  - 処理: オーケストレータが `regression-test-prompt.md` のプレースホルダーを実データで置き替え、汎用のサブエージェントを起動してリグレッションテストを実行させる
  - 遷移先: 全パス確認後、工程②（試験書作成）へ進む。失敗があればStep1へ差し戻し
- **関連タスク**: B-003（regression-test-prompt.mdの構造統一）, B-007（SKILL.mdのIntegration節・プロンプトテンプレート欄の委譲先固定記述解消）

---

## 機能4: リファクタリングWF Step2（リグレッションテスト実行＋開始前基準比較）

- **機能名**: リファクタリングWF リグレッションテスト実行＋開始前基準比較（fs-refactoring-phase5-impl Step2）
- **機能概説**: リファクタリングワークフローのStep2において、既存テスト全実行（リグレッションテスト）を実行し、フェーズ1で記録した開始前基準（セーフティネットベースライン）との比較結果を報告する工程。他WFと異なり工程番号がなく単独の呼び出しであり、基準比較機能を持つ。
- **機能詳細**:
  - `skills/fs-refactoring-phase5-impl/regression-test-prompt.md` は、冒頭見出し「# リグレッションテスト実行エージェント（リファクタリングWF用）」から始まり、「## 委譲先エージェント」「## プレースホルダー」セクションなし・コードブロック入れ子なしの構造に統一されている。他3ファイルとの差異（`{{safety_net_baseline}}` 変数、「### 開始前基準（比較対象）」セクション、基準比較の判定ロジック〔完全一致／FAIL数増加／スキップ数変化〕、「## 出力」内の「開始前基準との比較結果」項目）は維持されている。
  - `skills/fs-refactoring-phase5-impl/SKILL.md` のIntegration節には「**呼び出すサブエージェント（Step 2）:**」の見出しがあり、委譲先を固定しない旨の説明文（開始前基準との比較報告を含む旨）が続く。
  - 「サブエージェントプロンプト」欄の `regression-test-prompt.md` の説明が「汎用のサブエージェント用」になっている（「phase1-statusのセーフティネット基準との比較報告を含む」の記載は維持）。
  - Step2本文中の「本スキルディレクトリの `regression-test-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとして〜を起動し」の部分が、`micro-impl-agent` という具体名ではなく「サブエージェントを起動し」という他3ファイルのStep本文と揺れのない汎用表現になっている。
  - coding-test-2review経由（Step1）で呼び出される `micro-impl-agent (aide-powers agent)` の記載（正当な用途）は変更されていない。
- **アクション・イベント制御**:
  - 条件: リファクタリングWFがStep1（タスク実装ループ）を完了し、Step2に到達したとき
  - 処理: オーケストレータが `regression-test-prompt.md` のプレースホルダーを実データで置き替え、汎用のサブエージェントを起動してリグレッションテストと開始前基準との比較を実行させる
  - 遷移先: 全パス＆基準一致確認後、Step3（動作確認試験）へ進む。失敗があればStep1へ差し戻し
- **関連タスク**: B-004（regression-test-prompt.mdの構造統一・基準比較機能は維持）, B-008（SKILL.mdのIntegration節・サブエージェントプロンプト欄・Step2本文の委譲先固定記述解消）

---

## 関連タスク網羅性チェック

| タスクID | 対象ファイル | 対応する機能 |
|---|---|---|
| B-001 | skills/fs-bugfix-phase2-impl/regression-test-prompt.md | 機能1 |
| B-002 | skills/fs-change-phase2-impl/regression-test-prompt.md | 機能2 |
| B-003 | skills/fs-impl-phase4-execution/regression-test-prompt.md | 機能3 |
| B-004 | skills/fs-refactoring-phase5-impl/regression-test-prompt.md | 機能4 |
| B-005 | skills/fs-bugfix-phase2-impl/SKILL.md | 機能1 |
| B-006 | skills/fs-change-phase2-impl/SKILL.md | 機能2 |
| B-007 | skills/fs-impl-phase4-execution/SKILL.md | 機能3 |
| B-008 | skills/fs-refactoring-phase5-impl/SKILL.md | 機能4 |

全8タスクが機能1〜4のいずれかに対応付けられており、漏れなし。
