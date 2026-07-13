# 影響範囲分析（差分設計反映版 / QA APPROVED 後の再検討）

> 本プロジェクトは aide-powers フレームワーク自体のメタ開発であり、通常アプリ型の設計書（doc-index.md / user-requirements.md / system-requirements.md / program-structure.md）は存在しない（dev-environment.md §14 確定判断。本再検討時に `file_search` で user-requirements.md 等の不在を再確認済み）。
> そのため本分析は以下の読み替えで実施した（change-impact-reviewer-prompt.md ステップ0/3 のメタ開発読み替え）:
> - 設計根拠の代替: 変更対象スキル群（`coding-test-2review` / `impl-task-planning`）の SKILL.md ＋ 工程チェック表（impl-process-checklist.md）フォーマット定義
> - 既存要件矛盾確認（C2 代替）: 変更対象スキル群および呼び出し元フェーズスキルの既存仕様（特に「1ウェーブ最大6タスク」「依存先全完了タスクのみ実行可」「オーケストレータ代理チェック禁止」）と本変更が矛盾しないことの確認
> - 非機能要件影響確認（C3 代替）: 並列化による所要時間短縮（性能改善）が目的どおりであること、品質ガード（手順逸脱統制）が既存統制と矛盾しないことの確認
> - アクター視点の代替: coding-test-2review SKILL の「呼び出し元（Called by）」「呼び出すサブエージェント」を起点にした波及利用者の整理
>
> **【本版の位置づけ — 差分設計反映版】** 対応方針レビューで「案A の採用」が確定し、その後 **差分設計（delta-design.md ＋分割4ファイル）が QA APPROVED 済み**となった。本版は、Phase1（再分析版）の impact-analysis.md を起点に、確定した差分設計（共通仕様 CF-1〜CF-9・直接変更対象6＋下流フォロワー6・変更不要区分B・非依存区分C）と突合し、(1) 下流フォロワーの「直接変更対象への格上げ」を反映、(2) フォーマット変更（=インターフェース変更）の全参照箇所を grep で再追跡し、**delta-design に未掲載の現役ファイル（追従漏れ候補）を新規検出**して追記した更新版である。

## 確定した設計判断（本再検討の前提）

1. **案A の採用（差分設計で確定）**: 工程チェック表（impl-process-checklist.md）を「1タスク=1行・複数列（工程＝列）」から「**1工程=1行**」構造へ変更する。正準フォーマットは delta-design.md「共通仕様 CF-1〜CF-9」に一元定義された。同一タスクの実装担当・テスト実装担当（および2レビュー担当）が**それぞれ別々の物理行**を更新するため、同一行同時書き込み衝突が**構造的に解消**される。
2. **並列化（REQ-C-001/002）**: 同一タスク内で「実装(implement)∥テスト実装(write_test)」を並列起動、テスト実行(run_test) PASS 後に「設計準拠レビュー(spec_review)∥コード品質レビュー(quality_review)」を並列起動する。run_test は実装＋テスト実装の後（並列対象外）。
3. **品質ガード（REQ-C-003/004）**: 手順逸脱（省略・一括実行・簡易手順・不正確な実行）時の実行前ユーザー承認＋品質低下リスク説明（不具合の混入・コードの設計書からの乖離）を Iron Law ＋ Red Flags ＋新設節に明文化する。
4. **確定制約（歯止め）の堅持**: チェック表の状態更新は「その工程を実施したサブエージェント本人」が証跡として書く。**オーケストレータ（起動元）の代理チェック（done の偽記入）は引き続き禁止**。「起動元集約」案は却下済み。差し戻し（`⬜ todo` へ戻す）のみ起動元のスケジューリング行為として許容（CF-6）。
5. **タスク間並列上限は不変**: 「1ウェーブ最大6タスク」の上限はタスク本数で数える。タスク内工程の同時起動サブエージェント数（実装＋テスト実装＝2／2レビュー＝2）は6タスク上限のカウント対象外（別レイヤー。AC-001-2 と両立）。

