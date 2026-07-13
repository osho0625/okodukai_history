# 進捗ファイル共通フォーマット

## §1. 目的

本ドキュメントは、aide-powers の全7ワークフロー（企画・設計・実装・設計逆引き・変更・バグ修正・リファクタリング）における進捗管理ファイルの共通フォーマットを定義する。

各ワークフローの進行状況を統一的に記録・参照することで、以下を実現する:

- セッション再開時の即座な状況把握
- フェーズ完了状態の明確な可視化
- 成果物とレビュー結果の追跡

---

## §2. 進捗ファイルの命名と配置

進捗ファイルはプロジェクトの `.aide/specs/{project}/` 直下に配置する。

| ワークフロー | ファイル名 |
|---|---|
| 企画WF | `planning-progress.md` |
| 設計WF | `design-progress.md` |
| 実装WF | `impl-progress.md` |
| 設計逆引きWF | `reverse-progress.md` |
| 変更WF | `change-progress.md` |
| バグ修正WF | `bugfix-progress.md` |
| リファクタリングWF | `refactoring-progress.md` |

---

## §3. 基本フォーマット（全WF共通）

### 3.1 ステータステーブル

ファイル冒頭にワークフロー全体の概要テーブルを配置する。

```markdown
# {ワークフロー名} 進捗

| # | フェーズ | 状態 | 完了日時 |
|---|---|---|---|
| 1 | {フェーズ表示名} | ⬜ 未着手 | — |
| 2 | {フェーズ表示名} | 🔧 作業中 | — |
| 3 | {フェーズ表示名} | ✅ 完了 | 2025-06-01 14:30 |
```

### 3.2 フェーズ詳細セクション

ステータステーブルの後に、各フェーズの詳細セクションを配置する。

```markdown
## フェーズ{N}: {フェーズ表示名}

- スキル: `{スキル名}`
- 状態: {状態マーカー}
- 完了日時: {日時 or —}

### 成果物

| 成果物 | 作成者(skill/agent) | レビュアー(skill/agent) | レビュー結果 |
|---|---|---|---|
| user-requirements.md | fs-design-phase1-user-req | requirements-qa-agent | APPROVED |
| system-requirements.md | fs-design-phase2-system-req | requirements-qa-agent | REJECTED→APPROVED |
```

### 3.3 修正履歴テーブル（修正差し戻し時のみ）

レビューFAILや「前フェーズへ戻る」場面で、完了済みフェーズを修正のため差し戻す場合に使用する。
従来のように該当フェーズ行を `⬜ 未着手` にリセットしてはならない（完了実績・署名が失われるため）。
代わりに、進捗ファイルに「## 修正履歴」見出しと修正履歴テーブルを設け、差し戻しを追記する（初回の修正起票時に作成）。

```markdown
## 修正履歴

| 修正ID | 修正Phase | 修正理由 | 修正内容 | 状態 | 起票日時 | 完了日時 |
|---|---|---|---|---|---|---|
| FIX-1 | 2 | レビューで〇〇が不足 | 〇〇を追記 | 🔧 修正中 | 2026-06-09 10:00 | — |
```

**修正IDの採番:**

- 修正IDは `FIX-{連番}`（1始まり、ファイル内で一意）
- 既存テーブルがある場合は、既存の最大連番 + 1 を新しい修正IDとする

**重要ルール（ステータステーブルとの関係）:**

- フェーズを修正のため差し戻すときは、ステータステーブルの該当フェーズ行を `⬜ 未着手` に戻してはならない。`🔧 修正中` にする（完了日時はそのまま保持する）
- 修正作業後、該当フェーズの通常完了処理（phase-report-check の write モード）でステータステーブル行は `✅ 完了` に戻る
- 修正履歴エントリ自体は、修正作業の完了後に fix_close で `🔧 修正中` → `✅ 修正完了` にする


---

## §4. リファクタリングWF用の拡張

リファクタリングWFでは、安全性確保のためテスト結果欄を追加する。

### 4.1 ステータステーブル拡張

```markdown
| # | フェーズ | 状態 | 完了日時 | テスト結果 |
|---|---|---|---|---|
| 0 | 安全ネット確認 | ✅ 完了 | 2025-06-01 10:00 | ALL PASS |
| 4 | 実装 | 🔧 作業中 | — | 3/5 PASS |
```

### 4.2 テスト結果の記載形式

- 全パス: `ALL PASS`
- 一部パス: `{pass数}/{total数} PASS`
- 未実行: `—`

