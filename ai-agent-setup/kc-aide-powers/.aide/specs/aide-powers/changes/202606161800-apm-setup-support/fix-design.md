# バグ修正差分設計書

## 作成日
2026-06-17

## 対象バグ
`apm run setup-kiro-win` 実行時に setup-local.bat の日本語 echo 文（147行目）がエンコーディング破損により cmd.exe にパイプ演算子として誤解釈され、exit code 255 で失敗する。

## 対策種別
根本対策

## 修正方針サマリー（fix-plan.md より）
1. setup-local.bat を UTF-8 + `chcp 65001` 方式で再作成する（setup.bat と同一方式）
2. .gitattributes を新規作成し、bat ファイルのエンコーディング変換を防止する
3. dev-environment.md §5.1 のエンコーディング規約を実態に合わせて更新する

---

## 差分設計

### 1. setup-local.bat — UTF-8 + chcp 65001 で全体を再作成

#### 変更理由
ファイル全体のエンコーディングが破損（CP932 マルチバイト文字の第1バイトが U+FFFD に変換され、第2バイトの ASCII 残存が構文エラーを引き起こす）しているため、setup.bat と同一の UTF-8 + `chcp 65001` 方式で全体を再作成する。

#### before（現状 — エンコーディング破損状態）
```bat
@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
```
- `chcp 65001` がない
- 日本語 echo 文が全て文字化け（U+FFFD 置換 + ASCII 残存）
- 147行目の「ポ」(0x7C = `|`) が残存し、パイプ演算子として誤解釈される

#### after（修正後 — UTF-8 正常状態）
```bat
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
```
- 2行目に `chcp 65001 >nul` を追加（setup.bat と同一パターン）
- ファイル全体を UTF-8（BOM なし）で正しくエンコードする
- 改行コードは CRLF を維持（dev-environment.md §5.2）
- 全ての日本語 echo 文を正しい UTF-8 テキストで記述する

#### 具体的な日本語テキストの復元

以下は setup-local.bat の全日本語テキスト箇所の before → after（文字化けテキスト → 正しい日本語）:

