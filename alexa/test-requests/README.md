# Alexa テスト用 JSON リクエスト

ネットワーク制限で Alexaシミュレータ（音声）が使えない場合、
テストタブの「JSONエディタ」にこれらのJSONを貼り付けて送信することで、
Lambda を直接テストできます。

## 使い方

1. Alexa Developer Console → 「テスト」タブ
2. 上部で「JSONエディタ」を選択
3. 下記のいずれかのJSONを貼り付け
4. 「送信」ボタンをクリック
5. 右側に応答JSONが表示される（`outputSpeech.ssml` に読み上げ内容）

## スロット値の変え方

`slots` の各 `value` を書き換えるだけ。
- `childName.value`: りょうすけ / めぐみ / はるちか / かいせい / いろは
- `choreName.value`: 洗濯機回し / 料理 / ゴミ出し / トイレ掃除 / タオル畳み など
- `pointsCount.value`: 数値（文字列で指定）

## ファイル一覧

| ファイル | テスト内容 |
|----------|-----------|
| `launch.json` | スキル起動（LaunchRequest） |
| `chore-points.json` | ポイント申請（はるちか・タオル畳み・5pt） |
| `chore-points-default.json` | ポイント申請（デフォルトpt、料理） |
| `check-balance.json` | 残高確認（めぐみ） |
| `check-broadcast.json` | メッセージ確認 |
| `reply-ok.json` | 了解返事 |
