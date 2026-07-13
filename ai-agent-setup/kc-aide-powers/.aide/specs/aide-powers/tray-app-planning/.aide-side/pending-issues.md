# 未対応の問題一覧

## 概要
- プロジェクト: aide-powers
- 最終更新: 2026-05-19 13:20

## 問題一覧

### PENDING-001: impl-task-list.md チェックボックス更新ルール追加
- 発生日時: 2026-05-13 18:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）
- 種別: 改善要求
- 重要度: 中
- 詳細: fs-impl-execution のステップ9（タスク完了）に、impl-task-list.md の該当タスクを `- [ ]` → `- [x]` に更新するルールを追加する。現状は impl-progress.md のみ更新しており、タスクリストの俯瞰ビューが更新されない。
- 関連ファイル: skills/fs-impl-execution/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 高橋さんフィードバック #1。変更フォルダ: changes/202605131900-task-checkbox-update/

### PENDING-002: 非プログラム成果物のレビューサイクル簡略化
- 発生日時: 2026-05-13 18:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）
- 種別: 改善要求
- 重要度: 高
- 詳細: 非プログラム成果物（設定ファイル、ドキュメント、データ定義等）に対してプログラムコード用のフルレビューサイクルを適用しない。内容ベースで判定し、非プログラム成果物は「実装 → 設計準拠レビューのみ → 完了」の固定手順とする。判定理由を報告に明記するルールを設ける。
- 関連ファイル: skills/fs-impl-execution/SKILL.md, skills/multi-stage-code-review/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 高橋さんフィードバック #2, #7, #8 の統合対応。変更フォルダ: changes/202605131830-non-program-review-simplify/

### PENDING-003: テスト実行コマンドの言語非依存化
- 発生日時: 2026-05-13 18:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）
- 種別: 改善要求
- 重要度: 中
- 詳細: impl-coding-standards の mode: run_test にある Python/unittest 固定のコマンドテンプレートを廃止し、dev-environment.md に記載されたテスト実行コマンドを使用するルールに変更する。「対象テスト」と「全体リグレッションテスト」の2本立て実行ルールは維持。
- 関連ファイル: skills/impl-coding-standards/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 高橋さんフィードバック #3。変更フォルダ: changes/202605131910-test-command-language-agnostic/

### PENDING-004: レビューエージェントの PASS 時サマリモード追加
- 発生日時: 2026-05-13 18:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）
- 種別: 改善要求
- 重要度: 高
- 詳細: design-review-agent と code-review-agent の出力フォーマットに PASS 時サマリモードを追加する。PASS 時は「判定: PASS（検査クラス数: N, 差分: 0）」の1行のみ出力。FAIL 時のみ従来通り全詳細を出力する。
- 関連ファイル: agents/design-review-agent.md, agents/code-review-agent.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 高橋さんフィードバック #5。変更フォルダ: changes/2026-05-13-review-pass-summary/

### PENDING-005: WARNING 全指摘修正必須化
- 発生日時: 2026-05-13 18:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）
- 種別: 改善要求
- 重要度: 高
- 詳細: レビュー結果判断フローの WARNING の扱いを変更する。ERROR/WARNING を問わず全指摘を修正 + 再レビュー必須とする。修正困難かつ WARNING レベルの場合のみ、ユーザー承認でスキップ可能。「軽微なら記録して次へ進む」を廃止する。
- 関連ファイル: skills/fs-impl-execution/SKILL.md, skills/multi-stage-code-review/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 高橋さんフィードバック #5 関連（レビュー品質向上）。変更フォルダ: changes/2026-05-13-warning-fix-required/

### PENDING-006: fs-change-phase1-requirements に changes_dir 命名規則を明記
- 発生日時: 2026-05-13 19:00
- 発見元ワークフロー: 変更ワークフロー（高橋さんフィードバック対応）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ1（要件定義）実行中
- 種別: 設計考慮漏れ
- 重要度: 高
- 詳細: fs-change-phase1-requirements スキルに changes_dir の命名規則が明記されていない。「ワークフローコンテキストから渡される」としか書かれておらず、フェーズ1で change-requirements.md を作成する時点でフォルダの作り方がわからない。設計書の例示では日付ベース（`changes/2026-03-25`）が想定されているが、明示的なルールがない。
- 関連ファイル: skills/fs-change-phase1-requirements/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-13）
- 備考: 今回の作業中に発覚。3ワークフロー（変更・バグ修正・リファクタリング）のフェーズ1スキルに命名規則を追記。。変更フォルダ: changes/warning-fix-required/


