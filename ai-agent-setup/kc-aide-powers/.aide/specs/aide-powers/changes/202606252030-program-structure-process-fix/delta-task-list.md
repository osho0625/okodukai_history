# 差分タスクリスト

## 変更概要
program-structure.md の3箇所のプロセス定義行を SKILL.md の実体と一致させるテキスト修正。

## 依存関係グラフ
```
D-001 → D-002 → D-003（同一ファイル逐次実行）
```

## 並列実行判定
- 3タスクとも同一ファイル（program-structure.md）を変更するため逐次実行
- 変更箇所は別行だが、安全のため逐次とする

---

## タスク一覧

### D-001: fs-impl-phase4-execution プロセス行の修正

| 項目 | 内容 |
|---|---|
| タスクID | D-001 |
| 対応する差分設計 | 変更1 |
| 対象ファイル | `.aide/specs/aide-powers/program-structure.md` (L2291付近) |
| 変更内容 | プロセス行を以下に置換 |
| 依存タスク | なし（先頭タスク） |
| テスト種別 | 目視確認 |
| 確認方法 | 修正後プロセス行と `skills/fs-impl-phase4-execution/SKILL.md` の `## Step N:` を照合 |

**before:**
```
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: 全タスク完了確認 → 後処理
```

**after:**
```
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review 経由） → Step2: 動作検証・ユーザー確認 → 後処理
```

---

### D-002: fs-change-phase2-impl プロセス行の修正

| 項目 | 内容 |
|---|---|
| タスクID | D-002 |
| 対応する差分設計 | 変更2 |
| 対象ファイル | `.aide/specs/aide-powers/program-structure.md` (L2377付近) |
| 変更内容 | プロセス行を以下に置換（全15 Step名称修正） |
| 依存タスク | D-001 |
| テスト種別 | 目視確認 |
| 確認方法 | 修正後プロセス行と `skills/fs-change-phase2-impl/SKILL.md` の `## Step N:` を照合 |

**before:**
```
- プロセス: 前処理 → Step1: 差分設計の前段階更新 → Step2: 差分設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: ユーザー確認 → Step7: タスク分解 → Step8: タスクリスト確認 → Step9: 工程チェック表 → Step10: 実装ループ → Step11: 全テスト → Step12: doc-sync → Step13: 動作確認試験書更新 → Step14: history.md → Step15: pending-issues確認 → 後処理
```

**after:**
```
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 差分設計の作成 → Step3: 差分設計のユーザー承認 → Step4: 差分設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 影響範囲再精査 → Step7: 影響範囲再検討のユーザー承認 → Step8: 差分タスクリストの作成 → Step9: タスクリストのユーザー承認 → Step10: タスク実装ループ（coding-test-2review経由） → Step11: リグレッションテスト結果の確認・報告（セーフティネット） → Step12: 動作検証・ユーザー確認 → Step13: 設計書反映 → Step14: pending-issues 書き込み忘れチェック → Step15: 変更完了の案内 → 後処理
```

---

### D-003: fs-bugfix-phase2-impl プロセス行の修正

| 項目 | 内容 |
|---|---|
| タスクID | D-003 |
| 対応する差分設計 | 変更3 |
| 対象ファイル | `.aide/specs/aide-powers/program-structure.md` (L2401付近) |
| 変更内容 | プロセス行を以下に置換（全13 Step名称修正） |
| 依存タスク | D-002 |
| テスト種別 | 目視確認 |
| 確認方法 | 修正後プロセス行と `skills/fs-bugfix-phase2-impl/SKILL.md` の `## Step N:` を照合 |

**before:**
```
- プロセス: 前処理 → Step1: 差分設計前段階更新 → Step2: 修正設計書作成 → Step3: 影響範囲精密分析 → Step4: QAレビュー → Step5: QA結果対応 → Step6: タスク分解 → Step7: タスクリスト確認 → Step8: 実装ループ → Step9: 全テスト → Step10: セーフティネット → Step11: doc-sync → Step12: history.md → Step13: pending-issues確認 → 後処理
```

**after:**
```
- プロセス: 前処理 → Step1: 設計系共通スキル呼び出し判定 → Step2: 修正設計の作成 → Step3: 修正設計のユーザー承認 → Step4: 修正設計のQAレビュー → Step5: QA REJECTED 修正ループ → Step6: 差分タスクリストの作成 → Step7: タスクリストのユーザー承認 → Step8: タスク実装ループ（coding-test-2review 経由） → Step9: リグレッションテスト結果の確認・報告（セーフティネット） → Step10: 動作検証・ユーザー確認 → Step11: 設計書反映 → Step12: pending-issues 書き込み忘れチェック → Step13: バグ修正完了の案内 → 後処理
```

---

## 網羅性チェック

| delta-design.md 変更項目 | 対応タスク | 状態 |
|---|---|---|
| 変更1: fs-impl-phase4-execution | D-001 | ✅ |
| 変更2: fs-change-phase2-impl | D-002 | ✅ |
| 変更3: fs-bugfix-phase2-impl | D-003 | ✅ |

漏れなし。

---

## リグレッションテスト

| # | 確認対象 | 確認方法 | 合格基準 |
|---|---|---|---|
| R-1 | fs-impl-phase4-execution プロセス行 | program-structure.md の該当行と SKILL.md の Step を照合 | 全Step名が完全一致 |
| R-2 | fs-change-phase2-impl プロセス行 | program-structure.md の該当行と SKILL.md の Step を照合 | 全Step名が完全一致 |
| R-3 | fs-bugfix-phase2-impl プロセス行 | program-structure.md の該当行と SKILL.md の Step を照合 | 全Step名が完全一致 |

※ 自動テストなし（dev-environment.md §7.4: 自動テストFW未導入 + ドキュメント修正）
