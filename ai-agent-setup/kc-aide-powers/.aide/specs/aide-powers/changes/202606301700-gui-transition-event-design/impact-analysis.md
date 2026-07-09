# 影響範囲分析（Phase 2: 差分設計後の再精査版）

## 変更種別
両方（追加 + 変更）

- **変更**: gui-design スキルへの3セクション追加（REQ-C-001〜003）、architecture-qa-agent / object-design-qa-agent への検証観点追加（REQ-C-004〜005）、ユースケース分析の粒度変更（REQ-C-008）、object-design-qa-agent のレビュー方式変更（REQ-C-007）、design-qa-dispatch の入力パラメータ追加
- **追加**: fixモード差し戻し機構追加（REQ-C-006）、usecase-coverage-reviewer-prompt.md 新規作成

---

## スキル間インターフェース変更追跡（全件）

### 1. design-qa-dispatch への doc_index_path / review_scope 追加

| 項目 | 内容 |
|---|---|
| 変更内容 | `doc_index_path`（必須）と `review_scope`（オプション）を入力パラメータに追加 |
| 影響を受ける呼び出し元 | **7スキル**: fs-design-phase3-dev-plan, fs-design-phase7-ddd, fs-design-phase8-object, fs-design-phase10-program, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design |
| 影響の性質 | 呼び出し時に `doc_index_path` を追加で渡す必要あり。`review_scope` は個別レイヤーレビュー時のみ使用（fs-design-phase8-object） |
| 適用状況 | design-qa-dispatch 側: **編集済み**。呼び出し元7スキル: **未編集**（実装タスクとして対応必要） |

### 2. object-design-qa-agent への doc_index_path 入力追加

| 項目 | 内容 |
|---|---|
| 変更内容 | 入力パラメータに `doc_index_path` を追加。ステップ2「考慮漏れ検証」で doc-index.md から設計書を辿って機能リストを作成する |
| 影響を受ける呼び出し元 | design-qa-dispatch（直接の呼び出し元）。間接的に上記7スキル |
| 影響の性質 | design-qa-dispatch が `doc_index_path` を各QAレビューアーに中継するため、object-design-qa-agent 自体の呼び出し元（design-qa-dispatch）は対応済み |
| 適用状況 | agents/object-design-qa-agent.md: **編集済み**。agents/kiro/object-design-qa-agent.md: **未編集**。agents/kiro/prompts/object-design-qa-agent-prompt.md: **未編集** |

### 3. fs-design-phase6-usecase への fixモード入力追加

| 項目 | 内容 |
|---|---|
| 変更内容 | Input from caller に `mode`（phase6/fix）、`fix_target`、`qa_feedback` を追加 |
| 影響を受ける呼び出し元 | QAエージェント（architecture-qa-agent, object-design-qa-agent）のREJECTED出力に差し戻し先フェーズ名を含むフォーマット追加 → 差し戻しルーティングを行う呼び出し元フェーズスキル |
| 影響の性質 | QA REJECTED時に差し戻し先情報が出力されるようになるが、実際の差し戻しルーティング（mode=fix で phase6 を呼び出す処理）は呼び出し元フェーズスキル側で新規実装が必要 |
| 適用状況 | fs-design-phase6-usecase SKILL.md: **未編集**（差分設計で定義済み、実装タスクとして対応必要） |

### 4. fs-design-phase8-object の Step 構成変更

| 項目 | 内容 |
|---|---|
| 変更内容 | 固定5サブフェーズ → 動的レイヤー構成 + 各レイヤー直後の個別レビュー挿入 |
| 影響を受ける呼び出し元 | **なし**（外部インターフェースは不変。Input from caller の変更なし） |
| 影響の性質 | 内部Step構成の変更のみ。design-qa-dispatch への呼び出しパターンが増える（review_scope 付き個別レイヤーレビュー）が、design-qa-dispatch 側は対応済み |
| 適用状況 | skills/fs-design-phase8-object/SKILL.md: **編集済み** |

### 5. usecase-coverage-reviewer-prompt.md 新規追加

