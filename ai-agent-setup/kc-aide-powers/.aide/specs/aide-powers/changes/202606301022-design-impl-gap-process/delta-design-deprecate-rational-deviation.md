# 差分設計書（分割）— 合理的乖離概念の廃止と乖離種別判定への移行

## 変更概要

「合理的乖離」概念を完全に廃止し、「設計漏れ / 実装誤り」の二択判定に移行する。
本ファイルは影響を受ける全18ファイルの before→after 差分設計を記載する。

### 変更理由（全ファイル共通）

設計と実装が異なることに「合理的」な乖離はない。差分は「設計漏れ（実装が正しく設計書が未反映）」か「実装誤り（設計書が正しく実装が未準拠）」のどちらかである。判定フローを二択に簡素化し、曖昧な「承認」による乖離放置を排除する。

### 対応要件

REQ-C-004（新規追加）: 合理的乖離概念の廃止と乖離種別判定への移行

---

## 1. `skills/multi-stage-code-review/SKILL.md`

### 変更箇所: Review Result Handling セクション

**before:**
```markdown
1. **FAIL があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
   修正は `agents/micro-impl-agent`（aide-powers agent）に委譲する。
   プロンプトテンプレート: `implementer-prompt.md`（レビュー指摘内容をそのまま転記して渡す）
2. **合理的乖離（要承認）があるか？** → YES: ユーザーに理由を提示 → 承認されたら設計書を同期更新
3. **WARNING があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
```

**after:**
```markdown
1. **FAIL（明らかな実装誤り）があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
   修正は `agents/micro-impl-agent`（aide-powers agent）に委譲する。
   プロンプトテンプレート: `implementer-prompt.md`（レビュー指摘内容をそのまま転記して渡す）
2. **FAIL_PENDING（種別未確定の差分）があるか？** → YES: 工程チェック表に記録し保留。実装完了 or 依存ブロック後にユーザーと種別確定する
3. **WARNING があるか？** → YES: 実装者に修正を指示 → 修正後、再レビュー
```

### 変更箇所: 「重要」注記

**before:**
```markdown
**重要**: 合理的乖離を「実質PASS」として扱い、設計書修正をスキップしてはならない。
```

**after:**
```markdown
**重要**: 設計漏れ（FAIL_PENDING→種別確定後）検出時の設計書更新をスキップしてはならない。設計書と実装の同期は即座に実行する。
```

### 変更箇所: Red Flags テーブル

**before:**
```markdown
| 「合理的乖離だから実質PASSだ」と判断した | STOP。合理的乖離でも設計書の同期更新は必須。スキップしてはならない |
```

**after:**
```markdown
| 「設計漏れだが軽微だから設計書更新は後回しでいい」と判断した | STOP。設計漏れ確定後の設計書更新は即座に実行する。後回しは乖離の蓄積を招く |
```

### 変更箇所: Common Rationalizations テーブル

**before:**
```markdown
| 「合理的乖離を承認したから設計書更新は後でいい」 | 設計書と実装の乖離は即座に同期する。「後で」は忘却と品質劣化の始まり |
```

**after:**
```markdown
| 「設計漏れを検出したが設計書更新は後でいい」 | 設計書と実装の乖離は即座に同期する。「後で」は忘却と品質劣化の始まり |
```

### 変更箇所: Integration セクション

**before:**
```markdown
**Required workflow skills:**
- design-sync (aide-powers skill)（合理的乖離が承認された場合、設計書の同期更新に使用）
```

**after:**
```markdown
**Required workflow skills:**
- design-sync (aide-powers skill)（設計漏れ（FAIL_PENDING→種別確定後）、設計書の同期更新に使用）
```

**before:**
```markdown
**Calls:**
- design-sync (aide-powers skill)（合理的乖離の設計書同期時）
```

**after:**
```markdown
**Calls:**
- design-sync (aide-powers skill)（設計漏れ（FAIL_PENDING→種別確定後）の設計書同期）
```

---

