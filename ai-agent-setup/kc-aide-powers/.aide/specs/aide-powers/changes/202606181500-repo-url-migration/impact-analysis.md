# 影響範囲分析

## 変更概要（再掲）

リポジトリURL移行に伴い、プロジェクト内ドキュメント・設定ファイルに残る旧URL/旧パス参照を新しい参照に統一する。コードの振る舞い（ロジック）は一切変わらない。

| 置換パターン | Before | After |
|---|---|---|
| リポジトリURL（aide-claude） | `http://10.110.47.117/takashi/aide-claude.git` | `http://10.110.47.117/kc-apm/kc-aide-powers.git` |
| リポジトリURL（aide-powers） | `http://10.110.47.117/takashi/aide-powers.git` | `http://10.110.47.117/kc-apm/kc-aide-powers.git` |
| APMパッケージパス | `takashi/aide-powers` | `kc-apm/kc-aide-powers` |
| apm_modulesディレクトリ | `apm_modules/takashi/aide-powers/` | `apm_modules/kc-apm/kc-aide-powers/` |
| ディレクトリ参照（06-execution-units.md） | `aide-claude/` | `kc-aide-powers/` （リポジトリルート表記） |

---

## 1. アクター視点分析

### 1.1 影響アクター一覧

| # | アクター | 影響内容 | 影響度 |
|---|---|---|---|
| A-1 | aide-powers の利用者（APM経由インストール） | `apm install` コマンドのURL・パス表記が変わる。旧URLでインストール済みの環境は手動で再インストールが必要 | 中 |
| A-2 | aide-powers の利用者（git clone直接） | READMEの `<repository-url>` プレースホルダは変わらないが、docs内の具体的URL参照が更新される | 低 |
| A-3 | aide-powers の開発者（このリポジトリの開発者） | dev-environment.md のリモート構成記載が更新される。git remote は既に変更済みなので実作業への影響なし | 低 |

### 1.2 影響ユースケース一覧

| # | ユースケース | 影響アクター | 影響内容 |
|---|---|---|---|
| UC-1 | APM経由で aide-powers をインストールする | A-1 | `apm install --target kiro http://10.110.47.117/takashi/aide-powers` → `apm install --target kiro http://10.110.47.117/kc-apm/kc-aide-powers` に変わる |
| UC-2 | APM経由で aide-powers を更新する | A-1 | `apm install --allow-insecure --update` コマンドのURL部分が変わる |
| UC-3 | apm.yml の scripts でセットアップ補完を行う | A-1 | `apm_modules\\takashi\\aide-powers\\` → `apm_modules\\kc-apm\\kc-aide-powers\\` に変わる |
| UC-4 | 開発環境のリモート設定を確認する | A-3 | dev-environment.md §8.3 のリモート構成表が新URLに更新される |

---

## 2. プログラム構成視点分析

### 2.1 変更対象ファイル一覧

| # | ファイル | 変更箇所 | 変更種別 |
|---|---|---|---|
| F-1 | `apm.yml` | `repository:` フィールド（`takashi/aide-powers` → `kc-apm/kc-aide-powers`） | 文字列置換 |
| F-2 | `README.md` | APMインストールコマンド内URL、apm_modules パス参照（複数箇所） | 文字列置換 |
| F-3 | `docs/02-getting-started.md` | APMインストールコマンド内URL、apm_modules パス参照（複数箇所） | 文字列置換 |
| F-4 | `.aide/specs/aide-powers/dev-environment.md` | §8.3 リモート構成表の origin/public URL・リポジトリ名 | 文字列置換 |
| F-5 | `docs-dev/01-system-platform/06-execution-units.md` | §1 リポジトリ構成の `aide-claude/` ディレクトリ名参照 | 文字列置換 |

### 2.2 依存関係分析

| # | 依存元 | 依存先 | 依存の種類 | 影響 |
|---|---|---|---|---|
| D-1 | APM利用者の `apm.yml` scripts | F-1 `apm.yml` の repository | パッケージ解決パス | APM が新URLでリポジトリを解決する。旧URLでは解決不可 |
| D-2 | APM利用者の `apm.yml` scripts | F-2, F-3 のドキュメント記載パス | 手順参照（人間が読む） | ドキュメント通りにコマンドを実行する利用者に影響 |

### 2.3 影響がないことの確認

| 確認観点 | 結果 |
|---|---|
| 実行ロジック（bat/sh/hook） | 影響なし。setup.bat/sh 内に旧URLのハードコードはない |
| スキル定義（SKILL.md） | 影響なし。スキル内にリポジトリURLの参照はない |
| エージェント定義（agents/） | 影響なし |
| プラットフォームブートストラップ | 影響なし |
| program-structure.md のフォルダツリー | 影響なし（ルートフォルダ名 `aide-claude/` はローカルフォルダ名でありスコープ外と change-requirements.md で明記） |

---

## 3. git blame による起因元ドキュメントフォルダ特定

### 3.1 各ファイルの最終変更コミットと Docs: フッター

| ファイル | 最終コミット | コミットメッセージ | Docs: フッター |
|---|---|---|---|
| `apm.yml` | `857ea19` | `feat: APM targets メカニズム対応（5PF拡張）` | `Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support/` |
| `README.md` | `4605246` | `docs: APM更新手順を apm install --allow-insecure --update に修正` | なし |
| `docs/02-getting-started.md` | `857ea19` | `feat: APM targets メカニズム対応（5PF拡張）` | `Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support/` |
| `.aide/specs/aide-powers/dev-environment.md` | `d1fdbeb` | `fix: setup-local.bat UTF-8+chcp65001で再作成` | `Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support` |
| `docs-dev/01-system-platform/06-execution-units.md` | `53221eb` | `aide-powers: sync with main (fa19057)` | なし |

### 3.2 起因元ドキュメントフォルダ判定

複数ファイル（apm.yml、docs/02-getting-started.md、dev-environment.md）の Docs: フッターが同一の起因元を指している:

**起因元: `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/`**

ただし、本変更（repo-url-migration）は APM セットアップ機能の変更ではなく、リポジトリURL移行という独立した変更であるため、起因元フォルダへのマージは不要と判断する。

---

## 4. 分析結論

### 変更の性質

- 純粋な文字列置換作業（5ファイル）
- コードの振る舞い変更なし
- 依存関係は APM の外部パッケージ解決パスのみ（人間が手動でURL変更に追従する必要あり）

### リスク評価

| リスク | 評価 | 理由 |
|---|---|---|
| 置換漏れ | 低 | grep で対象箇所が特定済み |
| 意図しない副作用 | なし | テキスト置換のみで実行ロジックに影響なし |
| 既存利用者への影響 | 低 | 旧URLは既にリポジトリが移行済みのため、いずれ利用者は新URLに追従する必要がある |

---

## メタ情報

- 分析日: 2025-06-18
- 変更種別: 変更（既存ファイルの文字列置換）
- 起因元ドキュメントフォルダ: `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/`（マージ不要）
