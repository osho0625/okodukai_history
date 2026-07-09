# フェーズスキル詳細

ワークフローの各フェーズに 1 対 1 で対応するスキル群。本ファイルでは命名規則、Iron Law、
REQUIRED SUB-SKILL による連鎖、SKILL.md の共通構造を定義する。
ワークフロー別の責務一覧は本フォルダ内の以下のファイルを参照すること。

| ワークフロー | 詳細ファイル |
|---|---|
| 企画 | `planning.md` |
| 設計（11 フェーズ + 4ゲート） | `design.md` |
| 実装 | `impl.md` |
| 設計逆引き | `reverse.md` |
| 変更 | `change.md` |
| バグ修正 | `bugfix.md` |
| リファクタリング | `refactoring.md` |

## 命名規則

```
fs-{workflow}-phase{N}-{name}
```

- `fs-` プレフィックス: phase skill の意味。共通スキルとは命名で明確に区別される。
- `{workflow}`: `planning` / `design` / `impl` / `reverse` / `change` / `bugfix` / `refactoring`。
- `phase{N}`: フェーズ番号。一部のワークフロー（企画・実装・設計逆引きのオプション）では番号を持たない命名がある。
- `{name}`: フェーズの内容を示す英小文字 + ハイフン。

例:

| スキル名 | 所属 | 備考 |
|---|---|---|
| `fs-design-phase1-user-req` | 設計 | フェーズ番号 1 |
| `fs-design-phase10-program` | 設計 | フェーズ番号 10（2 桁） |
| `fs-impl-phase4-execution` | 実装 | フェーズ番号 4 |
| `fs-planning-phase2-explore` | 企画 | フェーズ番号 2 |
| `fs-reverse-phase5-optional-phases` | 設計逆引き | 番号なし命名（オプション群を束ねる） |

## 配置

```
skills/{skill-name}/SKILL.md          ← スキル本体
skills/{skill-name}/{prompt}.md       ← サブエージェント委譲用テンプレート（任意）
skills/{skill-name}/references/*.md   ← 参考資料（任意）
```

ワークスペース内に `skills/` フォルダがなくても、グローバルエリア（`~/.kiro/skills/`、`~/.claude/skills/`、`~/.copilot/skills/` 等）に
インストールされていれば全フェーズスキルが利用できる。配置・配布の機構は
[第1章](../../01-system-platform/) の責務であり、本章では扱わない。

## SKILL.md の共通構造

全フェーズスキルの `SKILL.md` は以下のセクションを共通で持つ。

| セクション | 内容 | 必須 / 任意 |
|---|---|---|
| YAML frontmatter（`name` / `description`） | スキル発見用のメタデータ | 必須 |
| `# {スキル名}` | フェーズスキルのタイトル | 必須 |
| `## Overview` | Core principle と概要 | 必須 |
| `## The Iron Law` | 絶対遵守ルール（破ったら品質崩壊） | 必須 |
| `## REQUIRED SUB-SKILL: rules-distribute` | skill:deploy / skill:cleanup の呼び出し指示 | 必須 |
| `## When to Use` | 起動条件 / Always / Exceptions | 必須 |
| `## メインプロセス` | フェーズの作業手順（ステップ図 + 詳細） | 必須 |
| `### 完了条件` | フェーズ完了の判定基準 | 必須 |
| `### 成果物パス一覧` | 作成される成果物のパスと作成者 | 推奨 |
| `## Red Flags - STOP` | やめるべき思考パターン一覧 | 推奨 |
| `## Common Rationalizations` | AI が言い訳に使いがちなパターンへの反論 | 推奨 |
| `## Integration` | REQUIRED SUB-SKILL（次フェーズ）/ Called by / Related skills | 必須 |
| `## グローバルルール参照（必須）` | `.aide/references/global-rules.md` の参照指示 | 必須 |

### Iron Law と Red Flags

aide-powers のフェーズスキルは「省略禁止」「サブエージェント委譲必須」など強い禁則を
**Iron Law** として明示する。Iron Law を破る思考が浮かんだら停止する役割を **Red Flags** が担う。
**Common Rationalizations** は AI が省略を正当化する言い訳パターンを先回りで列挙し、
それぞれに対する正しい現実認識を対比させる。

各ワークフローに固有の Iron Law（例: バグ修正の HEARING FIRST、リファクタリングの
NO CHANGE TO EXTERNAL BEHAVIOR）の代表例は、本フォルダ内のワークフロー別ファイルにまとめてある。

### REQUIRED SUB-SKILL の連鎖

フェーズスキルは「次に呼ぶべきスキル」を `Integration` セクションで `REQUIRED SUB-SKILL` として
宣言する。これにより、ワークフロー全体が固定された順序で連鎖し、AI Agent が独自判断で
途中フェーズに飛んだり省略したりすることを防ぐ。

```
fs-planning-phase1-intake-and-init
  → REQUIRED SUB-SKILL: fs-planning-phase2-explore
      → REQUIRED SUB-SKILL: fs-planning-phase3-finalize
          → 設計ワークフローへ引き継ぎ（handover-notes.md 経由）
```

### rules-distribute の skill モードを必ず呼ぶ

全フェーズスキルは、メインプロセス開始前に共通スキル `rules-distribute` を **skill:deploy** モードで、
スキル完了時に **skill:cleanup** モードで必ず呼ぶ。これにより、フェーズスキル固有の Iron Law が
プラットフォームのルールファイル機構に一時的に注入され、フェーズ実行中に常時参照される状態になる。
ルール配布機構（global / skill モードの動作詳細）は [第1章](../../01-system-platform/05-dynamic-rules.md)
を参照。

### グローバルルール参照（必須）

各フェーズスキルの末尾に、`.aide/references/global-rules.md` を読み込み記載された
全ルールを遵守する宣言を含める。番号付き選択肢、質問は 1 つずつ、敬語維持などの
グローバルルールはここで強制される。

## ワークフロー本体（フェーズスキル）が直接やってよいこと / やってはいけないこと

| 種別 | 例 | 可否 |
|---|---|---|
| 進捗ファイルの直接編集 | `planning-progress.md` / `design-progress.md` 等 | ✅ 可能（メタ情報のため） |
| `session-notes.md` の追記 | 確定事項・検討中・調査依頼の整理 | ✅ 可能（メタ情報のため） |
| `doc-index.md` の更新 | `doc-index-maintenance` 共通スキル経由 | ✅ 可能 |
| 設計書本体の作成・編集 | `user-requirements.md` 等 | ❌ サブエージェント or 共通スキルに委譲 |
| 実装コードの作成・編集 | プロジェクト本体のソース | ❌ `micro-impl-agent` に委譲 |
| git コミット | `git commit` | ❌ `git-commit-workflow` 共通スキル経由のみ |
| QA 判定 | APPROVED / REJECTED の判断 | ❌ QAレビューアーエージェントに委譲 |

これは「ワークフローの実作業禁止」グローバルルールに対応する。
進捗ファイルとセッションメモの直接編集だけが明示的な例外である。
