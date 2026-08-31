# Alexa お小遣い帳スキル セットアップガイド

## 前提条件

- Amazon Developer アカウント（Echo と同じアカウント）
- Alexa Developer Console: https://developer.amazon.com/alexa/console/ask
- 自宅ネットワーク（会社VPN/プロキシ下ではテストシミュレータが動かない）

---

## ステップ1: スキルを作成する

1. Alexa Developer Console を開く
2. 「スキルの作成」をクリック
3. 以下を設定：
   - スキル名: `お小遣い帳`
   - デフォルトの言語: `日本語`
   - モデル: `カスタム`
   - バックエンドリソース: `Alexa-hosted (Node.js)`
   - ホスティングリージョン: `米国東部（バージニア北部）`
   - テンプレート: `Hello World Skill`
4. 「スキルを作成」をクリック → 作成完了まで1-2分待つ

---

## ステップ2: 対話モデルを設定する

1. 「ビルド」タブをクリック
2. 左メニューの「呼び出し名」（Invocation）をクリック
3. 呼び出し名に `お小遣い帳` と入力
4. 左メニュー下部の「JSON エディター」をクリック
5. 既存の JSON を全選択（Ctrl+A）して削除
6. `alexa/interactionModels/ja-JP.json` の中身を丸ごと貼り付け
7. 「モデルを保存」をクリック
8. 「モデルをビルド」をクリック → 完了メッセージが出るまで待つ（30秒〜1分）

---

## ステップ3: コードをデプロイする

1. 「コード」タブをクリック
2. 左のファイルツリーで `lambda/index.js` をクリック
3. 既存のコードを全選択（Ctrl+A）して削除
4. 以下のコードを貼り付ける（環境変数を直書きしたバージョン）:

```javascript
const Alexa = require('ask-sdk-core');

const SUPABASE_URL = 'https://ynecezxnltigplrfzzoh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4';
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1498552364905529355/6I3vultTaQcYNRjPP76ZtyyyGLG1JWdU7eX3IfMtpGCUWR3sdw2Gn3_pNxHgaS-z9iyG';

// ============================================================
// Supabase ヘルパー
// ============================================================

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  return res.json();
}

async function supabasePost(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Supabase POST failed: ${res.status}`);
}

async function sendDiscord(message) {
  if (!DISCORD_WEBHOOK) return;
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  });
}

async function queuePushMessage(title, body, targetRole) {
  await supabasePost('push_messages', {
    target_role: targetRole,
    title,
    body,
    sent: false
  });
}

// ============================================================
// Intent Handlers
// ============================================================

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speech = 'お小遣い帳です。「○○のお風呂掃除」のように、名前と家事を言ってください。';
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('誰の、何のお手伝いですか？')
      .getResponse();
  }
};

const RequestChorePointsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RequestChorePointsIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const childName = slots.childName?.value;
    const choreName = slots.choreName?.value;

    if (!childName || !choreName) {
      return handlerInput.responseBuilder
        .speak('名前と家事が聞き取れませんでした。もう一度言ってください。')
        .reprompt('誰の、何のお手伝いですか？')
        .getResponse();
    }

    try {
      // 子供をDBから検索
      const children = await supabaseGet(`children?name=eq.${encodeURIComponent(childName)}&select=id,name`);
      if (children.length === 0) {
        return handlerInput.responseBuilder
          .speak(`${childName}さんが見つかりませんでした。`)
          .getResponse();
      }
      const child = children[0];

      // 家事マスタからポイント数を取得
      const choreTypes = await supabaseGet(`chore_types?name=eq.${encodeURIComponent(choreName)}&select=name,default_points`);
      const points = choreTypes.length > 0 ? choreTypes[0].default_points : 1;

      // chore_points に INSERT (status=pending)
      await supabasePost('chore_points', {
        child_id: child.id,
        chore_name: choreName,
        points: points,
        status: 'pending'
      });

      // Discord 通知
      await sendDiscord(`🎤 Alexa申請: ${childName}が「${choreName}」(${points}pt) を申請しました`);

      // Push通知キュー (admin向け)
      await queuePushMessage(
        '🎤 Alexa ポイント申請',
        `${childName}: ${choreName} (${points}pt)`,
        'admin'
      );

      const speech = `${childName}の${choreName}、${points}ポイントを申請しました。承認待ちです。`;
      return handlerInput.responseBuilder.speak(speech).getResponse();

    } catch (err) {
      console.error('RequestChorePoints error:', err);
      return handlerInput.responseBuilder
        .speak('エラーが発生しました。もう一度試してください。')
        .getResponse();
    }
  }
};

const CheckBalanceIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckBalanceIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const childName = slots.childName?.value;

    if (!childName) {
      return handlerInput.responseBuilder
        .speak('誰の残高を確認しますか？')
        .reprompt('名前を言ってください。')
        .getResponse();
    }

    try {
      const children = await supabaseGet(`children?name=eq.${encodeURIComponent(childName)}&select=name,balance`);
      if (children.length === 0) {
        return handlerInput.responseBuilder
          .speak(`${childName}さんが見つかりませんでした。`)
          .getResponse();
      }
      const child = children[0];
      const speech = `${childName}の残高は${child.balance}円です。`;
      return handlerInput.responseBuilder.speak(speech).getResponse();

    } catch (err) {
      console.error('CheckBalance error:', err);
      return handlerInput.responseBuilder
        .speak('残高の確認に失敗しました。')
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speech = '「りょうすけのお風呂掃除」のように名前と家事を言うと、ポイント申請できます。「めぐみの残高」で残高確認もできます。';
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('何をしますか？')
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak('バイバイ！').getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speech = 'ごめんなさい、わかりませんでした。「○○のお風呂掃除」のように言ってみてください。';
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('名前と家事を言ってください。')
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() { return true; },
  handle(handlerInput, error) {
    console.error('Error:', error);
    return handlerInput.responseBuilder
      .speak('エラーが起きちゃいました。もう一回言ってみて。')
      .getResponse();
  }
};

// ============================================================
// Skill Builder
// ============================================================

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    RequestChorePointsIntentHandler,
    CheckBalanceIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

5. `lambda/package.json` は触らない（Alexa-hosted のデフォルトのまま）
6. 画面上部の「Deploy」ボタンをクリック
7. 「Deployment was successful」と表示されるまで待つ

---

## ステップ4: テストする（シミュレータ）

1. 「テスト」タブをクリック
2. 上部のドロップダウンを「開発中」に変更
3. 言語ドロップダウンが「日本語」になっていることを確認
4. テキスト入力欄に以下を入力して Enter:

```
お小遣い帳を開いて
```

5. 期待される応答: 「お小遣い帳です。○○のお風呂掃除のように、名前と家事を言ってください。」

6. 続けて以下を入力:

```
りょうすけ の お風呂掃除
```

7. 期待される応答: 「りょうすけのお風呂掃除、○ポイントを申請しました。承認待ちです。」

8. Discord に通知が来ていることを確認

---

## ステップ5: 実機（Echo）でテストする

開発中のスキルは、同じ Amazon アカウントでログインしている Echo デバイスで自動的に使えます。

1. Echo に向かって「アレクサ、お小遣い帳を開いて」
2. 「りょうすけのお風呂掃除」と言う
3. 応答を確認

### 発話例

| やりたいこと | 言い方 |
|-------------|--------|
| スキル起動 | 「アレクサ、お小遣い帳を開いて」 |
| ポイント申請 | 「りょうすけの料理」（デフォルト3pt） |
| ポイント数を指定して申請 | 「はるちかにゴミ捨ての2ポイント追加」 |
| ポイント申請（1文で） | 「アレクサ、お小遣い帳で かいせい の 掃除機」 |
| 残高確認 | 「めぐみの残高」 |
| ヘルプ | 「ヘルプ」 |
| 終了 | 「終了」 |

### デフォルトポイント表

| 家事 | ポイント |
|------|---------|
| 洗濯機回し | 1pt |
| 洗濯機畳み | 8pt |
| 料理 | 3pt |
| 掃除機 | 2pt |
| ゴミ出し | 2pt |
| ゴミまとめ | 2pt |
| 片付け | 2pt |
| トイレ掃除 | 6pt |
| 生ごみ | 1pt |
| 牛乳パック開き | 1pt |
| その他 | 1pt |