## 変更種別

**変更**（既存スキル仕様の記述変更＋工程チェック表のフォーマット定義変更。新規ファイル・新規クラスの追加はなし）

- REQ-C-001 / REQ-C-002: 工程実行順序の仕様変更（逐次 → タスク内工程の並列起動）
- REQ-C-003 / REQ-C-004: Iron Law / Red Flag への統制ルール追記（手順逸脱時の実行前ユーザー承認＋品質低下リスク説明の必須化）
- 案A: 工程チェック表フォーマット定義の変更（1タスク=1行・複数列 → 1工程=1行）。生成側・読み取り側のフォーマット追従が必要

## インターフェース（=工程チェック表フォーマット）変更の全件追跡（Iron Law）

> 本変更で変わる「インターフェース」は関数シグネチャではなく **工程チェック表（impl-process-checklist.md）のフォーマット（データ構造）**である。「1タスク1行・複数列（8列/3列）」→「1工程1行」へ変わるため、生成・読み取り・参照する全箇所を grep で再追跡した。追跡キーワード: `impl-process-checklist` / `工程チェック表` / `全工程 PASS` / `全タスク・全工程` / `テスト実行工程` / `フルサイクル` / `8列` / `3列`。

### A. delta-design がカバー済みの箇所（突合結果 = 設計済み）

#### A-1. 直接変更対象（生成側・読み取り本体・3プロンプト）— delta-design で before→after 設計済み

| ファイル / 箇所 | 役割 | grep 実在確認 | 設計箇所 |
|---|---|---|---|
| skills/impl-task-planning/SKILL.md「工程チェック表の生成（必須）」 | フォーマット定義の本体（生成側） | ✓（L221「フルサイクル（8列）…簡略サイクル（3列）」等） | delta-design-impl-task-planning.md 変更対象1 |
| skills/impl-task-planning/impl-planner-prompt.md ステップ7 ＋「## 出力」節 | 生成手順（生成側） | ✓（L31「列構成・記号」/ L150「フルサイクル8列 / 簡略サイクル3列」） | delta-design-impl-task-planning.md 変更対象2-a/2-b |
| skills/coding-test-2review/SKILL.md | 実行ループ（読み取り本体） | ✓（L22 工程順序厳守 / L57「工程がPASS」等） | delta-design-coding-test-2review-skill.md 変更1〜9＋新設節 |
| skills/coding-test-2review/implementer-prompt.md | micro-impl-agent 用 | ✓（設計内で参照） | delta-design-coding-test-2review-prompts.md 変更対象1 |
| skills/coding-test-2review/spec-reviewer-prompt.md | design-review-agent 用 | ✓（設計内で参照） | delta-design-coding-test-2review-prompts.md 変更対象2 |
| skills/coding-test-2review/code-quality-reviewer-prompt.md | code-review-agent 用 | ✓（設計内で参照） | delta-design-coding-test-2review-prompts.md 変更対象3 |

#### A-2. 下流フォロワー（Phase1版では「直接対象外（追従が必要）」→ 本版では delta-design で直接変更対象へ格上げ済み）

> **Phase1版からの主要な差分。** Phase1版で「読み取り側の波及（影響度 中／低〜中）」として列挙していた下流ファイル群は、差分設計で「生成側・読み取り側はセットで直す」方針に基づき **直接変更対象へ格上げ**され、before→after が delta-design-downstream-followers.md（区分A）に設計済みとなった。

