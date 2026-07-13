# 影響範囲分析

## 変更種別
変更（既存の振る舞いを変更）

## アクター視点の影響

> 注: 本リポジトリは user-requirements.md が存在しないメタ開発プロジェクトである（dev-environment.md §14.1）。
> アクター視点分析は program-structure.md の起動フロー・エージェント定義一覧から導出する。

### 影響を受けるユースケース
- UC-001: ワークフロー起動 — ブートストラップ → aide-agent steering 読み込み → using-aide-powers activate の起動連鎖が、ブートストラップ → using-aide-powers 直接 activate に短縮される
- UC-002: セットアップ（setup.bat 実行） — aide-agent.md のコピー処理が不要になる
- UC-003: マルチプラットフォーム起動 — 各プラットフォームのブートストラップファイルで「aide-agent に切り替えて実行」の指示が「using-aide-powers を activate してその指示に従う」に変更される

### 影響を受けるアクター
- AIエージェント（プラットフォームのデフォルト Agent） — オーケストレータ動作の主体が aide-agent から自身に変わる
- aide-powers 利用者（開発者） — setup.bat/sh 実行時の配布物が変わる（aide-agent.md が配布されなくなる）

## プログラム構成視点の影響

### 変更対象ファイル（削除）
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `steering/aide-agent.md` | 削除 | オーケストレータ steering 定義の削除 |
| `agents/aide-agent.md` | 削除 | オーケストレータエージェント定義の削除 |
| `.kiro/steering/aide-agent.md` | 削除 | Kiro IDE 配布先 steering の削除 |
| `.kiro/agents/aide-agent.json` | 削除 | Kiro CLI 用エージェント JSON の削除 |

### 変更対象ファイル（修正）
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `steering/aide-powers-bootstrap.md` | 変更 | aide-agent steering 読み込み指示を削除し、using-aide-powers 直接 activate 指示に修正 |
| `skills/using-aide-powers/SKILL.md` | 変更 | 「エージェント切り替えガード」セクションの削除 |
| `setup.bat` | 変更 | aide-agent.md のコピー処理を削除 |
| `rules/aide-powers-bootstrap.md` | 変更 | 「aide-agent に切り替えて実行」を「using-aide-powers を activate」に修正 |
| `rules/aide-powers-bootstrap.mdc` | 変更 | description および本文の aide-agent 切り替え指示を修正 |
| `instructions/aide-powers-bootstrap.instructions.md` | 変更 | aide-agent 切り替え指示を using-aide-powers activate 指示に修正 |

