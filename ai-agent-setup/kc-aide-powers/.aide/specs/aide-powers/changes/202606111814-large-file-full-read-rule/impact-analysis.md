# 影響範囲分析（差分設計反映・精密版）

> 本ファイルは差分設計（delta-design.md / QA APPROVED 済み）を踏まえて Phase 1 版を再精査した更新版である。Phase 1 版の構成を維持しつつ、シグネチャ変更追跡結果・確認対象（テスト対象相当）・Phase 1 からの変更点を明示する。

## 変更種別
両方（global-rules.md 正本へは新規セクションの「追加」、version.json は version 5→6 の「変更」）

## シグネチャ変更追跡結果

- **結論: シグネチャ変更なし（コード変更なし）。**
- 根拠1（差分設計）: delta-design.md「インターフェース影響サマリ」に「コード変更なし。関数・クラス・API 等のシグネチャ変更は一切ない。実行可能コードへの変更は発生しない」と明記。before→after の変更対象は (a) global-rules.md（正本）への新規セクション追記、(b) version.json の `version` 5→6・`updated` 値更新 の2点のみ。
- 根拠2（全件追跡）: 変更対象を参照する箇所を Grep で全走査した結果、参照は全て Markdown ドキュメント（SKILL.md の手順記述・フェーズスキル前処理での読み込み）および version.json のデータ値比較であり、関数・メソッド・クラスのシグネチャ呼び出し元は存在しない。
  - `version.json`: using-aide-powers 起動時手順が `version`（整数値）を「データとして」比較するのみ。型・引数等のインターフェースではない。値変更（5→6）は配布トリガーとして意図された動作であり、追跡対象の呼び出し元（using-aide-powers / rules-distribute）の挙動は値比較ロジックのまま不変。
  - `global-rules.md`: rules-distribute が「全文をコピー配置」する入力ファイル。セクション追記は全文配布の対象に自動的に含まれ、配布ロジック自体の変更は不要。
- スコープ外への波及: なし（コード・シグネチャが存在しないため、スコープ外の呼び出し元追跡は対象なし）。

## 既存ルールとの矛盾確認

> メタ開発のため user-requirements.md / system-requirements.md は存在しない（dev-environment.md §14）。既存要件との矛盾確認は、既存 global-rules ルール群との矛盾有無で代替する。

| 既存ルール | 新ルールとの関係 | 矛盾 |
|---|---|---|
| ツールマップ参照ルール | 新ルールは `read_file` / `read_code` という Claude Code ツール名で記述される。Kiro 等ではツールマップで読み替える前提であり、本ルールも同じ前提に乗る（ツール名の所在・読み替え方法は変えない） | なし（同前提で整合） |
| スキルの所在ルール | グローバルエリアのファイルも読み取りツールで読める旨のルール。新ルールは「読む際は全行読む」を規定するもので、読む対象範囲を限定・変更しない。両者は補完関係 | なし |
| ファイル書き込みルール（50行超は Write→Append） | 「書き込み」側のルール。新ルールは「読み出し」側のルールであり対象が異なる。むしろ大きいファイルを分割して扱う思想が一貫しており整合的 | なし |
| 配置位置（スキルの所在ルール直後・実行環境ルール前） | 既存セクションの文言・順序は不変。間に新セクションを挿入するのみ。ファイル読み取り運用ルール（ツールマップ参照・スキルの所在・本ルール）が隣接しまとまる | なし |

- 結論: 既存 global-rules ルール群と新ルールの間に矛盾はない。追加のみ（OCP 整合）であり既存ルールの意味を変えない。

## アクター視点の影響

> 本リポジトリはメタ開発であり user-requirements.md は存在しない。ここでのアクター／ユースケースは、aide-powers を利用する AI Agent・全サブエージェント・全フェーズスキル／全工程・フレームワークオーナーへの影響として捉える。

### 影響を受けるユースケース
- 全ワークフロー（企画／設計／実装／設計逆引き／変更／バグ修正／リファクタリング）の各フェーズ実行時のファイル読み出し — 新ルールにより read_file での全行読みが義務化され、大きい SKILL.md・設計書・レポート等を読む際の読み出し挙動が変わる（部分ロード／AST 要約に頼らず分割全行取得）。
- メタ開発のフルレビュー作業（全 FS レビュー等） — 暫定の局所対策（review-{N}-*.md 冒頭の読み出しルール）が恒久・汎用ルールへ格上げされ、req_items 漏れの誤検出・削除済み Step の存在誤認が抑止される。
- 全サブエージェントによる設計書／コード読み込み — design-review / code-review / micro-impl 等が対象ファイルを読む際に全行取得が前提となる。

