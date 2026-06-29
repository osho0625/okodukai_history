# お小遣い手帳 - アーキテクチャ設計図

## 1. アプリ全体構成図

```mermaid
graph TB
    subgraph "GitHub Pages (Static Hosting)"
        INDEX[index.html<br/>TOPページ]
        CHILD[child.html<br/>個人ページ]
        ADMIN[admin.html<br/>管理者ページ]
        ALLOWANCE[allowance.html<br/>入出金]
        ARCADE[arcade.html<br/>ゲームセンター]
        
        subgraph "ゲーム・学習"
            GAME[game.html<br/>ぷよぷよ]
            PUYO_BATTLE[puyo-battle.html<br/>ぴくぴく対戦]
            TETRIS[tetris.html<br/>テトミン]
            BLAST[blast.html<br/>ピクミンブラスト]
            MATH_OLY[math-olympiad.html<br/>算数オリンピック]
            MATH_BATTLE[math-battle.html<br/>算数バトル]
            KANJI[kanji-test.html<br/>漢字テスト]
            SUIKA[suika.html<br/>すいかRPG]
            OLIMAR[olimar.html<br/>オリマー]
            TRPG[trpg-cthulhu.html<br/>クトゥルフTRPG]
            COCKROACH[cockroach-poker.html<br/>ごきぶりポーカー]
            QUARTO[quarto.html<br/>クアルト]
            QUORIDOR[quoridor.html<br/>コリドール]
            MEMORY[memory-game.html<br/>神経衰弱]
            BLOKUS[blokus.html<br/>ブロックス]
        end
        
        subgraph "情報・コンテンツ"
            SCIENCE[today-science.html<br/>今日のサイエンス]
            SCP[scp-archive.html<br/>今日のSCP]
            TICKET[ticket.html<br/>あそびチケット]
            NOTES[family-notes.html<br/>家族ノート]
        end
        
        subgraph "ナースコール"
            NURSE[nurse-call.html<br/>4ビュー: ホーム/チャット/通話/体温<br/>WebRTC音声+ビデオ通話<br/>即時Push通知]
        end
        
        subgraph "共通JS"
            COMMON[js/common.js<br/>共通処理・リダイレクト制御]
            SW[sw.js<br/>Service Worker]
        end
    end
    
    subgraph "Supabase Backend"
        DB[(PostgreSQL<br/>全テーブル)]
        REALTIME[Realtime<br/>Broadcast/Presence]
        EDGE[Edge Functions]
        STORAGE[Storage]
    end
    
    subgraph "外部サービス"
        DISCORD[Discord Webhook<br/>通知]
        GITHUB_ACTIONS[GitHub Actions<br/>Cron Jobs]
        WEB_PUSH[Web Push API<br/>ブラウザ通知]
        WEBRTC[WebRTC<br/>音声通話]
        STUN_TURN[STUN/TURN Server<br/>NAT越え]
    end
    
    INDEX --> CHILD
    INDEX --> ADMIN
    INDEX --> ARCADE
    INDEX --> NURSE
    ARCADE --> GAME
    ARCADE --> TETRIS
    ARCADE --> BLAST
    ARCADE --> OLIMAR
    ARCADE --> SUIKA
    ARCADE --> MATH_OLY
    ARCADE --> KANJI
    ARCADE --> TRPG
    ARCADE --> COCKROACH
    ARCADE --> QUARTO
    ARCADE --> QUORIDOR
    ARCADE --> MEMORY
    ARCADE --> BLOKUS
    CHILD --> NURSE
    
    COMMON --> |リダイレクト制御| NURSE
    
    PUYO_BATTLE --> REALTIME
    MATH_BATTLE --> REALTIME
    NURSE --> REALTIME
    NURSE --> EDGE
    NURSE --> WEBRTC
    WEBRTC --> STUN_TURN
    
    EDGE --> WEB_PUSH
    GITHUB_ACTIONS --> WEB_PUSH
    GITHUB_ACTIONS --> DB
    
    INDEX --> DB
    CHILD --> DB
    ADMIN --> DB
    GAME --> DB
```

## 2. ナースコール機能 アーキテクチャ図

