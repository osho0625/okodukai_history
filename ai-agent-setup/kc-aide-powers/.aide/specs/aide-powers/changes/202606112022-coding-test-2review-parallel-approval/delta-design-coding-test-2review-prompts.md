# 差分設計: coding-test-2review 3プロンプト（読み取り側 — 工程行更新への追従）

> メインファイル: [delta-design.md](./delta-design.md) の「修正対象の差分設計」より分割
> 新フォーマットの正準定義はメインファイルの「共通仕様（CF-1〜CF-9）」を参照。本ファイルは 3 プロンプトの「当該タスク行の◯◯セルを更新（当該行のみ最小編集）」という**列セル前提**を、「自分が担当した工程の行を 3 段階更新」へ追従させる before→after を示す。
> 関連要求: REQ-C-001（implementer の run_test 依存維持） / REQ-C-002（reviewer の独立並列前提） / 案A（工程行更新）

対象ファイル:
1. `skills/coding-test-2review/implementer-prompt.md`（micro-impl-agent 用）
2. `skills/coding-test-2review/spec-reviewer-prompt.md`（design-review-agent 用）
3. `skills/coding-test-2review/code-quality-reviewer-prompt.md`（code-review-agent 用）

> 共通の方針: 各プロンプトの「工程チェック表は当該タスクの行のみを最小編集で更新する／当該タスク（{task_id}）の『◯◯』セルを更新する」という列セル前提の記述を、「自分が担当した工程行（行キー `{task_id}::{工程キー}`）を CF-5 の 3 段階（開始 🔄 / 完了 ✅＋output / 失敗 ❌＋output）で更新する」へ統一する。各モードのレビュー観点・テスト作成ルール・判定基準・preservation check 等の実質ロジックは不変（approach.md の「プロンプトは独立工程前提のまま維持」方針）。

---

## 変更対象1: implementer-prompt.md

### 変更1-A: 共通ルール（全モード）

#### before

```markdown
## 共通ルール（全モード）

- 設計参照は **セクションを絞って** 渡す（設計書全体を渡さない）
- 工程チェック表は **当該タスクの行のみ** を最小編集で更新する（他タスクの行に触れない。更新前に Read で読み直す）
- 報告 Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
```

#### after

```markdown
## 共通ルール（全モード）

- 設計参照は **セクションを絞って** 渡す（設計書全体を渡さない）
- 工程チェック表（1 工程 = 1 行）は **自分が担当した工程の行（行キー `{task_id}::{工程キー}`）のみ** を最小編集で更新する（他工程・他タスクの行に触れない。更新前に Read で読み直す）。更新は CF-5 の 3 段階で行う:
  - 【作業開始直後】 自分の工程行の状態を `⬜ todo → 🔄 in-progress`、実行エージェントを自分の名前に
  - 【完了（PASS）】 `🔄 → ✅ done`、output に結果サマリ
  - 【失敗（FAIL）】 `🔄 → ❌ failed`、output にエラー／指摘内容
- 同一タスクの「実装（implement）」と「テスト実装（write_test）」は並列起動されうる。各モードは独立した 1 工程として実行し、自分の工程行のみを更新する（他工程の行に依存・干渉しない）
- 報告 Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
```

### 変更1-B: 各モードの「工程チェック表の更新（必須）」ブロック

#### before（mode: implement の例。write_test / run_test / fix / fix_test も同型）

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 実装完了後、当該タスク（{task_id}）の「実装」セルを更新すること（当該行のみ最小編集）
```

```markdown
（write_test）
- テスト作成完了後、当該タスク（{task_id}）の「テスト実装」セルを更新すること（当該行のみ最小編集）
（run_test）
- テスト実行完了後、当該タスク（{task_id}）の「テスト実行」セルを更新すること（当該行のみ最小編集）
（fix / fix_test）
- 修正完了後、当該タスク（{task_id}）の該当セルを更新すること（当該行のみ最小編集）
```

#### after

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: {process_row_key}（例: `{task_id}::implement`）
- 作業開始直後に当該工程行を `🔄 in-progress` に更新し、完了後に `✅ done`（output に結果サマリ）、失敗時に `❌ failed`（output にエラー内容）へ更新すること（自分の工程行のみ最小編集。CF-5）
```

```markdown
（write_test）更新対象の工程行: `{task_id}::write_test`（工程「テスト実装」）
（run_test）更新対象の工程行: `{task_id}::run_test`（工程「テスト実行」）
（fix）更新対象の工程行: fix 対象の工程行（再実行で `⬜ todo` に戻された `{task_id}::implement`）
（fix_test）更新対象の工程行: 再実行で `⬜ todo` に戻された `{task_id}::write_test`
※ いずれも 3 段階更新（開始 🔄 / 完了 ✅＋output / 失敗 ❌＋output）
```

### 変更1-C: mode: run_test の前後依存記述（維持を明記）

#### before

```markdown
## テスト実行ルール
- 対象テスト + 全体リグレッションを実行し全パスを確認
...
```

#### after

```markdown
## テスト実行ルール
- **前提（維持）**: テスト実行は、同一タスクの「実装」と「テスト実装」の両工程行が `✅ done`（テスト実装の後）になってから実施する。テスト実行は並列対象外
- 対象テスト + 全体リグレッションを実行し全パスを確認
...
```

### 変更理由（implementer-prompt.md）