### PENDING-008: コンテキストあふれ対応スキルの作成
- 発生日時: 2026-05-13 20:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 機能追加
- 重要度: 中
- 詳細: セッションのコンテキストがあふれてきたときに、ユーザーが新しいセッションを開始しやすいような工夫をするスキルを用意する。引き継ぎファイルの自動生成、現在の作業状態のサマリー、次セッションでの再開手順の提示等を含む。
- 関連ファイル: skills/session-handover/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: 変更フォルダ: changes/202605141100-session-handover-skill/

### PENDING-009: ビジュアルコンパニオンの積極活用
- 発生日時: 2026-05-13 20:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 機能追加
- 重要度: 中
- 詳細: 企画書作成や設計書作成など、イメージで表示するとわかりやすい場合にビジュアルコンパニオン（visual-companion スキル）を積極的に活用するよう、既存フェーズスキルを変更する。モックアップ、図表、選択肢の視覚的提示等で活用する。
- 関連ファイル: skills/fs-planning-*/SKILL.md, skills/fs-design-*/SKILL.md, skills/visual-companion/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: 45件中19件のフェーズスキルに visual-companion 活用セクションを追記。変更フォルダ: changes/202605141130-visual-companion-active-use/

### PENDING-010: ブラウザ選択時のAI自動反応（他プラットフォーム対応）
- 発生日時: 2026-05-13 21:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 機能追加
- 重要度: 中
- 詳細: visual-companion のブラウザ選択時にAIが自動反応する機能を、Kiro IDE 以外のプラットフォーム（Claude Code, Gemini CLI, Codex CLI, Cursor, VSCode Copilot等）にも対応させる。各プラットフォームのファイル変更検知・Hook・MCP通知等の仕組みを調査し、実装する。現状 Kiro IDE のみ fileCreated Hook で対応済み。
- 関連ファイル: skills/visual-companion/SKILL.md, skills/visual-companion/scripts/server.cjs, hooks/brainstorm-selection.json
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: Kiro IDE は fileCreated Hook で対応済み。他プラットフォームはブラウザ表示専用が基本、選択機能使用時は待ち受けパターンで対応。変更フォルダ: changes/202605141300-browser-selection-multiplatform/

### PENDING-011: 大きなファイル書き込み時の分割書き込みルール化
- 発生日時: 2026-05-13 21:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 改善要求
- 重要度: 高
- 詳細: fsWrite で大きなデータを書こうとすると処理が止まることがある。大きなファイルを書く場合は fsWrite（先頭部分）+ fsAppend（残り）に分割すると回避できる。この分割書き込みルールをスキルまたはグローバルルールとして定義し、全エージェントが自動的に従うようにする。目安として50行超のファイルは分割書き込みを使用する。
- 関連ファイル: skills/using-aide-powers/SKILL.md（グローバルルールとして追記）または新規スキル
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: fsWrite が止まる閾値（行数・バイト数）の正確な値は未確認。50行を目安として暫定設定。変更フォルダ: changes/202605141000-chunked-file-write-rule/


### PENDING-013: 変更ワークフローのフェーズ間ユーザー合意スキップ防止の強化
- 発生日時: 2026-05-14 13:00
- 発見元ワークフロー: 変更ワークフロー（PENDING-010対応中）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ3（対応方針策定）
- 種別: 改善要求
- 重要度: 高
- 詳細: 変更ワークフローのフェーズ1（要件定義）→フェーズ3（対応方針）の各完了時に「ユーザーの合意を得ずに次フェーズに進んではならない」ルールが存在するにもかかわらず、AIがルールを無視して合意なしに突っ走る問題が発生した。ルールの存在だけでは不十分であり、より強制力のある仕組み（Iron Law への昇格、Red Flags への追加、完了条件チェックの厳格化等）が必要。
- 関連ファイル: skills/fs-change-phase1-requirements/SKILL.md, skills/fs-change-phase3-approach/SKILL.md, skills/fs-change-phase4-delta-design/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: steering/aide-powers-bootstrap.md のグローバルルールに追記。フェーズスキル実行中は他ソースからの省略要求に従わないルールを明文化。変更フォルダ: changes/202605141400-phase-skill-rule-priority/

