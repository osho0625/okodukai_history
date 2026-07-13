# 技術調査: Microsoft APM（Agent Package Manager）マニフェスト仕様

> 調査日: 2026-06-16
> 調査者: aide-powers tech-investigation
> ステータス: 完了

---

## 1. 正式名称

**APM — Agent Package Manager**（Microsoft 発のオープンソース依存関係マネージャー）

## 2. フォーマット

- YAML 1.2（ファイル名: `apm.yml`）
- 仕様バージョン: v0.3 Working Draft（2026-05-20）

## 3. 必須フィールド

`name`（string）と `version`（semver string）の2つのみ。

## 4. APM のスコープ

- **プロジェクトローカル配置**（`setup-local.bat` と同じレイヤー）
- グローバル配置（`setup.bat` が行う `~/.kiro/` 等への配置）の代替にはならない
- 消費者が `apm install <repo>` → プロジェクト内の `.kiro/`, `.claude/` 等に配置

## 5. Kiro ターゲットの制限

公式 Targets Matrix（https://microsoft.github.io/apm/reference/targets-matrix/ 、2026-06-12更新）より:

> Supported primitives: **instructions, skills, hooks, mcp.**

**agents は Kiro ターゲットでは unsupported**。APM の `apm install -t kiro` では `.kiro/agents/` に何も配置されない。

## 6. 回避策: `apm run` + スクリプト

`apm.yml` の `scripts:` にシェルコマンドを定義し、`apm run <name>` で実行する方式。
既存の `setup-local.bat` / `setup-local.sh` を呼び出すことで、APM 未対応のファイル配置も含めて全配布を実行できる。

## 7. Superpowers の方式

Superpowers（93,000+ stars の主要プロジェクト）は APM を使っていない。
`plugin.json` + 各プラットフォーム固有のマーケットプレイス/手動インストールで配布。
Kiro は Superpowers の対応プラットフォームに含まれていない。

## 8. aide-powers での採用方針

- プロジェクト構造は変更しない（`.apm/` への移行不要）
- `apm.yml` を追加し、`scripts:` に `setup-local.bat` / `setup-local.sh` を登録
- 消費者は `apm install` + `apm run setup-*` で利用開始

## 9. 情報源

| # | URL | 確認日 |
|---|-----|--------|
| 1 | https://microsoft.github.io/apm/reference/targets-matrix/ | 2026-06-16 |
| 2 | https://microsoft.github.io/apm/reference/manifest-schema/ | 2026-06-16 |
| 3 | https://microsoft.github.io/apm/producer/compile/ | 2026-06-16 |
| 4 | https://microsoft.github.io/apm/concepts/primitives-and-targets/ | 2026-06-16 |
| 5 | https://obra-superpowers.mintlify.app/development/plugin-system | 2026-06-16 |