## 2. `skills/coding-test-2review/SKILL.md`

### 変更箇所: 設計準拠レビュー工程の FAIL 判定

**before:**
```markdown
- FAIL の場合: 指摘内容に従い、当該タスクの「実装」工程行（テストに起因する指摘なら「テスト実装」工程行）を `⬜ todo`（未PASS）に戻して再実行対象とする。合理的乖離が承認された場合は `design-sync (aide-powers skill)` で設計書を同期し PASS とする
```

**after:**
```markdown
- FAIL の場合（明らかな実装誤り）: 従来通り、指摘内容に従い当該タスクの「実装」工程行（テストに起因する指摘なら「テスト実装」工程行）を `⬜ todo`（未PASS）に戻して再実行対象とする
- FAIL_PENDING の場合（種別未確定の差分）: 乖離種別を即時確定せず、FAIL_PENDING 保留状態とする
  - FAIL_PENDING 詳細（差分内容）を工程チェック表の当該タスク備考欄に記録する
  - 当該タスクは FAIL_PENDING 保留状態のまま、他の実行可能タスクの処理を続行する
  - 乖離種別確定トリガー（以下のいずれか早い方）:
    - 全タスクの実装が完了した時点
    - FAIL_PENDING 保留タスクへの依存により後続タスクが実行不可能になった時点
  - トリガー到達後、蓄積された FAIL_PENDING 差分を 1件ずつユーザーに提示し種別を確定する:
    - 実装誤りと確定: 当該タスクの「実装」工程行を `⬜ todo` に戻して fix→再レビュー
    - 設計漏れと確定: `design-sync (aide-powers skill)` で設計書を更新（fix モード）→ 再レビュー
```

### 変更箇所: Integration セクション - Calls

**before:**
```markdown
- `design-sync (aide-powers skill)` — 設計準拠レビューで合理的乖離が承認された場合の設計書同期
```

**after:**
```markdown
- `design-sync (aide-powers skill)` — 設計準拠レビューで設計漏れ（FAIL_PENDING→種別確定後）を検出した場合の設計書同期
```

---

## 3. `skills/coding-test-2review/spec-reviewer-prompt.md`

### 変更箇所: mode: combined の「合理的乖離の許容ルール」セクション

**before:**
```markdown
## 合理的乖離の許容ルール
差分に合理的理由がありユーザーに説明でき設計書を同期更新する場合は許容。種別「合理的乖離（要承認）」として報告。
```

**after:**
```markdown
## 乖離種別判定ルール
差分を検出した場合、以下の二択で判定する:
- **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
- **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新
importルール違反は設計漏れ判定の対象外（常に FAIL_IMPL として実装修正が必要）。
```

### 変更箇所: mode: combined の判定/報告フォーマット

**before:**
```markdown
- 差分・未カバーの詳細（FAILの場合）/ 合理的乖離（該当時）/ サマリ
- 実装の差分・テストの未カバー・preservation check 違反が合計0件 → PASS、1件以上 → FAIL
```

**after:**
```markdown
- 差分・未カバーの詳細（FAILの場合。各差分に FAIL_IMPL / FAIL_DESIGN を付記）/ サマリ
- 実装の差分・テストの未カバー・preservation check 違反が合計0件 → PASS、1件以上 → FAIL_IMPL または FAIL_DESIGN
```

### 変更箇所: mode: implementation の「合理的乖離の許容ルール」セクション

**before:**
```markdown
## 合理的乖離の許容ルール
差分に合理的理由がありユーザーに説明でき設計書を同期更新する場合は許容。種別「合理的乖離（要承認）」として報告。
```

**after:**
```markdown
## 乖離種別判定ルール
差分を検出した場合、以下の二択で判定する:
- **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
- **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新
importルール違反は設計漏れ判定の対象外（常に FAIL_IMPL として実装修正が必要）。
```

---

## 4. `skills/design-sync/SKILL.md`

### 変更箇所: Phase 2 タイトルと内容

