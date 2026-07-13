# バグ報告: APM配布ファイルの配置場所が不正

## 基本情報

| 項目 | 内容 |
|---|---|
| 報告日時 | 2026-06-19 19:30 |
| 報告者 | ユーザー |
| 重要度 | 高 |
| 関連変更 | 202606191000-rules-distribute-platform-check |

## 症状

変更WF（202606191000-rules-distribute-platform-check）で追加した APM 配布用ファイル（global-rules, phase-skill-rules）が、APM の `apm install --target copilot` / `apm update` で配布先に正しく配布されない。また、以前から存在していた bootstrap ファイルも配布されなくなった。

## 再現手順

1. aide-powers リポジトリに `instructions/`, `rules/`, `steering/` の各ディレクトリに配布用ファイルを配置（変更WFで実施済み）
2. 配布先プロジェクトで `apm install --target copilot https://10.110.47.117/kc-apm/kc-aide-powers` を実行
3. 配布先の `.github/instructions/` を確認

## 期待動作

配布先の `.github/instructions/` に以下の3ファイルが存在する:
- `aide-powers-bootstrap.instructions.md`
- `aide-powers-global-rules.instructions.md`
- `aide-powers-phase-skill-rules.instructions.md`

## 実際の動作

配布先の `.github/instructions/` に `aide-powers-global-rules.instructions.md` と `aide-powers-phase-skill-rules.instructions.md` のみが出現し、`aide-powers-bootstrap.instructions.md` が消失した。

## 原因（調査済み）

APM のソースコード（`src/apm_cli/integration/instruction_integrator.py`）を調査した結果:
- APM は instructions のソースファイルを **`.apm/instructions/`** ディレクトリからのみ検索する（`find_instruction_files` メソッド）
- ルート直下の `instructions/`, `rules/`, `steering/` は APM のソースとして認識されない
- APM は `.apm/instructions/` にある `.instructions.md` ファイルを各ターゲットに自動変換して配布する（copilot → `.github/instructions/`, claude → `.claude/rules/`, kiro → `.kiro/steering/`）
- 変更WFでは誤って `instructions/`（ルート直下）、`rules/`、`steering/` にファイルを配置したため APM が認識できなかった

## 影響範囲

- APM 経由で aide-powers をインストールする全ユーザー（copilot, claude, kiro ターゲット）
- bootstrap が配布されないと aide-powers が起動しない

## 修正方針（概要）

1. `rules/aide-powers-global-rules.md` と `rules/aide-powers-phase-skill-rules.md` を削除
2. `instructions/aide-powers-global-rules.instructions.md` と `instructions/aide-powers-phase-skill-rules.instructions.md` を削除
3. `steering/aide-powers-global-rules.md` と `steering/aide-powers-phase-skill-rules.md` を削除
4. `instructions/aide-powers-bootstrap.instructions.md` を `.apm/instructions/` に APM 正式フォーマット（`applyTo: '**'` 付き `.instructions.md`）で配置（元ファイルは削除）
5. `.apm/instructions/` に `aide-powers-global-rules.instructions.md` と `aide-powers-phase-skill-rules.instructions.md` を APM 正式フォーマット（`applyTo: '**'` 付き `.instructions.md`）で新規作成
