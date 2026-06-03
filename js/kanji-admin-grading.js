// AdminGrading - 管理者採点ロジック（DOM非依存）
// localStorage キー: kanji_pending_tests, kanji_pending_strokes_{id}, kanji_test_results

const _KanjiStorageAG = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
const { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } = _KanjiStorageAG;

const PENDING_TESTS_KEY = 'kanji_pending_tests';
const PENDING_STROKES_PREFIX = 'kanji_pending_strokes_';
const TEST_RESULTS_KEY = 'kanji_test_results';

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

// --- 未採点テスト管理 ---

/**
 * 未採点テスト一覧を取得する
 * @returns {object[]} PendingGradingTest配列
 */
function getPendingTests() {
  return loadFromLocalStorage(PENDING_TESTS_KEY) || [];
}

/**
 * 個別問題を採点する
 * PendingQuestion.resultを 'pending_grading' から 'correct' / 'incorrect' に書き換え
 * @param {string} pendingTestId - 未採点テストID
 * @param {number} questionIndex - 問題インデックス
 * @param {boolean} isCorrect - 正解かどうか
 * @returns {boolean} 成功時true
 */
function gradeQuestion(pendingTestId, questionIndex, isCorrect) {
  const tests = getPendingTests();
  const testIndex = tests.findIndex(t => t.id === pendingTestId);
  if (testIndex === -1) return false;

  const test = tests[testIndex];
  if (questionIndex < 0 || questionIndex >= test.questions.length) return false;

  const question = test.questions[questionIndex];
  if (question.result !== 'pending_grading') return false;

  test.questions[questionIndex].result = isCorrect ? 'correct' : 'incorrect';
  saveToLocalStorage(PENDING_TESTS_KEY, tests);

  return true;
}

/**
 * 全pending_grading問題が採点済みか判定する
 * @param {string} pendingTestId - 未採点テストID
 * @returns {boolean} 全問採点済みならtrue
 */
function isAllGraded(pendingTestId) {
  const tests = getPendingTests();
  const test = tests.find(t => t.id === pendingTestId);
  if (!test) return false;

  return !test.questions.some(q => q.result === 'pending_grading');
}

/**
 * 全問採点完了→TestResult生成、PendingGradingTest削除、StrokesStore削除
 * 前提条件: isAllGraded(pendingTestId) === true
 * @param {string} pendingTestId - 未採点テストID
 * @returns {object} TestResult
 * @throws {Error} 未採点問題が残っている場合
 */
function finishGrading(pendingTestId) {
  if (!isAllGraded(pendingTestId)) {
    throw new Error('未採点の問題が残っています');
  }

  const tests = getPendingTests();
  const testIndex = tests.findIndex(t => t.id === pendingTestId);
  if (testIndex === -1) {
    throw new Error('指定されたテストが見つかりません');
  }

  const pendingTest = tests[testIndex];

  // TestResult生成
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const questionResults = pendingTest.questions.map(q => {
    let result;
    if (q.result === 'correct') {
      result = 'correct';
      correctCount++;
    } else if (q.result === 'skipped') {
      result = 'skipped';
      skippedCount++;
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

  const totalCount = pendingTest.totalCount;
  const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  const testResult = {
    id: generateId(),
    rangeId: pendingTest.rangeId,
    rangeName: pendingTest.rangeName,
    mode: 'test',
    questions: questionResults,
    correctCount: correctCount,
    incorrectCount: incorrectCount,
    skippedCount: skippedCount,
    totalCount: totalCount,
    score: score,
    completedAt: new Date().toISOString(),
  };

  // PendingGradingTest削除
  tests.splice(testIndex, 1);
  saveToLocalStorage(PENDING_TESTS_KEY, tests);

  // StrokesStore削除
  removeFromLocalStorage(PENDING_STROKES_PREFIX + pendingTestId);

  // TestResult追加
  const results = loadFromLocalStorage(TEST_RESULTS_KEY) || [];
  results.push(testResult);
  saveToLocalStorage(TEST_RESULTS_KEY, results);

  return testResult;
}

/**
 * 採点済みテスト結果一覧を取得する
 * @returns {object[]} TestResult配列
 */
function getTestResults() {
  return loadFromLocalStorage(TEST_RESULTS_KEY) || [];
}

// --- エクスポート ---

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPendingTests,
    gradeQuestion,
    isAllGraded,
    finishGrading,
    getTestResults,
    _PENDING_TESTS_KEY: PENDING_TESTS_KEY,
    _PENDING_STROKES_PREFIX: PENDING_STROKES_PREFIX,
    _TEST_RESULTS_KEY: TEST_RESULTS_KEY,
  };
}
if (typeof window !== 'undefined') {
  window.AdminGrading = {
    getPendingTests, gradeQuestion, isAllGraded, finishGrading, getTestResults,
    PENDING_TESTS_KEY, PENDING_STROKES_PREFIX, TEST_RESULTS_KEY,
  };
}