**before:**
```markdown
### Phase 2: 合理的乖離の判定

乖離に合理的理由があるかを判定する。

```
乖離検出 → 合理的理由あり？
  ├─ No  → 実装を設計に合わせて修正（通常のFAIL対応）
  └─ Yes → Phase 3 へ（ユーザー承認フロー）
```

**合理的理由の例**:
- 実装上の制約（言語仕様、フレームワーク制約）
- ライブラリAPIの実態（設計時の想定と異なるAPI仕様）
- パフォーマンス上の理由
- 可読性・保守性の向上

**合理的乖離の対象外**（必ず設計通りに実装）:
- バリデーション条件と例外送出
```

**after:**
```markdown
### Phase 2: 乖離種別の判定

乖離が「設計漏れ」か「実装誤り」かを判定する。

```
乖離検出 → 乖離種別の判定
  ├─ 実装誤り（FAIL_IMPL）: 設計書が正しく、実装が設計に準拠していない
  │   → 実装を設計に合わせて修正（fix→再レビュー）
  └─ 設計漏れ（FAIL_PENDING→種別確定後）: 実装が正しく、設計書が実態を反映していない
      → Phase 3 へ（設計書更新フロー）
```

**判定基準**:
- 設計書の定義が技術的に正しく実装可能 → FAIL_IMPL（実装を修正）
- 実装上の制約・ライブラリAPIの実態・パフォーマンス要件により設計書の定義が不適切 → FAIL_DESIGN（設計書を修正）

**設計漏れ判定の対象外**（常に FAIL_IMPL = 実装修正が必要）:
- バリデーション条件と例外送出
- importルール違反
```

### 変更箇所: Phase 3 タイトル

**before:**
```markdown
### Phase 3: 修正案の作成とユーザー承認
```

**after:**
```markdown
### Phase 3: 設計書修正案の作成と適用
```

注: Phase 3 の内容（修正案の作成、影響範囲の列挙、ユーザーへの提示と承認）は維持する。「合理的乖離の承認」ではなく「設計漏れに対する設計書修正の承認」として位置づけが変わるのみ。

### 変更箇所: Rational Deviation Rules セクション全体を廃止

**before:**
```markdown
## Rational Deviation Rules（合理的乖離の判定基準）

### 許容条件（3つ全てを満たすこと）

1. **合理的な理由がある**: 実装上の制約、ライブラリAPIの実態、パフォーマンス、可読性向上など
2. **ユーザーに説明できる**: 差分レポートに「なぜ設計と異なるか」「なぜこちらが良いか」を明記する
3. **設計書を同期更新する**: 許容された変更は設計同期プロセス経由で設計書に反映する

### 判定フロー

```
差分検出 → 合理的理由あり？
  ├─ No  → FAIL（設計通りに修正を指示）
  └─ Yes → ユーザーに理由を提示
             ├─ ユーザー承認 → PASS（設計書を更新）
             └─ ユーザー却下 → FAIL（設計通りに修正を指示）
```

### 合理的乖離の対象外

- バリデーション条件と例外送出は厳密に一致させる（合理的乖離ルールの対象外）
```

**after:**
（セクション全体を削除。判定フローは Phase 2「乖離種別の判定」に統合済み）

### 変更箇所: Red Flags テーブル

**before:**
```markdown
| 1 | 「合理的乖離だから実質PASSだ。設計書は後で直せばいい」 | 合理的乖離でも設計書更新は必須。今すぐ設計同期を実行する |
```

**after:**
```markdown
| 1 | 「設計漏れだが軽微だから設計書更新は後でいい」 | 設計漏れ検出時の設計書更新は即座に実行する。乖離を放置しない |
```

### 変更箇所: Common Rationalizations テーブル

**before:**
```markdown
| 「合理的乖離は承認すれば終わり」 | 承認は第一歩。設計書の同期更新まで完了して初めて終わり |
```

**after:**
```markdown
| 「設計漏れを検出すれば終わり」 | 検出は第一歩。設計書の同期更新まで完了して初めて終わり |
```

