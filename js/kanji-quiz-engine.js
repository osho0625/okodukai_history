// QuizEngine - 出題・回答・採点ロジック（純粋関数。DOM非依存・localStorage非依存）
(function() {
'use strict';

// --- ヘルパー ---

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

/**
 * Fisher-Yates シャッフル（配列のコピーを返す）
 * @param {any[]} array
 * @returns {any[]} シャッフルされた新しい配列
 */
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- 出題 ---

/**
 * クイズセッションを開始する
 * 全エントリをシャッフルし、先頭min(entries.length, 50)個を選出
 * @param {object[]} entries - KanjiEntry配列
 * @param {'test' | 'practice'} mode - テストモード or 練習モード
 * @returns {object} QuizSession
 */
function startQuiz(entries, mode) {
  const shuffled = shuffle(entries);
  const selected = shuffled.slice(0, Math.min(shuffled.length, 50));

  const questions = selected.map(entry => ({
    entryId: entry.id,
    reading: entry.reading,
    correctAnswer: entry.answer,
    userAnswer: null,
    answerType: null,
    status: 'unanswered',
    result: null,
  }));

  return {
    id: generateId(),
    rangeId: entries.length > 0 ? entries[0].rangeId : '',
    rangeName: '',
    mode: mode,
    questions: questions,
    currentIndex: 0,
    phase: 'answering',
    startedAt: new Date().toISOString(),
  };
}

// --- 回答記録 ---

/**
 * テキスト回答を記録する
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @param {string} answer - 回答テキスト
 * @returns {object} 更新されたQuizSession
 */
function submitAnswer(session, index, answer) {
  const questions = session.questions.slice();
  questions[index] = {
    ...questions[index],
    userAnswer: answer,
    answerType: 'text',
    status: 'answered',
  };
  return { ...session, questions };
}

/**
 * 手書き回答を記録する（ストロークデータはUI層が管理）
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @returns {object} 更新されたQuizSession
 */
function submitHandwritingAnswer(session, index) {
  const questions = session.questions.slice();
  questions[index] = {
    ...questions[index],
    answerType: 'handwriting',
    status: 'answered',
  };
  return { ...session, questions };
}

/**
 * 問題をスキップする
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @returns {object} 更新されたQuizSession
 */
function skipQuestion(session, index) {
  const questions = session.questions.slice();
  questions[index] = {
    ...questions[index],
    status: 'skipped',
  };
  return { ...session, questions };
}

/**
 * 「答えを見る」（練習モード用）
 * 不正解として記録する
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @returns {object} 更新されたQuizSession
 */
function showAnswer(session, index) {
  const questions = session.questions.slice();
  questions[index] = {
    ...questions[index],
    status: 'shown',
    result: 'incorrect',
  };
  return { ...session, questions };
}

/**
 * Self_Check結果を記録する（練習モード手書き回答用）
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @param {boolean} isCorrect - 正解かどうか
 * @returns {object} 更新されたQuizSession
 */
function selfCheck(session, index, isCorrect) {
  const questions = session.questions.slice();
  questions[index] = {
    ...questions[index],
    result: isCorrect ? 'correct' : 'incorrect',
  };
  return { ...session, questions };
}

// --- 採点 ---

/**
 * テキスト回答を採点する（文字列完全一致）
 * @param {string} answer - ユーザーの回答
 * @param {string} correctAnswer - 正解
 * @returns {boolean} 正解ならtrue
 */
function gradeTextAnswer(answer, correctAnswer) {
  return answer === correctAnswer;
}

// --- 結果計算 (Task 2.5) ---

/**
 * テスト結果を計算する
 * 全問題にfinal result（correct/incorrect/skipped）が存在する場合のみ有効
 * pending_gradingが残っている場合は使用不可
 * @param {object} session - QuizSession（全問題がresult確定済み）
 * @returns {object} TestResult
 */
function calculateResult(session) {
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const questionResults = session.questions.map(q => {
    let result;
    if (q.status === 'skipped') {
      result = 'skipped';
      skippedCount++;
    } else if (q.result === 'correct') {
      result = 'correct';
      correctCount++;
    } else {
      result = 'incorrect';
      incorrectCount++;
    }

    return {
      entryId: q.entryId,
      reading: q.reading,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer,
      result: result,
    };
  });

  const totalCount = session.questions.length;
  const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  return {
    id: generateId(),
    rangeId: session.rangeId,
    rangeName: session.rangeName,
    mode: session.mode,
    questions: questionResults,
    correctCount: correctCount,
    incorrectCount: incorrectCount,
    skippedCount: skippedCount,
    totalCount: totalCount,
    score: score,
    completedAt: new Date().toISOString(),
  };
}

/**
 * テストモード完了処理
 * - テキスト回答を自動採点
 * - 手書き回答はpending_gradingとしてマーク
 * - 結果に応じてPendingGradingTestまたはTestResultを返す
 * @param {object} session - QuizSession（phase='review'または全問完了）
 * @returns {object} { pendingTest, strokesStore, testResult }
 */
function finishTestMode(session) {
  // 各問題を採点処理
  const gradedQuestions = session.questions.map(q => {
    if (q.status === 'skipped') {
      return { ...q, result: 'incorrect' };
    }
    if (q.status === 'shown') {
      // 「答えを見る」は既にresult='incorrect'
      return q;
    }
    if (q.answerType === 'text') {
      const isCorrect = gradeTextAnswer(q.userAnswer, q.correctAnswer);
      return { ...q, result: isCorrect ? 'correct' : 'incorrect' };
    }
    if (q.answerType === 'handwriting') {
      return { ...q, result: 'pending_grading' };
    }
    // unanswered扱い（通常ここには来ない）
    return { ...q, result: 'incorrect' };
  });

  const hasPendingGrading = gradedQuestions.some(q => q.result === 'pending_grading');

  if (hasPendingGrading) {
    // 手書き回答が含まれる → PendingGradingTestを生成
    let textGradedCorrect = 0;
    let textGradedIncorrect = 0;
    let skippedCount = 0;

    const pendingQuestions = gradedQuestions.map(q => {
      let result;
      if (q.status === 'skipped') {
        result = 'skipped';
        skippedCount++;
      } else if (q.result === 'pending_grading') {
        result = 'pending_grading';
      } else if (q.result === 'correct') {
        result = 'correct';
        textGradedCorrect++;
      } else {
        result = 'incorrect';
        textGradedIncorrect++;
      }

      return {
        entryId: q.entryId,
        reading: q.reading,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        hasHandwritingAnswer: q.answerType === 'handwriting',
        result: result,
      };
    });

    const pendingTest = {
      id: generateId(),
      rangeId: session.rangeId,
      rangeName: session.rangeName,
      questions: pendingQuestions,
      totalCount: gradedQuestions.length,
      textGradedCorrect: textGradedCorrect,
      textGradedIncorrect: textGradedIncorrect,
      skippedCount: skippedCount,
      completedAt: new Date().toISOString(),
    };

    return {
      pendingTest: pendingTest,
      strokesStore: null,  // ストロークはUI層が管理
      testResult: null,
    };
  } else {
    // テキストのみ → 即TestResult生成
    const gradedSession = { ...session, questions: gradedQuestions };
    const testResult = calculateResult(gradedSession);

    return {
      pendingTest: null,
      strokesStore: null,
      testResult: testResult,
    };
  }
}

/**
 * Review Phase用の問題一覧を生成する
 * @param {object} session - QuizSession
 * @returns {object[]} ReviewItem配列
 */
function getReviewList(session) {
  return session.questions.map((q, index) => ({
    index: index,
    reading: q.reading,
    userAnswer: q.userAnswer,
    hasStrokes: q.answerType === 'handwriting',
    status: q.status,
  }));
}

/**
 * Review Phaseでテキスト回答を修正する
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @param {string} answer - 新しい回答テキスト
 * @returns {object} 更新されたQuizSession
 */
function updateAnswer(session, index, answer) {
  return submitAnswer(session, index, answer);
}

/**
 * Review Phaseで手書き回答を書き直す
 * @param {object} session - QuizSession
 * @param {number} index - 問題インデックス
 * @returns {object} 更新されたQuizSession
 */
function updateHandwritingAnswer(session, index) {
  return submitHandwritingAnswer(session, index);
}

/**
 * 不正解・スキップ問題のentryIdリストを取得する（リトライ用）
 * @param {object} result - TestResult
 * @returns {string[]} entryId配列
 */
function getRetryEntries(result) {
  return result.questions
    .filter(q => q.result === 'incorrect' || q.result === 'skipped')
    .map(q => q.entryId);
}

// --- エクスポート ---

var _exports = {
  startQuiz: startQuiz, submitAnswer: submitAnswer, submitHandwritingAnswer: submitHandwritingAnswer,
  skipQuestion: skipQuestion, showAnswer: showAnswer, selfCheck: selfCheck, gradeTextAnswer: gradeTextAnswer,
  calculateResult: calculateResult, finishTestMode: finishTestMode, getReviewList: getReviewList,
  updateAnswer: updateAnswer, updateHandwritingAnswer: updateHandwritingAnswer, getRetryEntries: getRetryEntries,
  _shuffle: shuffle, _generateId: generateId,
};
if (typeof module !== 'undefined' && module.exports) { module.exports = _exports; }
if (typeof window !== 'undefined') { window.QuizEngine = _exports; }
})();