| 項目 | 内容 |
|---|---|
| 変更内容 | UC網羅性レビュー用プロンプトテンプレートを新規作成 |
| 影響を受ける呼び出し元 | fs-design-phase6-usecase（内部の新 Step 3 から呼び出す） |
| 影響の性質 | 新規ファイルのため既存呼び出し元への影響なし |
| 適用状況 | **未作成**（実装タスクとして対応必要） |

### 6. architecture-qa-agent の REJECTED 出力フォーマット変更

| 項目 | 内容 |
|---|---|
| 変更内容 | FAIL項目の修正指示テーブルに「差し戻し先（該当時のみ）」列を追加 |
| 影響を受ける呼び出し元 | fs-design-phase7-ddd（architecture-qa-agentのREJECTED結果を受け取り修正ループを実行する） |
| 影響の性質 | REJECTED出力に差し戻し先情報が追加されるが、既存の修正ループ構造自体は不変。差し戻し先が「—」の場合は従来通り当該ファイル修正。差し戻し先が指定された場合のルーティング処理は新規実装が必要 |
| 適用状況 | agents/architecture-qa-agent.md: **未編集**。agents/kiro/architecture-qa-agent.md: **未編集**。agents/kiro/prompts/architecture-qa-agent-prompt.md: **未編集** |

### 7. object-designer-prompt.md の mode 追加（未確認事項）

| 項目 | 内容 |
|---|---|
| 変更内容 | 動的レイヤー構成に伴い、mode: phase8_{layer-name} で各レイヤーを切り替える方式。fix モードも追加 |
| 影響を受ける呼び出し元 | fs-design-phase8-object（内部からの呼び出し） |
| 影響の性質 | SKILL.md の記述上は mode: phase8_{layer-name} で呼び出す前提だが、プロンプト内の mode 判定ロジック追加が未確認 |
| 適用状況 | object-designer-prompt.md: **未確認**（差分設計書に「mode 追加が必要」と記載あり） |

---

## アクター視点の影響

### 影響を受けるユースケース

| 要件ID | 影響内容 |
|---|---|
| UR-001 | 設計WFフェーズ5（GUI設計）・フェーズ6（ユースケース分析）・フェーズ8（オブジェクト設計）の処理内容変更、フェーズ間差し戻し機構の追加 |
| UR-006 | ゲート2（architecture-qa-agent）・ゲート3（object-design-qa-agent）の検証観点拡充。個別レイヤーレビュー方式導入による早期品質確保 |
| UR-004 | architecture-qa-agent・object-design-qa-agentの責務範囲拡張（GUI設計3セクション検証・考慮漏れ検証） |
| UR-005 | GUI設計の詳細化（イベント制御表・状態遷移図）により間接的に実装レビュー精度向上 |
| UR-003 | fixモード追加がプラットフォーム共通で適用（3プラットフォーム分のエージェント定義に同一内容を反映） |

### 影響を受けるアクター

| アクター | 影響内容 |
|---|---|
| AIエージェントを使うソフトウェア開発者 | ① GUI設計成果物の充実化（画面遷移フロー・イベント制御表・状態遷移図が必須出力に） ② QAレビューの厳格化（3セクション欠落で FAIL） ③ ユースケース分析の詳細化（全操作網羅が必須） ④ 設計不備発見時の差し戻し・再分析による品質向上 |

---

## プログラム構成視点の影響

### 変更対象ファイル（直接編集）

