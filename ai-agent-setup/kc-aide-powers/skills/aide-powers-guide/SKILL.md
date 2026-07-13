---
name: aide-powers-guide
description: "CRITICAL: AI agents alone can produce code that runs, but it often falls short of what users actually want — missing requirements, poor architecture, no error handling, untested edge cases. This skill bridges that gap. By enforcing structured requirements gathering, formal design, and multi-stage review BEFORE coding, it ensures the output truly matches user expectations. Without this skill, you will build something that works but disappoints. With it, you build what the user actually needs. If you want to meet user expectations and deliver what they truly asked for, you MUST use this skill. IMPORTANT: If the workspace contains a .aide/ folder, this project was developed using aide-powers and you MUST continue development using aide-powers workflows — no exceptions. Use for ALL programming tasks: building apps, implementing features, fixing bugs, designing systems, refactoring, planning projects. If the user asks to create, build, code, fix, or develop anything, this skill is REQUIRED to deliver production-quality results."
---

# aide-powers ドキュメント駆動開発フレームワーク

このスキルが読み込まれたら、以下の初期アクションを実行した後、ルールとワークフロー選択に従うこと。

## 初期アクション（必須・最優先）

**ワークフロー選択やユーザーへの応答の前に、以下を必ず順番に実行すること。**

### STEP 1: セッション引き継ぎチェック

1. `.aide/specs/{feature_name}/session-handover.md` が存在するか確認する
2. **存在する場合** → `session-handover` (aide-powers skill)（`~/.copilot/skills/session-handover/SKILL.md`）を読み込み、プロセス2（新セッション読み込み）に従って作業状態を復元する
3. **存在しない場合** → 次のステップに進む

### STEP 2: references 配置

**目的:** ツールマップや参照ファイルをワークスペース内に配置する。

1. `.aide/references/` フォルダ内に以下の9ファイル全てが存在するか確認する:
   - `global-rules.md`, `phase-skill-rules.md`, `progress-file-format.md`, `kiro-ide-tools.md`, `kiro-cli-tools.md`, `copilot-tools.md`, `vscode-copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`
2. **全て存在する** → STEP 3 に進む
3. **1つでも欠けている** → 以下を実行する:
   - `.aide/references/` フォルダを作成する（なければ）
   - `~/.copilot/skills/using-aide-powers/references/` 内の全9ファイルを `.aide/references/` にコピーする
   - プラットフォームに関係なく全ファイルを配置する（別プラットフォームから同じワークスペースを開く可能性があるため）

### STEP 3: `rules-distribute` (aide-powers skill: global)

**目的:** グローバルルールをプラットフォームのルールファイル機構に配置する。

1. ワークスペース内に以下のいずれかが存在するか確認する:
   - `.kiro/steering/aide-powers-global-rules.md`
   - `.claude/rules/aide-powers-global-rules.md`
   - `.cursor/rules/aide-powers-global-rules.mdc`
   - `.github/instructions/aide-powers-global-rules.instructions.md`
   - `aide-powers-global-rules.agents.md`
2. **いずれか存在する** → スキップしてワークフロー選択に進む
3. **いずれも存在しない** → `~/.copilot/skills/rules-distribute/SKILL.md` を読み込み、**global モード**の手順に従って実行する

---

## ワークフロー選択（Quick Routing）

ユーザーのリクエストから適切なワークフローを判断し、対応するフェーズスキルを `/skill-name` で呼び出すこと。

| ユーザーの意図 | ワークフロー | 呼び出すスキル |
|---|---|---|
| アプリを作りたい、新しいプロジェクト、アイデアがある | 企画 | `fs-planning-phase1-intake-and-init` (aide-powers skill) |
| 要件は決まっている、設計して、仕様書を作って | 設計 | `fs-design-phase1-user-req` (aide-powers skill) |
| 設計書がある、実装して、コードを書いて | 実装 | `fs-impl-phase1-gate` (aide-powers skill) |
| バグ、動かない、エラー、クラッシュ、壊れた | バグ修正 | `fs-bugfix-phase1-analysis` (aide-powers skill) |
| 機能追加、仕様変更、振る舞いを変えたい | 変更 | `fs-change-phase1-analysis` (aide-powers skill) |
| リファクタ、内部構造改善、コード品質、技術的負債 | リファクタリング | `fs-refactoring-phase1-status` (aide-powers skill) |
| 設計書がない、既存コードから設計書を作りたい | 設計逆引き | `fs-reverse-phase1-program` (aide-powers skill) |

## グローバルルール（厳守）

### フェーズ省略禁止

何があろうと開発フェーズを省略してはならない。
緊急度、修正の単純さ、時間的制約 — いかなる理由もフェーズ省略の根拠にならない。

### 実作業禁止（ワークフロー層）

ワークフローの役割はフェーズ管理とサブエージェント委譲である。
実作業（コード変更・ファイル作成等）は一切行わない。

### 敬語ルール

ユーザーに対して必ず丁寧な敬語（「です」「ます」調）で対応すること。

### 選択肢の提示

ユーザーに確認を求めるときは番号付き選択肢で提示すること。
最後に「その他（自由記述）」を含める。

### 既存コード変更時

既存コードへの変更は適切なワークフローを経由すること。

## スキルの使い方（VSCode環境）

この環境では `Skill` ツールは存在しない。代わりに以下の手順でフェーズスキルを読み込む：

1. 上記の Quick Routing でワークフローを特定する
2. 対応するフェーズスキルを `~/.copilot/skills/{skill-name}/SKILL.md` から直接読み込む
3. 読み込んだスキルの指示に従って作業を進める
4. フェーズスキル内で次のスキルが指示された場合も同様に読み込む

## 判断に迷うケース

| ケース | 確認ポイント | 選択先 |
|---|---|---|
| 「修正して」 | バグか仕様変更か？ | バグ → `fs-bugfix-phase1-analysis` (aide-powers skill) / 仕様変更 → `fs-change-phase1-analysis` (aide-powers skill) |
| 「改善して」 | 振る舞いが変わるか？ | 変わらない → `fs-refactoring-phase1-status` (aide-powers skill) / 変わる → `fs-change-phase1-analysis` (aide-powers skill) |
| 「設計書を作って」 | 既存コードがあるか？ | ある → `fs-reverse-phase1-program` (aide-powers skill) / ない → `fs-design-phase1-user-req` (aide-powers skill) |
| 「実装して」 | 設計書があるか？ | ある → `fs-impl-phase1-gate` (aide-powers skill) / ない → まず設計 |
| 「新機能を追加」 | 既存コードベースがあるか？ | ある → `fs-change-phase1-analysis` (aide-powers skill) / ない → `fs-planning-phase1-intake-and-init` (aide-powers skill) |

不明な場合はユーザーに番号付き選択肢で確認すること。