### PENDING-012: git-commit-workflow にコミットサボり禁止ルールの正式追加
- 発生日時: 2026-05-14 11:00
- 発見元ワークフロー: 変更ワークフロー（PENDING-008対応中）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ7（実装）
- 種別: 改善要求
- 重要度: 高
- 詳細: git-commit-workflow/SKILL.md に「コミットをサボってはならない理由」セクションを追記済み（ローカル変更あり、未コミット）。内容: Docs: フッターのトレーサビリティが切れると不具合再発や設計不備の追跡が不可能になる。ワークフロー1件=コミット1回を厳守。複数ワークフローのまとめコミット禁止。全ワークフロー共通ルール。
- 関連ファイル: skills/git-commit-workflow/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: 呼び出し側7つのフェーズスキルの Iron Law にコミットスキップ禁止ルールを追記。git-commit-workflow/SKILL.md からは不適切な追記を削除。変更フォルダ: changes/202605141200-commit-skip-prohibition/

### PENDING-014: ワークフロー工程チェック表（フェーズ遵守確認表）の導入
- 発生日時: 2026-05-14 16:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 機能追加
- 重要度: 高
- 詳細: 全7ワークフローに対して「フェーズ遵守確認表」を導入する。先頭フェーズスキルが表を生成し、各フェーズスキルが作業完了時に自分の行のチェックを埋める。最終フェーズスキルが全行埋まりを確認してワークフロー完了とする。埋まっていないフェーズがあればやり直し。45件のフェーズスキル全てに追記が必要。
- 関連ファイル: skills/fs-*/SKILL.md（全45件）
- 推奨対応ワークフロー: 変更（実装フェーズで task-orchestration スキルを使用して並列処理）
- 対応状況: 対応完了（2026-05-14）
- 備考: task-orchestration スキルで45件を3グループ並列処理。変更フォルダ: changes/202605141700-workflow-compliance-checklist/

### PENDING-015: フェーズ遵守確認表のチェック条件強化
- 発生日時: 2026-05-14 17:00
- 発見元ワークフロー: 変更ワークフロー（PENDING-015: グローバルルール参照追加 対応中）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605141730-global-rules-reference/
- 発見フェーズ: フェーズ7（差分実装）
- 種別: 改善要求
- 重要度: 高
- 詳細: フェーズ遵守確認表の冒頭に以下のチェック条件を追記する。「各AI Agentはフェーズスキルの手順とルールを全て理解し、その通りに実行、成果物を作成した場合に ✅ をチェックすること。何か漏れた場合は ❌ を記載すること。」現状はチェック記入ルールが「完了条件を満たした時点でチェック」としか書かれておらず、成果物の漏れがあってもチェックできてしまう。さらに、チェック前に「フェーズスキルの完了条件セクションを再読し、全成果物が作成済みであることを1件ずつ確認する」自己検証ステップを義務化する。チェック表を「フェーズ遷移マーカー」として使うことを明示的に禁止し、「全成果物の作成完了を自己検証した結果」としてのみチェックを許可する。
- 関連ファイル: skills/fs-*/SKILL.md（全45件のフェーズ遵守確認表セクション）
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: 先頭フェーズスキル7件のテーブルテンプレート生成時に冒頭注記を追加する形で対応。チェック記入ルールに「完了条件セクションを再読して全成果物を確認するステップ」を追加する。変更フォルダ: changes/202605141720-checklist-condition-strengthen/

### PENDING-016: git-commit-workflow スキルにユーザー承認必須ルールの強化
- 発生日時: 2026-05-14 17:25
- 発見元ワークフロー: 変更ワークフロー（PENDING-015対応中）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605141720-checklist-condition-strengthen/
- 発見フェーズ: フェーズ8（完了処理）
- 種別: 改善要求
- 重要度: 高
- 詳細: git-commit-workflow スキルに「コミット実行前に必ずユーザー承認を取ること。承認なしにgit commitを実行してはならない」ルールを強化追記する。現状ルールは存在するが、AIが省略するケースが発生した。
- 関連ファイル: skills/git-commit-workflow/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: コミットメッセージとステージング内容をユーザーに提示し、明示的な「ok」を得てからcommitする手順を Iron Law レベルで明記。変更フォルダ: changes/202605141730-git-commit-user-approval/

