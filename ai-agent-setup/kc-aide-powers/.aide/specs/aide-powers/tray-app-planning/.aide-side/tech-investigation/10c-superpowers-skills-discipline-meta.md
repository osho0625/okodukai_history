# superpowers 規律スキル・メタスキル 詳細調査

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査対象 | superpowers の規律スキル4種（test-driven-development, systematic-debugging, verification-before-completion, writing-skills） |
| 調査日 | 2025-07-18 |
| 調査の背景 | aide-claude での置き換え設計の基礎資料。poc-framework-analysis.md の skills/ セクションに詳細不足の指摘あり |

## 要約

superpowers の規律スキル群は「Iron Law パターン」を共有する統一構造を持つ。Iron Law 文（絶対ルール）、Gate Function（実行前チェック）、Red Flags（自己検知リスト）、Common Rationalizations テーブル（言い訳封じ）、"Violating the letter is violating the spirit"（精神論封じ）の5要素が規律スキルの骨格である。メタスキル writing-skills は TDD サイクルをスキル文書作成に適用し、サブエージェントによるプレッシャーテストでスキルを「防弾化」する手法を体系化している。aide-claude では、これらのパターンを AIDE のルール体系（AGENTS.md / steering）に変換して組み込む設計が必要になる。

---

## 1. test-driven-development

### SKILL.md 構造

| セクション | 概要 |
|-----------|------|
| Overview | "Write the test first. Watch it fail. Write minimal code to pass." |
| The Iron Law | `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST` — 削除して最初からやり直し |
| Red-Green-Refactor | dot フローチャート付き。RED→Verify RED→GREEN→Verify GREEN→REFACTOR→Repeat |
| Good Tests | テスト品質基準（Minimal / Clear / Shows intent） |
| Why Order Matters | 5つの反論（"I'll write tests after" 等）への論駁 |
| Common Rationalizations | 11項目のテーブル（"Too simple to test" 〜 "Existing code has no tests"） |
| Red Flags - STOP | 13項目の自己検知リスト |
| Verification Checklist | 8項目のチェックリスト |
| Debugging Integration | バグ修正時も TDD サイクルを適用 |
| Testing Anti-Patterns | @testing-anti-patterns.md への参照 |

### Iron Law パターン適用状況

| 要素 | 有無 | 内容 |
|------|------|------|
| Iron Law 文 | ✅ | `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST` |
| "Letter = Spirit" | ✅ | 冒頭に明記 |
| Red Flags | ✅ | 13項目 |
| Rationalizations テーブル | ✅ | 11項目 |
| Gate Function | ❌ | 明示的な Gate Function はなし（Red-Green-Refactor サイクル自体がゲート） |

### 補助ファイル: testing-anti-patterns.md

モック関連の5つのアンチパターンを定義。各パターンに Gate Function（実行前チェック）を持つ。「テストはモックの動作ではなく実際の動作を検証すべき」が中心原則。TDD を守ればアンチパターンは自然に防げるという構造。

### スキル間参照

- `superpowers:verification-before-completion`（暗黙的 — Verification Checklist が同等機能）
- `@testing-anti-patterns.md`（明示的参照）

### aide-claude での対応方針（案）

AIDE の kiro-agents には既に `agent-impl-review-tests.md`（テストレビュー）が存在する。TDD の Iron Law・Rationalizations テーブルは AGENTS.md のグローバルルールまたは steering に組み込み、Red-Green-Refactor サイクルは実装エージェントの手順に統合する設計が適切。

---

## 2. systematic-debugging

### SKILL.md 構造

| セクション | 概要 |
|-----------|------|
| Overview | "ALWAYS find root cause before attempting fixes. Symptom fixes are failure." |
| The Iron Law | `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST` |
| When to Use | 全技術的問題に適用。特に時間的プレッシャー下で重要 |
| The Four Phases | Phase 1: Root Cause Investigation → Phase 2: Pattern Analysis → Phase 3: Hypothesis and Testing → Phase 4: Implementation |
| Phase 4.5 | 3回以上修正失敗時のアーキテクチャ再検討ルール |
| Red Flags | 12項目 |
| Human Partner's Signals | ユーザーの不満シグナル5パターン |
| Common Rationalizations | 8項目 |
| Supporting Techniques | 3つの補助ファイルへの参照 |
| Related skills | `superpowers:test-driven-development`, `superpowers:verification-before-completion` |

### Iron Law パターン適用状況

