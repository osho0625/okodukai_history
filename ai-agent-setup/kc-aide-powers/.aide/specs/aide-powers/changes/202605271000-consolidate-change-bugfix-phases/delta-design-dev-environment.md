# 差分設計: dev-environment.md（§1 / §3 / §12 の Python/.venv 方針改訂）

> 対象: `.aide/specs/aide-powers/dev-environment.md`
> 関連 REQ: REQ-C-006
> 親索引: [delta-design.md](./delta-design.md)
> 注: 本ファイルは「設計書（dev-environment.md）の改訂」を before→after で示す差分設計である。dev-environment.md は本リポジトリの開発環境定義であり、本設計エージェントは直接編集しない（実装工程で反映）。

## 改訂方針

「aide-powers は Python を一切使用しない /.py は存在しない /.venv は使用しない」という現行記載を、「配布物の主体は Markdown/bat/bash/JSON だが、一部スキル（screenshot-capture）は pyautogui（Python）を補助的に使用し、その依存は `.venv` に隔離する（グローバル環境は汚染しない）」へ改訂する。§13（グローバル非汚染ルール）と矛盾しないよう整合させる。

---

## 変更1: §1 プロジェクトの性質（REQ-C-006 AC-006-1）

### before

```markdown
## 1. プロジェクトの性質

aide-powers は **Python アプリケーションではありません**。AI Agent によるドキュメント駆動開発を高度化するためのフレームワークであり、配布物の実態は以下の集合体です。
```
（中略：要素テーブル）
```markdown
実行コードは Markdown / bat / bash / JSON の集合であり、`pyproject.toml`、`requirements.txt`、`setup.py` 等の Python パッケージ管理ファイルは存在しません。
```

### after

```markdown
## 1. プロジェクトの性質

aide-powers は **Python アプリケーションではありません**。AI Agent によるドキュメント駆動開発を高度化するためのフレームワークであり、配布物の実態は以下の集合体です。
```
（中略：要素テーブルは変更なし）
```markdown
実行コードは Markdown / bat / bash / JSON の集合であり、`pyproject.toml`、`requirements.txt`、`setup.py` 等の Python パッケージ管理ファイルは存在しません。

ただし、**一部のスキルは Python を補助的に使用します。** `screenshot-capture` スキル（履歴の物証としてスクリーンショットを撮影する共通スキル）は pyautogui（Python ライブラリ）を用いて画面を撮影します。この Python 依存はプロジェクト内の仮想環境 `.venv` に隔離し、グローバル環境へはインストールしません（§13 グローバル環境の非汚染ルールと整合）。これは配布物の主体が Markdown/bat/bash/JSON であるという上記方針の例外的補助であり、aide-powers が Python アプリケーション化することを意味しません。
```

### 変更理由

- AC-006-1。screenshot-capture（REQ-C-001）が pyautogui を使うため、「Python を一切使用しない /.py は存在しない」という記載が実態と矛盾する。一部スキルで Python を補助使用する旨を追記して解消する。グローバル非汚染（§13）との整合も明記する。

---

## 変更2: §3 AI Agent プラットフォーム（依存ツール表）（REQ-C-006 AC-006-2）

> 注: 現行の dev-environment.md では「Python は不要」という記載は **§6 依存ツール表** にある（§3 はプラットフォーム定義）。REQ-C-006 は §3 と記すが、実体は依存ツール表（§6）の Python 行である。本設計では **§6 依存ツール表の Python 行** を改訂対象とし、§3 にプラットフォーム上の補足が必要な場合は補記する。改訂対象セクション番号は実装工程で現物の見出し番号に合わせて確定する（記載位置のズレは approach.md の §1/§3/§12 指定を尊重しつつ、現物の「Python は不要」記述箇所を正とする）。

### before（§6 依存ツール表の該当行）

```markdown
| Python | 不要 | aide-powers の開発には Python ランタイムを使用しない |
```

### after（§6 依存ツール表の該当行）

```markdown
| Python | 一部スキルで必要 | `screenshot-capture` スキルが pyautogui（スクリーンショット撮影）を使用する。依存は `.venv` に隔離し、グローバル環境へはインストールしない（§13 と整合）。それ以外の開発作業では Python ランタイムを使用しない |
```

### 変更理由

- AC-006-2。「Python は不要 / 開発に Python ランタイムを使用しない」を、screenshot-capture 用に Python（pyautogui）が必要になる旨へ改訂する。`.venv` 隔離・グローバル非汚染を併記し §13 と整合させる。

---

## 変更3: §6 末尾「仮想環境を使用しない」記述（REQ-C-006 AC-006-3 の一部）

### before

```markdown
「仮想環境（venv / .venv 等）」は使用しません。Python アプリではないため作成自体が不要です。
```