---

## 5. `skills/import-review/SKILL.md`

### 変更箇所: Overview の「重要」注記

**before:**
```markdown
**重要:** importルール違反は**合理的乖離ルールの対象外**である。設計準拠レビュー（クラス定義・シグネチャ等）の差分には合理的乖離が適用されるが、importルール違反はアーキテクチャの根幹に関わるため、常に修正が必要。
```

**after:**
```markdown
**重要:** importルール違反は**設計漏れ判定の対象外**である。設計準拠レビュー（クラス定義・シグネチャ等）の差分には乖離種別判定（FAIL_IMPL / FAIL_DESIGN）が適用されるが、importルール違反はアーキテクチャの根幹に関わるため、常に FAIL_IMPL（実装修正が必要）として扱う。
```

### 変更箇所: Red Flags テーブル

**before:**
```markdown
| 「合理的乖離として承認してもらえばいい」 | importルール違反は合理的乖離ルールの対象外。アーキテクチャの根幹は乖離を認めない |
```

**after:**
```markdown
| 「設計漏れとして設計書を修正すればいい」 | importルール違反は設計漏れ判定の対象外。アーキテクチャの根幹は常に実装修正（FAIL_IMPL）が必要 |
```

---

## 6. `skills/fs-impl-phase4-execution/SKILL.md`

### 変更箇所: Step 1 coding-test-2review 説明文

**before:**
```markdown
⟨略⟩todo）に戻して fix→再レビューが PASS まで回る。成果物種別（プログラム / 非プログラム）の判定と簡略サイクル（非プログラムは ➖ skip 行）、合理的乖離検出時の design-sync も coding-test-2review 内部で実行される。
```

**after:**
```markdown
⟨略⟩todo）に戻して fix→再レビューが PASS まで回る。成果物種別（プログラム / 非プログラム）の判定と簡略サイクル（非プログラムは ➖ skip 行）、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も coding-test-2review 内部で実行される。
```

### 変更箇所: Integration セクション

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
```

---

## 7. `skills/fs-impl-phase4-execution/spec-reviewer-prompt.md`

注: fs-impl-phase4-execution ディレクトリに spec-reviewer-prompt.md が存在する場合。存在しない場合は coding-test-2review/spec-reviewer-prompt.md が共用されるため、本項目は #3 の変更で包含される。

変更内容は #3（`skills/coding-test-2review/spec-reviewer-prompt.md`）と同一パターン:
- 「合理的乖離の許容ルール」→「乖離種別判定ルール」
- 種別「合理的乖離（要承認）」→ FAIL_IMPL / FAIL_DESIGN の二択判定

---

## 8. `skills/fs-impl-phase5-final-check/SKILL.md`

### 変更箇所: Integration セクション

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（❌項目の追加実装。内部で実装→テスト→テスト実行→2段階レビュー→設計同期を完結）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（❌項目の追加実装。内部で実装→テスト→テスト実行→2段階レビュー→設計漏れ時の設計同期を完結）
```

**before:**
```markdown
- `design-review-agent (aide-powers agent)` — Step 1 の追加実装サイクル内設計準拠レビュー（すべて coding-test-2review 経由。本スキルから直接呼び出さない。最終監査の横断照合は final-design-audit-agent が担う）
```

**after:**
```markdown
- `design-review-agent (aide-powers agent)` — Step 1 の追加実装サイクル内設計準拠レビュー（すべて coding-test-2review 経由。本スキルから直接呼び出さない。乖離種別判定（FAIL_IMPL / FAIL_DESIGN）を担う。最終監査の横断照合は final-design-audit-agent が担う）
```

### 変更箇所: 呼び出す共通スキル セクション — coding-test-2review 行

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（追加実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（追加実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
```

---

## 9. `skills/fs-change-phase2-impl/SKILL.md`

### 変更箇所: coding-test-2review 説明文

**before:**
```markdown
レビュー FAIL は内部で fix→再レビューが PASS まで回り、合理的乖離検出時の design-sync も内部で実行される。
```

**after:**
```markdown
レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。
```

### 変更箇所: Integration セクション

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 10（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 10（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
```

