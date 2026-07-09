# 影響範囲分析（更新版 — 差分設計反映済み）

## 変更種別

**変更**（既存のスキル定義の振る舞いを変更する）

---

## アクター視点の影響分析

### 関連ユースケース

| # | ユースケース | 影響内容 |
|---|---|---|
| UC-1 | セッション開始時の references 配置 | コピー方式が Read→Write から シェルコマンド（Copy-Item/cp）に変更される。ファイル不足判定条件に「`.aide/references/` にファイル不足がある」が追加される |
| UC-2 | ワークフロー開始時のルール配布（global モード） | front-matter + 本文の結合が AI の Read→Write からシェルコマンドに変更される。フラグ削除もシェルコマンド（Remove-Item/rm）に変更される |

### 影響を受けるアクター

| # | アクター | 影響内容 | 操作フローの変化 |
|---|---|---|---|
| A-1 | AI Agent（オーケストレータ） | references コピーとルール配布の実行方法が変わる。Read/Write ツールの代わりにシェルコマンド実行ツール（execute_pwsh / bash）を使用する | **変化あり**: ファイル操作ツール（Read/Write）→ シェルコマンド実行ツールへ切り替え |
| A-2 | aide-powers 利用者（ユーザー） | 表面的な影響なし。コンテキスト消費削減と速度向上の恩恵を受ける | **変化なし**: ユーザーの操作手順に変化なし |

### 影響を受けないアクター

| アクター | 影響なしの理由 |
|---|---|
| フェーズスキル実行中の AI Agent | 配布後のルールファイルは同じ内容・同じ場所に配置されるため、下流の参照に影響なし |
| サブエージェント群（micro-impl-agent 等） | 配布メカニズムとは無関係。参照するルールファイルの内容・パスは不変 |
| rules-distribute の skill モード利用者 | skill:deploy/cleanup モードは変更対象外 |

### 説明対象アクター

| # | アクター | 説明が必要な理由 |
|---|---|---|
| EA-1 | AI Agent（オーケストレータ） | 操作フローが Read/Write → シェルコマンドに変更されるため、SKILL.md の新しい手順記述に従う必要がある |

※ ユーザー（A-2）への説明は不要。表面的な操作に変化なく、処理速度向上のみ。

---

## プログラム構成視点の影響分析

### 変更対象ファイル

| # | ファイルパス | 変更内容 |
|---|---|---|
| F-1 | `skills/using-aide-powers/SKILL.md` | 起動手順2「references 配置」のコピー方式記述をシェルコマンド方式に書き換え |
| F-2 | `skills/rules-distribute/SKILL.md` | ステップ2: global モード「入力ソース」および「差分検知＆置き換え処理」をシェルコマンド方式に書き換え |

### 依存関係テーブル

#### F-1: `skills/using-aide-powers/SKILL.md` を参照しているファイル

| # | 依存元ファイル | 依存の性質 | 影響度 |
|---|---|---|---|
| D-1 | `steering/aide-powers-bootstrap.md` | activate 誘導（起点） | なし（activate 指示自体は不変） |
| D-2 | `rules/aide-powers-bootstrap.md` | activate 誘導（Claude Code） | なし |
| D-3 | `instructions/aide-powers-bootstrap.instructions.md` | activate 誘導（Copilot） | なし |
| D-4 | `GEMINI.md` | @import で直接参照 | なし（Gemini は SKILL.md を読み込むだけ） |
| D-5 | `skills/rules-distribute/SKILL.md` | using-aide-powers から呼び出される（手順3） | なし — 呼び出しインターフェース不変（後述） |
| D-6 | `skills/session-handover/SKILL.md` | 新セッション開始時に参照 | なし（セッション引き継ぎロジックは不変） |
| D-7 | `skills/toolmap-verifier/SKILL.md` | references/ パス参照 | なし（references の所在は不変） |
| D-8 | 全フェーズスキル（`fs-*`） | using-aide-powers 経由で起動される | なし（ワークフロー選択・起動メカニズムは不変） |

#### F-2: `skills/rules-distribute/SKILL.md` を参照しているファイル

| # | 依存元ファイル | 依存の性質 | 影響度 |
|---|---|---|---|
| D-9 | `skills/using-aide-powers/SKILL.md` | 手順3で呼び出す | なし — 呼び出し時のパラメータ不変（後述） |
| D-10 | 全フェーズスキル（`fs-*`） | skill:deploy/cleanup モードで呼び出す | なし（skill モードは変更対象外） |

