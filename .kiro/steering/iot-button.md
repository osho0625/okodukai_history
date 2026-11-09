---
inclusion: fileMatch
fileMatchPattern: "*button*,*iot*"
---

# IoTボタン: お手伝いポイント申請

## 概要

物理ボタン / NFCタグ / スマホショートカットから、お手伝いポイントを申請できるIoT連携機能。
申請は `chore_points` に `status: 'pending'` でINSERTされ、admin承認が必要（Alexa申請と同じ承認制）。

- デバイス（ラズパイ等）はボタンごとの `token` だけを保持する
- 「誰の / どの家事 / 何pt」の割り当ては `button_actions` テーブルで管理（admin.htmlのUIで設定）
- `cooldown_seconds`（既定30秒）で連打防止
- 押下履歴は `button_action_logs` に監査ログとして記録

## 構成

| 要素 | パス | 役割 |
|------|------|------|
| Edge Function | supabase/functions/button-action/index.ts | token受信→割り当て解決→cooldown判定→chore_points pending INSERT→ログ記録 |
| テーブル定義 | supabase/functions/.../button_actions.sql | button_actions / button_action_logs |
| 管理UI | admin.html（🔘 IoTボタン管理） | 登録・有効無効・削除・押下統計・URL/QR生成・テスト発火 |
| ラズパイクライアント | button-listener.py | GPIOボタン押下→button-actionへPOST |
| セットアップ | button-setup.sh / BUTTON_README.md | ラズパイ自動起動・導入手順 |
| 家庭向けガイド | .kiro/specs/family-notes/docs/iot-button-guide.md | 買うもの・配線・セットアップ・admin登録・token貼付・動作確認・運用ヒント |

## テーブル

- `button_actions`: token（デバイス識別）、対象アカウント、家事名、ポイント、cooldown_seconds、有効/無効フラグ
- `button_action_logs`: 押下日時、token、結果（applied / cooldown 等）の監査ログ

## 動作フロー

1. デバイスがボタン押下を検知し、保持する `token` を `button-action` Edge Function にPOST
2. Edge Functionが `button_actions` から割り当てを解決
3. `cooldown_seconds` 内の連打は `cooldown` として拒否
4. OKなら `chore_points` に `status: 'pending'` でINSERT（承認待ち）
5. 結果を `button_action_logs` に記録

## 注意点

- デバイスには割り当て情報を持たせない（tokenのみ）。サーバ側で一元管理することで、紛失・使い回し時も管理UIから無効化できる
- 申請は必ず承認制。自動付与はしない
