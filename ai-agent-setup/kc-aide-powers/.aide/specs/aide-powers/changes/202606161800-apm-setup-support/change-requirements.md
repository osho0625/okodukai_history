# 変更要求定義

## 変更概要
- **変更の目的・背景**: APM 経由で aide-powers をインストールする際、現状は `apm install --target kiro` + `setup-local.bat` という2ステップが必要。しかし APM は本来 `apm install --target {target}` だけで skills/instructions/agents/hooks を自動配置する仕組みを持っている。aide-powers のパッケージ構成を APM のターゲット配置メカニズムに正しく適合させ、可能な限り `apm install` だけで完結するようにしたい。完結しないプラットフォーム（ギャップがあるもの）については、最小限の追加手順を明確にドキュメント化する。対象は5プラットフォーム（Kiro, Claude Code, Copilot, Codex, Gemini）。Cursor/OpenCode/Windsurf はブートストラップ設計が未整備のため今回対象外。
- **変更種別**: 複合（パッケージ構成変更 + ドキュメント追記 + setup スクリプト改修の可能性）

## 要求事項

### REQ-C-001: APM ターゲット別の配置ギャップ分析と対応方針の確定
- **種別**: 追加
- **説明**: aide-powers が各プラットフォームで必要とするファイル一式（skills, agents, steering/rules, hooks, AGENTS.md, GEMINI.md）と、APM が `--target {target}` で自動配置できるプリミティブのギャップを正式に分析し、プラットフォームごとの最適なセットアップフローを確定する。Kiro（現行の setup-local 対象）も含めて再評価する。
- **受入基準**:
  - AC-001: APM 対応対象の5プラットフォーム（Kiro, Claude Code, Copilot, Codex, Gemini）について「`apm install` だけで完結するか」「追加手順が必要か」が明確に判定されていること。Cursor/OpenCode/Windsurf はブートストラップ設計が未整備のため今回対象外とする
  - AC-002: 追加手順が必要なプラットフォームについて、具体的な手順（コマンド）が確定していること
- **優先度**: 必須

### REQ-C-002: APM パッケージ構成の改修（必要な場合）
- **種別**: 変更
- **説明**: APM の primitives 宣言（`.apm/` ディレクトリ構成、apm.yml の targets 設定等）が不足している場合、aide-powers パッケージを APM の期待するフォーマットに適合させる。これにより `apm install --target claude` 等で skills + agents + instructions が正しく配置されるようにする。
- **受入基準**:
  - AC-003: `apm install --target claude` で aide-powers の skills, agents（`.claude/agents/`）, instructions（`.claude/rules/`）が正しく配置されること（または配置できない場合その理由が明確であること）
  - AC-004: `apm install --target cursor` で同様に正しく配置されること
  - AC-005: `apm install --target codex` で skills + agents が正しく配置されること
  - AC-006: `apm install --target gemini` で skills が正しく配置されること
- **優先度**: 必須

### REQ-C-003: setup-local / setup スクリプトの改修（ギャップを埋める追加手順の自動化）
- **種別**: 変更
- **説明**: APM だけでは配置できないファイル（Kiro の agents 等）を配置する追加スクリプトを提供する。現行 setup-local.bat は Kiro/Claude/Copilot の3択だが、全プラットフォームに拡張するか、または APM で完結するプラットフォームは対象から外してギャップがあるもの（Kiro 等）だけ残すか、最適な形にする。引数でプラットフォームを指定する形式は維持する。ギャップの内容によっては setup.bat（グローバルインストール用）の改修も発生しうる。
- **受入基準**:
  - AC-007: APM で配置できないギャップが存在するプラットフォームについて、1コマンドでギャップを埋められる手段が提供されていること
  - AC-008: 引数でプラットフォームを指定できること（対話式に加えて `setup-local.bat . {番号}` 形式）
  - AC-009-a: setup.bat の改修が必要な場合、引数でプラットフォームを指定する形式で実装されていること
- **優先度**: 必須

### REQ-C-004: README.md / docs/02-getting-started.md の APM セクション改修
- **種別**: 変更
- **説明**: APM 経由セットアップの手順を、上記分析結果に基づいて正確に記載し直す。プラットフォームごとに「`apm install --target X` だけで OK」なのか「+ 追加手順が必要」なのかを明確に案内する。
- **受入基準**:
  - AC-009: 全対応プラットフォームについて APM 経由の手順が README に記載されていること
  - AC-010: `setup-local` が不要なプラットフォームについて「`apm install --target X` のみで完了」と明記されていること
  - AC-011: `setup-local` が必要なプラットフォームについて追加手順が具体的に記載されていること
  - AC-012: docs/02-getting-started.md §7 にも同等の情報が記載されていること
  - AC-013: README の APM セクションに APM 公式サイト URL（https://microsoft.github.io/apm/）を記載すること
- **優先度**: 必須

## 対象外（スコープ外）
- APM CLI 自体の機能拡張やバグ修正
- APM marketplace への公開
- 各プラットフォーム固有のトラブルシューティング追記
- aide-powers の機能変更（スキル・エージェントの内容変更）
- Cursor/OpenCode/Windsurf のAPM対応（ブートストラップ設計が未整備のため）

## 前提条件
- APM の targets matrix（https://microsoft.github.io/apm/reference/targets-matrix/）に基づく
- APM が各ターゲットで配置するプリミティブは APM のバージョンに依存する。現行 APM の仕様を前提とする
- aide-powers の primitives 構成（skills/, agents/, steering/ 等）は変更可能だが、動作に影響を与えない範囲で行う
- `setup.bat` によるグローバルインストール経路は既存のまま維持する（APM 経路と並存）

## 関連する既存要件
- `program-structure.md` — 配布マッピング表（各プラットフォームの配置先パス）
- `dev-environment.md` §4 — OS 依存と配布スクリプトの2系統維持ルール
- `docs/02-getting-started.md` §3 — グローバルインストール（setup.bat/setup.sh）
- `docs/02-getting-started.md` §7 — APM 経由セットアップ（現行）
- `README.md` APM セクション
- APM targets matrix: https://microsoft.github.io/apm/reference/targets-matrix/
- APM lifecycle: https://microsoft.github.io/apm/concepts/lifecycle/