### PENDING-017: フェーズ遵守確認表のチェック主体をサブエージェントに限定
- 発生日時: 2026-05-14 17:40
- 発見元ワークフロー: 変更ワークフロー（別プロジェクトでの実運用中）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 改善要求
- 重要度: 高
- 詳細: フェーズ遵守確認表のチェック記入は、各プロセスの実作業を行ったサブエージェントが自分の担当分だけをチェックするルールに変更する。オーケストレーター（フェーズスキルを読み込んで進行管理するエージェント）がチェックを記入することを禁止する。理由: オーケストレーターは実作業を行っていないため、成果物の漏れを正確に検証できない。サブエージェントが自分の作業完了を自己申告する形にすることで、チェックの信頼性を担保する。
- 関連ファイル: skills/fs-*/SKILL.md（全45件のフェーズ遵守確認表セクション）
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-14）
- 備考: 現状のルール「完了条件を満たした時点でチェック」を「実作業を行ったサブエージェントが、自分の担当プロセスの成果物を確認してチェック」に変更する。オーケストレーターによるチェック記入を明示的に禁止する。変更フォルダ: changes/202605141740-checklist-subagent-only/

### PENDING-018: fs-bugfix-phase6-doc に Iron Law セクションが欠落
- 発生日時: 2026-05-15 13:00
- 発見元ワークフロー: なし（rules-distribute 導入時のレビューで発見）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 設計考慮漏れ
- 重要度: 中
- 詳細: fs-bugfix-phase6-doc の SKILL.md に `## The Iron Law` セクションが存在しない。他の全フェーズスキルには Iron Law セクション（またはワークフロー共通 Iron Law への参照）があるが、このスキルのみ欠落している。バグ修正ワークフロー共通の Iron Law を追記する必要がある。
- 対応状況: 対応完了（2026-05-15）

### PENDING-019: fs-impl-final-check に Iron Law セクションが欠落
- 発生日時: 2026-05-15 13:00
- 発見元ワークフロー: なし（rules-distribute 導入時のレビューで発見）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 設計考慮漏れ
- 重要度: 中
- 詳細: fs-impl-final-check の SKILL.md に `## The Iron Law` セクションが存在しない。他の全フェーズスキルには Iron Law セクション（またはワークフロー共通 Iron Law への参照）があるが、このスキルのみ欠落している。実装ワークフロー共通の Iron Law を追記する必要がある。
- 関連ファイル: skills/fs-impl-final-check/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-15）



### PENDING-020: session-handover スキルの description 強化（スキル自動マッチング改善）
- 発生日時: 2026-05-18 19:30
- 発見元ワークフロー: 変更ワークフロー（202605181002-progress-management-migration）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: フェーズ7（差分実装）
- 種別: 改善要求
- 重要度: 高
- 詳細: session-handover スキルの frontmatter description が「セッション終了時に必ず呼ぶ」「プロンプト提示必須」等のキーワードを含んでおらず、AIがスキルを activate せずに自己判断で回答してしまう問題が発生した。description を強化し、Kiro IDE のスキル自動マッチングで「セッション終了」「引き継ぎ」「handover」「コンテキスト大きい」等のキーワードで確実に拾われるようにする。また、description に「プロセス4（新セッション用プロンプト提示）は絶対省略禁止」の旨を含める。
- 関連ファイル: skills/session-handover/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本セッションでAIがプロセス4を省略した実例あり。グローバルルール §6-1（スキルの最新版を毎回読む）違反が根本原因。description 強化により自動マッチングの精度を上げ、activate 忘れを防止する。変更フォルダ: changes/202605190200-session-handover-description/