### 影響を受けるアクター（説明対象アクター）
- **aide-powers を利用する AI Agent（オーケストレータ）** — 大きいファイル読み出し時に全行取得が義務付けられ、要約モード依存の読み落としが禁止される。
- **全サブエージェント** — レビュー・実装時の読み落としによる false positive / false negative が禁止される。
- **全フェーズスキル／全工程** — 前処理で `.aide/references/global-rules.md` を読み「global-rules 重要ポイント」を抽出するため、抽出対象に新ルールが加わる（次回 using-aide-powers 起動時の自動配布で `.aide/references/` が更新されて以降）。
- **フレームワークオーナー（ユーザー）** — 本変更WFでは正本（global-rules.md）追記と version +1 のみを行う。配布（`.aide/references/` 置き換え＋配布先再生成）は version +1 をトリガーに次回 using-aide-powers 起動時の起動時手順が自動実行するため、手動配布操作は不要。

> 操作フロー／新操作が変わるアクターは「全エージェント・全工程」である。本変更はファイル読み出しという全エージェント共通の基本挙動を恒久ルール化するため、特定アクターに限定されず、全アクターの読み出しフローに一律で適用される（適用の有効化は次回 using-aide-powers 起動時の自動配布完了後）。

## プログラム構成視点の影響

> 本リポジトリはメタ開発であり program-structure.md は存在しない。ここでは変更対象の正本ファイル群と、それを参照・配布する仕組み（rules-distribute / using-aide-powers 起動手順 / 配布先ルールファイル）への波及として捉える。対象プラットフォームは Kiro IDE / Kiro CLI のみ（`.aide/ai-agent-platform-targets.md`）。

### 変更対象ファイル（本変更WFのスコープ）
| ファイル | 変更種別 | 変更概要 |
|---|---|---|
| `skills/using-aide-powers/references/global-rules.md` | 追加 | 「大きいファイルを分割して全行読み出すルール」を独立セクション（見出し付き）として新規追記（「スキルの所在ルール」直後・「実行環境ルール」前に挿入） |
| `skills/using-aide-powers/references/version.json` | 変更 | version を 5 → 6 に +1、updated を 2026-06-11 に更新（配布反映のトリガー） |

### 依存関係（変更対象を参照しているファイル）

> 下表のうち「配布チェーン」に属するファイル（`.aide/references/` 一式・`.kiro/steering/` 配置先）は、本変更WFでは手動更新しない。version +1 をトリガーに次回 using-aide-powers 起動時の起動時手順が `.aide/references/` を正本から置き換え、rules-distribute が配布先を再生成する（自動反映）。

| ファイル | 依存内容 | 影響の可能性 |
|---|---|---|
| `skills/using-aide-powers/SKILL.md`（起動時手順2・3） | version.json 比較で `.aide/references/` を正本から置き換え、`.rules-updated` フラグを立てて rules-distribute を起動 | 高 |
| `skills/rules-distribute/SKILL.md` | `.aide/references/global-rules.md` を入力に各プラットフォームのルールファイルへ全文配布（global モード） | 高 |
| `.aide/references/global-rules.md` | 配布の入力コピー。次回 using-aide-powers 起動時に version 比較で正本から置き換えられる（本WFでは手動更新しない） | 高 |
| `.aide/references/version.json` | 正本 version.json と比較される側。一致判定で配布要否が決まり、次回起動時に置き換えられる | 高 |
| `.kiro/steering/aide-powers-global-rules.md` | Kiro 配置先（本プロジェクトの唯一の対象プラットフォーム）。次回起動時の自動配布で rules-distribute が正本から再生成（本WFでは手動更新しない） | 高 |
| 全フェーズスキル `skills/fs-*/SKILL.md`（前処理で global-rules を読む。Grep で fs-reverse-phase4/5/6 等で `.aide/references/global-rules.md` 読み込み＋「global-rules重要ポイント」抽出を確認） | 前処理で `.aide/references/global-rules.md` を読み「global-rules 重要ポイント」を抽出するため、次回起動時の自動配布後は新ルールが抽出対象に加わる | 中 |
| `.aide/ai-agent-platform-targets.md` | rules-distribute が配布対象プラットフォーム（Kiro のみ）を特定する入力 | 低 |

## 確認対象（テスト対象に相当）

> aide-powers は自動テストフレームワークを持たず、動作確認は手動検証で行う（dev-environment.md §7）。本変更はルールドキュメント変更のため、「テスト対象機能」をルール反映の確認方法として以下に定める。
>
> **スコープ区分**: V-001／V-002 は本変更WFで実施・検証する（D-001／D-002 の成果物確認）。V-003〜V-005 は本変更WFでは検証しない。version +1 をトリガーに次回 using-aide-powers 起動時の起動時手順＋rules-distribute による自動配布で反映されるため「本WFスコープ外（次回起動時に自動反映）」と位置づける。

