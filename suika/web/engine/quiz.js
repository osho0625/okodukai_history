// quiz.js — Quiz mini-game (ported from CQuiz/CQuizData)
// 4-choice quiz with timer, 4 questions per round

// Quiz data: [question1, question2, answer(correct), wrong1, wrong2, wrong3] × many
const QUIZ_DATA = [
  ['「秋刀魚」','さて、なんと読む？','さんま','あじ','たちうお','かます'],
  ['「こころ」「夢十夜」の筆者は？','','夏目漱石','宮沢賢治','樋口一葉','森崎外'],
  ['不意の出来事に驚くことを、寝耳に何という？','','水','声','ミミズ','足'],
  ['周囲を敵や反対者に囲まれて、助けがない','ことを、漢字４文字で何という？','四面楚歌','烏合之衆','傍若無人','天涯孤独'],
  ['「海豚」','さて、なんと読む？','いるか','あしか','とど','あざらし'],
  ['「舞姫」「雁」の筆者は？','','森崎外','正岡子規','泉鏡花','芥川竜之介'],
  ['何もしないまま、ただ手をこまねいて見ている','ことを、漢字４文字で何という？','無為無策','無我夢中','無知蒙昧','無念無想'],
  ['蓼食う虫もすきずき。','「蓼」って何と読む？','たで','ねぎ','ざざ','ぎょく'],
  ['９９＋９９＝？','','１９８','１９９','２０９','１８８'],
  ['２＋３×４＝？','','１４','２０','２４','９'],
  ['平行四辺形の面積を求める公式は？','','底辺×高さ','底辺×高さ÷２','（上底＋下底）×高さ÷２','（上底＋下底）×高さ'],
  ['「ヒトナミニオゴレヤ」','これってルートいくつ？','ルート３','ルート２','ルート４','ルート５'],
  ['正三角形の１つの角度は何度？','','６０度','４５度','７５度','３０度'],
  ['９９×９９＝？','','９８０１','９９９９','９９８１','９８０９'],
  ['２５％っていったら、何分の１？','','４分の１','３分の１','５分の１','６分の１'],
  ['２６と６５の最大公約数は？','','１３','７','３','１９'],
  ['伊豆半島があるのは何県？','','静岡県','神奈川県','奈良県','鹿児島県'],
  ['オーストラリアの首都は？','','キャンベラ','ウィーン','ザルツブルク','シドニー'],
  ['オーストリアの首都は？','','ウィーン','キャンベラ','ザルツブルク','シドニー'],
  ['東京都の県庁所在地はどこ？','','新宿','東京','上野','赤坂'],
  ['世界で１番広い砂漠は？','','サハラ砂漠','鳥取砂丘','ゴビ砂漠','ナミブ砂漠'],
  ['日本で１番広い湖は琵琶湖。','では、２番目に広い湖は？','霞ヶ浦','善福寺池','猪苗代湖','サロマ湖'],
  ['日本で１番高い山は、もちろん富士山。','では、２番目に高い山は？','北岳','高尾山','奥穂高岳','立山'],
  ['このゲームは何てプログラム','言語で開発されている？','Ｊａｖａ','ＪａｖａＳｃｒｉｐｔ','Ｆｌａｓｈ','Ｃ＋＋'],
  ['「＊」は何と読む？','','アスタリスク','チルダ','スラッシュ','シャープ'],
  ['１バイトって何ビット？','','８ビット','４ビット','１６ビット','３２ビット'],
  ['英語で「ソイソース」っていったら何のこと？','','醤油','味噌','みりん','ポン酢'],
  ['「マトン」って何の肉？','','羊','馬','豚','鶏'],
  ['枝豆が成長すると何になる？','','大豆','空豆','納豆','小豆'],
  ['英語で「テーブルテニス」といったら、','どんなスポーツ？','卓球','バドミントン','羽根つき','ボーリング'],
  ['英語で「ガーリック」っていったら何？','','にんにく','しょうが','からし','酢'],
  ['英語で「ピーコック」といったらどんな鳥？','','孔雀','スズメ','ダチョウ','文鳥'],
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

    if (this.input.isKeyDown('arrowup')) this.cursor = (this.cursor - 1 + 4) % 4;
    if (this.input.isKeyDown('arrowdown')) this.cursor = (this.cursor + 1) % 4;
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
    const labels = ['Ａ', 'Ｂ', 'Ｃ', 'Ｄ'];
    for (let i = 0; i < 4; i++) {
      const y = 110 + i * 40;
      ctx.fillStyle = i === this.cursor ? 'rgba(255,255,0,0.15)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(20, y - 12, 360, 32);
      ctx.fillStyle = i === this.cursor ? '#ff0' : '#ddd';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${labels[i]}：${this.shuffledAnswers[i]}`, 30, y + 8);
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
        ctx.fillText('全問正解！', 200, 160);
      } else if (this.result === 'fail') {
        ctx.fillStyle = '#f44';
        ctx.fillText('不正解...', 200, 160);
      } else if (this.result === 'timeout') {
        ctx.fillStyle = '#fa4';
        ctx.fillText('時間切れ！', 200, 160);
      } else {
        ctx.fillStyle = '#4f4';
        ctx.fillText('正解！', 200, 160);
      }
    }
  }
}