```mermaid
sequenceDiagram
    participant C as 子供デバイス<br/>(nurse-call.html)
    participant SB_RT as Supabase Realtime<br/>(Broadcast Channel)
    participant SB_DB as Supabase DB<br/>(nurse_calls, nurse_call_messages)
    participant EDGE as Edge Function<br/>(push-nurse-call)
    participant PUSH as Web Push API
    participant P as 親デバイス<br/>(admin端末)
    participant WEBRTC as WebRTC<br/>(音声通話)
    
    Note over C,P: === 呼び出しフロー ===
    
    C->>EDGE: POST /push-nurse-call<br/>{child_id, child_name, reason}
    EDGE->>SB_DB: INSERT nurse_calls
    EDGE->>PUSH: 即時Push通知送信<br/>(role='admin'の全端末)
    PUSH->>P: 🔔 ○○がよんでいます
    
    P->>SB_RT: broadcast "response"<br/>{type: "iku_yo", call_id}
    SB_RT->>C: 「今行くよ💨」ポップ表示
    P->>SB_DB: UPDATE nurse_calls<br/>SET responded_at
    
    Note over C,P: === チャットフロー ===
    
    C->>SB_RT: broadcast "chat"<br/>{sender: "child", text}
    SB_RT->>P: メッセージ受信・表示
    C->>SB_DB: INSERT nurse_call_messages
    C->>EDGE: 即時Push通知（1分間隔制限）
    EDGE->>PUSH: 💬チャット通知
    
    P->>SB_RT: broadcast "chat"<br/>{sender: "parent", text}
    SB_RT->>C: メッセージ受信・表示
    P->>SB_DB: INSERT nurse_call_messages
    
    Note over C,P: === 体温記録フロー ===
    
    C->>SB_DB: INSERT temperature_logs<br/>{child_name, temperature, measured_at}
    C->>SB_RT: broadcast "chat"<br/>🌡️ 36.8℃
    C->>EDGE: 即時Push通知<br/>🌡️ たいおん 36.8℃
    EDGE->>PUSH: Push配信
    
    Note over C,P: === 音声通話フロー ===
    
    C->>SB_RT: broadcast "voice_state"<br/>{state: "ringing"}
    SB_RT->>P: 着信表示「でんわにでる」
    P->>P: ユーザータップ → マイク取得
    C->>SB_RT: broadcast "signal"<br/>{type: "offer", sdp}
    SB_RT->>P: SDP Offer受信
    P->>SB_RT: broadcast "signal"<br/>{type: "answer", sdp}
    SB_RT->>C: SDP Answer受信
    
    loop ICE候補交換
        C->>SB_RT: broadcast "ice_candidate"
        SB_RT->>P: ICE受信
        P->>SB_RT: broadcast "ice_candidate"
        SB_RT->>C: ICE受信
    end
    
    P<-->WEBRTC: 音声ストリーム確立
    WEBRTC<-->C: P2P音声通話
```

## 3. ナースコールモード（デバイスロック）フロー

```mermaid
flowchart TD
    subgraph "管理者操作"
        A[admin.html で<br/>ナースコールモードON] --> B[子供のデバイスで<br/>localStorage設定]
    end
    
    subgraph "子供デバイス - 全ページ共通 (common.js)"
        C{localStorage<br/>nurse_call_mode_locked<br/>== true ?} -->|Yes| D[nurse-call.html へ<br/>強制リダイレクト]
        C -->|No| E[通常ページ表示]
    end
    
    subgraph "nurse-call.html"
        D --> F[ナースコール画面表示]
        F --> G[「おやすみモード中」表示]
        F --> H[よんで！ボタン]
        F --> I[チャットUI]
        F --> J[音声通話ボタン<br/>※親側のみ発信]
    end
    
    subgraph "解除フロー"
        K[admin権限で解除操作] --> L[localStorage<br/>nurse_call_mode_locked<br/>削除]
        L --> M[通常アプリ利用可能]
    end
    
    B --> C
    
    style D fill:#ff9999
    style G fill:#ffcc99
    style H fill:#99ff99
```

## 4. ぴくぴく対戦 アーキテクチャ図