| ファイル / 箇所 | 依存内容（grep 確認済み） | 設計箇所 |
|---|---|---|
| skills/fs-impl-phase4-execution/SKILL.md | 成果物表 L14・完了条件 L109「全タスク・全工程 PASS」・内部挙動注記 | downstream-followers A-1 |
| agents/final-design-audit-agent.md [5-2] | L109-110「フルサイクル（8列）／簡略サイクル（3列）／`[ ] / —`」 | downstream-followers A-2 |
| skills/fs-refactoring-phase5-impl/SKILL.md | 完了条件 L109「全タスク・全工程が PASS」・内部挙動注記 L101 | downstream-followers A-3 |
| skills/fs-refactoring-phase6-doc/SKILL.md Step3 | L137「テスト実行工程の結果で代替」 | downstream-followers A-4 |
| skills/fs-change-phase2-impl/SKILL.md Step10 | 完了条件 L329「全タスク・全工程 PASS」・内部挙動注記 | downstream-followers A-5 |
| skills/fs-bugfix-phase2-impl/SKILL.md Step8 | 完了条件 L285「全タスク・全工程 PASS」・内部挙動注記 | downstream-followers A-6 |

#### A-3. 変更不要（区分B）＋ フォーマット非依存（区分C）— delta-design で判断＋根拠を明記済み（突合 OK）

| ファイル / 箇所 | 区分 | grep 確認 | 根拠（要約） |
|---|---|---|---|
| skills/fs-impl-phase5-final-check/SKILL.md | B-1 | ✓（追記委譲記述のみ） | 追記ロジックは final-design-audit-agent[5-2]（A-2）に委譲。SKILL は非フォーマット依存の委譲記述のみ |
| agents/micro-impl-agent.md | B-2 | ✓（更新手順ハードコードなし） | 更新手順は implementer-prompt.md（CF-5）が渡す |
| agents/design-review-agent.md | B-3 | ✓（同上） | 更新手順は spec-reviewer-prompt.md（CF-5）が渡す |
| agents/code-review-agent.md | B-4 | ✓（同上） | 更新手順は code-quality-reviewer-prompt.md（CF-5）が渡す |
| skills/fs-impl-phase2-preparation/SKILL.md Step3 | B-5 | ✓（生成委譲のみ） | 生成を impl-planner-prompt.md（G2）へ委譲。列構成のハードコードなし |
| skills/fs-change-phase2-impl/SKILL.md タスク計画Step8 ＋ change-task-planner-prompt.md ステップ6 | B-6 | ✓（委譲のみ） | impl-task-planning へ委譲。列構成のハードコードなし（※Step10 は A-5 で対応） |
| skills/fs-bugfix-phase2-impl/SKILL.md タスク計画Step6 ＋ bugfix-task-planner-prompt.md ステップ6 | B-7 | ✓（委譲のみ） | 同上（※Step8 は A-6 で対応） |
| skills/fs-refactoring-phase4-design/SKILL.md Step5 | B-8 | ✓（委譲のみ、存在確認の完了条件） | 「工程チェック表の生成（必須）に従う」と委譲のみ |
| skills/using-aide-powers/references/progress-file-format.md | C | ✓（L198 リンク参照のみ） | impl-process-checklist.md へのリンク参照のみ（表構造の記述なし） |
| agents/test-coverage-audit-agent.md | C | ✓（チェック表非依存） | user-requirements.md × manual-test-plan.md の照合が責務 |
| skills/fs-reverse-phase1-program ／ fs-reverse-phase2-dev-env | C | ✓ | 「不要」と明記のみで生成／呼び出ししない |
| `*-SKILL-old.md`（退避ファイル群） | C | ✓（L128-200 等に旧8列・`[ ]` 記述あり） | 現役スキルではない履歴ファイル。参照されない |

### B. 【新規検出 — Phase1版・delta-design いずれにも未掲載】追従漏れ候補（現役ファイル）★ユーザー報告対象

