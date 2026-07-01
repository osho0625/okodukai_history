-- nurse_call_messages: call_idをNULLABLEに変更
-- チャットはcall無しでもグループチャットとして利用可能にする
-- 作成日: 2026/06/24

-- FK制約を一旦削除して再作成（NULLABLEに変更）
ALTER TABLE nurse_call_messages ALTER COLUMN call_id DROP NOT NULL;