---

## シグネチャ変更の追跡結果

### 分析対象

本変更は SKILL.md（Markdownドキュメント）の手順記述変更であり、プログラムコードのメソッド/関数シグネチャ変更はない。以下ではスキル間インターフェース（呼び出し方法・パラメータ・入出力プロトコル）の変更有無を確認する。

### スキル間インターフェース追跡

| # | インターフェース | Phase 1版の判定 | 差分設計反映後の再確認結果 |
|---|---|---|---|
| IF-1 | `using-aide-powers` → `rules-distribute` の呼び出し | 不変 | ✅ 不変。「rules-distribute スキルを global モードで実行」の指示文は維持。delta-design.md の「インターフェース影響サマリ」で明記 |
| IF-2 | `.aide/references/.rules-updated` フラグファイルプロトコル | 不変 | ✅ 不変。作成: using-aide-powers がシェルコマンドで `New-Item`/`touch`。確認: rules-distribute が存在確認。削除: rules-distribute がシェルコマンドで `Remove-Item`/`rm`。プロトコル自体（空ファイルの有無で配布要否を伝達）は不変 |
| IF-3 | 配布先ファイルの内容・フォーマット | 不変 | ✅ 不変。同一の front-matter + マーカーコメント + 本文が出力される（生成方法のみ変更） |
| IF-4 | 配布先のファイルパス・ファイル名 | 不変 | ✅ 不変。delta-design.md に「各プラットフォームの配置先パス・ファイル名」「front-matter の内容」は維持と明記 |
| IF-5 | skill モード（deploy / cleanup） | 不変 | ✅ 不変。delta-design.md のスコープ外と明記。before/after ブロックにも skill モードの記述は含まれない |
| IF-6 | version.json の比較ロジック | 不変 | ✅ 不変。「version.json の Read と比較は現行通り」と delta-design.md に明記 |
| IF-7 | AGENTS.md / GEMINI.md への参照行追記 | 不変 | ✅ 不変。「1行の追記のみのため現行通り AI が実行する」と delta-design.md に明記 |

### 結論

**シグネチャ変更（スキル間インターフェースの変更）: なし**

全7件のインターフェースについて、差分設計書で明示的に「不変」「維持」と記載されており、before→after の差分内容からも変更が確認されない。

---

## 既存要件・システム要件との矛盾確認

### 確認対象

doc-index.md に登録されている設計資料:
- `dev-environment.md` — §3 AI Agent プラットフォーム、§4 OS依存
- `program-structure.md` — フォルダ構成ツリー、配布マッピング表

※ `user-requirements.md` / `system-requirements.md` は doc-index.md に不在（dev-environment.md §14.1 で「存在しない」と明記。本リポジトリはメタ開発のため）

### 照合結果

| # | 照合対象 | 結果 |
|---|---|---|
| C-1 | dev-environment.md §3: プラットフォームは Kiro IDE / Kiro CLI | ✅ 矛盾なし。delta-design.md のシェルコマンドは PowerShell（Windows）と bash（Linux/Mac）を併記しており、dev-environment.md §4 の「2系統維持」方針と整合 |
| C-2 | dev-environment.md §4: Windows 開発主環境 + bat/sh 2系統維持 | ✅ 矛盾なし。delta-design.md は全コマンドで Windows（PowerShell）と Linux/Mac（bash）の両方を記載 |
| C-3 | dev-environment.md §6: 依存ツール — PowerShell 必須 | ✅ 矛盾なし。delta-design.md は PowerShell コマンド（Copy-Item, New-Item, Get-Content, Set-Content, Remove-Item）を使用。いずれも PowerShell 標準コマンドレット |
| C-4 | dev-environment.md §7: 動作確認は手動検証 | ✅ 矛盾なし。自動テストフレームワークは導入しない方針。本変更の検証も手動で行う |
| C-5 | program-structure.md: `skills/using-aide-powers/references/` の構成 | ✅ 矛盾なし。コピー対象10ファイルは program-structure.md のフォルダ構成ツリーに記載のファイルと完全一致 |
| C-6 | program-structure.md: 配布マッピング表 | ✅ 矛盾なし。rules-distribute の配布先パスは program-structure.md の配布マッピング表と整合。ファイルパス・ファイル名に変更なし |
| C-7 | program-structure.md: ハブスキル起動フロー | ✅ 矛盾なし。起動フローの連鎖（ブートストラップ → using-aide-powers → fs-* → サブエージェント）は不変 |

