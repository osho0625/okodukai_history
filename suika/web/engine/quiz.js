// quiz.js  EQuiz mini-game (ported from CQuiz/CQuizData)
// 4-choice quiz with timer, 4 questions per round

// Quiz data: [question1, question2, answer(correct), wrong1, wrong2, wrong3] ÁEmany
const QUIZ_DATA = [
  ['「秋�E魚、E,'さて、なんと読む�E�E,'さんま','あじ','たちぁE��','かまぁE],
  ['「こころ」「夢十夜」�E筁E��E�E�E�E,'','夏目漱石','宮沢賢治','樋口一葁E,'森崎夁E],
  ['不意の出来事に驚くことを、寝耳に何とぁE���E�E,'','水','声','ミミズ','足'],
  ['周囲を敵めE��対老E��囲まれて、助けがなぁE,'ことを、漢字４文字で何とぁE���E�E,'四面楚歁E,'烏合之衁E,'傍若無人','天涯孤独'],
  ['「海豚、E,'さて、なんと読む�E�E,'ぁE��ぁE,'あしぁE,'とど','あざらし'],
  ['「�E姫」「雁」�E筁E��E�E�E�E,'','森崎夁E,'正岡子要E,'泉鏡花','芥川竜之仁E],
  ['何もしなぁE��ま、ただ手をこまねぁE��見てぁE��','ことを、漢字４文字で何とぁE���E�E,'無為無筁E,'無我夢中','無知蒙昧','無念無想'],
  ['蓼食う虫もすきずき、E,'「蓼」って何と読む�E�E,'たで','ねぁE,'ざざ','ぎょぁE],
  ['�E�９＋９９＝！E,'','�E�９！E,'�E�９！E,'�E�０！E,'�E�８！E],
  ['�E�＋３×４＝！E,'','�E�！E,'�E�！E,'�E�！E,'�E�E],
  ['平行四辺形の面積を求める�E式�E�E�E,'','底辺×高さ','底辺×高さ÷�E�E,'�E�上底＋下底）×高さ÷�E�E,'�E�上底＋下底）×高さ'],
  ['「ヒトナミニオゴレヤ、E,'これってルートいくつ�E�E,'ルート！E,'ルート！E,'ルート！E,'ルート！E],
  ['正三角形の�E�つの角度は何度�E�E,'','�E�０度','�E�５度','�E�５度','�E�０度'],
  ['�E�９×９９＝！E,'','�E�８０！E,'�E�９９！E,'�E�９８！E,'�E�８０！E],
  ['�E�５！E��てぁE��たら、何�Eの�E�！E,'','�E��Eの�E�E,'�E��Eの�E�E,'�E��Eの�E�E,'�E��Eの�E�E],
  ['�E�６と�E�５�E最大公紁E��は�E�E,'','�E�！E,'�E�E,'�E�E,'�E�！E],
  ['伊豁E��島がある�Eは何県�E�E,'','静岡省E,'神奈川県','奈良省E,'鹿児島省E],
  ['オーストラリアの首�Eは�E�E,'','キャンベラ','ウィーン','ザルチE��ルク','シドニー'],
  ['オーストリアの首�Eは�E�E,'','ウィーン','キャンベラ','ザルチE��ルク','シドニー'],
  ['東京都の県庁所在地はどこ！E,'','新宿','東京','上野','赤坁E],
  ['世界で�E�番庁E��砂漠は�E�E,'','サハラ砂漠','鳥取砂丁E,'ゴビ砂漠','ナミブ砂漠'],
  ['日本で�E�番庁E��湖�E琵琶湖、E,'では、E��番目に庁E��湖�E�E�E,'霞ヶ浦','喁E��寺池','猪苗代湁E,'サロマ湁E],
  ['日本で�E�番高い山は、もちろん富士山、E,'では、E��番目に高い山は�E�E,'北岳','高尾山','奥穂高岳','立山'],
  ['こ�Eゲームは何てプログラム','言語で開発されてぁE���E�E,'�E��E�E��ａE,'�E��E�E��ａE���E�E��ｉｐａE,'�E��E�ａE��ａE,'�E��E�！E],
  ['「＊」�E何と読む�E�E,'','アスタリスク','チルダ','スラチE��ュ','シャーチE],
  ['�E�バイトって何ビチE���E�E,'','�E�ビチE��','�E�ビチE��','�E�６ビチE��','�E�２ビチE��'],
  ['英語で「ソイソース」ってぁE��たら何�Eこと�E�E,'','醤油','味噁E,'みりん','ポン酢'],
  ['「�Eトン」って何�E肉！E,'','羁E,'馬','豁E,'鶁E],
  ['枝豁E��成長すると何になる！E,'','大豁E,'空豁E,'納豁E,'小豁E],
  ['英語で「テーブルチE��ス」とぁE��たら、E,'どんなスポ�EチE��E,'卓球','バドミントン','羽根つぁE,'ボ�Eリング'],
  ['英語で「ガーリチE��」ってぁE��たら何！E,'','にんにぁE,'しょぁE��','からぁE,'酢'],
  ['英語で「ピーコチE��」とぁE��たらどんな鳥�E�E,'','孔雀','スズメ','ダチョウ','斁E��'],
];

export class QuizUI {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.active = false;
    this.questions = [];
    this.currentQ = 0;
    this.cursor = 0;
    this.timer = 0;
    this.maxTime = 300; // frames (about 30 seconds at 11fps)
    this.correct = 0;
    this.result = null; // 'pass' or 'fail'
    this.resolve = null;
    this.shuffledAnswers = [];
    this.correctIdx = 0;
    this.showResult = 0;
  }

  start(difficulty) {
    this.active = true;
    this.currentQ = 0;
    this.correct = 0;
    this.result = null;
    this.showResult = 0;

    // Pick 4 random questions
    const indices = [];
    const pool = [...Array(QUIZ_DATA.length).keys()];
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(Math.random() * pool.length);
      indices.push(pool.splice(r, 1)[0]);
    }
    this.questions = indices.map(i => QUIZ_DATA[i]);
    this.setupQuestion();

    return new Promise(resolve => { this.resolve = resolve; });
  }

  setupQuestion() {
    const q = this.questions[this.currentQ];
    // Shuffle answers (correct is always index 0 in data)
    const answers = [q[2], q[3], q[4], q[5]];
    // Fisher-Yates shuffle
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    this.shuffledAnswers = answers;
    this.correctIdx = answers.indexOf(q[2]);
    this.cursor = 0;
    this.timer = this.maxTime;
  }

  update() {
    if (!this.active) return;

    if (this.showResult > 0) {
      this.showResult--;
      if (this.showResult === 0) {
        if (this.result) {
          this.finish();
        } else {
          this.currentQ++;
          if (this.currentQ >= 4) {
            this.result = 'pass';
            this.showResult = 40;
          } else {
            this.setupQuestion();
          }
        }
      }
      return;
    }

    this.timer--;
    if (this.timer <= 0) {
      // Time up = fail
      this.result = 'timeout';
      this.showResult = 40;
      return;
    }

    if (this.input.isUp()) this.cursor = (this.cursor - 1 + 4) % 4;
    if (this.input.isDown()) this.cursor = (this.cursor + 1) % 4;
    if (this.input.isOK()) {
      if (this.cursor === this.correctIdx) {
        this.correct++;
        this.showResult = 25;
      } else {
        this.result = 'fail';
        this.showResult = 40;
      }
    }
    if (this.input.isCancel()) {
      this.result = 'fail';
      this.finish();
    }
  }

  finish() {
    this.active = false;
    if (this.resolve) {
      this.resolve(this.result === 'pass');
      this.resolve = null;
    }
  }

  draw() {
    if (!this.active) return;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, 400, 320);

    // Title
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.currentQ + 1}問`, 200, 20);

    // Timer bar
    const timerRatio = this.timer / this.maxTime;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 28, 360, 6);
    ctx.fillStyle = timerRatio > 0.3 ? '#4c4' : '#c44';
    ctx.fillRect(20, 28, 360 * timerRatio, 6);

    // Question
    const q = this.questions[this.currentQ];
    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(q[0], 20, 60);
    if (q[1]) ctx.fillText(q[1], 20, 78);

    // Answers
    const labels = ['�E�', '�E�', '�E�', '�E�'];
    for (let i = 0; i < 4; i++) {
      const y = 110 + i * 40;
      ctx.fillStyle = i === this.cursor ? 'rgba(255,255,0,0.15)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(20, y - 12, 360, 32);
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#ddd';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${labels[i]}�E�E{this.shuffledAnswers[i]}`, 30, y + 8);
      if (i === this.cursor) {
        ctx.fillText('▶', 12, y + 8);
      }
    }

    // Result overlay
    if (this.showResult > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 400, 320);
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      if (this.result === 'pass') {
        ctx.fillStyle = '#4f4';
        ctx.fillText('全問正解�E�E, 200, 160);
      } else if (this.result === 'fail') {
        ctx.fillStyle = '#f44';
        ctx.fillText('不正解...', 200, 160);
      } else if (this.result === 'timeout') {
        ctx.fillStyle = '#fa4';
        ctx.fillText('時間刁E���E�E, 200, 160);
      } else {
        ctx.fillStyle = '#4f4';
        ctx.fillText('正解�E�E, 200, 160);
      }
    }
  }
}
