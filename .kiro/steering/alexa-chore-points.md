---
inclusion: fileMatch
fileMatchPattern: "*alexa*"
---

# Alexa スキル: お手伝いポイント申請

## 概要

Echoデバイスから音声でお手伝いポイント申請・残高確認ができるAlexaカスタムスキル。
Alexa-hosted (Node.js) でホスティング。申請は `status: 'pending'` でINSERTされ、admin承認が必要。

- 呼び出し名: `お小遣い帳`
- スキルID: amzn1.ask.skill.915d14f9-4d31-40cd-90f3-3db18fb2cb10
- ホスティング: Alexa-hosted (Node.js)、リージョン: 米国東部
- Alexa Developer Console: https://developer.amazon.com/alexa/console/ask

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `alexa/README.md` | 概要説明 |
| `alexa/SETUP_GUIDE.md` | テスト〜本番運用の手順書 |
| `alexa/skill.json` | スキルマニフェスト（参考用） |
| `alexa/interactionModels/ja-JP.json` | 対話モデル（JSON Editor に貼る） |
| `alexa/lambda/index.js` | Lambda コード（Alexa Console の lambda/index.js に貼る） |
| `alexa/lambda/package.json` | 依存定義（参考用、Alexa-hosted のデフォルトを使う） |

## Intent 一覧

| Intent | スロット | 用途 |
|--------|---------|------|
| `RequestChorePointsIntent` | childName (CHILD_NAME), choreName (CHORE_NAME), pointsCount (AMAZON.NUMBER) | ポイント申請 |
| `CheckBalanceIntent` | childName (CHILD_NAME) | 残高確認 |
| `CheckBroadcastIntent` | - | 未読メッセージ確認（おうちブロードキャスト） |
| `ReplyOkIntent` | - | メッセージに返事（了解等） |
| `AMAZON.HelpIntent` | - | 使い方説明 |
| `AMAZON.StopIntent` / `AMAZON.CancelIntent` | - | 終了 |
| `AMAZON.FallbackIntent` | - | 聞き取れなかった時 |

## カスタムスロット

### CHILD_NAME
children テーブルの name に対応。synonyms で読み仮名・漢字・誤認識音も吸収。

| 値 | シノニム例 |
|----|-----------|
| りょうすけ | リョウスケ、亮介 |
| めぐみ | メグミ、恵 |
| はるちか | ハルチカ、春親、はるちゃん、しゅんちか、しゅんおや、はるおや |
| かいせい | カイセイ、海生、かいちゃん |
| いろは | イロハ、彩葉、いろちゃん |

### 音声誤認識の補正

「はるちか」が「しゅんちか」「しゅんおや」等に誤認識される問題への2段構え対策:
1. 対話モデル: CHILD_NAME の synonyms に誤認識音を登録 → 正しい値に正規化
2. コード: `normalizeChildName()` + `CHILD_NAME_ALIASES` でsynonymsをすり抜けた誤認識も補正

新しい誤認識パターンが見つかったら、synonyms と `CHILD_NAME_ALIASES` の両方に追加する。

### CHORE_NAME
家事名。synonyms で別の言い方も認識。

| 値 | シノニム |
|----|---------|
| 洗濯機回し | 洗濯回し、洗濯機まわし |
| 洗濯機畳み | 洗濯畳み、洗濯たたみ |
| 料理 | ごはん、りょうり、ご飯作り |
| 掃除機 | そうじき、掃除 |
| ゴミ出し | ゴミ捨て、ごみ出し |
| ゴミまとめ | ごみまとめ、ゴミ集め |
| 片付け | かたづけ、お片付け |
| トイレ掃除 | トイレ |
| 生ごみ | なまごみ、生ゴミ |
| 牛乳パック開き | 牛乳パック、パック開き |
| タオル畳み | タオルたたみ |
| その他 | そのた |

## デフォルトポイント表

コード内 `DEFAULT_POINTS` で定義。発話でポイント数を指定しなかった場合に使用。

| 家事 | pt |
|------|----|
| 洗濯機回し | 1 |
| 洗濯機畳み | 8 |
| 料理 | 3 |
| 掃除機 | 2 |
| ゴミ出し | 2 |
| ゴミまとめ | 2 |
| 片付け | 2 |
| トイレ掃除 | 6 |
| 生ごみ | 1 |
| 牛乳パック開き | 1 |
| その他 | 1 |