```mermaid
sequenceDiagram
    participant P1 as Player 1<br/>(puyo-battle.html)
    participant SB_RT as Supabase Realtime<br/>(Broadcast Channel)
    participant SB_DB as Supabase DB<br/>(puyo_battles)
    participant P2 as Player 2<br/>(puyo-battle.html)
    participant OBS as 観戦者<br/>(puyo-battle.html)
    
    Note over P1,P2: === マッチングフロー ===
    
    P1->>SB_DB: INSERT puyo_battles<br/>(room_code, difficulty, passcode)
    P1->>SB_RT: Subscribe room channel
    P2->>SB_DB: SELECT waiting rooms
    P2->>SB_RT: Subscribe room channel
    P2->>SB_RT: broadcast "join"
    
    Note over P1,P2: === PRNG同期 ===
    P1->>SB_RT: broadcast "seed"<br/>(crypto.getRandomValues)
    Note over P1,P2: 両者同一のぷよ色列を生成<br/>(mulberry32 seeded PRNG)
    
    Note over P1,P2: === ゲームプレイ ===
    
    loop ゲーム中 (60fps)
        P1->>SB_RT: broadcast "board_state"<br/>{board, score, falling_piece, next}
        SB_RT->>P2: 相手盤面描画
        SB_RT->>OBS: 両盤面描画
        
        P2->>SB_RT: broadcast "board_state"
        SB_RT->>P1: 相手盤面描画
    end
    
    Note over P1,P2: === お邪魔ぷよ ===
    P1->>SB_RT: broadcast "garbage"<br/>{count: score÷70}
    SB_RT->>P2: お邪魔予告表示→落下
    
    Note over P1,P2: === 連鎖演出 ===
    P1->>SB_RT: broadcast "chain_animation"<br/>{chain_count, positions}
    SB_RT->>P2: 連鎖演出再生
    SB_RT->>OBS: 連鎖演出再生
    
    Note over P1,P2: === 状態管理 (Owner権威モデル) ===
    Note over P1: Owner: heartbeat 5秒間隔<br/>stateId={epoch, version}<br/>split-brain防止
    
    Note over P1,P2: === 再接続 ===
    P1--xSB_RT: 切断
    Note over P1: 30秒 grace period
    P1->>SB_RT: 再接続<br/>PRNG state復元
```

## 5. 技術スタック概要

```mermaid
graph LR
    subgraph "Frontend (Static)"
        HTML[HTML5 Pages]
        JS[Vanilla JavaScript]
        CSS[CSS3]
        PWA[PWA<br/>manifest.json + sw.js]
    end
    
    subgraph "Backend (Supabase)"
        PG[PostgreSQL<br/>RLS無効]
        RT[Realtime<br/>Broadcast/Presence]
        EF[Edge Functions<br/>Deno Runtime]
        AUTH[Anonymous Access<br/>API Key認証]
    end
    
    subgraph "Infrastructure"
        GHP[GitHub Pages<br/>静的ホスティング]
        GHA[GitHub Actions<br/>Cron: 5分毎Push配信<br/>Daily: バックアップ]
        DC[Discord Webhook<br/>管理者通知]
    end
    
    subgraph "通信プロトコル"
        REST[REST API<br/>CRUD操作]
        WS[WebSocket<br/>Realtime同期]
        PUSH_P[Web Push<br/>バックグラウンド通知]
        RTC[WebRTC<br/>P2P音声通話]
    end
    
    HTML --> GHP
    JS --> REST
    JS --> WS
    EF --> PUSH_P
    JS --> RTC
    GHA --> DC
    GHA --> PUSH_P
```

## 6. ゲームセンター 一覧

| ゲーム | ファイル | タイプ | DB使用 |
|--------|----------|--------|--------|
| ぴくぴく（ぷよぷよ） | game.html / puyo-battle.html | パズル（対戦あり） | game_rankings, puyo_battles |
| テトミン | tetris.html | 落ちものパズル | tetris_rankings |
| ピクミンブラスト | blast.html | 配置パズル | blast_rankings |
| オリマーの冒険 | olimar.html | 探索RPG | localStorage |
| すいかが食べたい | suika.html | 3D RPG | なし |
| すいか原作Java版 | suika-original.html | Java Applet | なし |
| 算数オリンピック | math-olympiad.html | 学習 | math_olympiad_answers |
| 漢字50問テスト | kanji-test.html | 学習 | game_settings |
| クトゥルフTRPG | trpg-cthulhu.html | TRPG（admin限定） | なし |
| ごきぶりポーカー | cockroach-poker.html | カードゲーム（CPU対戦） | なし |
| クアルト | quarto.html | ボードゲーム（2人） | なし |
| コリドール | quoridor.html | ボードゲーム（2人） | なし |
| 神経衰弱 | memory-game.html | 記憶力カードゲーム | memory_rankings |
| ブロックス | blokus.html | ボードゲーム（1-4人、CPU対戦） | blokus_rankings |