---

## 10. `skills/fs-bugfix-phase2-impl/SKILL.md`

### 変更箇所: coding-test-2review 説明文

**before:**
```markdown
レビュー FAIL は内部で fix→再レビューが PASS まで回り、合理的乖離検出時の design-sync も内部で実行される。
```

**after:**
```markdown
レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される。
```

### 変更箇所: Integration セクション

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 8（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 8（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
```

---

## 11. `skills/fs-refactoring-phase5-impl/SKILL.md`

### 変更箇所: coding-test-2review 説明文

**before:**
```markdown
- レビュー FAIL は内部で fix→再レビューが PASS まで回り、合理的乖離検出時の design-sync も内部で実行される
```

**after:**
```markdown
- レビュー FAIL は内部で fix→再レビューが PASS まで回り、設計漏れ（FAIL_PENDING→種別確定後）の design-sync も内部で実行される
```

### 変更箇所: Integration セクション

**before:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）
```

**after:**
```markdown
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で設計漏れ（FAIL_PENDING→種別確定後）に実行される）
```

---

## 12. `skills/fs-refactoring-phase5-impl/spec-reviewer-prompt.md`

### 変更箇所: 合理的乖離の判定セクション

**before:**
```markdown
    ### 合理的乖離の判定
    差分が検出された場合、以下の条件を全て満たせば「合理的乖離（要承認）」として報告:
    1. 合理的な理由がある
    2. ユーザーに説明できる
```

**after:**
```markdown
    ### 乖離種別の判定
    差分が検出された場合、以下の二択で判定する:
    - **FAIL_IMPL（実装誤り）**: 設計書が正しく、実装が設計に準拠していない → fix で実装を修正
    - **FAIL_DESIGN（設計漏れ）**: 実装が正しく、設計書が実態を反映していない → design-sync で設計書を更新
```

### 変更箇所: 判定/報告フォーマット

**before:**
```markdown
    - 合理的乖離一覧（該当する場合）
```

**after:**
```markdown
    - 乖離種別一覧（FAIL_DESIGN 該当がある場合）
```

---

## 13. `agents/design-review-agent.md`

### 変更箇所: 担当リスト

**before:**
```markdown
- 合理的乖離の判定とユーザーへの承認依頼
```

**after:**
```markdown
- 乖離種別の判定（設計漏れ / 実装誤り）
```

### 変更箇所: importルール違反の注記

**before:**
```markdown
- importルール違反は**合理的乖離ルールの対象外**（常に修正が必要）
```

**after:**
```markdown
- importルール違反は**設計漏れ判定の対象外**（常に FAIL_IMPL = 実装修正が必要）
```

### 変更箇所: ステップ5 全体

**before:**
```markdown
### ステップ5: 合理的乖離の判定

設計との差分が検出された場合、合理的な理由があるかを判定する:

1. **合理的理由の有無を確認**: 実装上の制約、ライブラリAPIの実態、パフォーマンス、可読性向上など
2. **合理的理由がない場合** → FAIL（設計通りに修正を指示）
3. **合理的理由がある場合** → ユーザーに理由を提示し承認を求める
   - ユーザー承認 → PASS（`aide-powers:design-sync` スキルに設計書更新を依頼する旨を報告）
   - ユーザー却下 → FAIL（設計通りに修正を指示）
```

**after:**
```markdown
### ステップ5: 乖離種別の判定（実装誤り / 種別未確定）

設計との差分が検出された場合、乖離種別を判定する:

1. **設計書の定義が技術的に正しく実装可能か確認する**
2. **明らかな実装誤り（FAIL）**: 設計書の定義が正しく実装可能で、実装が設計に準拠していない → FAIL（設計通りに修正を指示）
3. **種別未確定（FAIL_PENDING）**: 実装上の制約・ライブラリAPIの実態等により設計書の定義が不適切な可能性がある → FAIL_PENDING（差分詳細を報告。種別確定は coding-test-2review の乖離種別確定フローでユーザーと行う）

注: バリデーション条件と例外送出、importルール違反は常に FAIL（明らかな実装誤り）。
```

