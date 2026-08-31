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

async function supabasePatch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Supabase PATCH failed: ${res.status}`);
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
  '生ごみ': 1,
  '牛乳パック開き': 1,
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
    const speech = 'お小遣い帳です。ポイント申請は「○○のお風呂掃除」、連絡確認は「メッセージ確認」と言ってね。';
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('何をしますか？ポイント申請、残高確認、メッセージ確認ができます。')
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
    const choreName = slots.choreName?.value || 'その他';
    const pointsCount = slots.pointsCount?.value ? parseInt(slots.pointsCount.value, 10) : null;

    if (!childName) {
      return handlerInput.responseBuilder
        .speak('名前が聞き取れませんでした。もう一度言ってください。')
        .reprompt('誰のお手伝いですか？')
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

// ============================================================
// ブロードキャスト関連 Intent Handlers
// ============================================================

const CheckBroadcastIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckBroadcastIntent';
  },
  async handle(handlerInput) {
    try {
      // 未返事のメッセージを取得（新しい順）
      const messages = await supabaseGet(
        'alexa_messages?direction=eq.to_alexa&replied=eq.false&order=created_at.desc&limit=5'
      );

      if (messages.length === 0) {
        return handlerInput.responseBuilder
          .speak('新しい連絡はありません。')
          .getResponse();
      }

      // 最新メッセージを読み上げ、返事を待つ
      const latest = messages[0];
      const count = messages.length;
      const countText = count > 1 ? `${count}件の連絡があります。最新のメッセージです。` : '1件連絡があります。';

      // セッション属性にメッセージIDを保存（返事用）
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.pendingMessageId = latest.id;
      sessionAttributes.pendingMessage = latest.message;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      const speech = `${countText}「${latest.message}」。分かったら「了解」と言ってね。`;
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt('「了解」と言うか、他のことを聞いてね。')
        .getResponse();

    } catch (err) {
      console.error('CheckBroadcast error:', err);
      return handlerInput.responseBuilder
        .speak('連絡の確認に失敗しました。')
        .getResponse();
    }
  }
};

const ReplyOkIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReplyOkIntent';
  },
  async handle(handlerInput) {
    try {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      const messageId = sessionAttributes.pendingMessageId;

      if (!messageId) {
        // セッションにメッセージがない場合、最新の未返事を取得して返事
        const messages = await supabaseGet(
          'alexa_messages?direction=eq.to_alexa&replied=eq.false&order=created_at.desc&limit=1'
        );
        if (messages.length === 0) {
          return handlerInput.responseBuilder
            .speak('返事する連絡がありません。')
            .getResponse();
        }
        // 最新メッセージに返事
        await supabasePatch(
          `alexa_messages?id=eq.${messages[0].id}`,
          { replied: true, reply_text: '了解', replied_at: new Date().toISOString() }
        );

        // 通知送信
        await sendDiscord(`✅ Alexa返事: 「${messages[0].message}」に了解`);
        await queuePushMessage('✅ Alexa返事', `「${messages[0].message}」に了解しました`, 'admin');

        return handlerInput.responseBuilder
          .speak(`「${messages[0].message}」に了解しました。伝えておくね！`)
          .getResponse();
      }

      // セッション内のメッセージに返事
      await supabasePatch(
        `alexa_messages?id=eq.${messageId}`,
        { replied: true, reply_text: '了解', replied_at: new Date().toISOString() }
      );

      const originalMsg = sessionAttributes.pendingMessage || 'メッセージ';

      // 通知送信
      await sendDiscord(`✅ Alexa返事: 「${originalMsg}」に了解`);
      await queuePushMessage('✅ Alexa返事', `「${originalMsg}」に了解しました`, 'admin');

      // セッション属性クリア
      delete sessionAttributes.pendingMessageId;
      delete sessionAttributes.pendingMessage;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(`了解！「${originalMsg}」に返事しておいたよ。`)
        .getResponse();

    } catch (err) {
      console.error('ReplyOk error:', err);
      return handlerInput.responseBuilder
        .speak('返事の送信に失敗しました。もう一回言ってみて。')
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
    const speech = '「りょうすけのお風呂掃除」でポイント申請、「めぐみの残高」で残高確認、「メッセージ確認」で連絡を聞けます。了解って言えば返事もできるよ。';
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
    CheckBroadcastIntentHandler,
    ReplyOkIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
