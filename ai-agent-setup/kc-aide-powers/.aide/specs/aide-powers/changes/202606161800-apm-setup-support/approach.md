# 対応方針書

## 方針概要
- **対応方針**: 両方（追加 + 既存変更）
- **OCP検討結果**: 既存変更が必要

### OCP検討の根拠

aide-powers はOOPアプリケーションではなく、スクリプト（bat/sh）・YAML設定・Markdownの集合体である。Strategy/Factoryパターン等の拡張ポイントは存在しない。

- `apm.yml`: `targets` セクションの新規追加は純粋な追記。`scripts` セクションは削除（消費者に露出されないため不要）
- `setup-local.bat/sh`: メニュー構成は変更しない。非対話モード終了処理のみ修正
- `setup.bat/sh`: 引数対応（非対話モード）の追加。メニュー項目は変更しない
- `README.md` / `docs/02-getting-started.md`: 既存セクション内のテーブル・手順の5PF拡張

リファクタリングによりOCP準拠の構造（プラットフォーム定義の外部ファイル化等）にすることは理論上可能だが、bat/shスクリプトの性質上、抽象化のコストが高く、メリットが限定的。現状の直接変更が最も合理的。

## 関連箇所

### 変更対象
| ファイル | クラス/メソッド | 変更内容 |
|---|---|---|
| `apm.yml` | scripts セクション | targets セクション新設（5PF: kiro, claude, copilot, codex, gemini）、scripts セクション削除、keywords 拡張 |
| `setup-local.bat` | 終了処理 | 非対話モード終了処理の修正（`exit /b 0` 追加）。メニュー構成は変更しない |
| `setup-local.sh` | 終了処理 | 同上（.sh版、`exit 0` 追加） |
| `setup.bat` | メニュー前処理 | 引数対応（非対話モード）追加。メニュー項目は変更しない |
| `setup.sh` | メニュー前処理 | 同上（.sh版） |
| `README.md` | APM セクション | ターゲット表の5プラットフォーム拡張、APM公式URL追加、完結可否の明記 |
| `docs/02-getting-started.md` | §7.2〜§7.3 | ターゲット表5PF拡張、手順をapm run方式に再構成 |

### 新規追加
| ファイル | クラス/メソッド | 追加内容 |
|---|---|---|
| ギャップ分析結果ドキュメント | — | 各プラットフォームの `apm install` 完結可否と追加手順を整理した分析成果物（delta-design.md §1 に記載） |

> **注:** `.apm/` ディレクトリの新設は不要と判定（APM がパッケージ内既存ディレクトリを自動発見するため。delta-design §2.2 参照）。

## 変更方針の詳細

### 1. APM ターゲット別ギャップ分析の実施（REQ-C-001）
- **方針**: APM の targets matrix（https://microsoft.github.io/apm/reference/targets-matrix/）を調査し、各プラットフォームで `apm install --target {target}` が自動配置するプリミティブ（skills, agents, rules, instructions, hooks 等）を確認する。aide-powers が各プラットフォームで必要とするファイル一式（program-structure.md の配布マッピング表参照）とのギャップを特定する。
- **理由**: この分析結果がREQ-C-002〜004の全ての方針を決定する前提条件となる。APM の実仕様を正確に把握しないと、過不足のある対応になる。

### 2. apm.yml の改修（REQ-C-002）
- **方針**: apm.yml に `targets` セクションを新設し、5プラットフォーム（kiro, claude, copilot, codex, gemini）を宣言する。`scripts` セクションは消費者に露出されないため削除する（実機検証済み）。直接 clone ユーザーは setup-local.bat を直接実行する。APM 経由の消費者向けには README で apm.yml への scripts 追記手順を案内する。
- **理由**: 現行は scripts のみ（3プラットフォーム）で targets 宣言がない。APM の自動配置メカニズムを活用するには targets セクションでプラットフォームを明示的に宣言する必要がある。scripts は消費者に露出されない仕様のため削除が合理的。

### 3. setup-local.bat/sh の改修（REQ-C-003）
- **方針**: setup-local.bat/sh のメニュー構成は変更しない（既存4択: 1:Kiro, 2:Claude, 3:Copilot, 4:全部を維持）。非対話モード終了処理のみ修正する（`exit /b 0` / `exit 0` 追加。apm run 経由での exit code 255 問題を解消）。Codex/Gemini はワークスペースローカル非対応のため setup-local に追加しない。
- **理由**: setup-local は APM 専用ではなく直接 clone フローでも使われる。メニュー番号変更はユーザーの混乱を招く。APM 経由のギャップ補完は消費者が apm.yml に scripts を追記して apm run で実行する方式で対応する。
- **制約**: bat は CP932/CRLF、sh は UTF-8/LF を維持（dev-environment.md §5）。bat/sh の2系統を同期（§4）。

### 4. setup.bat/sh の改修（REQ-C-003 の一部）
- **方針**: setup.bat/sh に引数対応（非対話モード）を追加する。`apm run` 経由や自動化スクリプトからプラットフォーム番号を引数で渡し、メニュー選択をスキップして直接実行できるようにする。メニュー項目自体は変更しない（Cursor 含む既存7/8択を維持）。
- **理由**: Codex/Gemini はワークスペースローカル非対応でグローバル配置（setup.bat 経由）が必要。APM 経由の消費者が apm run で setup.bat を呼ぶ際に引数でプラットフォーム番号を渡す形式が必要。

### 5. README.md の APM セクション改修（REQ-C-004）
- **方針**: ターゲット表を5プラットフォーム（Kiro, Claude Code, Copilot, Codex, Gemini）に拡張する。各プラットフォームについて「`apm install` のみで完了」か「+ 追加手順が必要」かを明記する。APM 公式サイト URL（https://microsoft.github.io/apm/）を APM セクション冒頭に記載する。ギャップ補完手順は apm.yml scripts 追記 + apm run 方式で案内する。
- **理由**: ユーザーがプラットフォームに応じた最短手順を即座に判断できるようにする。AC-009〜AC-013 を満たす。

### 6. docs/02-getting-started.md §7 の改修（REQ-C-004）
- **方針**: §7.2 のターゲット表を5プラットフォームに拡張する。§7.3 の手順を README と同じ apm.yml scripts 追記 + apm run 方式に再構成する。APM のみで完結するプラットフォーム（Claude Code, Copilot）と追加手順が必要なプラットフォーム（Kiro, Codex, Gemini）を分離して案内する。
- **理由**: README と docs の両方で整合した情報を提供する（AC-012）。

## リファクタリング検討結果
- **検討結果**: 不要
- **理由**: bat/sh スクリプトに対して OCP 準拠のプラグイン構造（プラットフォーム定義の外部ファイル化 + 動的読み込み等）を導入することは技術的に可能だが、以下の理由から不要と判断する:
  1. bat/sh はインタプリタの制約上、抽象化のコストが高い（可読性低下、デバッグ困難）
  2. プラットフォーム追加頻度は低い（現在5PF対応、将来的に追加可能）
  3. 直接変更のコストが十分に低い（引数対応追加・終了処理修正の定型作業）
  4. メタ開発プロジェクトであり、配布スクリプトの保守性よりも明快さ・手動検証のしやすさを優先する