### 変更箇所: 出力 - 種別の説明

**before:**
```markdown
- **合理的乖離（要承認）**: 設計との差分に合理的理由がある場合。ユーザーに理由を提示して承認を求める
```

**after:**
（この種別を削除）

### 変更箇所: 出力 - 「合理的乖離の詳細」テーブル

**before:**
```markdown
### 合理的乖離の詳細（該当がある場合）

| # | 乖離内容 | 理由 | 推奨 |
|---|---|---|---|
| 1 | （例）`provider` 引数の追加 | ライブラリAPIが実際にはprovider指定を要求するため | 承認 → 設計書更新 |
```

**after:**
```markdown
### 種別未確定差分（FAIL_PENDING）の詳細（該当がある場合）

| # | 乖離内容 | 未確定の理由 | 候補 |
|---|---|---|---|
| 1 | （例）`provider` 引数の追加 | ライブラリAPIが実際にはprovider指定を要求する可能性 | 設計漏れ（設計書更新）/ 実装誤り（修正） |
```

### 変更箇所: サマリ判定文

**before:**
```markdown
差分が0件の場合は PASS、1件以上の場合は FAIL とする。
合理的乖離がユーザーに承認された場合は PASS とし、`aide-powers:design-sync` スキルに設計書更新を依頼する。
```

**after:**
```markdown
差分が0件の場合は PASS とする。
差分が1件以上の場合、各差分を FAIL（明らかな実装誤り）または FAIL_PENDING（種別未確定）に分類する。
FAIL_PENDING の場合は差分詳細を報告し、coding-test-2review の乖離種別確定フローに委ねる。
```

### 変更箇所: FAIL時の出力

**before:**
```markdown
**FAIL時の出力（差分1件以上の場合）:**
従来通り全詳細（差分一覧テーブル、合理的乖離詳細、サマリ）を出力する。
```

**after:**
```markdown
**FAIL/FAIL_PENDING時の出力（差分1件以上の場合）:**
全詳細（差分一覧テーブル（各差分に FAIL / FAIL_PENDING を付記）、FAIL_PENDING 詳細（該当時）、サマリ）を出力する。
```

### 変更箇所: 行動規範

**before:**
```markdown
5. **判定は差分が1件でもあれば FAIL とする。** ただし合理的乖離がユーザーに承認された場合は除く
```

**after:**
```markdown
5. **判定は差分が1件でもあれば FAIL（明らかな実装誤り）または FAIL_PENDING（種別未確定）とする。** 差分0件のみ PASS
```

**before:**
```markdown
7. **合理的乖離を検出した場合は、理由を明記してユーザーに承認を求める。** 承認された場合は `aide-powers:design-sync` スキルに設計書更新を依頼する旨を報告する
8. **バリデーション条件と例外送出は厳密に一致させる。** 合理的乖離ルールの対象外とする
```

**after:**
```markdown
7. **種別未確定の差分（FAIL_PENDING）を検出した場合は、差分詳細を明記し報告する。** 種別確定は coding-test-2review の乖離種別確定フローでユーザーと行う。設計漏れと確定された場合は `aide-powers:design-sync` スキルに設計書更新を依頼する。
8. **バリデーション条件と例外送出は厳密に一致させる。** 設計漏れ判定の対象外（常に FAIL = 即 fix）とする
```

---

## 14. `agents/kiro/design-review-agent.md`

変更内容は #13（`agents/design-review-agent.md`）と完全に同一。同じ before→after パターンを適用する。

---

## 15. `agents/kiro/prompts/design-review-agent-prompt.md`

変更内容は #13（`agents/design-review-agent.md`）と完全に同一。同じ before→after パターンを適用する。

