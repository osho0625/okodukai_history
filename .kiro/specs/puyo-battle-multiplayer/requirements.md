# Requirements Document

## Introduction

ぴくぴく対戦（puyo-battle.html）に、再戦機能・3人以上の入室・観戦/順番待ち・勝ち残り方式・観戦のみ制限を追加する。現在は2人限定でルーム再作成が必要な仕様を拡張し、連戦や複数人での利用を快適にする。

## Room State Model

A room SHALL be in exactly one of the following states:
- **LOBBY** — ルーム作成済み、対戦者の参加待ち
- **PLAYING** — 対戦進行中（seatA vs seatB）
- **RESULT** — 対戦終了、結果表示中
- **REMATCH_WAIT** — 再戦投票待ち（rematchVotes管理）
- **ROTATING** — 勝ち残り方式でのプレイヤー入れ替え中（5秒インターバル）
- **CLOSED** — ルーム終了（全員退出 or タイムアウト）

Transitions must be deterministic and broadcast to all participants.

## Room Data Model

The room SHALL maintain the following participant structure:
- **seatA** — 対戦席A（Active_Player）
- **seatB** — 対戦席B（Active_Player）
- **spectators[]** — 観戦者リスト
- **queue[]** — 順番待ちリスト（FIFO、サーバータイムスタンプ順）
- **rematchVotes** — `{ seatA: bool, seatB: bool }` 再戦投票状態

## Glossary

- **Battle_System**: ぴくぴく対戦の全体システム（puyo-battle.html内のロジック）
- **Room**: 対戦ルーム。puyo_battlesテーブルの1レコードに対応するSupabase Realtime Broadcastチャンネル
- **Room_Owner**: ルームを作成したプレイヤー。退出時は最古参に移譲
- **Active_Player**: 現在対戦中の2人のプレイヤー（seatA, seatB）
- **Spectator**: 対戦を観戦しているプレイヤー（操作不可、盤面閲覧のみ）
- **Queue_Player**: 順番待ちリストに入っているプレイヤー（次の対戦に参加する権利を持つ）
- **Winner**: 対戦に勝利したプレイヤー
- **Loser**: 対戦に敗北したプレイヤー
- **Rematch**: 同じルーム・同じ相手で再度対戦を開始する機能
- **Spectator_Only_Mode**: 3人目以降の参加者を観戦のみに制限するルーム設定

## Requirements

### Requirement 1: 再戦機能

**User Story:** As a プレイヤー, I want 対戦終了後に同じ相手ともう一度対戦できる, so that ルームを作り直す手間なく連戦できる。

#### Acceptance Criteria

1. WHEN 対戦が終了した, THE Battle_System SHALL 結果画面に「もういちど」ボタンを表示する
2. WHEN 両方のActive_Playerが「もういちど」ボタンを押した, THE Battle_System SHALL 同じルーム設定（難易度・パスコード）で新しい対戦を開始する
3. WHEN 一方のActive_Playerが「もういちど」ボタンを押した, THE Battle_System SHALL 相手の応答を待っている旨を表示する（rematchVotes状態管理）
4. WHEN 一方のActive_Playerが「ロビーに戻る」を選択した, THE Battle_System SHALL 再戦待ちの相手に「相手が退出しました」と通知する
5. WHEN 再戦が開始された, THE Battle_System SHALL 新しいシードを生成してぷよ出現順序を再同期する
6. WHILE 再戦待ち状態, THE Battle_System SHALL 30秒のタイムアウト後に自動的にロビーに戻す
7. IF queue is non-empty THEN winner-stays mode (Requirement 4) SHALL override rematch. 「もういちど」ボタンは非表示とする

### Requirement 2: 3人以上の入室

**User Story:** As a プレイヤー, I want ルームに3人以上入れるようにしたい, so that 友達が後から来ても同じルームで一緒に遊べる。

#### Acceptance Criteria

1. THE Battle_System SHALL ルームに最大6人まで同時接続を許可する（UIレイアウト制約による上限）
2. WHEN 3人目以降のプレイヤーがルームに参加した, THE Battle_System SHALL 参加者を観戦状態として扱う
3. WHILE 対戦が進行中, THE Battle_System SHALL Spectatorに両方のActive_Playerの盤面をリアルタイムで表示する（read-only board state updates only、入力イベントは受け付けない）
4. WHEN Spectatorがルームに参加した, THE Battle_System SHALL ルーム内の参加者一覧にSpectatorの名前を表示する
5. THE Battle_System SHALL ルーム参加者全員に現在の参加者数と名前一覧を表示する
6. WHEN Active_Playerが切断した, THE Battle_System SHALL 30秒間の再接続を待ち、タイムアウト後に残ったActive_Playerを勝者とする（即時forfeitしない）

### Requirement 3: 観戦/順番待ち選択

**User Story:** As a 3人目以降のプレイヤー, I want 観戦するか順番待ちするかを選びたい, so that 自分の目的に合った参加方法を選べる。

#### Acceptance Criteria