### PENDING-021: 手順簡素化・省略の提案を一切禁止するルールの追加
- 発生日時: 2026-05-18 21:30
- 発見元ワークフロー: 変更ワークフロー（202605181002-progress-management-migration）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605181002-progress-management-migration/
- 発見フェーズ: フェーズ4（差分設計）— やり直し時にユーザーから指摘
- 種別: 改善要求
- 重要度: 最高
- 詳細: どんなに大量のタスクをこなすときや、コンテキストあふれが懸念されるとき、急いでいるときであろうと、ユーザーに一切の手順簡素化や省略の提案をしてはならない。選択肢として提示することも禁止。user-profile でレベルの低いユーザーのために自動実行する際も、簡素化や省略は一切禁止。そういうときこそ正式な手順を確実に実行すること。グローバルルール（global-rules.md）の §3（フェーズ遵守ルール）に以下を追加する: 「手順の簡素化・省略をユーザーに提案してはならない。選択肢として提示してもならない。量が多い・コンテキストが大きい・急いでいる等の理由は簡素化の根拠にならない。量が多い場合は task-orchestration スキルで並列処理し、正式な手順を全件に適用すること。」注意書き: 「簡素化や省略は一見効率的に見えるが、結局やり直しになり、元の作業量の数倍のコストがかかる。正式な手順を省略して得られる時間は、やり直しで失う時間に比べれば微々たるものである。」
- 関連ファイル: skills/using-aide-powers/references/global-rules.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本変更で44件の差分設計を「パターンテンプレート」で済ませようとした結果、実装フェーズで6件中4件が失敗し、フェーズ4からの全やり直しが発生した実例あり。急がば回れ。正式な手順を愚直に全件実行することが、結果的に最短経路である。変更フォルダ: changes/202605190220-no-simplification-proposal/

### PENDING-022: サブエージェントのコンテキスト制約時に安易に新規セッションを立てず task-orchestration で分割実行するルールの追加
- 発生日時: 2026-05-18 22:00
- 発見元ワークフロー: 変更ワークフロー（202605181002-progress-management-migration）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605181002-progress-management-migration/
- 発見フェーズ: フェーズ4（差分設計）— やり直し時に発覚
- 種別: 改善要求
- 重要度: 高
- 詳細: サブエージェントに大きなファイルを書かせようとして出力が切れた際、「コンテキストが大きいので新規セッションで」と安易にセッション切り替えを提案した。正しい対応は task-orchestration スキルで作業を分割し、各サブエージェントが扱える粒度に分解して並列実行すること。グローバルルールまたは task-orchestration スキルに以下を追加する: 「サブエージェントの出力が切れた・ファイルが大きすぎて1回で書けない等のコンテキスト制約に遭遇した場合、安易に新規セッション立ち上げを提案してはならない。task-orchestration スキルで作業を分割し、各サブエージェントが扱える粒度（50行以下の書き込み単位等）に分解して実行すること。セッション切り替えはコンテキストウィンドウ自体が限界に達した場合の最終手段であり、作業の分割で解決できる問題にセッション切り替えを持ち出すことを禁止する。」
- 関連ファイル: skills/task-orchestration/SKILL.md, skills/using-aide-powers/references/global-rules.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本セッションでサブエージェントの invoke が出力切れで失敗した際、即座に「新セッションで」と提案した実例あり。正しくは task-orchestration で分割計画を立てて同セッション内で実行すべきだった。変更フォルダ: changes/202605190230-context-constraint-task-split/


### PENDING-023: delta-design-qa-agent が WARNING を「任意対応」として出力する問題の修正
- 発生日時: 2026-05-18 23:30
- 発見元ワークフロー: 変更ワークフロー（202605181002-progress-management-migration）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605181002-progress-management-migration/
- 発見フェーズ: フェーズ4（差分設計）— QAレビュー APPROVED 後にユーザーが指摘
- 種別: 改善要求
- 重要度: 高
- 詳細: delta-design-qa-agent が QAレビュー結果で WARNING を「任意対応」として出力し、ワークフロー側がそれを鵜呑みにして修正せず次フェーズに進もうとした。PENDING-005 で「WARNING全指摘修正必須化」が定義済みであり、WARNING であっても修正必須のはずだが、QAレビューアーエージェントの定義にこのルールが反映されていない。原因: (1) delta-design-qa-agent のプロンプト/定義に PENDING-005 のルール（WARNING も修正必須）が組み込まれていない。(2) ワークフロー側が QA の「APPROVED + WARNING（任意）」を受け取った際に、WARNING を修正してから次フェーズに進むべきだが、APPROVED の判定だけを見て進行した。対策: (1) delta-design-qa-agent（および他の全QAレビューアーエージェント）の定義に「WARNING は任意対応ではない。修正必須である。WARNING がある場合は APPROVED ではなく REJECTED を返すこと」を追記する。(2) ワークフロー側（fs-change-phase4-delta-design 等）に「QAレビュー結果に WARNING が含まれる場合は APPROVED であっても修正してから次フェーズに進むこと」を追記する。
- 関連ファイル: agents/delta-design-qa-agent.md, agents/code-review-agent.md, agents/design-review-agent.md, skills/fs-change-phase4-delta-design/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本セッションで QA が APPROVED + WARNING 2件を返し、ワークフローが WARNING を無視して次フェーズに進もうとした実例あり。ユーザーに指摘されて修正した。変更フォルダ: changes/202605190240-warning-means-rejected/


