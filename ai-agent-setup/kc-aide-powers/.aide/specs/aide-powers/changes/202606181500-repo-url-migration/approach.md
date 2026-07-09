# 対応方針書

## 方針概要
- **対応方針**: 既存変更で対応（テキストファイル内URL/パス参照の文字列置換）
- **OCP検討結果**: 適用対象外（ドキュメント/設定ファイルの文字列置換であり、コード設計変更ではない）

## 関連箇所

### 変更対象
| ファイル | 変更箇所 | 変更内容 |
|---|---|---|
| apm.yml | repository フィールド | `http://10.110.47.117/takashi/aide-powers` → `http://10.110.47.117/kc-apm/kc-aide-powers` |
| README.md | APMインストールコマンド、apm_modules パス参照 | takashi/aide-powers → kc-apm/kc-aide-powers |
| docs/02-getting-started.md | APMインストールコマンド、apm_modules パス参照 | 同上 |
| .aide/specs/aide-powers/dev-environment.md | §8.3 リモート構成表 | origin/public URL更新、public削除反映 |
| docs-dev/01-system-platform/06-execution-units.md | リポジトリルート表記 | aide-claude/ → kc-aide-powers/（リポジトリ名としての参照のみ） |

### 新規追加
なし（全て既存ファイルの文字列置換）

## 変更方針の詳細

### 置換パターン
| # | Before | After | 対象ファイル |
|---|---|---|---|
| 1 | `http://10.110.47.117/takashi/aide-claude.git` | `http://10.110.47.117/kc-apm/kc-aide-powers.git` | dev-environment.md |
| 2 | `http://10.110.47.117/takashi/aide-powers.git` | `http://10.110.47.117/kc-apm/kc-aide-powers.git` | dev-environment.md |
| 3 | `http://10.110.47.117/takashi/aide-powers` (URL without .git) | `http://10.110.47.117/kc-apm/kc-aide-powers` | apm.yml, README.md, docs/02-getting-started.md |
| 4 | `apm_modules\\takashi\\aide-powers\\` / `apm_modules/takashi/aide-powers/` | `apm_modules\\kc-apm\\kc-aide-powers\\` / `apm_modules/kc-apm/kc-aide-powers/` | README.md, docs/02-getting-started.md |
| 5 | `aide-claude/` (リポジトリルート表記) | `kc-aide-powers/` | docs-dev/06-execution-units.md |

### 方針
- grep で対象箇所を事前に特定し、漏れなく置換する
- 過去の履歴ドキュメント（changes/配下の過去フォルダ、tech-investigation、tray-app-planning）はスコープ外
- program-structure.md のルートフォルダ名 `aide-claude/` はローカルフォルダ名のためスコープ外
- 置換完了後に再度 grep で残存チェックを行い、受入基準を満たすことを確認する

### dev-environment.md §8.3 の特殊対応
- origin URL変更に加えて、public remote が削除されたことを反映する
- ブランチ構成やリモート運用の記載を新しい状態に合わせる

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: 純粋なテキスト置換であり、コード設計変更ではない。リファクタリングの余地なし
