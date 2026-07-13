# 差分設計書（索引）

## 変更概要

GUI設計フェーズにおける画面遷移フロー・イベント制御表・状態遷移図の必須化、QAエージェントの検証観点拡充、ユースケース分析の粒度細分化、fixモード追加、およびobject-design-qa-agentのレビュー方式変更を行う。

## 設計方針

- 既存マークダウンファイルへの追記・修正で対応する（一部新規ファイル追加あり）
- 既存のセクション構成・フォーマット・文体を踏襲する
- 3プラットフォーム分のエージェント定義（agents/, agents/kiro/, agents/kiro/prompts/）は同一の検証項目内容を各ファイルの形式に合わせて記述する
- REQ-C-005 と REQ-C-007 はユーザーが直接ファイル編集済み。差分設計書には実際の編集結果を before→after 形式で記録する
- オーケストレータ（フェーズスキル）自身が実作業するのではなく、プロンプトテンプレートを用意してサブエージェントに委譲する

## 分割ファイル一覧

| # | ファイル名 | 対象REQ-C | 内容サマリ |
|---|---|---|---|
| 1 | [delta-design-gui-design.md](./delta-design-gui-design.md) | 001, 002, 003 | gui-design スキル（SKILL.md / gui-designer-prompt.md / gui-reverse-prompt.md）への3セクション追加 |
| 2 | [delta-design-qa-agents.md](./delta-design-qa-agents.md) | 004, 005 | architecture-qa-agent / object-design-qa-agent への検証観点追加 + design-qa-dispatch への doc_index_path/review_scope 入力追加 |
| 3 | [delta-design-phase-skills.md](./delta-design-phase-skills.md) | 006, 007, 008 | fs-design-phase6-usecase（fixモード追加 + UC網羅性レビュー Step 追加）/ fs-design-phase8-object（レイヤー動的構成化 + 個別レビュー挿入）/ usecase-coverage-reviewer-prompt.md 新規作成 |

## インターフェース影響サマリ

### シグネチャ変更

なし。本変更はマークダウンベースのスキル定義プロジェクトであり、プログラミング言語のインターフェース（関数シグネチャ等）は存在しない。

### スキル間インターフェースの変更

| 変更箇所 | 影響を受ける呼び出し元 | 影響内容 |
|---|---|---|
| gui-design スキルの完了条件拡張 | fs-design-phase5-gui | gui-design.md の成果物に3セクション（画面遷移フロー・イベント制御表・状態遷移図）が追加される。呼び出し元の動作変更は不要（完了条件はスキル内部で判定） |
| architecture-qa-agent の検証項目追加 + REJECTED出力に差し戻し先フォーマット追加 | fs-design-phase7-ddd, design-qa-dispatch | QA REJECTED時の修正指示に新項目・差し戻し先情報が含まれうる。ルーティング・修正ループの構造変更は不要 |
| object-design-qa-agent の検証項目追加（考慮漏れ検証 + doc_index_path 入力） | fs-design-phase8-object, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design | 呼び出し元から doc_index_path を渡す必要がある。design-qa-dispatch 経由で渡される |
| design-qa-dispatch の入力パラメータ追加（doc_index_path, review_scope） | fs-design-phase3-dev-plan, fs-design-phase7-ddd, fs-design-phase8-object, fs-design-phase10-program, fs-change-phase2-impl, fs-bugfix-phase2-impl, fs-refactoring-phase4-design | 呼び出し元から doc_index_path を渡す必要がある。review_scope はオプション（個別レイヤーレビュー時に使用） |
| fs-design-phase6-usecase の fixモード追加 | architecture-qa-agent, object-design-qa-agent（差し戻し指示の出力先として） | QAエージェントのREJECTED出力に差し戻し先フェーズ名を含むフォーマット追加 |
| fs-design-phase8-object のStep構成変更（動的レイヤー + 個別レビュー） | design-qa-dispatch | review_scope パラメータで個別レイヤーレビュー / 全体整合性レビューを区別。design-qa-dispatch 側は対応済み |
| fs-design-phase6-usecase に UC網羅性レビュー Step 追加 | — | 新規 Step のため既存呼び出し元への影響なし。usecase-coverage-reviewer-prompt.md を新規作成 |

### 呼び出し元への影響

- **fs-design-phase5-gui**: 動作変更不要。gui-design スキルの内部完了条件が拡張されるが、スキル呼び出しインターフェース（mode, feature_name等）は不変
- **fs-design-phase7-ddd**: 動作変更不要。architecture-qa-agentのREJECTED修正ループ構造は既存のまま
- **design-qa-dispatch**: **変更済み**。doc_index_path / review_scope の入力追加、各QAレビューアーへの渡し情報追加、target_reviewer の許容値明記
- **fs-design-phase3-dev-plan / fs-design-phase7-ddd / fs-design-phase10-program**: design-qa-dispatch 呼び出し時に doc_index_path を渡す必要あり（軽微な呼び出しパラメータ追加）
- **fs-change-phase2-impl / fs-bugfix-phase2-impl / fs-refactoring-phase4-design**: design-qa-dispatch 呼び出し時に doc_index_path を渡す必要あり（軽微な呼び出しパラメータ追加）

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 優先度 |
|---|---|---|
| program-structure.md | `usecase-coverage-reviewer-prompt.md` の新規追加を反映 | 低（実装時に自動反映） |
| doc-index.md | 変更なし（新規ドキュメント追加なし） | — |
| user-requirements.md | 変更なし | — |

## 新規作成ファイル

| ファイル | 内容 |
|---|---|
| `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md` | UC網羅性レビュー用プロンプトテンプレート（新規） |