> インターフェース（フォーマット）変更の全件 grep 追跡により、**delta-design の直接変更対象（A-1/A-2）にも、変更不要判断（区分B）にも、非依存（区分C）にも掲載されていない現役ファイル**で、旧フォーマット（8列/3列・フルサイクル逐次）または旧完了表現（全タスク・全工程 PASS）を記述している箇所を新たに検出した。これらは差分設計の整合単位（操作系スキル/プロンプト/エージェント）から外れた**ドキュメント・設計資料系**であり、delta-design では before→after が設計されていない。後続のタスク分解・実装・doc-sync が追従漏れに気づけるよう、ここに明示し**ユーザー報告対象**とする。
>
> **重要**: これらは runtime（ワークフロー実行）の生成・読み取り経路には乗らないため、本変更の operational な完了判定を破綻させるものではない（＝ delta-design の「整合単位（生成側・読み取り側セット）」の網羅性自体は妥当）。ただし**放置するとフレームワークのドキュメント／ユビキタス言語が実装と乖離**するため、対応要否の判断が必要。

| # | ファイル / 箇所 | 旧フォーマット記述（grep 実在） | 種別 | delta-design 掲載 | 推奨対応（※本エージェントは判断のみ。実装・編集はしない） |
|---|---|---|---|---|---|
| N-1 | .aide/specs/aide-powers/ubiquitous-language.md L137 | 「工程チェック表 \| process checklist \| …**フルサイクル8列または非プログラム成果物用3列**で構成」 | メタ開発の設計資料（ユビキタス言語辞書・現役） | 未掲載 | 案A 後は「1工程=1行」の定義に更新が必要。ユビキタス言語は設計の正本のため、本変更の doc-sync 工程または別途同期で更新を検討 |
| N-2 | docs-dev/02-ai-agent/01-workflows/03-impl.md L86, L22, L72 | 「工程チェック表（**フルサイクル 8 列 / 非プログラム成果物 3 列**）」＋ フルサイクル逐次フロー（実装→設計準拠→品質→テスト作成→テストレビュー→テスト実行） | 開発者向けドキュメント（現役） | 未掲載 | 8列/3列の記述・逐次フロー記述が実装と乖離。並列化＋1工程1行へ追従が望ましい |
| N-3 | docs-dev/02-ai-agent/01-workflows/05-change.md L69, L89 | フルサイクル逐次フロー ＋ 工程チェック表（成果物表） | 開発者向けドキュメント | 未掲載 | 同上 |
| N-4 | docs-dev/02-ai-agent/01-workflows/06-bugfix.md L87 | 「delta-task-list.md / impl-process-checklist.md … 工程チェック表」 | 開発者向けドキュメント | 未掲載 | 成果物記述。逐次/列前提の表現があれば追従検討 |
| N-5 | docs-dev/02-ai-agent/02-phase-skills/impl.md L81-83, L93 | フルサイクル逐次（実装→Stage1a/1b→テスト作成→Stage2a/2b→テスト実行）＋「PROCESS CHECKLIST MUST BE UPDATED AT EACH STEP」 | 開発者向けドキュメント | 未掲載 | 逐次フロー・各ステップ更新の記述が並列化＋1工程1行と乖離 |
| N-6 | docs-dev/02-ai-agent/02-phase-skills/change.md L47-48 | フルサイクル ＋ 工程チェック表（impl-process-checklist.md） | 開発者向けドキュメント | 未掲載 | 同上 |
| N-7 | docs-dev/02-ai-agent/02-phase-skills/bugfix.md L75 | 「delta-task-list.md / impl-process-checklist.md」工程チェック表 | 開発者向けドキュメント | 未掲載 | 成果物記述。追従検討 |
| N-8 | docs-dev/02-ai-agent/03-common-skills/impl.md L90, L100 | パイプライン図「タスク完了 → 工程チェック表更新 → 次のタスク」＋「工程チェック表は名前付きエージェントが更新（代筆禁止）」 | 開発者向けドキュメント | 未掲載 | 逐次パイプライン図の更新が望ましい（代筆禁止原則の記述自体は不変で可） |
| N-9 | docs-dev/02-ai-agent/04-agents/00-overview.md L41-50 | 「工程チェック表の**セル**を埋める」「オーケストレーター自身がセルを埋めること…禁止」 | 開発者向けドキュメント | 未掲載 | 「セル」→「工程行」の用語追従が望ましい（代筆禁止原則は不変で可） |
| N-10 | .aide/prompts/fs-report-style-migration-prompt.md L96 | 「工程チェック表の**全タスク・全工程が PASS**」 | 移行用プロンプト（過去の一括移行作業用・履歴的） | 未掲載 | 一度きりの移行作業用プロンプトで再実行されない見込み。CF-9 表現へ追従するか、履歴扱いで据え置くかをユーザー判断 |