---

## §5. 記録ルール

### 5.1 状態マーカー

ステータステーブルで使う基本マーカー（4種）:

| マーカー | 意味 |
|---|---|
| `⬜ 未着手` | フェーズ未開始 |
| `🔧 作業中` | フェーズ進行中 |
| `✅ 完了` | フェーズ完了 |
| `🔧 修正中` | フェーズが修正対象として差し戻され、修正作業中（完了実績・署名は保持される） |

修正履歴テーブル（§3.3）でのみ使うマーカー:

| マーカー | 意味 |
|---|---|
| `✅ 修正完了` | 修正履歴エントリの完了状態（ステータステーブルには出ない） |

### 5.2 完了日時フォーマット

- 形式: `YYYY-MM-DD HH:MM`（タイムゾーンなし、秒なし）
- 未完了時: `—`（EMダッシュ U+2014）

### 5.3 レビュー結果の表記

- レビューなし（レビュー対象外の成果物）: `— (なし)`
- 一発合格: `APPROVED`
- リジェクト後に合格: `REJECTED→APPROVED`（半角矢印 →）
- リジェクト（未解決）: `REJECTED`

### 5.4 成果物テーブル（4列）

| 列名 | 内容 |
|---|---|
| 成果物 | ファイル名（パスなし） |
| 作成者(skill/agent) | 作成を担当したスキルまたはエージェント名 |
| レビュアー(skill/agent) | レビューを担当したスキルまたはエージェント名 |
| レビュー結果 | APPROVED / REJECTED→APPROVED / REJECTED / — (なし) |

---

## §6. 更新タイミングルール

### 6.1 先頭フェーズ: progress-resume-check による制御

ワークフロー起動時、`progress-resume-check` スキルが進捗ファイルを参照し、以下を判定する:

- 進捗ファイルが存在しない → 新規作成を案内
- 進捗ファイルが存在し未完了フェーズあり → 再開位置を案内
- 進捗ファイルが存在し全フェーズ完了 → 完了済みを案内

**重要:** `progress-resume-check` は Read 専用であり、進捗ファイルを編集しない。

### 6.2 後続フェーズ: gitコミット直前に更新

フェーズの作業が完了し、git-commit-workflow でコミットする直前に進捗ファイルを更新する。
これにより、コミットと進捗記録が常に同期する。

### 6.3 作業中マーカー運用

- フェーズ開始時: 該当フェーズを `🔧 作業中` に更新
- フェーズ完了時: `✅ 完了` に更新し、完了日時を記入

### 6.4 関連ファイルリンク（impl のみ）

`impl-progress.md` のみ、冒頭に「関連」セクションを設ける:

```markdown
# 実装WF 進捗

## 関連

- [設計進捗](design-progress.md)
- [実装プロセスチェックリスト](impl-process-checklist.md)

## ステータス
...
```

### 6.5 最終フェーズのコミット包含ルール

最終フェーズスキル（ワークフローの最後のフェーズ）は、git-commit-workflow を呼び出す**前に**
自フェーズの進捗を `✅ 完了` に更新し、その更新をコミット対象に含めること。

**手順:**
1. 最終フェーズの全作業を完了する
2. 進捗ファイルの自フェーズ行を `✅ 完了` に更新する
3. git-commit-workflow を呼び出す（進捗ファイルが M に含まれていることを確認）

**禁止:**
- コミット後に進捗ファイルを更新すること（コミット漏れの原因）
- 進捗ファイルの更新をコミット対象から除外すること

---

## §7. WF別の初期状態テンプレートとフェーズマッピング

### 7.1 企画WF（planning-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-planning-phase1-intake-and-init` | 情報収集・初期化 |
| 2 | Phase 2 | `fs-planning-phase2-explore` | 探索・深掘り |
| 3 | Phase 3 | `fs-planning-phase3-finalize` | 最終化・引き渡し |
| 4 | Phase 4 | `fs-planning-phase4-final-check` | 完全性チェック |

### 7.2 設計WF（design-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-design-phase1-user-req` | ユーザー要件定義 |
| 2 | Phase 2 | `fs-design-phase2-system-req` | システム要件定義 |
| 3 | Phase 3 | `fs-design-phase3-dev-plan` | 開発計画 |
| 4 | Phase 4 | `fs-design-phase4-architecture` | アーキテクチャ設計 |
| 5 | Phase 5 | `fs-design-phase5-gui` | GUI設計 |
| 6 | Phase 6 | `fs-design-phase6-usecase` | ユースケース分析 |
| 7 | Phase 7 | `fs-design-phase7-ddd` | DDD/レイヤードアーキテクチャ |
| 8 | Phase 8 | `fs-design-phase8-object` | オブジェクト設計 |
| 9 | Phase 9 | `fs-design-phase9-infra` | インフラIF設計 |
| 10 | Phase 10 | `fs-design-phase10-program` | プログラム構成 |
| 11 | Phase 11 | `fs-design-phase11-final-check` | 完全性チェック |