### PENDING-024: 変更ワークフローのフェーズ7で工程チェック表未作成 + git コミット漏れ（AI判断ミス）
- 発生日時: 2026-05-18 23:50
- 発見元ワークフロー: 変更ワークフロー（202605181002-progress-management-migration）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605181002-progress-management-migration/
- 発見フェーズ: フェーズ7（差分実装）+ フェーズ8（完了処理）
- 種別: 不具合（AIのルール違反による）
- 重要度: 最高
- 詳細: |
    **症状:**
    1. `impl-process-checklist.md`（工程チェック表）が生成されなかった
    2. git コミット時に changes/ ディレクトリ（設計成果物）がステージングから除外された

    **根本原因（確定）:**

    【問題1: changes/ ディレクトリのコミット漏れ】
    - git add でファイルを手動選択した際に、untracked ディレクトリ（??）を意図的に除外した
    - 「M のファイル = 今回変更したファイル」と短絡的に判断し、?? のファイルを「以前から存在していた未追跡ファイル」と誤認
    - 実際には changes/ ディレクトリはフェーズ0〜6で作成された設計成果物であり、本ワークフローの一部
    - Iron Law 違反: git-commit-workflow スキルに委譲せず直接 git add + git commit を実行した

    【問題2: 工程チェック表の未作成】
    - steering ルールの「テストは動作確認チェックリストに置き換える」を拡大解釈し、工程チェック表自体を不要と判断
    - steering ルールは「テスト」の代替を述べているだけで、「工程チェック表」の省略は許可していない
    - Iron Law「PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP」は無条件の義務であり、ドキュメント編集であっても適用される

    【共通する根本原因】
    「量が多いから効率化しよう」という思考が、ルール省略の合理化を生んだ。
    56件のタスクを処理する中で、正式手順（git-commit-workflow 委譲、工程チェック表の逐次更新）を
    「重い」と感じ、無意識にスキップした。fs-change-phase7-impl の Common Rationalizations に
    記載されている「コンテキストが溢れそうだからタスクを統合する」と同じ構造の問題。

    **再発防止策（検討中）:**
    1. steering ルールに「工程チェック表は成果物種別に関わらず必須」を明記する
    2. git-commit-workflow 委譲の Iron Law 違反検出を強化する（直接 git commit 実行の検出）
    3. 「非プログラム成果物」の場合でも工程チェック表の簡略版（実装→レビュー の2列）を必須とする
- 関連ファイル: skills/fs-change-phase7-impl/SKILL.md, skills/impl-task-planning/SKILL.md, skills/git-commit-workflow/SKILL.md
- 推奨対応ワークフロー: 変更（再発防止策の実装）
- 対応状況: 対応完了（2026-05-19）
- 備考: |
    再発防止策として以下を実施:
    1. 4つの実装フェーズスキルの Iron Law に「工程チェック表は成果物種別に関わらず必須。省略禁止」を追記
    2. git-commit-workflow に untracked ファイルの確認義務プロセスを追記
    変更フォルダ: changes/202605190100-process-checklist-mandatory/


### PENDING-025: 進捗管理の更新とコミットタイミングの見直し（全ワークフロー）
- 発生日時: 2026-05-19 13:20
- 発見元ワークフロー: 変更ワークフロー（202605190300-session-handover-self-contained）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605190300-session-handover-self-contained/
- 発見フェーズ: フェーズ8（完了処理）
- 種別: 改善要求
- 重要度: 最高
- 詳細: |
    **症状:**
    変更ワークフローのフェーズ8（完了処理）で change-progress.md を「フェーズ8完了」に更新した後、
    git コミット時にその更新が含まれない問題が繰り返し発生している。

    **根本原因:**
    現在のルールでは「進捗ファイル更新 → git コミット」の順序だが、フェーズ8自体の完了マークは
    コミット後に付けるべきか、コミット前に付けるべきかが曖昧。結果として:
    1. フェーズ8の進捗更新がコミットに含まれない
    2. 前ワークフロー（202605181002）でも同じ問題が発生した

    **要求する対策:**
    1. 全ワークフローの最終フェーズスキルで「進捗ファイルの最終更新 → コミット」の順序を明確化する
    2. git-commit-workflow のステップ3（変更ファイルの確認）で、change-progress.md / *-progress.md が
       M（modified）に含まれていることを確認するチェックを追加する
    3. progress-file-format.md に「最終フェーズの進捗更新はコミット対象に含めること」を明記する
    4. 全7ワークフローの最終フェーズスキル（fs-change-phase8-completion, fs-bugfix-phase6-doc,
       fs-refactoring-phase5-doc, fs-impl-doc-generation, fs-planning-finalize,
       fs-design-phase10-program, fs-reverse-optional-phases）に
       「進捗ファイル最終更新 → コミット対象に含める」の手順を明記する