> 補足（ユビキタス言語の関連エントリ）: ubiquitous-language.md には「多段階コードレビュー（multi-stage code review）」「ホワイトリスト3エージェント」等のエントリもある。ホワイトリスト3エージェントの定義は本変更で不変（CF-2/CF-8 で担当対応は維持）。「多段階コードレビュー」は coding-test-2review 以前の別機構の語彙であり本変更の直接対象外だが、辞書整合の観点で N-1 と併せて確認するのが望ましい。

### C. 概念表現（フォーマット非依存）として追従不要と確認した箇所

> grep で「全工程 PASS」等がヒットするが、**チェック表の列/行構造ではなく coding-test-2review の status: DONE の意味（＝全工程が通った状態）を概念的に説明する記述**であり、CF-9（全工程行が ✅done／➖skip）の下でも意味が保たれるため追従不要と確認した。delta-design の A-3/A-5/A-6 が完了条件・内部挙動注記を CF-9 へ整合させることで、これら概念表現とも矛盾しない。

| ファイル / 箇所 | 記述 | 判定 |
|---|---|---|
| skills/fs-refactoring-phase5-impl/SKILL.md 状態判定 L123-126 | 「status: DONE は全工程（リグレッション含む）PASS を意味する」「全パス（status: DONE＝全工程PASS）」 | 概念表現。フォーマット非依存（追従不要） |
| skills/fs-change-phase2-impl/SKILL.md 状態判定 L344-346 | 同種（全工程PASS の意味説明） | 概念表現。フォーマット非依存（追従不要） |
| skills/fs-bugfix-phase2-impl/SKILL.md 状態判定 L304-306 | 同種 | 概念表現。フォーマット非依存（追従不要） |
| skills/fs-impl-phase4-execution/SKILL.md 注記 L173 | 「全サブタスクが全工程 PASS になった時点で…」（親タスク完了チェックの説明） | 概念表現。フォーマット非依存（追従不要） |

## 既存仕様との矛盾確認（C2 代替 — メタ開発読み替え）

> user-requirements.md は存在しないため、変更対象スキル群および呼び出し元フェーズスキルの**既存仕様**と本変更（差分設計確定版）の矛盾有無を確認した。

| 既存仕様（歯止め） | 本変更との関係 | 矛盾の有無 |
|---|---|---|
| 1ウェーブ最大6タスク（タスク間並列上限） | 上限は**タスク本数で数える**ことを Iron Law・Process に明記。タスク内工程の同時起動数（実装＋テスト実装＝2／2レビュー＝2）は上限カウント対象外（別レイヤー） | **矛盾なし**（AC-001-2 を満たす。delta-design-coding-test-2review-skill.md 変更1/変更3） |
| 依存先が全完了したタスクのみ実行可能（タスク間依存原則） | タスク内工程の並列化は「同一タスク内工程」の話であり、タスク間依存原則とは別レイヤー。Process で「タスク間依存原則は不変」と明記 | **矛盾なし** |
| オーケストレータ代理チェック禁止（本人が証跡を書く） | 1工程1行でも「担当本人が自分の工程行を3段階更新」を堅持。起動元の done 偽記入は引き続き禁止。差し戻し（⬜ todo へ戻す）のみ起動元のスケジューリングとして許容（done を偽る行為ではない） | **矛盾なし**（delta-design-coding-test-2review-skill.md 変更8。CF-5/CF-6/CF-8） |
| レビュー FAIL 時の再実行ルール（FAIL 工程を未PASSに戻して再実行） | 1工程1行の行状態遷移（❌/⬜ todo へ戻す）で表現。両レビュー同時 FAIL の差し戻し規則も明文化 | **矛盾なし**（AC-002-3 を満たす。CF-6・変更5） |
| 工程順序厳守（実装→テスト実装→テスト実行→2レビュー） | 「逐次厳守」を「並列起動＋前後依存維持（run_test は実装＋テスト実装後、2レビューはrun_test後）」へ更新。テスト実行の前後依存は維持 | **意図的変更**（REQ-C-001/002。逐次の解除範囲と維持範囲を明示区別しており、依存破壊はなし） |
| 工程チェック表は成果物種別に関わらず必須・省略禁止（pending PENDING-024 由来の歯止め） | 非プログラム成果物も `➖ skip` 行（output に判定理由）で生成し「理由なき簡略化を禁止」を維持（CF-7） | **矛盾なし**（歯止めを構造で維持） |