### 設計ドキュメント更新対象
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` | 変更 | aide-agent 関連記述の削除・更新（エージェント一覧表、フォルダツリー、起動フロー図、「aide-agent が agents/kiro/ に存在しない理由」セクション、配布マッピング表） |

### 依存関係（変更対象を参照しているファイル）
| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `steering/aide-powers-bootstrap.md` | aide-agent steering の読み込み指示 | 高 — 起動フローの直接的な変更 |
| `skills/using-aide-powers/SKILL.md` | aide-agent かどうかの分岐ガード | 高 — ハブスキルの実行フロー変更 |
| `setup.bat` | aide-agent.md のファイルコピー処理 | 中 — インストーラのステップ削除 |
| `rules/aide-powers-bootstrap.md` | aide-agent 切り替え指示（Claude Code） | 高 — プラットフォームブートストラップ |
| `rules/aide-powers-bootstrap.mdc` | aide-agent 切り替え指示（Cursor） | 高 — プラットフォームブートストラップ |
| `instructions/aide-powers-bootstrap.instructions.md` | aide-agent 切り替え指示（Copilot） | 高 — プラットフォームブートストラップ |
| `.aide/specs/aide-powers/program-structure.md` | aide-agent の設計記述（13エージェント一覧、起動フロー、ネスト実行制限の説明） | 中 — ドキュメント整合性 |

### 影響がないことを確認したファイル
- `docs/` — aide-agent への参照なし
- `docs-dev/` — aide-agent への参照なし
- `setup.sh` — aide-agent への参照なし（grep 確認済み。bat のみ対象）
- `GEMINI.md` — aide-agent への参照なし
- `apm.yml` — aide-agent への参照なし
- `cleanup-kiro-agent.*` — aide-agent への参照なし
- `hooks/` — aide-agent への参照なし
- `ubiquitous-language.md` — aide-agent への参照なし
- `cross-chapter-review.md` — aide-agent への参照なし

## 分析時点の注意事項
- `setup.sh` には aide-agent.md のコピー処理が確認されなかった（grep 確認済み）。bat/sh の不整合ではなく、sh 側は元から aide-agent.md コピーを含んでいなかった
- `.kiro/agents/aide-agent.json`（Kiro CLI 用）は .gitignore 対象だがワークスペース内に物理存在する。setup.bat が配置したグローバル領域のファイルとして削除が必要
- `agents/kiro/` には aide-agent 関連ファイルがそもそも存在しない（program-structure.md の設計判断による）

---

## 差分設計ベースの影響再精査

### シグネチャ変更の追跡
差分設計書に明記のとおり「**シグネチャ変更なし**」。スキル/エージェントの外部インターフェースに変更はない。

追跡結果: **追跡不要**（シグネチャ変更が存在しないため）

### Phase 1 分析との差分確認

| 確認項目 | Phase 1 | 差分設計 | 差異 |
|---|---|---|---|
| 削除対象ファイル数 | 2ファイル（steering/aide-agent.md, agents/aide-agent.md） | 4ファイル（+ .kiro/steering/aide-agent.md, .kiro/agents/aide-agent.json） | 差分設計で .kiro/ 配下の配布先2ファイルが明示的に追加された。Phase 1 の「注意事項」に記載済みだった項目が正式に削除対象に昇格 |
| 修正対象ファイル数 | 6ファイル | 6ファイル | 一致 |
| 設計ドキュメント更新 | program-structure.md | program-structure.md | 一致 |
| setup.sh の扱い | 「aide-agent への参照なし（bat のみ対象）」と注意事項に記載 | 記載なし（変更対象外） | 一致（grep 再確認済み: setup.sh に aide-agent 参照なし） |

### 漏れがないことの確認
- grep による全文検索で aide-agent 参照箇所を再確認済み
- 差分設計に記載された全10ファイル（削除4 + 修正6）が、grep 結果の実参照箇所と完全一致
- grep 結果に含まれるがスコープ外のファイル:
  - `.aide/specs/aide-powers/changes/202606162000-remove-aide-agent/` 配下 — 本変更WFの作業成果物であり変更対象外
  - `.aide/specs/aide-powers/program-structure.md` — 設計ドキュメント更新対象として既に含まれている

---

## テスト対象機能

> 注: 本リポジトリにはテストフレームワークが存在しない（配布物の実態は Markdown / bat / bash / JSON の集合体）。
> テストは手動確認項目として記載する。

### 手動確認項目

| # | 確認項目 | 確認方法 | 対応する受入基準 |
|---|---|---|---|
| T-001 | 削除対象4ファイルがワークスペース内に存在しないこと | ファイルの存在確認（ls / dir） | AC-001 |
| T-002 | 修正後の各ブートストラップファイルに `aide-agent` への参照が残っていないこと | grep `aide-agent` で確認 | AC-003 |
| T-003 | 修正後の各ブートストラップファイルが「using-aide-powers スキルを activate」の記述になっていること | ファイル内容の目視確認 | AC-004 |
| T-004 | setup.bat の実行が正常に完了すること（aide-agent.md コピー処理の削除によるエラーなし） | setup.bat 実行 | AC-002 |
| T-005 | Kiro IDE でプロジェクトを開き、ソフトウェア開発要求を出した際に using-aide-powers が activate されること | 実際の操作確認 | AC-004 |
| T-006 | program-structure.md が aide-agent 削除後の実態と一致していること | ドキュメント内容の目視確認 | AC-005, AC-006 |

### テストスキップの根拠
- dev-environment.md §1: 本リポジトリは Python アプリケーションではなく、配布物の実態は Markdown / bat / bash / JSON の集合体
- テストフレームワーク不在: 自動テスト基盤が存在しないため、手動確認で代替
- ユーザー承認済み: テスト skip はメタ開発プロジェクトの性質による制約

---

## 説明対象アクター

| アクター | 説明が必要な理由 | 説明内容 |
|---|---|---|
| AIエージェント（プラットフォームのデフォルト Agent） | 起動フローが変更される。aide-agent steering 読み込みステップが廃止され、直接 using-aide-powers を activate する形になる | ブートストラップファイルの修正により自動的に新フローが適用される。追加の説明ドキュメントは不要（ブートストラップファイル自体が指示書） |
| aide-powers 利用者（開発者） | setup.bat 実行時の配布物が変わる（aide-agent.md が配布されなくなる）。既にグローバル領域に配置されている aide-agent.md / aide-agent.json は残置される可能性がある | setup.bat 再実行で新しい構成がデプロイされる。古い aide-agent.md / aide-agent.json の手動削除が必要になる可能性あり（※setup.bat に削除処理を追加するかは実装タスクで判断） |

### 説明方法
- AIエージェント: ブートストラップファイルの内容変更により自動適用（追加のドキュメント不要）
- 開発者: docs/ の更新は不要（aide-agent は docs/ に記載されていないことを確認済み）。program-structure.md の更新で設計ドキュメントレベルの整合性は担保される

---

## 既存要件との矛盾確認

### 確認対象
本リポジトリはメタ開発プロジェクトであり、通常アプリ向けの user-requirements.md / system-requirements.md は存在しない（dev-environment.md §14.1）。確認対象は以下のとおり:

| 確認対象ドキュメント | 結果 |
|---|---|
| `program-structure.md` | aide-agent をオーケストレータとして定義しているが、本変更により更新される。矛盾は更新により解消される |
| `dev-environment.md` | §14 design-gate 免除が確定済み。本変更に矛盾する記述なし |
| `ubiquitous-language.md` | aide-agent への参照なし。矛盾なし |
| `cross-chapter-review.md` | aide-agent への参照なし。矛盾なし |
| `doc-index.md` | aide-agent への参照なし。矛盾なし |

### 矛盾の有無
**矛盾なし**。program-structure.md は本変更の一部として更新されるため、変更完了後に整合性が担保される。

### システム要件影響
- 本リポジトリには aide-powers 本体の system-requirements.md は存在しない（tray-app-planning サブプロジェクトにはあるが、aide-powers フレームワーク本体のものではない）
- dev-environment.md §14.2 により、design-gate は PASS 相当として扱う
- 結論: **システム要件への影響なし**

---

## 起因元ドキュメントフォルダ
- パス: なし
- コミットハッシュ: なし（関連コミット: `3abffcd1` — steering 移行、`79f48472` — agents/aide-agent.md 新規追加）
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（両コミットとも `Docs:` トレーラーを含まない）

---

## 完了条件自己チェック

| ID | 条件 | 結果 |
|---|---|---|
| C1 | シグネチャ変更全件追跡完了 | ✅ なし＝追跡不要と明記済み |
| C2 | 既存要件矛盾確認完了 | ✅ 矛盾なし（§既存要件との矛盾確認） |
| C3 | システム要件影響確認完了 | ✅ 影響なし（system-requirements.md 不在。dev-environment.md §14 確認済み） |
| C4 | テスト対象機能が特定済み | ✅ 手動確認項目 T-001〜T-006 を定義（§テスト対象機能） |
| C5 | 説明対象アクターが特定済み | ✅ 2アクター特定（§説明対象アクター） |
| C6 | impact-analysis.md が更新済み | ✅ 本ファイル |