| 要素 | 有無 | 内容 |
|------|------|------|
| Iron Law 文 | ✅ | `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST` |
| "Letter = Spirit" | ✅ | 冒頭に明記 |
| Red Flags | ✅ | 12項目 |
| Rationalizations テーブル | ✅ | 8項目 |
| Gate Function | ❌ | 明示的な Gate Function はなし（4フェーズプロセス自体がゲート） |

### 補助ファイル一覧

| ファイル | 役割 |
|---------|------|
| `root-cause-tracing.md` | コールスタックを逆方向にトレースして根本原因を特定する技法。5段階のトレースプロセスとスタックトレース追加手法を解説 |
| `defense-in-depth.md` | バグ修正時に4層（Entry / Business / Environment / Debug）で検証を追加し、バグを構造的に不可能にする手法 |
| `condition-based-waiting.md` | テストの任意タイムアウトを条件ベースのポーリングに置き換える手法。waitFor パターンの実装ガイド |
| `condition-based-waiting-example.ts` | 上記の TypeScript 実装例（waitForEvent, waitForEventCount, waitForEventMatch の3関数） |
| `find-polluter.sh` | テスト汚染の原因テストを二分探索で特定する bash スクリプト（約50行） |
| `CREATION-LOG.md` | スキル作成過程の記録。抽出判断、防弾化要素、テスト結果を文書化。スキル作成のリファレンス例 |
| `test-academic.md` | 学術テスト — スキル内容の理解度を確認する6問の質問 |
| `test-pressure-1.md` | プレッシャーテスト1 — 本番障害（$15k/分損失）での緊急修正 vs 体系的デバッグの選択 |
| `test-pressure-2.md` | プレッシャーテスト2 — 4時間のサンクコスト + 疲労 + 夕食の予定での選択 |
| `test-pressure-3.md` | プレッシャーテスト3 — シニアエンジニア + テックリードの権威 + 社会的圧力での選択 |

### スキル間参照

- `superpowers:test-driven-development`（Phase 4 の失敗テスト作成で参照）
- `superpowers:verification-before-completion`（修正完了の検証で参照）

### aide-claude での対応方針（案）

AIDE の kiro-agents には `agent-bugfix-analyzer.md`（原因分析）と `agent-bugfix-planner.md`（修正計画）が存在する。4フェーズプロセスはバグ修正オーケストレーターのフェーズ構造と親和性が高い。Iron Law と Rationalizations テーブルは steering に組み込み、補助技法（root-cause-tracing, defense-in-depth）はエージェント指示に統合する設計が適切。condition-based-waiting と find-polluter.sh はツールとして別途提供可能。

---

## 3. verification-before-completion

### SKILL.md 構造

| セクション | 概要 |
|-----------|------|
| Overview | "Claiming work is complete without verification is dishonesty, not efficiency." |
| The Iron Law | `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE` |
| The Gate Function | 5ステップ: IDENTIFY → RUN → READ → VERIFY → CLAIM |
| Common Failures | 7パターンの「主張 vs 必要な証拠 vs 不十分な証拠」テーブル |
| Red Flags - STOP | 8項目（"should", "probably" 等の曖昧表現を検知） |
| Rationalization Prevention | 8項目のテーブル |
| Key Patterns | Tests / Regression tests / Build / Requirements / Agent delegation の5パターン |
| Why This Matters | 24件の失敗記憶からの教訓 |
| When To Apply | 適用タイミング（ALWAYS before ANY variation of success claims） |

### Iron Law パターン適用状況

| 要素 | 有無 | 内容 |
|------|------|------|
| Iron Law 文 | ✅ | `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE` |
| "Letter = Spirit" | ✅ | 冒頭に明記 |
| Gate Function | ✅ | 5ステップの明示的ゲート（唯一 Gate Function を持つスキル） |
| Red Flags | ✅ | 8項目 |
| Rationalizations テーブル | ✅ | 8項目 |

### 補助ファイル

なし（SKILL.md のみで完結）

### スキル間参照

なし（他スキルから参照される側）

### aide-claude での対応方針（案）

AIDE の kiro-agents には既に `agent-impl-review-tests.md`（テストレビュー）、`agent-impl-review-errors.md`（エラーレビュー）等のレビューエージェントが存在する。verification-before-completion の Gate Function は、AIDE の QA ゲート機構（design-qa-agent）と同等の役割を果たす。AGENTS.md のグローバルルールに「完了主張前の検証義務」として組み込むのが最も効果的。

---

## 4. writing-skills（メタスキル）

### SKILL.md 構造

