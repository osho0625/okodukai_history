# Spec作業 引き継ぎメモ

最終更新: 2026/05/19

## 現在のSpec状況

### 1. play-ticket（あそびチケット）

| ドキュメント | 状態 | 備考 |
|---|---|---|
| requirements.md | ✅ 完了（レビュー済み） | 9要件、DB Schema含む |
| design.md | ✅ 完了（レビュー済み） | 最終レビュー反映済み |
| tasks.md | ❌ 未作成 | **次のアクション** |

**概要:** 紙の「あそびチケット」をデジタル化。管理者（つじ）が発行、子供（かいせい・はるちか・いろは）が使用。

**次にやること:**
- `tasks.md` を作成してタスク分解
- その後、実装フェーズに入る

**実装順序（設計書に記載済み）:**
1. Supabase migration（ticketsテーブル + RLS + sequence + index）
2. pages/ticket.html（チケット一覧・使用・履歴）
3. pages/admin.html にチケット発行セクション追加
4. Discord webhook連携
5. sw.js キャッシュ対象追加 + バージョンbump
6. 手動テスト（発行・使用・二重押し・offline・history）

**設計上の重要ポイント:**
- RLS有効 + 全許可ポリシー（game_rankingsと同パターン）
- 原子的UPDATE: `WHERE status='unused'` で楽観ロック
- ticket_no: database sequence（欠番許容）
- オフライン: localStorageキャッシュ表示、操作は無効化
- XSSエスケープ: `esc()` 関数でDB値をサニタイズ
- スタンプ演出: 600ms待機後に再描画

---

### 2. math-olympiad-app（算数オリンピック）

| ドキュメント | 状態 | 備考 |
|---|---|---|
| requirements.md | ✅ 完了 | |
| design.md | ✅ 完了（レビュー済み） | 12点フィードバック反映済み |
| tasks.md | ❌ 未作成 | |

**概要:** ゲームセンターに追加する思考力育成アプリ。問題JSON + Supabase回答管理 + 管理者採点。

**次にやること:**
- `tasks.md` を作成してタスク分解
- play-ticketと独立して進められる

**設計上の重要ポイント:**
- 単一HTML（pages/math-olympiad.html）+ ビュー切り替え
- user_id(UUID)ベースのDB操作（user_nameは表示用のみ）
- 匿名公開アプリ: RLS全許可 + UPDATEのみstatus='pending'制約
- sessionStorage: タイマー・ヒント・回答ドラフト復元
- innerHTML使用（ruby対応）、将来DOMPurify検討
- loadProblems() / loadUserAnswers() にエラー処理あり
- goNextProblem(): findIndex+slice方式

---

## Specワークフロー情報

両方とも `requirements-first` ワークフロー。

```
.kiro/specs/play-ticket/.config.kiro
.kiro/specs/math-olympiad-app/.config.kiro
```

## 次のチャットでの指示例

```
play-ticketのtasks.mdを作成してください。
設計書とrequirementsは .kiro/specs/play-ticket/ にあります。
```

または

```
math-olympiad-appのtasks.mdを作成してください。
設計書とrequirementsは .kiro/specs/math-olympiad-app/ にあります。
```

## 開発ルール（忘れずに）

コード変更後は必ず以下3つを更新:
1. `pages/release-notes.html` — リリースノート追記
2. `sw.js` — CACHE_NAME バージョン +1
3. `index.html` — 末尾バージョン表示更新