**結論**: 既存の歯止め（6タスク上限・依存先原則・代理チェック禁止・FAIL 再実行・成果物種別必須）と本変更に矛盾は検出されなかった。工程順序のみ意図的に逐次→並列へ変更しているが、前後依存（実装/テスト → run_test → 2レビュー）は保持されており、品質ゲートの実質は維持される。

## 非機能要件への影響確認（C3 代替 — メタ開発読み替え）

| 観点 | 影響 | 評価 |
|---|---|---|
| 性能（所要時間） | 実装∥テスト実装、2レビュー並列により同一タスク内の所要時間が短縮（REQ-C-001/002 の目的） | **目的どおりの改善**。タスク本数上限6は不変のためタスク間スループットは現状維持 |
| 品質ガード（プロセス統制） | 手順逸脱時の実行前承認＋リスク説明を Iron Law/Red Flags/新設節に追加（REQ-C-003/004） | 既存統制（束ね禁止・依存先原則・代理チェック禁止等）に**上乗せ**する形で、既存統制と矛盾しない |
| 信頼性（同時更新衝突） | 旧フォーマットで並列化すると同一行同時 str_replace 衝突リスクがあったが、1工程1行で**構造的に解消** | 並列化に伴う新規リスクを設計で吸収 |
| 保守性（ドキュメント整合） | docs-dev／ubiquitous-language.md が旧フォーマット記述のまま（B節 N-1〜N-10） | **要対応の懸念**。実装と文書の乖離を生むため、対応要否のユーザー判断が必要 |

## テスト対象機能の特定（メタ開発のため「テスト」＝動作確認試験）

> メタ開発のため自動テストは存在せず、「テスト」＝実際にワークフローを回し、工程チェック表が 1工程1行で生成・更新され、並列化・完了判定・手順逸脱統制が仕様どおり動くかの**動作確認試験**を指す。

### 新規確認対象（直接変更する機能）

| # | 確認対象 | 確認観点 | 関連 AC |
|---|---|---|---|
| T-1 | 工程チェック表の 1工程1行 生成 | impl-task-planning が 5工程行（プログラム）／実工程＋skip行（非プログラム）を行キー `{task_id}::{工程キー}`・初期 `⬜ todo` で生成するか | CF-1/CF-2/CF-7 |
| T-2 | 実装∥テスト実装の並列起動 | 同一タスクで implement と write_test が同時起動され、各 micro-impl-agent が別工程行を3段階更新するか（衝突しないか） | AC-001-1 |
| T-3 | タスク間並列上限との両立 | タスク内工程の同時起動を含めても「1ウェーブ最大6タスク（本数）」が守られるか | AC-001-2 |
| T-4 | 2レビューの並列起動 | run_test PASS 後に spec_review と quality_review が同時起動され、それぞれ別工程行を更新するか。前提（実装・テスト揃い）を満たすか | AC-002-1/AC-002-2 |
| T-5 | レビュー FAIL 再実行（単独/両者同時） | 実装起因→implement行、テスト起因→write_test行へ差し戻し、両レビュー同時FAIL（同一工程は統合fix／混在は両行差し戻し）→ run_test → 2レビュー の再実行連鎖が成立するか | AC-002-3 |
| T-6 | 完了判定（CF-9） | タスク完了＝全工程行が ✅done／➖skip、全体完了＝全タスクの全工程行、親タスク完了＝parent_check 行 ✅done が正しく判定されるか | CF-9 |
| T-7 | 手順逸脱時の実行前承認＋リスク説明 | 省略・一括実行・簡易手順・不正確な実行の前にユーザー承認を取得し、不具合混入・設計書乖離リスクを説明するか（事後報告不可・リスク説明なし承認無効） | AC-003-1〜3/AC-004-1〜3 |
| T-8 | 代理チェック禁止の堅持 | 起動元が done を代理記入しないか。差し戻し（⬜ todo へ戻す）のみ起動元が行えるか | CF-5/CF-6/CF-8 |
| T-9 | final-design-audit-agent の行追記（A-2） | ❌検出時に追記されるタスクが「工程行一式」（行キー・初期 ⬜ todo・非プログラムは skip 行）で追記されるか | CF-1/CF-4/CF-7 |

