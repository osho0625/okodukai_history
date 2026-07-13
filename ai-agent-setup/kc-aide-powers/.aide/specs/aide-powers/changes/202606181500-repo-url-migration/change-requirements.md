# 変更要求定義

## 変更概要
- **変更の目的・背景**: GitリポジトリのURL（オーナー/プロジェクト名パス）を `takashi/aide-claude` および `takashi/aide-powers` から `kc-apm/kc-aide-powers` に移行した。git remote は変更済みだが、プロジェクト内のドキュメント・設定ファイルに残る旧URL・旧パス参照を新しい参照に統一する必要がある。プロダクト名「aide-powers」自体は変更しない。
- **変更種別**: 非機能変更

## 要求事項

### REQ-C-001: リポジトリURL参照の更新
- **種別**: 非機能変更
- **説明**: プロジェクト内ドキュメント・設定ファイルに含まれる旧リポジトリURL（`http://10.110.47.117/takashi/aide-claude.git` および `http://10.110.47.117/takashi/aide-powers.git`）を、新URL（`http://10.110.47.117/kc-apm/kc-aide-powers.git`）に更新する。
- **受入基準**:
  - AC-001: プロジェクト内の全ファイルにおいて `http://10.110.47.117/takashi/aide-claude.git` への参照が存在しないこと
  - AC-002: プロジェクト内の全ファイルにおいて `http://10.110.47.117/takashi/aide-powers.git` への参照が存在しないこと
  - AC-003: 旧URLが記載されていた箇所が `http://10.110.47.117/kc-apm/kc-aide-powers.git` に置換されていること
- **優先度**: 必須

### REQ-C-002: APMパッケージパス参照の更新
- **種別**: 非機能変更
- **説明**: `apm.yml` の repository フィールドおよびドキュメント内の APM インストールコマンド等に含まれるパッケージパス `takashi/aide-powers` を `kc-apm/kc-aide-powers` に更新する。
- **受入基準**:
  - AC-001: `apm.yml` の repository フィールドが `kc-apm/kc-aide-powers` を参照していること
  - AC-002: ドキュメント内のAPMインストールコマンドが `kc-apm/kc-aide-powers` を使用していること
  - AC-003: プロジェクト内に `takashi/aide-powers` というパッケージパス参照が残存しないこと
- **優先度**: 必須

### REQ-C-003: apm_modules ディレクトリパス参照の更新
- **種別**: 非機能変更
- **説明**: ドキュメント・設定ファイル内の `apm_modules/takashi/aide-powers/` というディレクトリパス参照を `apm_modules/kc-apm/kc-aide-powers/` に更新する。
- **受入基準**:
  - AC-001: プロジェクト内に `apm_modules/takashi/aide-powers/` というパス参照が残存しないこと
  - AC-002: 該当箇所が `apm_modules/kc-apm/kc-aide-powers/` に置換されていること
- **優先度**: 必須

## 対象外（スコープ外）
- git remote 設定の変更（既に実施済み）
- 過去の履歴ドキュメント（`.aide/specs/aide-powers/changes/` 配下の過去変更フォルダ、`.aide/specs/aide-powers/tech-investigation/` 配下、`tray-app-planning` 配下）に含まれる旧URL参照の更新。これらは過去の意思決定記録であり、その時点の事実を保持するべきである
- ローカルの `apm_modules/` ディレクトリ自体のリネーム（APM の再インストールで自動的に解決される）
- program-structure.md のプロジェクトルートフォルダ名 `aide-claude/` の変更（ローカルフォルダ名であり、リポジトリURL移行とは独立）
- プロダクト名 aide-powers への言及はそのまま維持（変更不要）

## 前提条件
- git remote は既に新URL (`http://10.110.47.117/kc-apm/kc-aide-powers.git`) に設定変更済み
- 旧 remote `public` は削除済み
- 変更対象はプロジェクト内のテキストファイル（ドキュメント・設定ファイル）のみであり、実行ロジックへの影響はない

## 関連する既存要件
- `apm.yml`: APM パッケージ定義（program-structure.md 参照）
- `docs/02-getting-started.md`: インストールガイド（doc-index.md 参照）
- `dev-environment.md`: 開発環境定義（doc-index.md 参照）
- `program-structure.md`: プログラム構成書（doc-index.md 参照）
