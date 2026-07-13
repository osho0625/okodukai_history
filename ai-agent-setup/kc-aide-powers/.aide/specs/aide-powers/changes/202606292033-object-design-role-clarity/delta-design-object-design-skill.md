# 差分設計書（詳細） - skills/object-design/SKILL.md

対象ファイル: `skills/object-design/SKILL.md`

## 変更対象1-1: 新規作成プロセス（mode: create）Step 2

### before
```markdown
**Step 2:** object-designer-prompt.md を mode: quality_check で Task ディスパッチする
- サブエージェントが以下の品質基準を全レイヤーに適用して検証する:
  - SOLID原則（S/O/L/I/D 各原則の適用状況）
  - テスタビリティ（DI可能な構造、純粋ロジックの分離）
  - ドメインモデル貧血症の防止（ドメイン層のみ）
  - レイヤー間依存違反（上位→下位の具象依存がないか）
  - ダミー実装の設計漏れ（インフラ層のテスト用ダミー実装）
  - ユビキタス言語の整合性（命名の揺れがないか）
```

### after
```markdown
**Step 2:** object-designer-prompt.md を mode: quality_check で Task ディスパッチする
- サブエージェントが以下の品質基準を全レイヤーに適用して検証する:
  - SOLID原則（S/O/L/I/D 各原則の適用状況）
  - テスタビリティ（DI可能な構造、純粋ロジックの分離）
  - ドメインモデル貧血症の防止（ドメイン層のみ）
  - レイヤー間依存違反（上位→下位の具象依存がないか）
  - ダミー実装の設計漏れ（インフラ層のテスト用ダミー実装）
  - ユビキタス言語の整合性（命名の揺れがないか）
  - 外部連携部分の技術調査結果・参考ドキュメントリンクの記載状況
```

### 変更理由
REQ-C-002（AC-003）対応。quality_check モードのサブエージェント検証観点に、外部連携部分の技術調査結果・参考ドキュメントリンクの記載状況チェックを追加する。既存6項目のリストに1項目追加するのみで、既存の検証観点・順序は変更しない。

---

## 変更対象1-2: 差分設計プロセス（mode: delta）Step 3

### before
```markdown
**Step 3:** object-designer-prompt.md を mode: delta で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 影響を受けるレイヤーの既存 object-design-*.md を Read で読み込む（参照のみ、変更しない）
  2. 変更要求に基づき、before→after 形式で差分を設計する
  3. SOLID原則・テスタビリティを維持しながら差分を設計する
  4. `{changes_dir}/delta-object-design.md` を Write で作成する
```

### after
```markdown
**Step 3:** object-designer-prompt.md を mode: delta で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 影響を受けるレイヤーの既存 object-design-*.md を Read で読み込む（参照のみ、変更しない）
  2. 変更要求に基づき、before→after 形式で差分を設計する
  3. SOLID原則・テスタビリティを維持しながら差分を設計する
  4. 変更が外部ツール・外部サービス連携部分に及ぶ場合、tech-investigation (aide-powers skill) を実施し、調査結果と参考ドキュメントリンクを技術的実装情報セクションに反映する
  5. `{changes_dir}/delta-object-design.md` を Write で作成する
```

### 変更理由
REQ-C-002（AC-003, AC-004）対応。delta モードでは既存レイヤーへの変更が外部連携部分に及ぶ場合のみ tech-investigation を実施するという approach.md の方針に基づき、既存Write手順（旧4）の直前にステップを挿入する。既存ステップの意味・順序関係は変更せず、番号のみ後ろにずれる。

---

## 変更対象1-3: 逆引きプロセス（mode: reverse）Step 2

### before
```markdown
**Step 2:** object-designer-prompt.md を mode: reverse で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 全クラスの抽出（クラス名、継承関係、メソッド、プロパティ）
  2. 依存関係の解析（import文、コンストラクタインジェクション）
  3. レイヤー分類（ドメイン/アプリケーション/インフラ/プレゼンテーション）
  4. 例外クラスの抽出
  5. デザインパターンの識別（リポジトリ、ファクトリ、アダプタ等）
  6. テスト観点の抽出
```

### after
```markdown
**Step 2:** object-designer-prompt.md を mode: reverse で Task ディスパッチする
- サブエージェントが以下を実行する:
  1. 全クラスの抽出（クラス名、継承関係、メソッド、プロパティ）
  2. 依存関係の解析（import文、コンストラクタインジェクション）
  3. レイヤー分類（ドメイン/アプリケーション/インフラ/プレゼンテーション）
  4. 例外クラスの抽出
  5. デザインパターンの識別（リポジトリ、ファクトリ、アダプタ等）
  6. テスト観点の抽出
  7. 外部連携部分の参考ドキュメントリンクの記録（既存コードのコメントやREADME等から抽出できる場合は記録し、抽出できない場合は tech-investigation (aide-powers skill) で補足調査してもよい）
```

### 変更理由
REQ-C-002（AC-003）対応。approach.md の方針「reverse モードでは既存コードのコメントやREADME等から参考ドキュメントURLを抽出できる場合は記録し、抽出できない場合は tech-investigation で補足調査してもよいという任意規定とする」を反映する。既存6項目の末尾に7番目のステップを追加するのみ。

---

## 変更対象1-4: Integration > Related skills

### before
```markdown
**Related skills:**
- `ddd-modeling (aide-powers skill)` — ドメイン層の設計を担当（本スキルはドメイン層以外を担当）
- `design-qa-dispatch (aide-powers skill)` — オブジェクト設計のQAレビュー（本スキルの呼び出し元フェーズスキルが管理）
- `design-sync (aide-powers skill)` — 実装中に設計との乖離が発覚した場合の同期手順
```

### after
```markdown
**Related skills:**
- `ddd-modeling (aide-powers skill)` — ドメイン層の設計を担当（本スキルはドメイン層以外を担当）
- `design-qa-dispatch (aide-powers skill)` — オブジェクト設計のQAレビュー（本スキルの呼び出し元フェーズスキルが管理）
- `design-sync (aide-powers skill)` — 実装中に設計との乖離が発覚した場合の同期手順
- `tech-investigation (aide-powers skill)` — 外部ツール・外部サービス連携部分の設計時に、公式ドキュメントベースの技術調査を実施するために使用する
```

### 変更理由
REQ-C-002対応。本スキルの各モード処理手順内で tech-investigation を呼び出すようになるため、Integration セクションの Related skills に参照を追加し、スキル間の関係性を明示する。既存3項目は変更せず末尾に追加する。
