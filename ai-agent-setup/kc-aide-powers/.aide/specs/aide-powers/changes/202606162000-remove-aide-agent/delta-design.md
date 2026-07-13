# 差分設計書: aide-agent 関連ファイルの削除

## 設計方針
- 対応方針: 既存変更で対応（ファイル削除 + 参照箇所修正）
- 全変更が「aide-agent 参照の削除」という単一パターン
- 新規追加なし。リファクタリングなし

## インターフェース影響サマリ
- シグネチャ変更なし（スキル/エージェントの外部インターフェースに変更はない）

## 削除対象ファイル

### 削除1: steering/aide-agent.md
- 変更種別: ファイル全体の物理削除
- 変更理由: aide-agent 運用廃止。オーケストレータ機能は phase-skill-rules.md / global-rules.md でプラットフォームのデフォルト Agent に直接注入済み

### 削除2: agents/aide-agent.md
- 変更種別: ファイル全体の物理削除
- 変更理由: aide-agent エージェント定義の廃止。プラットフォームのデフォルト Agent が using-aide-powers を直接 activate する形に変更

### 削除3: .kiro/steering/aide-agent.md
- 変更種別: ワークスペース内配置ファイルの物理削除
- 変更理由: 配布元（steering/aide-agent.md）が廃止されるため、配布先も削除

### 削除4: .kiro/agents/aide-agent.json
- 変更種別: ワークスペース内配置ファイルの物理削除
- 変更理由: aide-agent エージェント定義が廃止されるため、Kiro CLI 用 JSON 定義も削除

## 修正対象の差分設計

### 修正1: steering/aide-powers-bootstrap.md

**変更理由**: aide-agent steering 読み込み指示を削除し、using-aide-powers 直接 activate 指示のみに簡素化する

**before:**
```markdown
---
inclusion: always
---

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。

開発ワークフロー実行中は、`aide-agent` steering（手動読み込み）をコンテキストに読み込んでオーケストレータとして動作してください。
```

**after:**
```markdown
---
inclusion: always
---

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。
```

**変更箇所の説明**: 末尾の「開発ワークフロー実行中は、`aide-agent` steering（手動読み込み）をコンテキストに読み込んでオーケストレータとして動作してください。」の段落を削除。

---

### 修正2: skills/using-aide-powers/SKILL.md（エージェント切り替えガードセクション）

**変更理由**: aide-agent への切り替え判定が不要になるため、ガードセクション全体を削除する

**before:**
```markdown
---

## エージェント切り替えガード

あなたが `aide-agent` でない場合（aide-agent.md のプロンプトを受け取っていない場合）、
ソフトウェア開発の要求に対して `aide-agent` に切り替えて実行すること。

あなたが `aide-agent` である場合、以降の手順に従ってワークフローを実行すること。

---
```

**after:**
```markdown
---
```

**変更箇所の説明**: `## エージェント切り替えガード` セクション全体（見出し、本文、後続のセパレータ `---`）を削除。直前のセパレータ `---` はそのまま残し、直後の `## 起動時の手順` に接続する。

---

### 修正3: setup.bat（aide-agent.md コピー処理の削除）

**変更理由**: steering/aide-agent.md が廃止されるため、コピー処理が不要になる

**before:**
```bat
if exist "%SCRIPT_DIR%steering\aide-agent.md" (
    copy /Y "%SCRIPT_DIR%steering\aide-agent.md" "%KIRO_DIR%\steering\aide-agent.md" >nul
    echo   コピー完了: aide-agent.md
) else (
    echo   警告: steering\aide-agent.md が見つかりません
)
```

**after:**
（該当ブロック全体を削除。前後の処理をそのまま接続する）

**変更箇所の説明**: setup.bat 内の Kiro IDE/CLI インストール処理で、aide-agent.md を `%KIRO_DIR%\steering\` にコピーする if-else ブロック（6行）を削除する。前の aide-powers-bootstrap.md コピー処理と後の skills コピー処理はそのまま維持。

---

### 修正4: rules/aide-powers-bootstrap.md（Claude Code 用）

**変更理由**: aide-agent 切り替え指示を using-aide-powers activate 指示に修正する

**before:**
```markdown
<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## エージェント切り替え

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `aide-agent` に切り替えて実行してください。
```

**after:**
```markdown
<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。
```

**変更箇所の説明**: 見出し「## エージェント切り替え」→「## ソフトウェア開発時の動作」に変更。本文を「`aide-agent` に切り替えて実行してください」→「`using-aide-powers` スキルを activate し、その指示に従ってください」に変更。steering/aide-powers-bootstrap.md と同等の文言に統一する。

---

### 修正5: rules/aide-powers-bootstrap.mdc（Cursor 用）

**変更理由**: aide-agent 切り替え指示を using-aide-powers activate 指示に修正する

**before:**
```markdown
---
alwaysApply: true
description: "aide-powers ブートストラップ。ソフトウェア開発要求時に aide-agent へ切り替える。"
---

<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## エージェント切り替え

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `aide-agent` に切り替えて実行してください。
```

**after:**
```markdown
---
alwaysApply: true
description: "aide-powers ブートストラップ。ソフトウェア開発要求時に using-aide-powers スキルを activate する。"
---

<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。
```

**変更箇所の説明**: 
1. フロントマター `description` を「aide-agent へ切り替える」→「using-aide-powers スキルを activate する」に変更
2. 見出し「## エージェント切り替え」→「## ソフトウェア開発時の動作」に変更
3. 本文を「`aide-agent` に切り替えて実行してください」→「`using-aide-powers` スキルを activate し、その指示に従ってください」に変更

---

### 修正6: instructions/aide-powers-bootstrap.instructions.md（Copilot 用）

**変更理由**: aide-agent 切り替え指示を using-aide-powers activate 指示に修正する

**before:**
```markdown
---
applyTo: '**'
---

<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## エージェント切り替え

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `aide-agent` に切り替えて実行してください。
```

**after:**
```markdown
---
applyTo: '**'
---

<!-- [aide-powers:bootstrap] このファイルは setup スクリプトにより配置。手動編集禁止。 -->

# aide-powers ブートストラップ

aide-powers がインストールされています。

## ソフトウェア開発時の動作

ユーザーからソフトウェア開発に関する要求（作成・実装・設計・変更・バグ修正・リファクタリング・企画・技術調査）を受けた場合、
必ず `using-aide-powers` スキルを activate し、その指示に従ってください。
```

**変更箇所の説明**: 
1. 見出し「## エージェント切り替え」→「## ソフトウェア開発時の動作」に変更
2. 本文を「`aide-agent` に切り替えて実行してください」→「`using-aide-powers` スキルを activate し、その指示に従ってください」に変更

---

## 更新が必要な設計資料

| ファイル | 更新概要 | 更新タイミング |
|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` | aide-agent 関連記述の削除・更新: エージェント一覧表（13→12）、フォルダツリー（`agents/aide-agent.md` 行の削除、`steering/aide-agent.md` 行の削除）、起動フロー図（aide-agent steering 経由の段を削除）、「aide-agent が agents/kiro/ に存在しない理由」セクション全体の削除、配布マッピング表（`steering/aide-agent.md` 行の削除） | 実装後（ファイル削除・修正が完了した後に設計書を実態に合わせて更新） |