---

## 16. `docs-dev/02-ai-agent/04-agents/implementation-agents.md`

### 変更箇所: design-review-agent 判定種別

**before:**
```markdown
| `PASS` | 差分 0 件、または合理的乖離がユーザーに承認された |
| `FAIL` | 差分 1 件以上で承認なし |

差分の種別: ロジック未修正 / 対策未反映 / 過去不具合修正の喪失 / 合理的乖離（要承認）/
クラス欠落 / メソッド欠落 / シグネチャ不一致 / 不変条件欠落 / 処理フロー逸脱 / 未定義の追加。
```

**after:**
```markdown
| `PASS` | 差分 0 件 |
| `FAIL` | 差分 1 件以上（種別未確定。明らかな実装誤りは即 fix 指示） |

差分の種別: ロジック未修正 / 対策未反映 / 過去不具合修正の喪失 /
クラス欠落 / メソッド欠落 / シグネチャ不一致 / 不変条件欠落 / 処理フロー逸脱 / 未定義の追加。
乖離種別（実装誤り / 設計漏れ）の確定は、実装完了または依存ブロック時にユーザーと行う。
```

### 変更箇所: 合理的乖離関連記述

**before:**
```markdown
合理的乖離が承認された場合は `design-sync` 共通スキルに設計書更新を依頼する旨を報告する。
```

**after:**
```markdown
設計漏れと確定された場合は `design-sync` 共通スキルに設計書更新を依頼する。
```

### 変更箇所: 行動規範

**before:**
```markdown
5. 判定は差分が 1 件でもあれば FAIL（合理的乖離が承認された場合を除く）。
```

**after:**
```markdown
5. 判定は差分が 1 件でもあれば FAIL。種別確定はレビュー中に行わない。
```

---

## 17. `docs-dev/02-ai-agent/03-common-skills/impl.md`

### 変更箇所: import-review 記述

**before:**
```markdown
import ルール違反は **合理的乖離ルールの対象外**（常に修正必要）。
```

**after:**
```markdown
import ルール違反は **設計漏れ判定の対象外**（常に実装修正が必要）。
```

### 変更箇所: Iron Law

**before:**
```markdown
- import ルール違反を「合理的乖離」として承認してはならない。
```

**after:**
```markdown
- import ルール違反を「設計漏れ」として設計書修正で回避してはならない。常に実装を修正する。
```

---

## 18. `docs-dev/02-ai-agent/03-common-skills/infrastructure.md`

### 変更箇所: design-sync 呼び出し元

**before:**
```markdown
### 呼び出し元

- 多段階コードレビューで合理的乖離が承認された場合
- `design-review-agent` が「設計書側を更新する必要がある」と報告した場合
```

**after:**
```markdown
### 呼び出し元

- coding-test-2review の乖離種別確定フローで「設計漏れ」と確定された場合
- `design-review-agent` が「設計書側を更新する必要がある」と報告した場合（種別確定後に起動）
```

---

## 要件トレーサビリティ

| 要件ID | 対応する設計箇所 |
|---|---|
| REQ-C-004 | 本ファイル全体（合理的乖離概念の廃止と乖離種別判定への移行） |
| AC-004-1 | 全18ファイルの「合理的乖離（要承認）」→ 乖離種別判定への変更 |
| AC-004-2 | design-sync の Phase 2「合理的乖離の判定」→「乖離種別の判定」への変更 |
| AC-004-3 | Rational Deviation Rules セクションの廃止 |
| AC-004-4 | PASS_WITH_DEVIATION ステータスの廃止 |
| AC-004-5 | import-review の「合理的乖離ルールの対象外」→「設計漏れ判定の対象外（常に FAIL_IMPL）」への変更 |
| AC-004-6 | レビュー中の即時ユーザー承認フロー廃止。種別確定を実装完了/停止後に遅延 |
| AC-004-7 | design-review-agent からユーザー対話機能を削除（FAIL報告のみに簡素化） |