## ポイント数決定の優先順位

1. 発話で数値指定（1〜100）→ その値
2. `DEFAULT_POINTS` テーブルにマッチ → その値
3. Supabase `chore_types` テーブルにマッチ → `default_points`
4. いずれにもマッチしない → 1pt

## 家事名省略時の挙動

`choreName` スロットが空の場合、自動的に「その他」（1pt）として申請される。
例: 「はるちかに5ポイント」→ その他 5pt

## 通知フロー

ポイント申請時:
1. `chore_points` に INSERT (`status: 'pending'`)
2. Discord Webhook に `🎤 Alexa申請: ...` を送信
3. `push_messages` に admin 向け Push通知をキュー

## デプロイ時の注意

- Git リポジトリの `alexa/lambda/index.js` は `process.env` で環境変数を参照
- Alexa-hosted では環境変数が使えないため、Alexa Console 上では直書きに変更する
- `lambda/package.json` は Alexa-hosted のデフォルトのまま触らない（壊れる原因）
- 対話モデル変更後は「モデルを保存」→「モデルをビルド」を忘れない
- コード変更後は「Deploy」ボタンを押す（ビルドとは別、コード反映に必須）

### 🔴 Node.js 旧ランタイム制約（重要）

Alexa-hosted の Node.js ランタイムは古い（Node 16系）ため、以下が使えない:
- オプショナルチェイニング `?.` → `&&` で書く（`slots.x && slots.x.value`）
- Null合体 `??` → 使わない
- グローバル `fetch` → 使えない。`https` モジュールで自前実装（`httpRequest` ヘルパー参照）

これらを使うとデプロイは成功するが Lambda 起動時に構文エラー → `No resource endpoint found` になり、全発話が「お役に立てません」になる。

## テスト方法

### JSONエディタ経由（推奨・ネットワーク制限回避）

会社VPN/プロキシ下では Alexaシミュレータ（音声）が `avs-alexa-fe.amazon.com` へのCORSでブロックされ動かない。
その場合は テストタブ →「JSONエディタ」に `alexa/test-requests/*.json` を貼って送信することで Lambda を直接テスト可能。

| ファイル | 内容 |
|----------|------|
| `alexa/test-requests/launch.json` | スキル起動（疎通確認） |
| `alexa/test-requests/chore-points.json` | ポイント申請 |
| `alexa/test-requests/chore-points-default.json` | デフォルトpt申請 |
| `alexa/test-requests/check-balance.json` | 残高確認 |
| `alexa/test-requests/check-broadcast.json` | メッセージ確認 |
| `alexa/test-requests/reply-ok.json` | 了解返事 |

### 実機Echo

同じAmazonアカウントのEchoなら開発中スキルが自動で使える。自宅WiFiならネットワーク制限なく音声で動作。

## ブロードキャスト機能（メッセージ確認・了解返事）

親からの音声メッセージへの返事機能。`alexa_messages` テーブルを使用。
- `CheckBroadcastIntent`: 未返事メッセージを読み上げ（direction=to_alexa, replied=false）
- `ReplyOkIntent`: 「了解」で返事（replied=true に更新 + Discord/Push通知）
- テーブルが未作成の場合、これらのIntentのみエラー（ポイント申請には影響なし）

## 発話例

| 発話 | 結果 |
|------|------|
| アレクサ、お小遣い帳を開いて | スキル起動 |
| りょうすけの料理 | 料理 3pt 申請 |
| はるちかにゴミ捨て2ポイント | ゴミ出し 2pt 申請 |
| かいせいに5ポイント | その他 5pt 申請 |
| めぐみの残高 | 残高読み上げ |
| メッセージ確認 | 未読ブロードキャスト読み上げ |
| 分かった / 了解 / OK | 最新メッセージに返事（admin通知） |

## 新しいスキルを追加する際のテンプレート

新しいAlexaスキルを追加する場合:
1. `alexa/` 配下にスキル名のフォルダを作成（例: `alexa/reminder-skill/`）
2. 対話モデル・Lambda コード・README を配置
3. `.kiro/steering/` に専用の steering ファイルを作成（このファイルを参考に）
4. `CONTEXT.md` の機能一覧に追記
5. `alexa/README.md` にスキル一覧として追記