### リグレッション確認対象（既存挙動が従来どおり完走するか）

| # | 確認対象 | 確認観点 |
|---|---|---|
| R-1 | 実装WF（fs-impl-phase4-execution）完走 | チェック表生成（phase2-preparation）→ 実装ループ（phase4）→ 最終チェック（phase5）が新構造で完走し、完了条件（CF-9）が成立するか |
| R-2 | 変更WF（fs-change-phase2-impl Step10）完走 | 生成委譲（タスク計画Step8）→ 実装ループ（Step10）が新構造で完走するか。task_kind=change の preservation check が維持されるか |
| R-3 | バグ修正WF（fs-bugfix-phase2-impl Step8）完走 | 同上（task_kind=bugfix の preservation check 維持） |
| R-4 | リファクタリングWF（phase4 生成→phase5 実装→phase6 doc）完走 | phase6 のテスト実行結果代替読み取りが `run_test` 工程行（CF-2）から正しく取得できるか。セーフティネット（全体リグレッション）が維持されるか |
| R-5 | 最終チェック（fs-impl-phase5-final-check）完走 | final-design-audit-agent の行追記後、coding-test-2review 経由の追加実装が新構造で回るか |
| R-6 | 非プログラム成果物の扱い | skip 行（output に判定理由）で生成され、「理由なき簡略化禁止」が維持されるか |

## 説明対象アクターの特定

> 本変更で挙動・運用が変わる利用者を特定する。

| アクター | 変わる点 | 説明の要否・内容 |
|---|---|---|
| 各WFのオーケストレータAI（fs-impl-phase4 / fs-change-phase2 / fs-bugfix-phase2 / fs-refactoring-phase5 / fs-impl-phase5-final-check） | 完了判定が「全タスク・全工程 PASS（列）」→「全工程行が ✅done／➖skip（CF-9）」へ。内部挙動注記が並列化＋工程行3段階更新へ。代理チェック禁止は不変、差し戻しのみ可 | **要説明**（新しい完了判定基準・並列化の内部挙動・代理チェック禁止の堅持） |
| micro-impl-agent | 実装とテスト実装が並列起動されうる。自分の工程行（implement／write_test／run_test）を行キーで特定し3段階更新する（process_row_key を受領） | **要説明**（自工程行のみ更新・3段階・並列前提。手順はプロンプト CF-5 が渡す） |
| design-review-agent / code-review-agent | 2レビューが並列起動される独立工程。各々が spec_review／quality_review 行を3段階更新。FAIL 時は output に起因（実装／テスト）を記す | **要説明**（並列前提・自工程行更新・FAIL 起因の記載） |
| final-design-audit-agent | ❌検出時の追記が「8列/3列」→「工程行一式（CF-1/CF-7）」へ | **要説明**（行追記フォーマットの変更） |
| フレームワーク利用者（人間） | 手順逸脱時に実行前承認とリスク説明を求められる。事後報告での逸脱は不可 | **要説明**（承認インタラクションが新規発生しうること、その意義） |
| 開発者（docs-dev 読者） | 並列化・1工程1行へ変わるが、docs-dev／ubiquitous-language.md が未追従（B節 N-1〜N-10） | **要判断**（文書同期の要否。乖離したままだと誤解を招く） |