### after

```markdown
Python の仮想環境（`.venv`）は、`screenshot-capture` スキルが使用する pyautogui の依存を隔離する目的で **使用します**。`screenshot-capture` は pyautogui が未導入の場合にプロジェクト内 `.venv` へインストールしてから撮影します（グローバル環境へはインストールしません。§13 と整合）。それ以外の開発作業では仮想環境を必要としません。
```

### 変更理由

- AC-006-3。「仮想環境は使用しない」という記述が REQ-C-001 の `.venv` 利用方針と矛盾するため、screenshot-capture 用に `.venv` を使用する旨へ改訂する。

---

## 変更4: §12 仮想環境（REQ-C-006 AC-006-3 / AC-006-4）

### before

```markdown
## 12. 仮想環境

| 項目 | 内容 |
|---|---|
| Python 仮想環境 | **使用しない**（Python アプリではないため作成自体が不要） |
| Node.js | visual-companion の `server.cjs` 実行時のみ使用。グローバル Node.js を直接使用し、プロジェクト固有の `node_modules/` は持たない |

aide-powers グローバルルール §5-3「仮想環境（venv, .venv 等）が設定されている場合は仮想環境を優先すること」は、本リポジトリでは適用対象なしです。
```

### after

```markdown
## 12. 仮想環境

| 項目 | 内容 |
|---|---|
| Python 仮想環境（`.venv`） | **`screenshot-capture` スキル用に使用する。** pyautogui（スクリーンショット撮影）の依存を隔離する目的でプロジェクト内 `.venv` を使用する。pyautogui が未導入の場合は `.venv` へインストールしてから撮影する。**グローバル環境へはインストールしない**（§13 グローバル環境の非汚染ルールと整合）。`screenshot-capture` 以外の開発作業では Python 仮想環境を必要としない |
| Node.js | visual-companion の `server.cjs` 実行時のみ使用。グローバル Node.js を直接使用し、プロジェクト固有の `node_modules/` は持たない |

aide-powers グローバルルール §5-3「仮想環境（venv, .venv 等）が設定されている場合は仮想環境を優先すること」は、本リポジトリでは `screenshot-capture` スキルが使用する `.venv` に対して適用される（pyautogui 関連の Python 実行は `.venv` を優先する）。`screenshot-capture` 以外の開発作業には Python 仮想環境が存在しないため、その範囲では適用対象なしのままである。
```

### 変更理由

- AC-006-3。「Python 仮想環境は使用しない」「グローバルルール §5-3 は適用対象なし」を、screenshot-capture 用に `.venv` を使用する旨・§5-3 が `.venv` に適用される旨へ改訂する。
- AC-006-4。`.venv` 隔離・グローバル非汚染を明記し、§13（グローバル環境の非汚染ルール）と矛盾しないことを担保する（pyautogui の依存は `.venv` に隔離しグローバルへインストールしないことが読み取れる）。

---

## §13 との整合確認（AC-006-4）

§13「グローバル環境の非汚染ルール」は「リポジトリの開発作業のためにグローバル環境へ追加のパッケージをインストールする必要はない」と述べる。本改訂後の §1/§6/§12 はいずれも「pyautogui の依存は `.venv` に隔離し、グローバル環境へはインストールしない」と明記するため、§13 と矛盾しない。

- §13 本体への改訂は不要（既存の非汚染原則がそのまま `.venv` 隔離方針を包含する）。
- 必要なら §13 に「`screenshot-capture` の pyautogui 依存も `.venv` に隔離し、この非汚染原則に従う」の 1 文を補記してもよい（任意・整合補強）。本設計では必須としない。

## セクション番号に関する申し送り

approach.md / change-requirements.md は改訂対象を「§1 / §3 / §12」と記すが、現行 dev-environment.md では「Python は不要」記述は §6 依存ツール表、「仮想環境を使用しない」記述は §6 末尾と §12 にある（§3 はプラットフォーム定義で Python 記述はない）。本設計では **記述内容（Python/.venv 方針）を正** とし、現物の該当箇所（§1・§6・§12）を改訂対象とする。実装工程では現物の見出し番号に合わせて反映すること。AC-006 の趣旨（Python/.venv 方針の実態整合）は本差分で完全にカバーされる。

## 受入基準カバレッジ

| AC | 充足箇所 |
|---|---|
| AC-006-1 | 変更1（§1 に Python 補助使用を追記） |
| AC-006-2 | 変更2（§6 依存ツール表 Python 行） |
| AC-006-3 | 変更3（§6 末尾）・変更4（§12 仮想環境） |
| AC-006-4 | 変更4・「§13 との整合確認」節（.venv 隔離・グローバル非汚染・§13 非矛盾） |
