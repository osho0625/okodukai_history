// AdminGrading - 管理者採点ロジック（DOM非依存）
// localStorage キー: kanji_pending_tests, kanji_pending_strokes_{id}, kanji_test_results
(function() {
'use strict';

var _Storage = (typeof require !== 'undefined') ? require('./kanji-storage') : (window.KanjiStorage || {});
var _saveToLS = _Storage.saveToLocalStorage;
var _loadFromLS = _Storage.loadFromLocalStorage;
var _removeFromLS = _Storage.removeFromLocalStorage;

var PENDING_TESTS_KEY = 'kanji_pending_tests';
var PENDING_STROKES_PREFIX = 'kanji_pending_strokes_';
var TEST_RESULTS_KEY = 'kanji_test_results';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
    return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
  });
}

function getPendingTests() {
  return _loadFromLS(PENDING_TESTS_KEY) || [];
}

function gradeQuestion(pendingTestId, questionIndex, isCorrect) {
  var tests = getPendingTests();
  var testIndex = -1;
  for (var i = 0; i < tests.length; i++) { if (tests[i].id === pendingTestId) { testIndex = i; break; } }
  if (testIndex === -1) return false;

  var test = tests[testIndex];
  if (questionIndex < 0 || questionIndex >= test.questions.length) return false;
  if (test.questions[questionIndex].result !== 'pending_grading') return false;

  test.questions[questionIndex].result = isCorrect ? 'correct' : 'incorrect';
  _saveToLS(PENDING_TESTS_KEY, tests);
  return true;
}

function isAllGraded(pendingTestId) {
  var tests = getPendingTests();
  var test = null;
  for (var i = 0; i < tests.length; i++) { if (tests[i].id === pendingTestId) { test = tests[i]; break; } }
  if (!test) return false;
  for (var j = 0; j < test.questions.length; j++) {
    if (test.questions[j].result === 'pending_grading') return false;
  }
  return true;
}

function finishGrading(pendingTestId) {
  if (!isAllGraded(pendingTestId)) throw new Error('未採点の問題が残っています');

  var tests = getPendingTests();
  var testIndex = -1;
  for (var i = 0; i < tests.length; i++) { if (tests[i].id === pendingTestId) { testIndex = i; break; } }
  if (testIndex === -1) throw new Error('指定されたテストが見つかりません');

  var pendingTest = tests[testIndex];
  var correctCount = 0, incorrectCount = 0, skippedCount = 0;

  var questionResults = pendingTest.questions.map(function(q) {
    var result;
    if (q.result === 'correct') { result = 'correct'; correctCount++; }
    else if (q.result === 'skipped') { result = 'skipped'; skippedCount++; }
    else { result = 'incorrect'; incorrectCount++; }
    return { entryId: q.entryId, reading: q.reading, correctAnswer: q.correctAnswer, userAnswer: q.userAnswer, result: result };
  });

  var totalCount = pendingTest.totalCount;
  var score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  var testResult = {
    id: generateId(), rangeId: pendingTest.rangeId, rangeName: pendingTest.rangeName, mode: 'test',
    questions: questionResults, correctCount: correctCount, incorrectCount: incorrectCount,
    skippedCount: skippedCount, totalCount: totalCount, score: score, completedAt: new Date().toISOString(),
  };

  tests.splice(testIndex, 1);
  _saveToLS(PENDING_TESTS_KEY, tests);
  _removeFromLS(PENDING_STROKES_PREFIX + pendingTestId);

  var results = _loadFromLS(TEST_RESULTS_KEY) || [];
  results.push(testResult);
  _saveToLS(TEST_RESULTS_KEY, results);

  return testResult;
}

function getTestResults() {
  return _loadFromLS(TEST_RESULTS_KEY) || [];
}

// --- エクスポート ---
var exports = {
  getPendingTests: getPendingTests, gradeQuestion: gradeQuestion, isAllGraded: isAllGraded,
  finishGrading: finishGrading, getTestResults: getTestResults,
  _PENDING_TESTS_KEY: PENDING_TESTS_KEY, _PENDING_STROKES_PREFIX: PENDING_STROKES_PREFIX, _TEST_RESULTS_KEY: TEST_RESULTS_KEY,
};
if (typeof module !== 'undefined' && module.exports) { module.exports = exports; }
if (typeof window !== 'undefined') { window.AdminGrading = exports; }
})();