### 7.3 実装WF（impl-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-impl-phase1-gate` | 設計ゲート確認 |
| 2 | Phase 2 | `fs-impl-phase2-preparation` | 実装準備 |
| 3 | Phase 3 | `fs-impl-phase3-gui-mockup` | GUIモックアップ |
| 4 | Phase 4 | `fs-impl-phase4-execution` | 実装実行 |
| 5 | Phase 5 | `fs-impl-phase5-final-check` | 最終確認 |
| 6 | Phase 6 | `fs-impl-phase6-doc-generation` | ドキュメント生成 |
| 7 | Phase 7 | `fs-impl-phase7-final-check` | 完全性チェック |

### 7.4 設計逆引きWF（reverse-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-reverse-phase1-program` | プログラム構成抽出 |
| 2 | Phase 2 | `fs-reverse-phase2-dev-env` | 開発環境抽出 |
| 3 | Phase 3 | `fs-reverse-phase3-system-req` | システム要件抽出 |
| 4 | Phase 4 | `fs-reverse-phase4-user-req` | ユーザー要件抽出 |
| 5 | Phase 5 | `fs-reverse-phase5-optional-phases` | オプションフェーズ |
| 6 | Phase 6 | `fs-reverse-phase6-final-check` | 完全性チェック |

### 7.5 変更WF（change-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-change-phase1-analysis` | 分析・計画 |
| 2 | Phase 2 | `fs-change-phase2-impl` | 設計・実装・完了処理 |
| 3 | Phase 3 | `fs-change-phase3-final-check` | 完全性チェック |

### 7.6 バグ修正WF（bugfix-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-bugfix-phase1-analysis` | 分析・計画 |
| 2 | Phase 2 | `fs-bugfix-phase2-impl` | 設計・実装・ドキュメント反映 |
| 3 | Phase 3 | `fs-bugfix-phase3-final-check` | 完全性チェック |

### 7.7 リファクタリングWF（refactoring-progress.md）

| # | フェーズ | スキル名 | 表示名 |
|---|---|---|---|
| 1 | Phase 1 | `fs-refactoring-phase1-status` | 安全ネット確認 |
| 2 | Phase 2 | `fs-refactoring-phase2-candidates` | 候補特定 |
| 3 | Phase 3 | `fs-refactoring-phase3-plan` | リファクタリング計画 |
| 4 | Phase 4 | `fs-refactoring-phase4-design` | 差分設計 |
| 5 | Phase 5 | `fs-refactoring-phase5-impl` | 実装 |
| 6 | Phase 6 | `fs-refactoring-phase6-doc` | ドキュメント同期 |
| 7 | Phase 7 | `fs-refactoring-phase7-final-check` | 完全性チェック |

---

## §8. doc-index.md への登録方針

進捗ファイルはメタ情報（プロセス管理用）であり、設計成果物ではない。
したがって `doc-index.md` には登録しない。

---

## §9. 関連スキル

| スキル | 役割 |
|---|---|
| `progress-resume-check` | 進捗ファイル参照（Read専用）、再開位置判定 |
| `fs-planning-*` | 企画WFフェーズスキル群 |
| `fs-design-*` | 設計WFフェーズスキル群 |
| `fs-impl-*` | 実装WFフェーズスキル群 |
| `fs-reverse-*` | 設計逆引きWFフェーズスキル群 |
| `fs-change-*` | 変更WFフェーズスキル群 |
| `fs-bugfix-*` | バグ修正WFフェーズスキル群 |
| `fs-refactoring-*` | リファクタリングWFフェーズスキル群 |
| `git-commit-workflow` | コミット実行（進捗更新のトリガー） |
| `doc-index-maintenance` | doc-index.md 管理（進捗ファイルは対象外） |
| `design-gate` | 設計完了ゲート確認 |

---

## §10. 改訂履歴

| 日付 | 内容 |
|---|---|
| 2025-06-18 | 初版作成（変更WF 202605181002-progress-management-migration 段階1） |