※ ポイント数を発話で指定した場合はそちらが優先されます

---

## ステップ6: 家事名を追加する

家事マスタに合わせて対話モデルのスロット値を更新する場合：

1. 「ビルド」→「JSON エディター」を開く
2. `types` 配列の `CHORE_NAME` に値を追加:

```json
{ "name": { "value": "新しい家事名", "synonyms": ["別の言い方"] } }
```

3. 「モデルを保存」→「モデルをビルド」

※ コード側の変更は不要。chore_types テーブルにマッチする名前ならポイント数を自動取得、マッチしなければ1pt。

---

## ステップ7: 子供の名前を追加する

1. 「ビルド」→「JSON エディター」
2. `types` 配列の `CHILD_NAME` に値を追加:

```json
{ "name": { "value": "新しい名前" } }
```

3. 「モデルを保存」→「モデルをビルド」

---

## トラブルシューティング

### テストシミュレータで応答が来ない

| 原因 | 対処 |
|------|------|
| ネットワーク制限（会社VPN/プロキシ） | 自宅WiFi に切り替える。CORS エラーが出たらネットワーク環境の問題 |
| セキュリティソフトがブロック | 一時的に無効化して試す |
| ブラウザ拡張機能 | シークレットモードで試す |
| モデル未ビルド | 「ビルド」タブで「モデルをビルド」実行 |
| デプロイ未完了 | 「コード」タブで「Deploy」→ 緑メッセージ確認 |
| テストが「非公開」になっている | ドロップダウンを「開発中」に変更 |

### シミュレータをバイパスしてテストする方法

ネットワーク環境が原因でシミュレータが使えない場合、実機 Echo で直接テスト可能。Developer Console と同じ Amazon アカウントでログインしている Echo なら開発中スキルが自動で有効。

### 「○○さんが見つかりませんでした」と言われる

- Supabase の children テーブルの `name` カラムと、CHILD_NAME スロットの値が完全一致しているか確認
- 例: DB が「りょうすけ」ならスロットも「りょうすけ」（漢字/ひらがなの不一致に注意）

### 「エラーが起きちゃいました」と言われる

- Supabase の URL / Key が正しいか確認
- Lambda のログを確認: 「コード」タブ → 画面下部 → 「Amazon CloudWatch ログ」リンク
- `fetch` がタイムアウトしている場合、Lambda のタイムアウト設定を延長（デフォルト8秒 → 15秒推奨）

### ポイントは申請されたが Discord 通知が来ない

- DISCORD_WEBHOOK の URL が正しいか確認
- Discord の Webhook が削除されていないか確認（Discord サーバー設定 → 連携サービス → Webhook）

### Echo で「スキルが見つかりません」と言われる

- Developer Console のアカウントと Echo のアカウントが同一か確認
- Echo の Alexa アプリ → 設定 → デバイス → 言語が日本語になっているか確認
- スキルの言語が Japanese (JP) で作られているか確認

---

## 本番運用の注意点

- Alexa-hosted は審査なしで自分のデバイスで使える（公開しない限り）
- 公開する必要なし。家族の Echo で使うだけなら開発中のまま永久に使える
- Alexa-hosted の無料枠: 月100万リクエスト。家庭内利用なら余裕
- package.json は Alexa-hosted のデフォルトのまま触らないこと（壊れる原因）
- Supabase Key がコードに直書きされているが、Alexa-hosted のソースは外部公開されないので問題なし

---

## ファイル構成（参考）

```
alexa/
├── README.md                     # 概要説明
├── SETUP_GUIDE.md                # このファイル
├── skill.json                    # スキルマニフェスト（参考用）
├── interactionModels/
│   └── ja-JP.json                # 対話モデル（ビルドタブのJSONエディターに貼る）
└── lambda/
    ├── index.js                  # Lambda コード（コードタブの lambda/index.js に貼る）
    └── package.json              # 参考用（Alexa-hosted のデフォルトを使うこと）
```