| ID | 確認対象 | 確認方法 | スコープ | 根拠 |
|---|---|---|---|---|
| V-001 | 正本への追記反映 | `skills/using-aide-powers/references/global-rules.md` に「## 大きいファイルを分割して全行読み出すルール」が、スキルの所在ルール直後・実行環境ルール前に独立セクションとして存在し、AC-002〜AC-004 の明文（全行読み／分割取得／要約モード依存禁止／恒久・汎用／false positive・false negative 禁止）を含むこと | 本WFで実施・検証（D-001 成果物確認） | AC-001〜AC-004 |
| V-002 | version 更新 | `skills/using-aide-powers/references/version.json` の `version` が 6、`updated` が更新されていること | 本WFで実施・検証（D-002 成果物確認） | AC-005 |
| V-003 | `.aide/references/` への反映 | 次回 using-aide-powers 起動時の自動配布後、`.aide/references/global-rules.md` に新セクションが反映されていること | 本WFスコープ外（次回起動時に自動反映） | AC-007 |
| V-004 | 配布先への反映 | 次回 using-aide-powers 起動時の自動配布後、`.kiro/steering/aide-powers-global-rules.md`（Kiro 配置先）に新セクションが反映されていること | 本WFスコープ外（次回起動時に自動反映） | AC-006 |
| V-005 | フェーズスキル前処理での取り込み | 任意のフェーズスキル前処理で `.aide/references/global-rules.md` を読んだ際、「global-rules 重要ポイント」抽出の対象に新ルールが含まれうること。V-003 の反映後（＝次回起動以降）に担保される | 本WFスコープ外（次回起動時の自動配布後に有効化） | アクター影響（全工程） |

- 注: V-001/V-002 は本差分設計の before→after 対象であり、本変更WF内で成果物を確認する。V-003/V-004/V-005 は version +1 をトリガーとした次回 using-aide-powers 起動時の起動時手順＋rules-distribute による自動再生成の結果として反映・有効化されるため、本変更WFでは検証しない（配布先の手動編集は禁止）。

## システム要件（非機能）への影響

> メタ開発のため system-requirements.md は存在しない。非機能観点での影響を確認・明記する。

- 性能: ルール適用により大きいファイルを分割して複数回読む場面が増え、読み出し回数・トークン消費は増加しうるが、これは読み落とし防止という品質目的の意図的トレードオフであり、許容範囲。
- セキュリティ／可用性: 影響なし（読み出し挙動の規定のみ。認証・ネットワーク・データ破壊等に関与しない）。
- 保守性／品質: false positive / false negative の抑止により、レビュー・実装の品質が向上する（プラス影響）。
- 結論: 非機能要件への有害な影響はなし。

## Phase 1 からの変更点

- シグネチャ変更追跡を独立節として明示し、「コード変更なし＝シグネチャ変更なし」を Grep 全件追跡の結果（参照は全て Markdown ／ version.json データ値で、コードの呼び出し元なし）とともに確定記載した。
- 既存ルールとの矛盾確認を独立節として追加（ツールマップ参照ルール／スキルの所在ルール／ファイル書き込みルール／配置位置との照合。矛盾なしを確認）。
- 確認対象（テスト対象相当）を V-001〜V-005 として表形式で具体化（受入基準 AC との対応付き）。Phase 1 では「フルレビュー作業」への言及にとどまっていた点を、手動検証の確認手順として精密化した。
- システム要件（非機能）への影響節を追加し、性能トレードオフ・品質向上・有害影響なしを明記した。
- 依存関係の根拠を Grep 確認結果（fs-reverse-phase4/5/6 等での global-rules 読み込み、using-aide-powers の version.json 比較ロジック、rules-distribute の全文配布）に基づき裏付けた。なお Phase 1 が挙げた依存関係・影響度（高／中／低）に漏れ・誤りはなく、評価は妥当と再確認した（「低」評価の `.aide/ai-agent-platform-targets.md` も配布対象特定の入力にとどまり、再評価後も「低」のまま）。
- **配布の位置づけ整合（今回の fix）**: 配布を「本WF内での手動実行」から「version +1 をトリガーに次回 using-aide-powers 起動時の起動時手順が自動実行（`.aide/references/` 置き換え＋配布先再生成）」へ整理し、delta-design.md fix1 と整合させた。これに伴い確認対象を V-001/V-002＝本WFで実施・検証・V-003〜V-005＝本WFスコープ外（次回起動時に自動反映）に区分した。

## 分析時点の注意事項
- 本分析は差分設計（QA APPROVED 済み）反映後の精密版である。
- 配布先のうち Kiro 以外（`.claude/` 等）は対象プラットフォームに含まれないため、本変更による影響はない。
- 正本追記のみでは AI 挙動は変わらない。version +1 をトリガーに次回 using-aide-powers 起動時に `.aide/references/` 置き換え・rules-distribute 配布が自動実行され、その完了をもって反映される（本変更WFでは手動配布しない／REQ-C-002）。

## 起因元ドキュメントフォルダ
- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（`skills/using-aide-powers/references/global-rules.md` を変更した直近コミット c5c0a02「refactor: compliance-checkを本来の役割に絞り軽量化」、853347b「docs: using-aide-powers の SKILL.md と global-rules.md を簡素化」等いずれにも `Docs:` フッターは存在せず、起因元ドキュメントフォルダは特定されない）