| ファイル | 変更種別 | 変更概要 | 適用状況 |
|---|---|---|---|
| `skills/gui-design/SKILL.md` | 変更 | 完了条件に3セクション追加、Red Flags追加 | 未編集 |
| `skills/gui-design/gui-designer-prompt.md` | 変更 | create/deltaモードのステップ追加、成果物フォーマットに3セクション追加 | 未編集 |
| `skills/gui-design/gui-reverse-prompt.md` | 変更 | reverseモードに3ステップ追加（7→10ステップ化） | 未編集 |
| `agents/architecture-qa-agent.md` | 変更 | 検証項目2-1拡張 + REJECTED出力に差し戻し先列追加 | 未編集 |
| `agents/kiro/architecture-qa-agent.md` | 変更 | 同上（Kiro IDE用） | 未編集 |
| `agents/kiro/prompts/architecture-qa-agent-prompt.md` | 変更 | 同上（Kiro CLI用） | 未編集 |
| `agents/object-design-qa-agent.md` | 変更 | doc_index_path入力追加 + ステップ2「考慮漏れ検証」追加 + ステップ番号繰り下げ | **編集済み** |
| `agents/kiro/object-design-qa-agent.md` | 変更 | 同上（Kiro IDE用） | 未編集 |
| `agents/kiro/prompts/object-design-qa-agent-prompt.md` | 変更 | 同上（Kiro CLI用） | 未編集 |
| `skills/design-qa-dispatch/SKILL.md` | 変更 | doc_index_path/review_scope入力追加、各QAレビューアーへの渡し情報追加 | **編集済み** |
| `skills/fs-design-phase6-usecase/SKILL.md` | 変更 | fixモードエントリポイント追加、UC網羅性レビューStep追加、Step番号繰り下げ | 未編集 |
| `skills/fs-design-phase6-usecase/usecase-lister-prompt.md` | 変更 | 粒度基準セクション追加 | 未編集 |
| `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md` | **新規** | UC網羅性レビュー用プロンプトテンプレート | 未作成 |
| `skills/fs-design-phase8-object/SKILL.md` | 変更 | 動的レイヤー構成 + 個別レビュー挿入 + Integration更新 | **編集済み** |
| `skills/fs-design-phase8-object/object-designer-prompt.md` | 変更 | mode追加（phase8_{layer-name} / fix） | **未確認** |
| `skills/fs-design-phase8-object/ddd-modeler-prompt.md` → `domain-layer-object-designer-prompt.md` | リネーム | ドメイン層オブジェクト設計専用プロンプトのリネーム | **リネーム済み** |

### 依存関係（変更対象を参照しているファイル — doc_index_path 追加が必要なスキル）

| ファイル | 依存内容 | 影響レベル | 必要な対応 |
|---|---|---|---|
| `skills/fs-design-phase3-dev-plan/SKILL.md` | design-qa-dispatch 呼び出し（requirements-qa-agent） | **中** | doc_index_path パラメータ追加 |
| `skills/fs-design-phase7-ddd/SKILL.md` | design-qa-dispatch 呼び出し（architecture-qa-agent）+ REJECTED修正ループ | **高** | doc_index_path 追加 + 差し戻し先ルーティング新規対応 |
| `skills/fs-design-phase8-object/SKILL.md` | design-qa-dispatch 呼び出し（object-design-qa-agent）+ review_scope使用 | **対応済み** | SKILL.md 編集済み |
| `skills/fs-design-phase10-program/SKILL.md` | design-qa-dispatch 呼び出し（final-design-qa-agent） | **中** | doc_index_path パラメータ追加 |
| `skills/fs-change-phase2-impl/SKILL.md` | design-qa-dispatch 呼び出し（差分設計QA） | **中** | doc_index_path パラメータ追加 |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | design-qa-dispatch 呼び出し（差分設計QA） | **中** | doc_index_path パラメータ追加 |
| `skills/fs-refactoring-phase4-design/SKILL.md` | design-qa-dispatch 呼び出し（差分設計QA） | **中** | doc_index_path パラメータ追加 |

### 依存関係（gui-design.md の成果物変更に依存するファイル）

| ファイル | 依存内容 | 影響レベル | 必要な対応 |
|---|---|---|---|
| `skills/fs-design-phase5-gui/SKILL.md` | gui-design スキルを呼び出す（create モード） | **低** | 動作変更不要（gui-design内部の完了条件拡張。呼び出しインターフェース不変） |
| `skills/fs-reverse-phase5-optional-phases/SKILL.md` | gui-design を reverse モードで呼び出す | **低** | 動作変更不要（reverse モードのステップ数は増えるがインターフェース不変） |
| `skills/infra-interface-design/infra-interface-designer-prompt.md` | gui-design.md を入力として参照 | **低** | 動作変更不要（参照セクション追加のみ、既存参照に影響なし） |
| `skills/program-structure-design/SKILL.md` | gui-design.md を参照 | **低** | 動作変更不要 |

---

## 既存要件との矛盾確認