### 結論

**既存設計資料との矛盾: なし**

---

## テスト対象機能の特定

### 直接変更する機能 → 新規テスト

| # | テスト対象 | テスト内容 | 対応する受入条件 |
|---|---|---|---|
| T-1 | references 一括コピー（シェルコマンド） | version 不一致時にシェルコマンドで全10ファイルがコピーされること | AC-001-1, AC-001-2 |
| T-2 | references コピー後フラグ作成 | コピー完了後に `.aide/references/.rules-updated` が作成されること | AC-001-3 |
| T-3 | references version 一致時スキップ | version 一致時に何も実行されないこと | AC-001-4 |
| T-4 | references ディレクトリ自動作成 | `.aide/references/` が存在しない場合にシェルコマンドで作成されること | AC-001-5 |
| T-5 | global モード配布（front-matter 付き） | Kiro/Claude Code/Cursor/Copilot 向けに front-matter + マーカー + 本文が正しく結合されること | AC-002-1, AC-002-2 |
| T-6 | global モード配布（単純コピー） | Codex/OpenCode/Gemini CLI 向けにソースがそのままコピーされること | AC-002-1, AC-002-2 |
| T-7 | global モード AI Read 禁止 | AI が global-rules.md / phase-skill-rules.md の内容を Read しないこと | AC-002-3 |
| T-8 | global モード フラグなし時スキップ | フラグなし＆配置先存在時に配布がスキップされること | AC-002-4 |
| T-9 | global モード 初回配置保証 | 配置先ファイルが存在しない場合にフラグ有無に関わらず新規作成されること | AC-002-5 |
| T-10 | global モード フラグ削除 | 配布完了後にフラグファイルがシェルコマンドで削除されること | AC-002-6 |
| T-11 | global モード ディレクトリ自動作成 | 配置先ディレクトリが存在しない場合にシェルコマンドで作成されること | AC-002-7 |

### 変更の影響を受ける可能性がある機能 → リグレッションテスト対象

| # | テスト対象 | リグレッション確認内容 | 理由 |
|---|---|---|---|
| RT-1 | rules-distribute skill モード（deploy/cleanup） | skill モードが正常動作すること（変更の影響を受けていないこと） | 同一ファイル（rules-distribute SKILL.md）内に共存するため、記述変更時に意図せず skill モード部分を破損するリスク |
| RT-2 | version.json 比較ロジック | version 比較による更新判定が正しく動作すること | 手順2の前半（比較ロジック）は不変の予定だが、周辺記述の変更により意図せず影響する可能性 |
| RT-3 | AGENTS.md / GEMINI.md 参照行追記 | front-matter なしプラットフォームの追記ロジックが正常動作すること | rules-distribute SKILL.md 内に記述があり、global モード書き換え時に影響するリスク |
| RT-4 | using-aide-powers の手順3以降 | rules-distribute 呼び出し以降の手順（progress-resume-check 等）が正常に続行すること | 手順2の大規模書き換えにより、手順3の記述に意図しない影響が出るリスク |
| RT-5 | セッション開始フロー全体 | ブートストラップ → using-aide-powers activate → 手順1〜4 が正常に一連で完了すること | 手順2の変更が全体フローの連続性に影響しないことの確認 |

---

## 変更が及ばない範囲（明示）

| 範囲 | 理由 |
|---|---|
| `skills/rules-distribute/SKILL.md` の skill モード（deploy/cleanup） | delta-design.md で「維持する部分（変更なし）」と明記。スコープ外 |
| `skills/using-aide-powers/references/version.json` | 比較ロジックは不変。version.json の構造・内容は変更しない |
| 配布先ルールファイルの内容・フォーマット | 出力は同一（生成方法のみ変更）。front-matter + マーカー + 本文の構成不変 |
| `.aide/ai-agent-platform-targets.md` | 変更なし |
| 全フェーズスキル（fs-*） | 配布後のルールファイルを参照するのみ。参照先の内容・パスが不変のため影響なし |
| サブエージェント群（agents/） | 配布メカニズムとは無関係 |
| setup.bat / setup.sh | インストーラは別経路。SKILL.md の手順記述変更はインストーラに影響しない |
| hooks/ | セッションフックは配布メカニズムとは独立 |

