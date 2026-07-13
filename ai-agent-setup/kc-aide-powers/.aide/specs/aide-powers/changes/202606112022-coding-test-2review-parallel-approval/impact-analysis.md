# 影響範囲分析（Phase 2: 差分設計反映版）

## 変更種別
両方（変更 + 削除）

## アクター視点の影響

### 影響を受けるユースケース
- UR-001: 7つのワークフロー提供 — 実装WF・変更WF・バグ修正WFのタスク計画段階で生成される工程チェック表の行キールールが明確化される。正しい行キー生成によりタスク実行フェーズでの工程追跡精度が向上する
- UR-004: 12種サブエージェントによる専門分業 — micro-impl-agent / design-review-agent / code-review-agent が工程チェック表を参照する際、サブタスクID単位の行キーにより正確な工程特定が可能になる
- UR-010: 共通スキル群による横断的ユーティリティ — impl-task-planning 共通スキルのルールがプロンプトテンプレートレベルまで浸透し、ルール適用の確実性が向上する

### 影響を受けるアクター
- AIエージェント（タスクプランナー） — 工程チェック表の行キー生成時にサブタスクID単位で行キーを作るルールが明示され、親タスクIDでの誤生成が防止される
- AIエージェント（実装エージェント） — 工程チェック表の行キーが正しく生成されることで、工程更新時の対象行特定が確実になる

---

## プログラム構成視点の影響

### 変更対象ファイル（差分設計確定版）
| ファイル | 変更種別 | 変更概要 | CR |
|---|---|---|---|
| `skills/fs-change-phase2-impl/change-task-planner-prompt.md` | 変更 | ステップ6に行キー生成ルールを追記 | CR-001 |
| `skills/fs-bugfix-phase2-impl/bugfix-task-planner-prompt.md` | 変更 | ステップ6に行キー生成ルールを追記 | CR-001 |
| `skills/impl-task-planning/impl-planner-prompt.md` | 変更 | ステップ7に行キー生成ルールを追記 | CR-001 |
| `skills/fs-impl-phase2-preparation/impl-planner-prompt.md` | 削除 | 冗長コピーの除去 | CR-002 |
| `skills/fs-impl-phase2-preparation/SKILL.md` | 変更 | Step 3/4 のプロンプト参照先を共通スキルに変更、Integration セクション更新（4箇所: A/B/C/D） | CR-002 |
| `.aide/specs/aide-powers/program-structure.md` | 変更 | `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行を更新 | CR-002 |

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `skills/fs-change-phase2-impl/SKILL.md` | `change-task-planner-prompt.md` をサブエージェントプロンプトとして参照 | 低（プロンプト内容追記のみで呼び出し方法は不変） |
| `skills/fs-bugfix-phase2-impl/SKILL.md` | `bugfix-task-planner-prompt.md` をサブエージェントプロンプトとして参照 | 低（プロンプト内容追記のみで呼び出し方法は不変） |
| `skills/impl-task-planning/SKILL.md` | `impl-planner-prompt.md` を同スキル配下のプロンプトとして管理 | 低（プロンプト内容追記のみでスキル構造は不変） |
| `skills/fs-impl-phase4-execution/SKILL.md` | impl-process-checklist.md を実行時に読み取り・更新する | 低（行キーフォーマットは既存定義と整合的。生成側の明確化のみ） |
| `skills/coding-test-2review/SKILL.md` | impl-process-checklist.md の工程行を参照・更新する | 低（行キーフォーマットは既存の `{task_id}::{工程キー}` と同一） |
| `.kiro/skills/fs-impl-phase2-preparation/impl-planner-prompt.md` | setup.bat でコピーされたミラー。ソース削除後に setup.bat 再実行で反映 | 中（setup.bat 再実行までは旧コピーが残存する） |
| `.github/skills/impl-task-planning/impl-planner-prompt.md` | setup-local.bat でコピーされたミラー | 低（setup-local.bat 再実行で反映） |
| `skills/fs-refactoring-phase4-design/SKILL.md` | impl-task-planning スキルを activate してタスク分解を実行 | 低（共通スキルの追記により自動的に恩恵を受ける） |

---

## シグネチャ変更追跡結果

**該当なし。**

本変更はMarkdownファイル（プロンプトテンプレート/スキル定義）のテキスト追記・参照パス変更・ファイル削除のみで構成される。プログラムコードのシグネチャ変更は存在しない。

---

## 既存要件矛盾確認結果

| 確認対象 | 結果 |
|---|---|
| UR-001（7つのワークフロー提供） | ✅ 矛盾なし — 実装WF・変更WF・バグ修正WFの品質向上に寄与 |
| UR-004（12種サブエージェントによる専門分業） | ✅ 矛盾なし — サブエージェントの工程追跡精度が向上 |
| UR-010（共通スキル群による横断的ユーティリティ） | ✅ 矛盾なし — 共通スキル（impl-task-planning）のルール浸透強化 |
| UR-011（ファイルベースのデータ管理） | ✅ 矛盾なし — 変更はMarkdownファイルの追記・削除のみ |
| UR-035（メタ開発ではスキル定義が設計書を兼ねる） | ✅ 矛盾なし — スキル定義内のルール明確化であり方針と整合 |
| C-02（リポジトリ編集は即時反映されない） | ✅ 矛盾なし — setup.bat 再実行で反映される前提を変更要求が明示済み |

**結論: 既存ユーザー要件・システム制約との矛盾は検出されなかった。**

---

## 差分設計で追加判明した変更箇所（Phase 1版からの差分）

| 追加判明箇所 | 内容 |
|---|---|
| `.aide/specs/aide-powers/program-structure.md` | `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行を更新（`impl-planner-prompt.md` を本スキルディレクトリ配下から共通スキル参照に変更） |
| `skills/fs-impl-phase2-preparation/SKILL.md` 変更箇所B/C | Phase 1 では変更箇所A/D のみ想定していたが、delta-design により Step 4（修正ループ時）と Step 3（NEEDS_CONTEXT時）の参照記述も変更対象であることが判明 |

