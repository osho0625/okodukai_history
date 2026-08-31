// Alexa お手伝いポイント申請スキル Lambda ハンドラー
// 環境変数: SUPABASE_URL, SUPABASE_KEY, DISCORD_WEBHOOK

const Alexa = require('ask-sdk-core');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

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
// デフォルトポイント表（Alexaスキル内定義）
// ============================================================

const DEFAULT_POINTS = {
  '洗濯機回し': 1,
  '洗濯機畳み': 8,
  '料理': 3,
  '掃除機': 2,
  'ゴミ出し': 2,
  'ゴミまとめ': 2,
  '片付け': 2,
  'トイレ掃除': 6,
  'その他': 1
};

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
    const pointsCount = slots.pointsCount?.value ? parseInt(slots.pointsCount.value, 10) : null;

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

      // ポイント数決定: 発話指定 > デフォルトポイント表 > 家事マスタDB > 1pt
      let points;
      if (pointsCount && pointsCount > 0 && pointsCount <= 100) {
        points = pointsCount;
      } else if (DEFAULT_POINTS[choreName] !== undefined) {
        points = DEFAULT_POINTS[choreName];
      } else {
        const choreTypes = await supabaseGet(`chore_types?name=eq.${encodeURIComponent(choreName)}&select=name,default_points`);
        points = choreTypes.length > 0 ? choreTypes[0].default_points : 1;
      }

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