## 分析時点の注意事項・懸念

- **最大の懸念（★ユーザー報告）**: B節 N-1〜N-10 のとおり、delta-design に未掲載の現役ファイル（ubiquitous-language.md／docs-dev 8件／移行プロンプト）に旧フォーマット記述が残存する。これらは runtime 経路には乗らないため operational な完了判定は破綻しないが、放置するとフレームワーク文書・ユビキタス言語が実装と乖離する。本変更のスコープ（操作系スキル/プロンプト/エージェント）に含めるか、別途 doc-sync／別変更／pending-issue で扱うかの**ユーザー判断が必要**。
- 本エージェントの担当は影響範囲再検討（impact-analysis.md 更新）のみであり、delta-design.md の before→after・approach.md の方針・タスク分解・実装コードには一切踏み込んでいない（B節の追従漏れ候補も「検出・記録・報告」に留め、設計修正はしていない）。
- 区分B（変更不要）と区分C（非依存）は delta-design の判断と突合し、grep 実在確認の上で妥当と確認した。

## 起因元ドキュメントフォルダ

- パス: なし（Docs: フッターなし — Phase1版から変更なし）
- コミットハッシュ（Phase1版を踏襲）:
  - coding-test-2review SKILL.md（並列・統制・衝突回避の主要箇所）: `a5938054`
  - 工程チェック表フォーマット定義（impl-task-planning SKILL.md「工程チェック表の生成（必須）」）: `53221eb` 導入、`1c757bd4` で「状態 / 実行エージェント名」形式へ改訂
- 検証結果: **Docs: フッターなし**。起因元ドキュメントフォルダは特定できない。

---

## 完了条件自己チェック（C1〜C7）

| # | チェック項目 | 結果 | 備考 |
|---|---|---|---|
| C1 | シグネチャ（=フォーマット）変更全件追跡完了 | ✅ PASS | `impl-process-checklist` / `工程チェック表` / `全工程 PASS` / `全タスク・全工程` / `テスト実行工程` / `フルサイクル` / `8列` / `3列` を横断 grep。メイン＋全分割の変更項目と突合し、A節（カバー済）・B節（新規検出の追従漏れ候補 N-1〜N-10）・C節（概念表現で非依存）に分類記載 |
| C2 | 既存要件矛盾確認完了 | ✅ PASS（メタ開発読み替え） | user-requirements.md 不在を確認。既存歯止め（6タスク上限・依存先原則・代理チェック禁止・FAIL再実行・成果物種別必須）と矛盾なしを明記。工程順序のみ意図的変更（前後依存は維持） |
| C3 | システム要件影響確認完了 | ✅ PASS（メタ開発読み替え） | system-requirements.md 不在を確認。性能（改善）・品質ガード（上乗せで矛盾なし）・信頼性（衝突の構造的解消）・保守性（文書乖離の懸念）を明記 |
| C4 | テスト対象機能が特定済み | ✅ PASS | 新規確認 T-1〜T-9、リグレッション確認 R-1〜R-6 を記載 |
| C5 | 説明対象アクターが特定済み | ✅ PASS | オーケストレータAI／3サブエージェント／final-design-audit-agent／人間利用者／開発者 を特定 |
| C6 | impact-analysis.md が更新済み | ✅ PASS | 本ファイルを Write／Append で再作成 |
| C7 | 分割ファイル全 Read 完了 | ✅ PASS | delta-design.md ＋ 分割4ファイル（impl-task-planning / coding-test-2review-skill / coding-test-2review-prompts / downstream-followers）を全 Read |
