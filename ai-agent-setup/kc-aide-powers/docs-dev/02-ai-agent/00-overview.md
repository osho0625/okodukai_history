# 第2章: AI Agent 構成詳細

aide-powers が AI Agent に実行させる開発プロセスの中身を扱う章。

第1章（システム・プラットフォーム機構）が「ハブスキル発見・ルール配布・起動処理」など
**aide-powers が動くための器** を扱うのに対し、第2章は **器に載って実際に動くもの** ——
つまり7つのワークフロー、各ワークフローを構成するフェーズスキル、ワークフローを横断して
利用される共通スキル、そして委譲先の共通エージェントを扱う。

## 章の構成

```
02-ai-agent/
├── 00-overview.md             … 本ファイル（章2の入口）
├── 01-workflows/              … 7つのワークフロー個別の流れ
│   ├── 00-overview.md
│   ├── 01-planning.md
│   ├── 02-design.md
│   ├── 03-implementation.md
│   ├── 04-reverse-design.md
│   ├── 05-change.md
│   ├── 06-bugfix.md
│   └── 07-refactoring.md
├── 02-phase-skills/           … フェーズスキルの命名規則・共通構造
│   └── README.md
├── 03-common-skills/          … 共通スキル一覧と役割
│   └── README.md
└── 04-agents/                 … 共通エージェント一覧と役割
    └── README.md
```

## 章で扱う 3 つの登場人物

aide-powers のドキュメント駆動開発を実際に動かしているのは、以下の 3 種類の構成要素である。

| 種別 | 配布物 | 命名規則 | 主な責務 |
|---|---|---|---|
| フェーズスキル | `skills/fs-{workflow}-phase{N}-{name}/SKILL.md` | `fs-` プレフィックス + ワークフロー名 + フェーズ番号 | 1 ワークフローの 1 フェーズを担当。進捗管理・ユーザー対話・サブエージェント委譲 |
| 共通スキル | `skills/{name}/SKILL.md` | 機能名そのまま（例: `design-gate`、`doc-sync`） | 複数ワークフローから呼ばれる再利用可能な処理ロジック・品質ルール |
| 共通エージェント | `agents/{name}.md` | 役割名そのまま（例: `micro-impl-agent`） | 実装・レビュー・QA 判定など、コンテキストを分離した実作業の担い手 |

ワークフロー本体（フェーズスキル群）は **進行管理とユーザー対話** に専念し、
**実作業はサブエージェント委譲または共通スキル経由** で行う。これは aide-powers の
グローバルルール「ワークフローの実作業禁止」に対応する。

## 7つのワークフロー

| ワークフロー | エントリポイントスキル |
|---|---|
| 企画ワークフロー | `fs-planning-phase1-intake-and-init` |
| 設計ワークフロー | `fs-design-phase1-user-req` |
| 実装ワークフロー | `fs-impl-phase1-gate` |
| 設計逆引きワークフロー | `fs-reverse-phase1-program` |
| 変更ワークフロー | `fs-change-phase1-analysis` |
| バグ修正ワークフロー | `fs-bugfix-phase1-analysis` |
| リファクタリングワークフロー | `fs-refactoring-phase1-status` |

各ワークフローの用途・フェーズ数・QA ゲート構成・相互の関係は
[`01-workflows/00-overview.md`](./01-workflows/00-overview.md) を参照。

ユーザー発話からのルーティングは、ハブスキル（`using-aide-powers`）の Quick Routing と
グローバルルール（`global-rules.md`）に記述されている。詳細は第1章のハブスキル方式を参照。

## 章境界

| 担当章 | 扱う内容 |
|---|---|
| 第0章（全体概要） | aide-powers とは何か、何が嬉しいか、誰のためのものか |
| 第1章（機構） | ハブスキル方式、ルール配布、ブートストラップ、ツールマップ |
| **第2章（本章）** | **ワークフロー個別の流れ、フェーズスキル・共通スキル・共通エージェントの一覧と役割** |
| 第3章（拡張） | スキル追加手順、エージェント追加手順、新ワークフローの組み立て方 |

第2章は「中身と関係」の章である。スキルの SKILL.md がどう書かれているかの記法詳細や、
新しいスキルを追加する手順は第3章の責務である。

## 読み進め方

1. まず `01-workflows/00-overview.md` で 7ワークフローの全体像と相互関係を把握する。
2. 関心のあるワークフロー個別ファイル（`01-workflows/01-planning.md` 〜 `07-refactoring.md`）で
   フェーズの流れを追う。
3. 各ワークフローの中で繰り返し登場するスキル・エージェントの正体を、
   `02-phase-skills/`、`03-common-skills/`、`04-agents/` の各 README で確認する。

## 関連ドキュメント

- `.aide/specs/aide-powers/ubiquitous-language.md`: 章をまたいで一貫した用語を保つ共通辞書。
- `skills/using-aide-powers/SKILL.md`: ハブスキル本体。Quick Routing の正本。
- `.aide/global-rules.md`: 全フェーズスキル共通のグローバルルール。