- 関連ファイル: skills/git-commit-workflow/SKILL.md, skills/using-aide-powers/references/progress-file-format.md, skills/fs-change-phase8-completion/SKILL.md, skills/fs-bugfix-phase6-doc/SKILL.md, skills/fs-refactoring-phase5-doc/SKILL.md, skills/fs-impl-doc-generation/SKILL.md, skills/fs-planning-finalize/SKILL.md, skills/fs-design-phase10-program/SKILL.md, skills/fs-reverse-optional-phases/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 202605181002 と 202605190300 の2つのワークフローで同じ問題が発生。進捗ファイルの更新がコミットに含まれないのは構造的な問題であり、全ワークフローで統一的に対策する必要がある。変更フォルダ: changes/202605190320-commit-timing-fix/


### PENDING-026: 他スキルの references/ パス参照が Kiro IDE で機能しない問題
- 発生日時: 2026-05-19 12:50
- 発見元ワークフロー: 変更ワークフロー（202605191056-rename-using-aide-to-using-aide-powers）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605191056-rename-using-aide-to-using-aide-powers/
- 発見フェーズ: フェーズ7（差分実装）
- 種別: 設計考慮漏れ
- 重要度: 高
- 詳細: |
    各フェーズスキル（fs-*）の SKILL.md に記載されている
    `skills/using-aide-powers/references/progress-file-format.md` や
    `skills/using-aide-powers/references/global-rules.md` へのパス参照は、
    Kiro IDE ではスキルが自分のフォルダ配下しか見えないため機能しない可能性がある。
    Claude Code 等の他プラットフォームでは skills/ 全体が見えるため問題ないが、
    Kiro IDE では各スキルが独立したコンテキストで動作するため、
    他スキルの references/ を直接参照する設計が成立しない。
    
    対策案:
    1. 各スキルの references/ に必要なファイルをコピー配置する（重複管理のコスト増）
    2. Kiro IDE 向けに steering ファイルとして配置し、全スキルから参照可能にする
    3. using-aide-powers スキルの references/ を共有リソースとして特別扱いする仕組みを導入
    4. 現状維持（Claude Code / Copilot CLI 等では機能するため、Kiro IDE は制約として受容）
- 関連ファイル: skills/fs-*/SKILL.md（全49件）, skills/using-aide-powers/references/
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本リネーム変更で新たに発生した問題ではなく、元々の設計（`skills/using-aide/references/` 参照）から存在していた潜在的問題。リネームにより顕在化した。変更フォルダ: changes/202605191200-references-workspace-copy/


### PENDING-027: dev-environment.md に kiro-tools.md 表記あり（実体は kiro-ide-tools.md）
- 発生日時: 2026-05-19 13:00
- 発見元ワークフロー: 変更ワークフロー（202605191056-rename-using-aide-to-using-aide-powers）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605191056-rename-using-aide-to-using-aide-powers/
- 発見フェーズ: フェーズ7（差分実装）
- 種別: 設計考慮漏れ
- 重要度: 中
- 詳細: dev-environment.md に `kiro-tools.md` という表記があるが、実体のファイル名は `kiro-ide-tools.md` である。参照名と実体名が不一致。
- 関連ファイル: .aide/specs/aide-powers/dev-environment.md, skills/using-aide-powers/references/kiro-ide-tools.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: 本リネーム変更とは別件の既存欠陥。変更フォルダ: changes/202605191500-dev-environment-update/ で dev-environment.md 全面更新時に解消。

