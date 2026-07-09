# 影響範囲分析: rules-distribute プラットフォーム確認スキップ & APM経由ルール配布ファイル追加

## 変更種別

仕様変更 + 機能追加（両方）

---

## 1. アクター視点の影響分析

### 1.1 影響アクター

| アクター | 影響 | 説明 |
|---|---|---|
| 利用者（aide-powers利用エンジニア） | あり | プラットフォーム確認のUXが改善される（毎回の確認が不要に）。APM経由でルールファイルが自動配布されるようになり、setup.bat/sh 実行だけでなくAPMからもインストール可能になる |
| 開発者（aide-powers開発エンジニア） | あり | 正本（references/global-rules.md, phase-skill-rules.md）を更新した際に、steering/・rules/・instructions/ の配布ファイルも同期更新する運用が追加される |

### 1.2 影響ユースケース

| # | ユースケース | 影響内容 |
|---|---|---|
| UC-1 | rules-distribute global モード実行（初回） | 影響なし。`.aide/ai-agent-platform-targets.md` が存在しないため従来通りユーザーに確認 |
| UC-2 | rules-distribute global モード実行（2回目以降） | **振る舞い変更**。プラットフォーム確認をスキップし、既存ターゲットファイルをそのまま使用 |
| UC-3 | プラットフォームターゲットの明示的変更依頼 | **振る舞い追加**。ユーザーの明示的依頼時のみ再確認フローを実行 |
| UC-4 | APM経由でのaide-powersインストール（Kiro） | **機能追加**。`steering/aide-powers-global-rules.md` と `steering/aide-powers-phase-skill-rules.md` が自動配布される |
| UC-5 | APM経由でのaide-powersインストール（Claude Code） | **機能追加**。`rules/aide-powers-global-rules.md` と `rules/aide-powers-phase-skill-rules.md` が自動配布される |
| UC-6 | APM経由でのaide-powersインストール（Copilot） | **機能追加**。`instructions/aide-powers-global-rules.instructions.md` と `instructions/aide-powers-phase-skill-rules.instructions.md` が自動配布される |
| UC-7 | 正本ルールファイルの更新 | **運用追加**。正本更新時に配布ファイル6本の同期更新が必要になる |

---

## 2. プログラム構成視点の影響分析

### 2.1 変更対象ファイル

| # | ファイルパス | 変更種別 | 対応要求 | 説明 |
|---|---|---|---|---|
| 1 | `skills/rules-distribute/SKILL.md` | 変更 | REQ-C-001, REQ-C-002 | ステップ1のプラットフォーム確認ロジックを条件分岐化 |
| 2 | `steering/aide-powers-global-rules.md` | **新規作成** | REQ-C-003 | Kiro向け global-rules 配布ファイル |
| 3 | `steering/aide-powers-phase-skill-rules.md` | **新規作成** | REQ-C-003 | Kiro向け phase-skill-rules 配布ファイル |
| 4 | `rules/aide-powers-global-rules.md` | **新規作成** | REQ-C-004 | Claude Code向け global-rules 配布ファイル |
| 5 | `rules/aide-powers-phase-skill-rules.md` | **新規作成** | REQ-C-004 | Claude Code向け phase-skill-rules 配布ファイル |
| 6 | `instructions/aide-powers-global-rules.instructions.md` | **新規作成** | REQ-C-005 | Copilot向け global-rules 配布ファイル |
| 7 | `instructions/aide-powers-phase-skill-rules.instructions.md` | **新規作成** | REQ-C-005 | Copilot向け phase-skill-rules 配布ファイル |

### 2.2 依存関係ファイル（変更はしないが影響確認が必要）

| # | ファイルパス | 依存の種類 | 確認理由 |
|---|---|---|---|
| 1 | `skills/using-aide-powers/references/global-rules.md` | 正本（参照元） | 配布ファイルの内容ソース。REQ-C-006 で形式一致が求められる |
| 2 | `skills/using-aide-powers/references/phase-skill-rules.md` | 正本（参照元） | 同上 |
| 3 | `apm.yml` | APMパッケージ定義 | APMが `steering/`、`rules/`、`instructions/` を認識するか確認が必要。既存のbootstrapが配布済みなので追加ファイルも同じ仕組みで自動認識されるはず |
| 4 | `steering/aide-powers-bootstrap.md` | 既存配布パターン参考 | 新規ファイルの命名規則・形式の参考 |
| 5 | `rules/aide-powers-bootstrap.md` | 既存配布パターン参考 | 同上 |
| 6 | `instructions/aide-powers-bootstrap.instructions.md` | 既存配布パターン参考 | 同上 |
| 7 | `.aide/ai-agent-platform-targets.md` | 条件判定対象 | REQ-C-001 の存在チェック対象。ファイル自体は変更しない |

### 2.3 影響を受けないことの確認

| 対象 | 理由 |
|---|---|
| `setup.bat` / `setup.sh` | スコープ外として明記。APM配布であるためセットアップスクリプト変更不要 |
| `rules-distribute` ステップ2/3 本体ロジック | スコープ外として明記。ワークスペース配布ロジックは変更しない |
| `rules/aide-powers-bootstrap.mdc`（Cursor用） | Cursorはスコープ外 |
| `hooks/` | 本変更と無関係 |
| `agents/` | 本変更と無関係 |

---

## 3. 起因元ドキュメントフォルダ

### git blame 結果

`skills/rules-distribute/SKILL.md` の最新コミット:
- コミット: `7dd9fd0` — `feat: references コピーと rules-distribute global モードをシェルコマンド化`
- Docs フッター: `.aide/specs/aide-powers/changes/202606162100-shell-based-file-copy/`

### 判定

今回の変更要求（プラットフォーム確認スキップ + APM配布ファイル追加）は、上記起因元フォルダ（shell-based-file-copy）とは**関連しない独立した変更**である。

起因元ドキュメントフォルダ: **なし**（本変更は新規の変更要求であり、既存の変更フォルダとのマージ対象ではない）

---

## 4. 注意事項

1. **配布ファイル同期運用の追加**: 正本（`skills/using-aide-powers/references/`）を更新するたびに、6本の配布ファイルも同期更新する必要がある。この運用をどこに明記するか（SKILL.md 内の注記 or 別途ドキュメント）は対応方針で検討が必要
2. **apm.yml の確認**: 既存の `aide-powers-bootstrap` が各ディレクトリから正常に配布されているため、追加ファイルも同パターンで認識されると想定されるが、apm.yml 側で明示的なファイル列挙が必要かどうかの確認が必要
3. **マーカーコメントの一貫性**: REQ-C-006 で指定されたマーカーコメント `<!-- [aide-powers:auto-generated] ... -->` は、現在ワークスペース配布時に付与されるものと同一形式であること

---

## 5. 差分設計確認後の追記

差分設計書（delta-design.md）の内容を精査した結果、以下の通り追加の影響はない。

### シグネチャ変更追跡

**該当なし**。本変更はプログラムコードの変更を含まず、全てMarkdownファイル（SKILL.md のテキスト修正 + 新規Markdownファイル6本追加）のみである。シグネチャ変更は発生しない。

### 追加の影響

**なし**。差分設計書 §3「配布ファイル同期運用の注記追加」により SKILL.md 末尾に注記セクションが追加されるが、これは情報の追記のみであり、既存の振る舞いに影響しない。

### テスト対象

**なし**。プログラムコードの変更がないため、自動テスト対象は存在しない。動作確認は手動（差分設計書 §5 要求トレーサビリティの検証方法を参照）で実施する。