| 行付近 | before（文字化け） | after（正しいテキスト） |
|--------|-------------------|----------------------|
| タイトル | `aide-powers ���[�J���Z�b�g�A�b�v` | `aide-powers ローカルセットアップ` |
| コピー元 | `�R�s�[��:` | `コピー元:` |
| コピー先 | `�R�s�[��:` | `コピー先:` |
| メニュー見出し | `�C���X�g�[�����I�����Ă�������:` | `インストール先を選択してください:` |
| 選択肢文 | `�S��` | `全部` |
| キャンセル | `�L�����Z��` | `キャンセル` |
| プロンプト | `�I�� [0-4]:` | `選択 [0-4]:` |
| 無効選択 | `�����ȑI���ł��B` | `無効な選択です。` |
| セクション見出し | `--- Kiro IDE ���[�J�� ---` | `--- Kiro IDE ローカル ---` |
| コピー中 | `skills\ ���R�s�[��...` | `skills\ をコピー中...` |
| コピー完了 | `�R�s�[����:` | `コピー完了:` |
| 非対話上書き | `�㏑��: AGENTS.md�i��Θb���[�h�j` | `上書き: AGENTS.md（非対話モード）` |
| 上書き確認 | `������ AGENTS.md ���㏑�����܂����H [y/N]:` | `既存の AGENTS.md を上書きしますか？ [y/N]:` |
| スキップ | `�X�L�b�v: AGENTS.md` | `スキップ: AGENTS.md` |
| 完了 | `����` | `完了` |
| 最終メッセージ | `=== ���[�J���Z�b�g�A�b�v���� ===` | `=== ローカルセットアップ完了 ===` |
| 配置報告 | `�v���W�F�N�g %TARGET_DIR% �Ƀ��[�J���ݒ��z�u���܂����B` | `プロジェクト %TARGET_DIR% にローカル設定を配置しました。` |
| 共有案内（147行目） | `���|�W�g���ɃR�~�b�g����΃`�[���ŋ��L�ł��܂��B` | `リポジトリにコミットすればチームで共有できます。` |
| キャンセル表示 | `�L�����Z�����܂����B` | `キャンセルしました。` |


#### ロジック変更なし

setup-local.bat のロジック（分岐・コピー処理・メニュー番号・引数処理等）は一切変更しない。変更は以下の**3点**のみ:
1. ファイルエンコーディングを UTF-8（BOM なし）に修正
2. `chcp 65001 >nul` を `@echo off` の直後に追加
3. 文字化けした日本語テキストを正しい UTF-8 テキストに復元

---

### 2. .gitattributes — 新規作成

#### 変更理由
git の自動改行変換やエンコーディング変換により bat ファイルのバイト列が意図せず変更されることを防止する再発防止策。現状 `.gitattributes` が存在せず、git のデフォルト動作に依存している。

#### before
ファイルが存在しない。

#### after
```gitattributes
# aide-powers: bat ファイルのエンコーディング保護
# git による自動改行変換を防止し、CRLF を維持する
*.bat -text diff
```

#### 設計判断
- `binary` ではなく `-text diff` を選択する理由:
  - `binary` にすると `git diff` でテキスト差分が表示されなくなり、レビュー性が低下する
  - `-text` は git による改行変換（LF↔CRLF）を無効化するが、diff は通常のテキストとして表示される
  - `diff` 属性を明示することでテキスト差分表示を保証する
- bat ファイルは CRLF 改行が必須のため、git の `core.autocrlf` 設定に依存せず `-text` で保護する

---

### 3. dev-environment.md §5.1 — エンコーディング規約更新

#### 変更理由
dev-environment.md §5.1 では bat ファイルのエンコーディングを「Shift_JIS（CP932）」と規定しているが、実態として setup.bat は既に UTF-8 + `chcp 65001` で正常動作しており、規約と実態が乖離している。今回 setup-local.bat も UTF-8 + `chcp 65001` に統一するため、規約を実態に合わせて更新する。

#### before
```markdown
| bat スクリプト（`.bat`） | Shift_JIS（CP932） | 既存 `setup.bat`, `setup-local.bat` は CP932（`file` コマンドで Non-ISO extended-ASCII）。新規 `.bat` ファイルもこれに合わせること |
```

（§5.1 下部の補足文）
```markdown
bat ファイルを CP932 で書く理由は、Windows cmd の既定コードページが日本語環境で CP932 のため、UTF-8 で記述するとメッセージ表示時に文字化けが発生するためです。
```

#### after
```markdown
| bat スクリプト（`.bat`） | UTF-8（BOM なし） | 先頭に `chcp 65001 >nul` を記述すること。`setup.bat`, `setup-local.bat` は UTF-8 + `chcp 65001` で動作する。新規 `.bat` ファイルもこれに合わせること |
```

（§5.1 下部の補足文）
```markdown
bat ファイルは UTF-8 で記述し、スクリプト先頭で `chcp 65001 >nul` を実行してコードページを切り替えます。これにより apm 経由（PowerShell → cmd.exe、コードページ 65001）でも、cmd.exe 直接実行でも、日本語メッセージが正しく表示されます。
```

---

## インターフェース影響サマリ

| 項目 | 影響 |
|------|------|
| setup-local.bat の引数インターフェース | **変更なし** — 第1引数（TARGET_DIR）、第2引数（メニュー番号）の仕様は維持 |
| setup-local.bat のメニュー番号 | **変更なし** — 0〜4 の選択肢番号は維持 |
| setup-local.bat の exit code | **変更あり（バグ修正）** — 正常終了時に `exit /b 0` を確実に返すようになる（これがバグ修正の目的） |
| 他スクリプトへの影響 | **なし** — setup.bat, cleanup-kiro-agent.bat は今回変更しない |
| apm.yml の scripts 定義 | **変更不要** — 既存の `setup-local.bat . 1` 呼び出しがそのまま動作する |
| .gitattributes による既存ファイルへの影響 | setup.bat は既に UTF-8 + CRLF で正しく格納されており、`-text` 追加による実害なし |

---

## リグレッションテスト設計

dev-environment.md §7.4 に基づき、自動テストフレームワークは使用しない。以下の手動テスト計画で検証する。

### テスト1: バグ再現テストの再実行（主テスト）

| 項目 | 内容 |
|------|------|
| 目的 | 修正によりバグが解消されたことを確認する（パイプ誤解釈 + exit code 255 の解消） |
| 防ぐバグ | setup-local.bat の日本語 echo 文がパイプ演算子として誤解釈され exit code 255 で失敗する問題 |
| 前提条件 | 別プロジェクト（apm.yml に `scripts: setup-kiro-win` を定義済み） |
| 手順 | 1. `apm install --allow-insecure --target kiro http://10.110.47.117/takashi/aide-powers` を実行<br>2. `apm run setup-kiro-win` を実行 |
| 期待結果 | exit code 0 で正常終了。エラーメッセージなし |
| 判定基準 | `apm run` がエラーなく完了し、`[X] Script execution error` が表示されないこと |

### テスト2: 日本語メッセージの表示確認

| 項目 | 内容 |
|------|------|
| 目的 | UTF-8 + chcp 65001 により日本語メッセージが正しく表示されることを確認する |
| 防ぐバグ | エンコーディング不整合による文字化け表示 |
| 前提条件 | テスト1と同一環境 |
| 手順 | テスト1の実行時にコンソール出力を目視確認 |
| 期待結果 | 以下のメッセージが文字化けなく表示される:<br>- `aide-powers ローカルセットアップ`<br>- `--- Kiro IDE ローカル ---`<br>- `skills\ をコピー中...`<br>- `=== ローカルセットアップ完了 ===`<br>- `リポジトリにコミットすればチームで共有できます。` |
| 判定基準 | 日本語文字列が U+FFFD（�）や文字化けなく表示されること |

### テスト3: ファイルコピーの完了確認

| 項目 | 内容 |
|------|------|
| 目的 | setup-local.bat の本来の機能（ファイルコピー）が正常に動作することを確認する |
| 防ぐバグ | exit code 非0 によるコピー失敗誤判定 |
| 前提条件 | テスト1実行後 |
| 手順 | ターゲットプロジェクトの以下のディレクトリを確認:<br>- `.kiro/skills/` — 76フォルダが存在すること<br>- `.kiro/agents/` — エージェント定義ファイルが存在すること<br>- `.kiro/steering/` — aide-powers-bootstrap.md が存在すること |
| 期待結果 | 上記3ディレクトリに期待するファイルが配置されている |
| 判定基準 | `dir .kiro\skills` で 76 フォルダが確認できること |

### テスト4: cmd.exe からの直接実行確認

| 項目 | 内容 |
|------|------|
| 目的 | apm 経由でなく cmd.exe から直接実行しても正常動作することを確認する |
| 防ぐバグ | chcp 65001 が cmd.exe 直接実行時に副作用を起こす可能性 |
| 前提条件 | プロジェクトルートに setup-local.bat が存在する |
| 手順 | 1. cmd.exe を起動<br>2. `cd <プロジェクトルート>`<br>3. `setup-local.bat . 1` を実行 |
| 期待結果 | exit code 0 で正常終了。日本語メッセージが正しく表示される |
| 判定基準 | `echo %ERRORLEVEL%` が 0 を返すこと。文字化けなし |

### テスト5: setup.bat のリグレッション確認

| 項目 | 内容 |
|------|------|
| 目的 | .gitattributes 追加が setup.bat の動作に悪影響を与えないことを確認する |
| 防ぐバグ | .gitattributes の `-text` 属性が既存の正常な setup.bat に悪影響を与える可能性 |
| 前提条件 | .gitattributes がコミット済み |
| 手順 | 1. `git status` で setup.bat に意図しない変更がないことを確認<br>2. `setup.bat 1` を実行（Kiro IDE インストール） |
| 期待結果 | setup.bat が従来通り正常動作する。日本語メッセージ表示も正常 |
| 判定基準 | エラーなく完了し、`~/.kiro/skills/` にファイルが配置されること |

### テスト6: git clone 後のエンコーディング保全確認

| 項目 | 内容 |
|------|------|
| 目的 | .gitattributes により、別環境での git clone 後も setup-local.bat のエンコーディングが保全されることを確認する |
| 防ぐバグ | git の自動改行変換によるファイル破損の再発 |
| 前提条件 | 修正版がリモートリポジトリに push 済み |
| 手順 | 1. 別ディレクトリで `git clone` を実行<br>2. クローンした setup-local.bat の先頭バイトを確認（BOM なし UTF-8）<br>3. `chcp 65001 >nul` が2行目に存在することを確認<br>4. 改行コードが CRLF であることを確認 |
| 期待結果 | UTF-8（BOM なし）+ CRLF + `chcp 65001 >nul` の構成が維持されている |
| 判定基準 | `file setup-local.bat` で `UTF-8 Unicode text, with CRLF line terminators` と表示されること |

---

## 更新が必要な設計資料

| 資料 | 更新内容 | 理由 |
|------|----------|------|
| `dev-environment.md` §5.1 | bat ファイルのエンコーディング規約を「UTF-8 + chcp 65001」に変更（上記差分設計の通り） | 規約と実態の乖離解消。本バグ修正の一部として実施 |
| `program-structure.md` | フォルダ構成ツリーのルート直下に `.gitattributes` を追記。配布されないファイル（開発・管理用）テーブルに `.gitattributes | git属性設定（bat ファイルの -text diff）` を追記 | .gitattributes が新規追加されるため、プログラム構成に反映が必要 |

---

## 変更ファイル一覧

| ファイル | 操作 | 概要 |
|---------|------|------|
| `setup-local.bat` | 修正（全体再作成） | UTF-8 + chcp 65001 方式に変換。ロジック変更なし |
| `.gitattributes` | 新規作成 | bat ファイルの `-text diff` 属性設定 |
| `.aide/specs/aide-powers/dev-environment.md` §5.1 | 修正（2箇所） | エンコーディング規約を UTF-8 + chcp 65001 に更新 |

---

Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support
