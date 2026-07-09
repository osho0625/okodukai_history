# 差分設計書: phase-compliance-check 検証項目強化

## 変更概要

既存の write モード検証項目リストに新項目を追加する形で対応する。自己申告ベースの検証を「客観的証跡照合ベース」に強化するため、(1) Process実行証跡の照合検証、(2) サブエージェント委譲指示の無視検出、(3) 成果物なしフェーズの署名手順明確化の3点を phase-compliance-check スキルと compliance-checker エージェントに追加する。OCP/リファクタリングは不要（ドキュメントファイルのため）。

## 変更1: write モード入力パラメータ追加（REQ-C-001）

### 対象ファイル: skills/phase-compliance-check/SKILL.md

#### Before（write モード入力テーブル）

```markdown
### 入力

| 項目 | 説明 |
|---|---|
| mode | `write` |
| workflow_name | ワークフロー名（change / bugfix / refactoring / impl 等） |
| phase_number | 完了したフェーズ番号 |
| phase_name | フェーズ名 |
| progress_file_path | 進捗ファイルのパス |
| changes_dir | 成果物格納先パス |
| expected_artifacts | このフェーズで作成されるべき成果物ファイル名リスト |
| user_approval | ユーザー承認済みか（true/false） |
| rule_violations | ルール違反の有無（none / 違反内容）。E-1〜E-4 の個別申告を含む |
| skill_name | 実行したフェーズスキル名 |
```

#### After（write モード入力テーブル）

```markdown
### 入力

| 項目 | 説明 |
|---|---|
| mode | `write` |
| workflow_name | ワークフロー名（change / bugfix / refactoring / impl 等） |
| phase_number | 完了したフェーズ番号 |
| phase_name | フェーズ名 |
| progress_file_path | 進捗ファイルのパス |
| changes_dir | 成果物格納先パス |
| expected_artifacts | このフェーズで作成されるべき成果物ファイル名リスト |
| user_approval | ユーザー承認済みか（true/false） |
| rule_violations | ルール違反の有無（none / 違反内容）。E-1〜E-4 の個別申告を含む |
| skill_name | 実行したフェーズスキル名 |
| process_full_text | 該当フェーズスキルの SKILL.md の Process セクション全文（前処理・Step群・後処理すべて） |
| execution_evidence | オーケストレータが会話履歴から切り出した実行証跡（各ステップの実行を証明できる箇所の抜粋） |
```

### 対象ファイル: agents/compliance-checker.md

#### Before

該当なし — 新規セクション追加

#### After（検証項目 I. Process実行証跡照合）

```markdown
### I. Process実行証跡照合
- process_full_text から前処理・各Step・後処理を1件ずつ列挙する
- 各ステップに対応する証跡が execution_evidence 内に存在するか照合する
- 照合基準: ステップの主要アクション（ファイル読み込み、サブエージェント呼び出し、ユーザーへの確認等）が証跡に含まれているか
- 証跡なしのステップがある場合 → FAIL（理由: 「Step X の実行証跡が不足」）
- 全ステップに対応する証跡が確認できた場合 → この項目は PASS
```

## 変更2: サブエージェント委譲検証追加（REQ-C-002）

### 対象ファイル: skills/phase-compliance-check/SKILL.md

#### Before（プロセス 2. サブエージェントが以下を検証）

```markdown
2. サブエージェントが以下を検証:
   a. 前フェーズの署名検証（改ざんチェック）
   b. 成果物ファイルの存在確認
   c. 自己申告の整合性チェック
   d. ユーザー承認の確認
   e. ルール遵守の自己申告チェック（E-1〜E-4）
   f. 進捗ファイル直接編集の検出
   g. git-commit-workflow (aide-powers skill) 経由のコミット確認（フェーズ8のみ）
   h. **省略なし宣言の記載**（下記「省略なし宣言ルール」参照）
```

#### After（プロセス 2. サブエージェントが以下を検証）

```markdown
2. サブエージェントが以下を検証:
   a. 前フェーズの署名検証（改ざんチェック）
   b. 成果物ファイルの存在確認
   c. 自己申告の整合性チェック
   d. ユーザー承認の確認
   e. ルール遵守の自己申告チェック（E-1〜E-4）
   f. 進捗ファイル直接編集の検出
   g. git-commit-workflow (aide-powers skill) 経由のコミット確認（フェーズ8のみ）
   h. **省略なし宣言の記載**（下記「省略なし宣言ルール」参照）
   i. **Process実行証跡照合**（process_full_text と execution_evidence を照合し、各ステップの実行証跡が存在するか検証する）
   j. **サブエージェント委譲検証**（Process内の委譲指示箇所に対応するサブエージェント呼び出しの証跡があるか検証する。オーケストレータ自己実行の場合 FAIL）
```