| 確認対象 | 結果 |
|---|---|
| user-requirements.md UR-001〜035 | **矛盾なし** — 変更はUR-001（設計WF強化）、UR-004（サブエージェント専門分業強化）、UR-006（設計QAゲート拡充）の方向で整合 |
| system-requirements.md §4.4 QA判定基準 | **矛盾なし** — 検証項目の追加のみ。FAIL=0 かつ WARNING=0 で APPROVED の判定基準は不変 |
| system-requirements.md §4.1 エラー分類 | **矛盾なし** — REJECTED の使い方は既存定義通り。差し戻し先情報の付加は拡張であり既存定義と矛盾しない |
| system-requirements.md §4.2 エラー伝播ルール | **矛盾なし** — サブエージェント→フェーズスキル→ユーザーの伝播構造は維持 |
| dev-environment.md §7.4 自動テスト方針 | **矛盾なし** — 手動検証方針は維持。テスト対象機能は手動確認として定義 |
| dev-environment.md §14 design-gate扱い | **矛盾なし** — メタ開発のdesign-gate適用対象外ルールに影響なし |

---

## テスト対象機能（手動確認すべき機能）

本プロジェクトは手動検証（dev-environment.md §7）のため、以下を「手動確認すべき機能」として列挙する。

### 優先度: 高（コア機能の変更）

| # | 確認対象 | 確認手順 | 対応REQ-C |
|---|---|---|---|
| 1 | gui-design スキル（create モード）で3セクションが出力されること | 設計WFフェーズ5を実行し、gui-design.md に画面遷移フロー・イベント制御表・状態遷移図が含まれることを確認 | 001-003 |
| 2 | gui-design スキル（reverse モード）で3セクションが抽出されること | 逆引きWFで gui-design を reverse 実行し、3セクションが出力されることを確認 | 001-003 |
| 3 | architecture-qa-agent が3セクション欠落時にFAILを出力すること | 3セクションを含まないgui-design.mdに対してQAレビューを実行し、FAILが出ることを確認 | 004 |
| 4 | architecture-qa-agent のREJECTED出力に差し戻し先情報が含まれること | 3セクション欠落でREJECTED時、修正指示テーブルに差し戻し先列が記載されることを確認 | 004, 006 |
| 5 | object-design-qa-agent の考慮漏れ検証（ステップ2）が機能すること | object-design-qa-agent を実行し、doc_index_path経由で設計書を辿り機能リスト照合が行われることを確認 | 005 |
| 6 | fs-design-phase6-usecase のfixモードが機能すること | mode=fix, fix_target, qa_feedback を指定して phase6 を実行し、Step Fix が実行されて呼び出し元に制御が戻ることを確認 | 006 |
| 7 | fs-design-phase8-object の動的レイヤー構成が機能すること | 設計WFフェーズ8を実行し、layered-architecture.md から動的にレイヤーリストを取得して設計+レビューのペアが繰り返されることを確認 | 007 |
| 8 | 各レイヤー直後の個別レビュー（review_scope付き）が機能すること | フェーズ8実行中に各レイヤー設計後に個別レビューが実行され、REJECTED時にfix→再レビューループが動作することを確認 | 007 |
| 9 | UC網羅性レビュー（usecase-coverage-reviewer-prompt.md）が機能すること | フェーズ6のStep3でサブエージェントが実行され、未カバー操作の検出・報告が行われることを確認 | 008 |

### 優先度: 中（呼び出しパラメータ追加の波及確認）

| # | 確認対象 | 確認手順 | 影響元 |
|---|---|---|---|
| 10 | design-qa-dispatch に doc_index_path を渡す7スキルが正常動作すること | 各スキルから design-qa-dispatch を呼び出す際に doc_index_path が渡され、QAレビューが正常実行されることを確認 | design-qa-dispatch 変更 |
| 11 | 3プラットフォーム分のエージェント定義が同一内容であること | agents/architecture-qa-agent.md、agents/kiro/architecture-qa-agent.md、agents/kiro/prompts/architecture-qa-agent-prompt.md の検証項目が一致することを確認 | 004 |
| 12 | 3プラットフォーム分のエージェント定義が同一内容であること | agents/object-design-qa-agent.md、agents/kiro/object-design-qa-agent.md、agents/kiro/prompts/object-design-qa-agent-prompt.md の検証項目が一致することを確認 | 005 |

### 優先度: 低（間接影響の確認）

