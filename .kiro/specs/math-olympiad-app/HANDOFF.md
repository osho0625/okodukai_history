# 算数オリンピックアプリ — レビュー引き継ぎドキュメント

## 概要

ゲームセンター（arcade.html）に追加する「算数オリンピック」思考力育成アプリの spec が完成し、設計レビューを通過した状態。実装開始可能。

## spec ファイル

| ファイル | 内容 |
|---------|------|
| `.kiro/specs/math-olympiad-app/requirements.md` | 要件定義（14要件） |
| `.kiro/specs/math-olympiad-app/design.md` | 設計書（コード例・DB設計・テスト戦略含む） |
| `.kiro/specs/math-olympiad-app/tasks.md` | 実装タスク（12タスク、サブタスク含む） |

## プロジェクト技術スタック

- vanilla HTML/JS/CSS（フレームワークなし）
- Supabase（CDN script タグ）+ GitHub Pages
- PWA（sw.js でキャッシュ）
- テスト: vitest + fast-check（新規導入）

## 設計の主要判断

1. **単一HTML + 6ビュー**: pages/math-olympiad.html 内で showView() による SPA 風切り替え
2. **user_id (UUID)**: DB識別子。localStorage `math_olympiad_user_id` で生成。user_name は表示用のみ
3. **insert/update 分離**: upsert は使わない。RLS UPDATE ポリシーとの相性を明確化
4. **reviewed 上書き防止（二重ガード）**:
   - アプリ側: select → status チェック → reviewed なら reject
   - DB側: RLS `USING (status = 'pending') WITH CHECK (status = 'reviewed' OR status = 'pending')`
5. **DOMPurify CDN**: 問題文 innerHTML 描画時に sanitize（ALLOWED_TAGS: ruby, rt, br）
6. **sessionStorage 永続化（5キー）**: timer_start, current_problem, hints_revealed, answer_draft, thinking_draft
7. **stale timer**: TIMER_EXPIRE_MS（6時間）超過で clearProblemSession()
8. **23505 unique_violation**: insert 時の 2タブ競合をハンドリング
9. **管理者認可**: localStorage deviceRole=admin のみ（家庭内信頼境界前提）
10. **オフライン**: sw.js キャッシュで問題閲覧可能、提出は navigator.onLine チェック

## Supabase テーブル

```sql
CREATE TABLE math_olympiad_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  problem_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  thinking_note TEXT DEFAULT '',
  elapsed_seconds INT NOT NULL,
  hints_used INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  score INT,
  admin_comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_math_answers_user_id ON math_olympiad_answers(user_id);
CREATE INDEX idx_math_answers_status ON math_olympiad_answers(status);

ALTER TABLE math_olympiad_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON math_olympiad_answers FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON math_olympiad_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "update_only_pending" ON math_olympiad_answers
  FOR UPDATE USING (status = 'pending') WITH CHECK (status = 'reviewed' OR status = 'pending');
```

## レビューで修正済みの全項目（20件）

1. user_id ベースに統一（user_name 主キー問題解消）
2. RLS UPDATE ポリシーに WITH CHECK 追加
3. upsert → insert/update 分離
4. DOMPurify 導入（矛盾記述も修正済み）
5. addEventListener null 対策（bindDraftEvents 関数化、initApp 内で呼び出し）
6. submit 後の loadUserAnswers() 再取得
7. startProblem() で前問題ドラフトクリア（clearProblemSession 先頭呼び出し）
8. showResult() null ガード
9. loadProblems() Array.isArray チェック
10. loadUserAnswers() try/catch + 必要列のみ select + order
11. loadPendingReviews() 必要列のみ select
12. submitReview() error handling
13. 23505 unique_violation ハンドリング
14. showView() null guard + scrollTo(0,0)
15. COMMENT_TEMPLATES 改行付き挿入
16. ヒント状態 sessionStorage 永続化
17. clearProblemSession() ヘルパー一元化（5キー）
18. goNextProblem() 仕様明記（new のみ対象）
19. DB インデックス追加（user_id, status）
20. 信頼境界・elapsed_seconds 参考値を明記

## MVP 実装順序

1. テスト基盤 + 問題JSON 50問
2. メインページ骨格 + 問題表示
3. 回答入力 + 経過時間計測
4. チェックポイント
5. Supabase 保存（回答提出）
6. 管理者採点
7. 採点結果閲覧
8. チェックポイント
9. 学習履歴管理
10. ヒントシステム
11. ゲームセンター統合 + PWA + バージョン更新
12. 最終チェックポイント

## 実装時の注意点

- Supabase テーブル作成（タスク5.1）は手動 SQL 実行が必要
- 問題 JSON 50問作成が最大ボリューム（タスク1.2）
- sw.js / index.html / release-notes.html の更新を最後に忘れないこと（開発ルール）
- `*` 付きタスクはオプション（プロパティテスト）
- game_settings.game_publish に `game_math_olympiad: true` を追加する必要あり

## 仕様上の許容事項（意図的）

- elapsed_seconds は参考値（sessionStorage 改ざん可能、不正防止対象外）
- 管理者認可は DevTools 改ざん可能（家庭内利用前提）
- user_name は提出時点の名前を保存（名前変更後も過去レコードは更新しない）
- goNextProblem() は未挑戦(new)のみ対象（pending 再編集は問題一覧から直接選択）
- RLS SELECT は全許可（全員の回答が見える。将来 Anonymous Auth 導入で user_id ベースに移行予定）

## 次のアクション

tasks.md を開いてタスク1から順に実装を開始する。