### PENDING-028: 設計書と実装の乖離修正（references パス変更に伴う設計書更新）
- 発生日時: 2026-05-19 12:30
- 発見元ワークフロー: 変更ワークフロー（202605191200-references-workspace-copy）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605191200-references-workspace-copy/
- 発見フェーズ: フェーズ8（完了処理）
- 種別: 設計考慮漏れ
- 重要度: 高
- 詳細: references ファイルの参照パスを `.aide/references/` に変更したが、設計書（system-architecture.md, program-structure.md 等）が実装の現状と乖離している可能性がある。設計逆引きワークフローで設計書を最新化する必要がある。
- 関連ファイル: .aide/specs/aide-powers/system-architecture.md, .aide/specs/aide-powers/program-structure.md
- 推奨対応ワークフロー: 設計逆引き
- 対応状況: 削除（2026-05-19）
- 備考: ユーザー判断により削除。設計書は後で作り直す予定。

### PENDING-029: fs-change-phase7-impl 内に .kiro/specs/ パスが残存
- 発生日時: 2026-05-19 12:40
- 発見元ワークフロー: 変更ワークフロー（202605191200-references-workspace-copy）
- 発見元ドキュメントフォルダ: .aide/specs/aide-powers/changes/202605191200-references-workspace-copy/
- 発見フェーズ: フェーズ7（差分実装）レビュー時
- 種別: 設計考慮漏れ
- 重要度: 中
- 詳細: fs-change-phase7-impl/SKILL.md 内のテンプレート記述に `.kiro/specs/feature_name/` パスが残存している。aide-powers では `.aide/specs/` を使用するため、修正が必要な可能性がある。
- 関連ファイル: skills/fs-change-phase7-impl/SKILL.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: `.kiro/specs/feature_name/` → `.aide/specs/feature_name/` に修正。

### PENDING-030: 変更・バグ修正・リファクタリングの設計時に「更新が必要な設計資料」セクションを必須化
- 発生日時: 2026-05-19 14:00
- 発見元ワークフロー: なし（ユーザー要望）
- 発見元ドキュメントフォルダ: なし
- 発見フェーズ: —
- 種別: 改善要求
- 重要度: 高
- 詳細: |
    変更・バグ修正・リファクタリングの各ワークフローで、既存の設計書（system-architecture.md,
    program-structure.md, object-design-*.md 等）の変更が必要な場合、その内容が個別の設計ドキュメント
    （delta-design.md / fix-design.md / refactoring-design.md）に記載されていないため、
    QAレビューアーが「設計書と実装が違う」と判断して REJECTED を返す問題が発生している。

    **要求する対策:**
    各ワークフローの差分設計フェーズスキルに「更新が必要な設計資料」セクションを必須項目として追加する。
    このセクションには以下を記載する:
    - 更新対象の設計書ファイルパス
    - 更新内容の概要（before → after）
    - 更新タイミング（実装前 / 実装後）

    **対象フェーズスキル:**
    - 変更WF: skills/fs-change-phase4-delta-design/SKILL.md（delta-design.md のテンプレートに追加）
    - バグ修正WF: skills/fs-bugfix-phase4-design/SKILL.md（fix-design.md のテンプレートに追加）
    - リファクタリングWF: skills/fs-refactoring-phase3-design/SKILL.md（refactoring-design.md のテンプレートに追加）

    **対象設計ドキュメントテンプレート:**
    delta-design.md / fix-design.md / refactoring-design.md に以下のセクションを追加:
    ```
    ## 更新が必要な設計資料
    | 設計書ファイル | 更新内容概要 | 更新タイミング |
    |---|---|---|
    | （例）.aide/specs/aide-powers/program-structure.md | XXX クラスの追加 | 実装後 |
    ```
    設計書の変更が不要な場合は「なし」と明記する（空欄禁止）。

    **QAレビューアーへの対応:**
    delta-design-qa-agent / 各QAレビューアーエージェントに「更新が必要な設計資料セクションが
    存在しない場合は REJECTED を返すこと」を追記する。
- 関連ファイル: |
    skills/fs-change-phase4-delta-design/SKILL.md,
    skills/fs-bugfix-phase4-design/SKILL.md,
    skills/fs-refactoring-phase3-design/SKILL.md,
    agents/delta-design-qa-agent.md
- 推奨対応ワークフロー: 変更
- 対応状況: 対応完了（2026-05-19）
- 備考: QAが「設計書と違う」と言ってPASSしてくれない問題の根本原因。設計時に更新対象を明示することで、実装フェーズで設計書更新漏れを防止する。変更フォルダ: changes/202605191500-design-doc-update-section/