---

## 起因元ドキュメントフォルダの特定（git blame）

### 調査結果（Phase 1版から変更なし）

| 対象ファイル | 主要コミット | コミットメッセージ | Docs: フッター |
|---|---|---|---|
| `skills/using-aide-powers/SKILL.md` | `87bba11` | feat: ルール配布の同期判定をversion.json駆動に変更 | なし |
| `skills/using-aide-powers/SKILL.md` | `3c2614e` | refactor: version.jsonをper-file構造から単一versionに簡素化 | `Docs: .aide/specs/aide-powers/changes/202605271000-consolidate-change-bugfix-phases/` |
| `skills/rules-distribute/SKILL.md` | `87bba11` | feat: ルール配布の同期判定をversion.json駆動に変更 | なし |
| `skills/rules-distribute/SKILL.md` | `dae2460` | fix(rules-distribute): global モードに正本ソース鮮度保証を追加し古いルールが反映されない不具合を修正 | なし |

### 結論

**起因元ドキュメントフォルダ: なし**（Docs: パスあり（`3c2614e`）だが今回の変更とは無関係 — version.json 構造簡素化の変更であり、シェルコマンド化とは動機・内容が異なる）

---

## Phase 1 版との差分（更新箇所のサマリー）

| 項目 | Phase 1 版 | 更新版（本ドキュメント） |
|---|---|---|
| テスト対象機能の特定 | 未実施 | 新規テスト 11件 + リグレッションテスト 5件を特定 |
| 説明対象アクターの特定 | 未実施 | AI Agent（オーケストレータ）を特定。ユーザーへの説明は不要と判定 |
| シグネチャ変更追跡 | 概要レベル | 7件のインターフェースを個別に差分設計書と突き合わせて再確認 |
| 既存要件との矛盾確認 | 未実施 | dev-environment.md / program-structure.md と7項目で照合。矛盾なし |
| D-5, D-9 の影響度 | 「要確認」 | 「なし」に確定（差分設計書でインターフェース不変が明記） |
| フラグ削除のシェルコマンド化 | 未記載 | 追加確認（delta-design.md の after 部分で Remove-Item/rm を使用） |
| ファイル不足判定条件の追加 | 未記載 | 追加確認（delta-design.md で「`.aide/references/` にファイル不足がある」を判定条件に追加） |

---

## 影響範囲サマリー

| 項目 | 値 |
|---|---|
| 変更種別 | 変更 |
| 影響ユースケース数 | 2件 |
| 影響アクター数 | 2件（うち操作フロー変化あり: 1件） |
| 説明対象アクター数 | 1件（AI Agent） |
| 変更対象ファイル数 | 2件 |
| 依存関係ファイル数 | 10件（全て影響なし） |
| シグネチャ変更 | なし（7件のインターフェース全て不変を確認） |
| 既存要件との矛盾 | なし（7項目で照合済み） |
| 新規テスト項目 | 11件 |
| リグレッションテスト項目 | 5件 |
| 起因元ドキュメントフォルダ | なし |

### 特に注意が必要な点

1. **クロスプラットフォーム対応**: シェルコマンドは Windows（PowerShell: `Copy-Item`, `New-Item`, `Get-Content`, `Set-Content`, `Remove-Item`）と Linux/Mac（`cp`, `mkdir -p`, `cat`, `printf`, `rm`）で異なる。SKILL.md の記述で両方を正確に併記すること
2. **front-matter 結合のエスケープ**: PowerShell でのバッククォートエスケープ（`` `n ``）と bash での `printf` / ヒアドキュメント方式の違いに注意
3. **skill モード境界の維持**: rules-distribute SKILL.md の書き換え時に、skill:deploy/cleanup モードの記述を一切変更しないよう注意。同一ファイル内に共存するため、意図しない変更の混入リスクがある
4. **ファイル不足判定条件の追加**: delta-design.md で「`.aide/references/` にファイル不足がある」が version 不一致と同列の更新トリガーとして追加されている。Phase 1 版の change-requirements.md では version 不一致のみがトリガーだったが、差分設計でファイル不足も含むように拡張されている点に留意