| # | 確認対象 | 確認手順 | 影響元 |
|---|---|---|---|
| 13 | gui-design delta モードで3セクション変更が差分に含まれること | 変更WFで gui-design delta モードを実行し、3セクションの before→after が出力されることを確認 | 001-003 |
| 14 | usecase-lister-prompt.md の粒度基準が適用されること | フェーズ6 Step2 で粒度基準に基づいたUCリストが生成されることを確認 | 008 |

---

## 説明対象アクターの特定

| アクター | 説明が必要な内容 | 理由 |
|---|---|---|
| AIエージェントを使うソフトウェア開発者（ユーザー） | ① GUI設計の成果物に3セクションが追加されたこと（設計フェーズの所要時間増加の可能性） ② QAレビューの基準が厳格化されたこと（REJECTED発生頻度の増加可能性） ③ ユースケース分析が全操作網羅レベルに詳細化されたこと | 設計WF実行時の体感変化が大きい。従来より詳細な成果物が求められるため、ワークフロー実行時間・対話回数が増加する可能性がある |

**説明不要のアクター:**
- 他のフレームワーク利用者（変更ワークフロー・バグ修正ワークフロー利用者）: design-qa-dispatch への doc_index_path 追加は透過的（内部パラメータ追加であり、ユーザー操作に変更なし）

---

## Phase 1 からの差分（再精査で判明した追加事項）

| # | 項目 | Phase 1 の記載 | Phase 2 での修正 |
|---|---|---|---|
| 1 | design-qa-dispatch 呼び出し元への影響 | 「ルーティング自体は不変」と記載 | 呼び出し元7スキル全てで `doc_index_path` パラメータ追加が必要（軽微だが全件対応必須） |
| 2 | gui-reverse-prompt.md | 依存関係として記載のみ | 差分設計に3ステップ追加（7→10ステップ化）が明記。変更対象ファイルに格上げ |
| 3 | object-designer-prompt.md | 記載なし | mode 追加が必要であることが差分設計で判明。適用状況「未確認」 |
| 4 | architecture-qa-agent REJECTED出力 | 修正ループ構造不変と記載 | 差し戻し先情報の追加により、fs-design-phase7-ddd での差し戻しルーティング新規対応が必要 |
| 5 | usecase-coverage-reviewer-prompt.md | 記載なし | 新規作成ファイルとして明確化。fs-design-phase6-usecase の Step 3 で使用 |
| 6 | fs-design-phase6-usecase Step番号繰り下げ | 記載なし | UC網羅性レビュー Step 追加により旧Step3以降が番号繰り下げ |
| 7 | ddd-modeler-prompt.md リネーム | 記載なし | domain-layer-object-designer-prompt.md にリネーム済み |

---

## 未確認事項・懸念事項

| # | 項目 | 詳細 | リスクレベル |
|---|---|---|---|
| 1 | object-designer-prompt.md の mode 判定ロジック | 差分設計書に「mode 追加が必要」と記載あるが、プロンプト内の mode 判定ロジックが未確認。動的レイヤー名（phase8_{layer-name}）への対応が必要 | 中 |
| 2 | fs-design-phase7-ddd での差し戻しルーティング | architecture-qa-agent の REJECTED 出力に差し戻し先が含まれるようになるが、実際に fs-design-phase6-usecase を fix モードで呼び出すルーティング処理は phase7 側に新規実装が必要 | 中 |
| 3 | 3プラットフォーム分のエージェント定義同期 | agents/kiro/object-design-qa-agent.md と agents/kiro/prompts/object-design-qa-agent-prompt.md が未編集。agents/object-design-qa-agent.md と同一内容に更新が必要 | 低（実装時に対応） |

---

## 起因元ドキュメントフォルダ

- パス: なし（Docs: パスあり、ただし今回の変更とは無関係）
- コミットハッシュ: 395709946aa2c8bd8b10b3626b937def1108cd50
- コミットメッセージ1行目: feat: 変更WF(10→3)とバグ修正WF(7→3)のフェーズ統合
- 検証結果: 無関係 — 起因元は「スクリーンショット証跡による履歴偽装検出の強化」と「WFフェーズ統合」が主テーマであり、今回の「GUI画面遷移・イベント制御・状態遷移図の設計強化」とは目的・内容ともに異なる