---

## テスト対象機能

本プロジェクトはメタ開発（Markdownフレームワーク）のため自動テストは存在しない（C-03準拠）。

### 動作確認項目

| # | 確認項目 | 確認方法 |
|---|---|---|
| T-1 | `change-task-planner-prompt.md` のステップ6に行キー生成ルールが正しく追記されていること | ファイル読み取りで該当セクションの内容確認 |
| T-2 | `bugfix-task-planner-prompt.md` のステップ6に行キー生成ルールが正しく追記されていること | ファイル読み取りで該当セクションの内容確認 |
| T-3 | `impl-task-planning/impl-planner-prompt.md` のステップ7に行キー生成ルールが正しく追記されていること | ファイル読み取りで該当セクションの内容確認 |
| T-4 | `fs-impl-phase2-preparation/impl-planner-prompt.md` が削除されていること | ファイル不存在確認 |
| T-5 | `fs-impl-phase2-preparation/SKILL.md` の Step 3 参照先が `skills/impl-task-planning/impl-planner-prompt.md` に変更されていること | ファイル読み取りで参照パス確認 |
| T-6 | `fs-impl-phase2-preparation/SKILL.md` の Step 4（修正ループ）参照先が共通スキルに変更されていること | ファイル読み取りで参照パス確認 |
| T-7 | `fs-impl-phase2-preparation/SKILL.md` の Step 3（NEEDS_CONTEXT時）参照先が共通スキルに変更されていること | ファイル読み取りで参照パス確認 |
| T-8 | `fs-impl-phase2-preparation/SKILL.md` の Integration セクションが共通スキル参照形式に更新されていること | ファイル読み取りで記述確認 |
| T-9 | `program-structure.md` の `fs-impl-phase2-preparation` セクションのプロンプトテンプレート行が更新されていること | ファイル読み取りで記述確認 |
| T-10 | 3ファイル（CR-001）の追記内容が完全に同一のルール文であること | 3ファイルの該当セクションを比較確認 |

---

## 説明対象アクター

| アクター | 周知内容 | 周知方法 |
|---|---|---|
| AIエージェント（タスクプランナー） | 行キー生成ルール: サブタスクID単位で行キーを生成し、サブタスクがないタスクのみ親タスクIDで行を作る | プロンプトテンプレートへの直接追記（実装完了後、setup.bat 再実行で各プラットフォームに反映） |
| AIエージェント（実装エージェント） | 変更なし（生成側ルールの明確化であり、参照・更新側のロジックには影響しない） | 周知不要（恩恵は自動的に享受） |

---

## リスク・考慮事項

| # | リスク | 軽減策 |
|---|---|---|
| 1 | setup.bat 再実行まで `.kiro/skills/` 配下のミラーに旧 `impl-planner-prompt.md` コピーが残存する | 実装完了後に setup.bat 再実行をリリース手順に含める |
| 2 | `fs-impl-phase2-preparation/SKILL.md` の参照パス変更が4箇所あり、1箇所でも漏れると参照不整合が発生する | delta-design の変更箇所A/B/C/D を順次適用し、T-5〜T-8で全箇所確認 |
| 3 | program-structure.md の更新漏れ（設計資料の同期） | T-9 で更新確認。doc-sync 対象として明示 |

---

## 起因元ドキュメントフォルダ
- パス: .aide/specs/aide-powers/changes/202606112022-coding-test-2review-parallel-approval/
- コミットハッシュ: 01e52731dead6c781e83ad84ae150915e107d2f9
- コミットメッセージ1行目: feat: coding-test-2review 工程内並列化・手順逸脱統制・工程チェック表1工程1行化（PI-033）
- 検証結果: 関連あり（工程チェック表のフォーマットを1工程1行構造に変更したコミットであり、行キー `{task_id}::{工程キー}` の定義を導入した起因元。今回の変更はその行キー生成ルールのサブタスクID対応を明示する追加修正）

*Docs: .aide/specs/aide-powers/changes/202606292100-task-list-row-key-subtask-rule*