1. WHEN 3人目以降のプレイヤーがルームに参加した, THE Battle_System SHALL 「観戦する」と「順番待ちする」の選択UIを表示する
2. WHEN プレイヤーが「観戦する」を選択した, THE Battle_System SHALL プレイヤーをSpectatorとして登録する
3. WHEN プレイヤーが「順番待ちする」を選択した, THE Battle_System SHALL プレイヤーをQueue_Playerとして待ちリストの末尾に追加する
4. THE Battle_System SHALL 順番待ちリストの現在の順番をQueue_Player全員に表示する
5. WHILE Queue_Playerが順番待ち中, THE Battle_System SHALL 対戦の観戦画面を表示する
6. WHEN SpectatorまたはQueue_Playerがルームから退出した, THE Battle_System SHALL 参加者一覧と順番待ちリストを更新する
7. A Spectator SHALL be able to join the queue at any time（観戦→順番待ちへの変更可能）
8. A Queue_Player SHALL be able to leave the queue and remain as Spectator（順番待ち→観戦への変更可能）

### Requirement 4: 勝ち残り方式

**User Story:** As a Queue_Player, I want 勝者と対戦できる勝ち残り方式で遊びたい, so that 順番待ちの後に強い相手と対戦できる。

#### Acceptance Criteria

1. WHEN 対戦が終了しQueue_Playerが存在する, THE Battle_System SHALL Winnerを次の対戦のActive_Player（seatA）として残す
2. WHEN 対戦が終了しQueue_Playerが存在する, THE Battle_System SHALL 順番待ちリストの先頭のQueue_Playerを次の対戦のActive_Player（seatB）とする
3. WHEN 対戦が終了しQueue_Playerが存在する, THE Battle_System SHALL Loserを順番待ちリストの末尾に追加する
4. WHEN 対戦が終了しQueue_Playerが存在しない, THE Battle_System SHALL 通常の再戦フロー（Requirement 1）を適用する
5. WHEN 勝ち残り方式で次の対戦が開始される, THE Battle_System SHALL 5秒のインターバル（ROTATING状態）の後に新しい対戦を自動開始する
6. THE Battle_System SHALL 各プレイヤーの連勝数をルーム内で表示する

### Requirement 5: 観戦のみ制限

**User Story:** As a Room_Owner, I want 3人目以降を観戦のみに制限したい, so that 対戦の邪魔をされずに特定の相手と連戦できる。

#### Acceptance Criteria

1. WHEN Room_Ownerがルームを作成する, THE Battle_System SHALL 「観戦のみ」チェックボックスを表示する
2. WHEN 「観戦のみ」が有効なルームに3人目以降が参加した, THE Battle_System SHALL 「順番待ちする」選択肢を非表示にし観戦のみを許可する
3. THE Battle_System SHALL ルーム一覧画面で「観戦のみ」制限のあるルームに視覚的な表示（👁アイコン）を付ける
4. WHILE 「観戦のみ」が有効, THE Battle_System SHALL 対戦終了後に通常の再戦フロー（Requirement 1）を適用する
5. WHEN 「観戦のみ」が有効なルームで対戦が終了した, THE Battle_System SHALL Spectatorに再戦の状況（待機中/開始）をリアルタイムで通知する

### Requirement 6: 再接続

**User Story:** As a プレイヤー, I want 一時的な切断から復帰できる, so that ネットワークの瞬断で対戦が無効にならない。

#### Acceptance Criteria

1. WHEN any participant disconnects, THE Battle_System SHALL preserve their role (seatA/seatB/spectator/queue position) for 30 seconds
2. WHEN the disconnected participant reconnects within 30 seconds, THE Battle_System SHALL restore their role and state
3. WHEN Active_Player disconnects and does NOT reconnect within 30 seconds, THE Battle_System SHALL declare forfeit and the remaining Active_Player wins
4. WHEN Spectator or Queue_Player disconnects and does NOT reconnect within 30 seconds, THE Battle_System SHALL remove them from the participant list

### Requirement 7: Ownership Transfer

**User Story:** As a ルーム参加者, I want ルームオーナーが抜けてもルームが存続する, so that 対戦が中断されない。

#### Acceptance Criteria

1. WHEN Room_Owner leaves the room, THE Battle_System SHALL assign ownership to the oldest remaining participant（参加時刻が最も古い人）
2. THE Battle_System SHALL notify all participants of the ownership transfer
3. WHEN all participants leave, THE Battle_System SHALL transition the room to CLOSED state

### Requirement 8: Queue Integrity

**User Story:** As a Queue_Player, I want 順番が公平に管理される, so that 先に並んだ人が先に対戦できる。

#### Acceptance Criteria

1. Queue order SHALL be FIFO based on server timestamp（Supabaseサーバー時刻基準）
2. WHEN multiple players join the queue simultaneously, THE Battle_System SHALL order them by their join broadcast timestamp
3. THE Battle_System SHALL NOT allow queue manipulation (cutting in line, reordering) by any participant