### 対象ファイル: agents/compliance-checker.md

#### Before

該当なし — 新規セクション追加

#### After（検証項目 J. サブエージェント委譲検証）

```markdown
### J. サブエージェント委譲検証
- process_full_text から「Task でサブエージェントをディスパッチする」「サブエージェントに委譲する」「invoke_sub_agent で起動する」「(aide-powers agent) サブエージェント」等のキーワードを含む箇所を抽出する
- 該当箇所ごとに、execution_evidence にサブエージェント呼び出し（invoke_sub_agent / invokeSubAgent / Task 等）の記録があるか確認する
- オーケストレータ自身が直接実行した証跡しかない場合 → FAIL（理由: 「Step X でサブエージェント委譲が指示されているが、オーケストレータが自己実行している」）
- 委譲指示が process_full_text に存在しない場合 → この項目はスキップ（PASS扱い）
- 全委譲指示に対応するサブエージェント呼び出しの証跡が確認できた場合 → この項目は PASS
```

## 変更3: 成果物なしフェーズの署名手順明確化（REQ-C-003）

### 対象ファイル: skills/phase-compliance-check/SKILL.md

#### Before

該当なし — 新規セクション追加

#### After（「成果物なしフェーズの署名手順」セクション全文）

```markdown
## 成果物なしフェーズの署名手順

フェーズ1（状態確認）等、成果物を作成しないフェーズでは以下のルールに従う。

### 署名対象文字列の構築

成果物テーブルに SHA256 列の値が0件の場合、「成果物一覧のSHA256」として空文字列の SHA256 ハッシュ値を使用する:

```
E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855
```

署名対象文字列: `{workflow_name}|{phase_number}|{完了日時}|E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`

### 手順

1. 成果物テーブルの SHA256 列を確認する
2. SHA256 列の値が0件（成果物なし）の場合:
   - 「成果物一覧のSHA256」= `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`（固定値）
3. 署名対象文字列を構築: `{workflow_name}|{phase_number}|{完了日時}|E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`
4. 通常の署名手順（HMAC-SHA256）で署名を生成する

### 検証時の注意

verify モードで成果物なしフェーズの署名を検証する際も、同じ固定値を使用して署名対象文字列を再構築すること。
```

### 対象ファイル: agents/compliance-checker.md

#### Before（AES署名の仕組み > 署名生成）

```markdown
### 署名生成（PASS 時）
PowerShell で以下を実行:
1. 署名対象文字列を構築: `{workflow_name}|{phase_number}|{完了日時}|{成果物一覧のSHA256}`
2. HMAC-SHA256 で署名生成（鍵は .aide/secrets/compliance-key.txt から読み込み）
3. Base64 エンコードして進捗ファイルに埋め込み: `<!-- PHASE-SIG:{phase_number}:{Base64文字列} -->`
```

#### After（AES署名の仕組み > 署名生成）

```markdown
### 署名生成（PASS 時）
PowerShell で以下を実行:
1. 署名対象文字列を構築: `{workflow_name}|{phase_number}|{完了日時}|{成果物一覧のSHA256}`
   - **成果物なしフェーズの場合:** 成果物テーブルに SHA256 列の値が0件のとき、「成果物一覧のSHA256」として空文字列の SHA256 ハッシュ値（固定値）を使用する:
     `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`
   - 署名対象文字列例: `change|1|2026-05-25 10:00|E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`
2. HMAC-SHA256 で署名生成（鍵は .aide/secrets/compliance-key.txt から読み込み）
3. Base64 エンコードして進捗ファイルに埋め込み: `<!-- PHASE-SIG:{phase_number}:{Base64文字列} -->`
```

## 更新が必要な設計資料

なし

（間接影響として全フェーズスキル45ファイルの後処理で新パラメータ `process_full_text`, `execution_evidence` の提供が必要になるが、change-requirements.md のスコープ外定義により、フェーズスキルへの反映は別ワークフローで実施する）