| セクション | 概要 |
|-----------|------|
| Overview | "Writing skills IS Test-Driven Development applied to process documentation." |
| What is a Skill? | スキルの定義（再利用可能な技法・パターン・ツール） |
| TDD Mapping for Skills | TDD 概念とスキル作成の対応表 |
| When to Create a Skill | 作成基準（直感的でなかった技法、横断的に再利用可能等） |
| Skill Types | technique / pattern / reference の3分類 |
| Directory Structure | フラット名前空間、SKILL.md 必須 |
| SKILL.md Structure | YAML frontmatter + セクション構成テンプレート |
| Claude Search Optimization (CSO) | description フィールドの最適化（ワークフロー要約禁止が重要） |
| Flowchart Usage | dot フローチャートの使用基準 |
| Code Examples | 1つの優れた例 > 多数の凡庸な例 |
| File Organization | 3パターン（自己完結 / ツール付き / 重量参照付き） |
| The Iron Law | `NO SKILL WITHOUT A FAILING TEST FIRST`（TDD と同じ原則） |
| Testing All Skill Types | 4タイプ別テスト手法（Discipline / Technique / Pattern / Reference） |
| Bulletproofing Skills | ループホール封じ、精神論封じ、Rationalization テーブル構築 |
| RED-GREEN-REFACTOR for Skills | スキル版 TDD サイクル |
| Anti-Patterns | 4つのアンチパターン（Narrative / Multi-Language / Code in Flowcharts / Generic Labels） |
| Skill Creation Checklist | RED → GREEN → REFACTOR → Quality → Deployment の全チェックリスト |

### Iron Law パターン適用状況

| 要素 | 有無 | 内容 |
|------|------|------|
| Iron Law 文 | ✅ | `NO SKILL WITHOUT A FAILING TEST FIRST` |
| "Letter = Spirit" | ❌ | 明示なし（TDD スキルの原則を前提として参照） |
| Red Flags | ❌ | 明示的な Red Flags リストなし |
| Rationalizations テーブル | ✅ | 8項目（テストスキップの言い訳） |
| Gate Function | ❌ | なし |

### 補助ファイル一覧

| ファイル | 役割 |
|---------|------|
| `testing-skills-with-subagents.md` | スキルの TDD テスト手法の完全ガイド。RED-GREEN-REFACTOR をスキル文書に適用する具体的手順、プレッシャーシナリオの書き方、メタテスト技法を解説 |
| `anthropic-best-practices.md` | Anthropic 公式のスキル作成ベストプラクティス。簡潔さ、自由度の設定、プログレッシブディスクロージャー、フィードバックループ、評価駆動開発を解説 |
| `persuasion-principles.md` | LLM に対する説得原則の研究ベース解説。Cialdini の7原則（Authority, Commitment, Scarcity 等）のスキル設計への応用。Meincke et al. (2025) の N=28,000 実験結果を引用 |
| `graphviz-conventions.dot` | dot フローチャートのスタイルガイド。ノード形状（diamond=質問, box=アクション, octagon=警告等）とエッジラベルの規約を DSL 自体で記述 |
| `render-graphs.js` | SKILL.md 内の dot ブロックを SVG にレンダリングする Node.js スクリプト。--combine オプションで全図を1つに結合可能 |
| `examples/CLAUDE_MD_TESTING.md` | CLAUDE.md のスキル発見記述の A/B テスト設計。4シナリオ × 4バリアント（NULL / Soft / Directive / Emphatic / Process）のテストプロトコル |

### スキル間参照

- **REQUIRED BACKGROUND:** `superpowers:test-driven-development`（TDD サイクルの理解が前提）
- `testing-skills-with-subagents.md` 内で `persuasion-principles.md` を参照
- `testing-skills-with-subagents.md` 内で `superpowers:test-driven-development` を REQUIRED BACKGROUND として参照

### aide-claude での対応方針（案）

writing-skills はスキル作成のメタスキルであり、aide-claude では直接的な対応物は不要。ただし、以下の知見は aide-claude の設計に活用すべき:
- **CSO（Claude Search Optimization）**: description にワークフロー要約を書くとスキル本文が読まれなくなる問題 → AIDE のエージェント description 設計に適用
- **防弾化パターン**: Iron Law + Rationalizations テーブル + Red Flags → AIDE の steering ファイルの構造設計に適用
- **説得原則**: Authority + Commitment + Scarcity が最も効果的 → AIDE のルール記述スタイルに適用
- **テスト手法**: プレッシャーシナリオによるスキルテスト → AIDE のルール検証手法として採用可能

---

## スキル間参照関係マップ