- 案A: 「当該タスクの行／『◯◯』セルを更新（当該行のみ最小編集）」という**列セル前提**を、「自分が担当した工程行（`{task_id}::{工程キー}`）を 3 段階更新」へ追従（CF-5）。これにより並列起動された実装・テスト実装の各 micro-impl-agent が別々の物理行を正確に更新でき、衝突しない。
- REQ-C-001: write_test がテスト観点（設計書）起点で実装非依存に書ける旨（実装と並列起動されうる）を共通ルールに明記。run_test の「テスト実装の後に実施／並列対象外」依存は**維持**することをテスト実行ルールに明記（approach.md の確定方針）。
- fix / fix_test は、CF-6 で `⬜ todo` に戻された工程行を再実行し、本人が 🔄 → ✅ に更新する流れへ整合。

---

## 変更対象2: spec-reviewer-prompt.md

### 変更2-A: ヘッダ説明（工程チェック表更新の前提）

#### before

```markdown
coding-test-2review 固有: レビュー完了後、**工程チェック表（impl-process-checklist.md）の当該タスク行の「設計準拠レビュー」セル更新** も design-review-agent に依頼する（当該行のみ最小編集。更新前に Read で読み直す）。
```

#### after

```markdown
coding-test-2review 固有: レビューは「コード品質レビュー」と**並列起動**される独立工程である（前提: 対象タスクの実装・テスト実装・テスト実行が PASS していること）。design-review-agent は**自分が担当した工程行（`{task_id}::spec_review`）のみ**を CF-5 の 3 段階（開始 🔄 / 完了 ✅＋output / 失敗 ❌＋output）で更新する（他工程・他タスクの行に触れない。更新前に Read で読み直す）。
```

### 変更2-B: mode: combined の「工程チェック表の更新（必須）」ブロック

#### before

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- レビュー完了後、当該タスク（{task_id}）の「設計準拠レビュー」セルを更新すること（当該行のみ最小編集）
```

#### after

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::spec_review`（工程「設計準拠レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）
```

> 同ファイル内の mode: implementation / mode: test の「該当セルを更新」記述も同様に、`{task_id}::spec_review` 工程行の 3 段階更新へ追従する（観点の内訳記述であり、combined と同じ行を更新）。

### 変更理由（spec-reviewer-prompt.md）

- REQ-C-002: 設計準拠レビューがコード品質レビューと並列起動される独立工程であること、前提（実装・テスト実装・テスト実行 PASS）を明記（AC-002-2）。レビュー観点・判定ロジックは不変。
- 案A: 「当該タスク行の『設計準拠レビュー』セル更新」を `{task_id}::spec_review` 工程行の 3 段階更新へ追従（CF-5）。FAIL 時に output へ「指摘起因（実装／テスト実装）」を記すことで、CF-6 / SKILL.md の「レビュー FAIL 時の再実行ルール」が差し戻し先を一意に決定できるようにする（AC-002-3 の前提情報）。

---

## 変更対象3: code-quality-reviewer-prompt.md

### 変更3-A: ヘッダ説明（工程チェック表更新の前提）

#### before

```markdown
coding-test-2review 固有: レビュー完了後、**工程チェック表（impl-process-checklist.md）の当該タスク行の「コード品質レビュー」セル更新** も code-review-agent に依頼する（当該行のみ最小編集。更新前に Read で読み直す）。
```

#### after

```markdown
coding-test-2review 固有: レビューは「設計準拠レビュー」と**並列起動**される独立工程である（前提: 対象タスクの実装・テスト実装・テスト実行が PASS していること）。code-review-agent は**自分が担当した工程行（`{task_id}::quality_review`）のみ**を CF-5 の 3 段階（開始 🔄 / 完了 ✅＋output / 失敗 ❌＋output）で更新する（他工程・他タスクの行に触れない。更新前に Read で読み直す）。
```

### 変更3-B: mode: combined の「工程チェック表の更新（必須）」ブロック

#### before

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- レビュー完了後、当該タスク（{task_id}）の「コード品質レビュー」セルを更新すること（当該行のみ最小編集）
```

#### after

```markdown
### 工程チェック表の更新（必須）
- 工程チェック表: {process_checklist_path}
- 更新対象の工程行: `{task_id}::quality_review`（工程「コード品質レビュー」）
- レビュー開始直後に当該工程行を `🔄 in-progress` に更新し、PASS なら `✅ done`（output に判定サマリ）、FAIL なら `❌ failed`（output に指摘内容と起因＝実装／テスト実装の別）へ更新すること（自分の工程行のみ最小編集。CF-5）
```

> 同ファイル内の mode: implementation / mode: test の「該当セルを更新」記述も同様に、`{task_id}::quality_review` 工程行の 3 段階更新へ追従する。

### 変更理由（code-quality-reviewer-prompt.md）

- REQ-C-002: コード品質レビューが設計準拠レビューと並列起動される独立工程であること、前提（実装・テスト実装・テスト実行 PASS）を明記（AC-002-2）。レビュー観点・判定ロジックは不変。
- 案A: 「当該タスク行の『コード品質レビュー』セル更新」を `{task_id}::quality_review` 工程行の 3 段階更新へ追従（CF-5）。FAIL 時に output へ起因（実装／テスト実装）を記し、CF-6 の再実行ルールと整合（AC-002-3 の前提情報）。