```
writing-skills (メタスキル)
  ├── REQUIRED: test-driven-development
  ├── 参照: testing-skills-with-subagents.md
  │     ├── REQUIRED: test-driven-development
  │     └── 参照: persuasion-principles.md
  └── 参照: anthropic-best-practices.md

test-driven-development (規律スキル)
  └── 参照: @testing-anti-patterns.md

systematic-debugging (規律スキル)
  ├── 参照: root-cause-tracing.md
  ├── 参照: defense-in-depth.md
  ├── 参照: condition-based-waiting.md
  ├── Related: test-driven-development
  └── Related: verification-before-completion

verification-before-completion (規律スキル)
  └── (他スキルから参照される側、自身は参照なし)
```

## Iron Law パターン比較表

| 要素 | TDD | Debugging | Verification | Writing-Skills |
|------|-----|-----------|-------------|----------------|
| Iron Law 文 | ✅ | ✅ | ✅ | ✅ |
| "Letter = Spirit" | ✅ | ✅ | ✅ | ❌（暗黙） |
| Gate Function | ❌ | ❌ | ✅ | ❌ |
| Red Flags | ✅ 13項目 | ✅ 12項目 | ✅ 8項目 | ❌ |
| Rationalizations | ✅ 11項目 | ✅ 8項目 | ✅ 8項目 | ✅ 8項目 |
| プレッシャーテスト | ❌（writing-skills側で実施） | ✅ 3シナリオ | ❌ | ✅（テスト手法を定義） |
| dot フローチャート | ✅ 1つ | ❌（補助ファイルに3つ） | ❌ | ✅ 1つ |

## aide-claude での対応方針まとめ

| superpowers スキル | aide-claude での対応 | 理由 |
|-------------------|---------------------|------|
| test-driven-development | **再設計して組み込み** | AIDE は steering + AGENTS.md でルールを管理。Iron Law・Rationalizations を steering に、Red-Green-Refactor を実装エージェント手順に統合 |
| systematic-debugging | **再設計して組み込み** | 4フェーズプロセスはバグ修正オーケストレーターと親和性高。補助技法はエージェント指示に統合 |
| verification-before-completion | **再設計して組み込み** | Gate Function は AIDE の QA ゲート機構と同等。AGENTS.md グローバルルールに統合 |
| writing-skills | **直接対応不要、知見を設計に活用** | メタスキル。CSO・防弾化パターン・説得原則を AIDE の steering 設計に反映 |

**共通方針**: superpowers の「スキル」は Claude Code の SKILL.md 形式に最適化されている。aide-claude では同じ内容を AIDE のルール体系（AGENTS.md グローバルルール + steering ファイル + エージェント指示）に変換する必要がある。Iron Law パターンの5要素（Iron Law 文、Letter=Spirit、Gate Function、Red Flags、Rationalizations テーブル）は、steering ファイルの標準構造として採用する価値がある。

---

## 参照ファイル一覧

### test-driven-development
- `references/superpowers/skills/test-driven-development/SKILL.md`
- `references/superpowers/skills/test-driven-development/testing-anti-patterns.md`

### systematic-debugging
- `references/superpowers/skills/systematic-debugging/SKILL.md`
- `references/superpowers/skills/systematic-debugging/root-cause-tracing.md`
- `references/superpowers/skills/systematic-debugging/defense-in-depth.md`
- `references/superpowers/skills/systematic-debugging/condition-based-waiting.md`
- `references/superpowers/skills/systematic-debugging/condition-based-waiting-example.ts`
- `references/superpowers/skills/systematic-debugging/find-polluter.sh`
- `references/superpowers/skills/systematic-debugging/CREATION-LOG.md`
- `references/superpowers/skills/systematic-debugging/test-academic.md`
- `references/superpowers/skills/systematic-debugging/test-pressure-1.md`
- `references/superpowers/skills/systematic-debugging/test-pressure-2.md`
- `references/superpowers/skills/systematic-debugging/test-pressure-3.md`

### verification-before-completion
- `references/superpowers/skills/verification-before-completion/SKILL.md`

### writing-skills
- `references/superpowers/skills/writing-skills/SKILL.md`
- `references/superpowers/skills/writing-skills/testing-skills-with-subagents.md`
- `references/superpowers/skills/writing-skills/anthropic-best-practices.md`
- `references/superpowers/skills/writing-skills/persuasion-principles.md`
- `references/superpowers/skills/writing-skills/graphviz-conventions.dot`
- `references/superpowers/skills/writing-skills/render-graphs.js`
- `references/superpowers/skills/writing-skills/examples/CLAUDE_MD_TESTING.md`
