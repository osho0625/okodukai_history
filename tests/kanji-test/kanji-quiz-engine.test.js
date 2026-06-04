/**
 * Unit tests for QuizEngine — 出題・回答・採点ロジック
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.6, 4.7, 5.1, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10, 12.1, 12.2
 */
import { describe, it, expect } from 'vitest';

const {
  startQuiz,
  submitAnswer,
  submitHandwritingAnswer,
  skipQuestion,
  showAnswer,
  selfCheck,
  gradeTextAnswer,
  calculateResult,
  finishTestMode,
  getReviewList,
  updateAnswer,
  updateHandwritingAnswer,
  getRetryEntries,
} = require('../../js/kanji-quiz-engine.js');

// --- テストデータヘルパー ---

function makeEntries(count) {
  const entries = [];
  for (let i = 0; i < count; i++) {
    entries.push({
      id: `entry-${i}`,
      rangeId: 'range-1',
      reading: `よみ${i}`,
      answer: `漢字${i}`,
    });
  }
  return entries;
}

// --- startQuiz ---

describe('QuizEngine: startQuiz', () => {
  it('selects all entries when count <= 50', () => {
    const entries = makeEntries(10);
    const session = startQuiz(entries, 'test');

    expect(session.questions).toHaveLength(10);
    expect(session.mode).toBe('test');
    expect(session.phase).toBe('answering');
    expect(session.currentIndex).toBe(0);
  });

  it('selects max 50 entries when count > 50', () => {
    const entries = makeEntries(80);
    const session = startQuiz(entries, 'practice');

    expect(session.questions).toHaveLength(50);
    expect(session.mode).toBe('practice');
  });

  it('produces no duplicate entryIds', () => {
    const entries = makeEntries(60);
    const session = startQuiz(entries, 'test');

    const entryIds = session.questions.map(q => q.entryId);
    const uniqueIds = new Set(entryIds);
    expect(uniqueIds.size).toBe(entryIds.length);
  });

  it('initializes all questions as unanswered', () => {
    const entries = makeEntries(5);
    const session = startQuiz(entries, 'test');

    for (const q of session.questions) {
      expect(q.status).toBe('unanswered');
      expect(q.userAnswer).toBeNull();
      expect(q.answerType).toBeNull();
      expect(q.result).toBeNull();
    }
  });

  it('handles empty entries array', () => {
    const session = startQuiz([], 'test');
    expect(session.questions).toHaveLength(0);
  });
});

// --- submitAnswer ---

describe('QuizEngine: submitAnswer', () => {
  it('records text answer and sets status to answered', () => {
    const entries = makeEntries(3);
    const session = startQuiz(entries, 'test');
    const updated = submitAnswer(session, 0, '回答テスト');

    expect(updated.questions[0].userAnswer).toBe('回答テスト');
    expect(updated.questions[0].answerType).toBe('text');
    expect(updated.questions[0].status).toBe('answered');
  });

  it('does not mutate original session', () => {
    const entries = makeEntries(3);
    const session = startQuiz(entries, 'test');
    submitAnswer(session, 0, '回答');

    expect(session.questions[0].status).toBe('unanswered');
  });
});

// --- submitHandwritingAnswer ---

describe('QuizEngine: submitHandwritingAnswer', () => {
  it('records handwriting answer type and sets status to answered', () => {
    const entries = makeEntries(3);
    const session = startQuiz(entries, 'test');
    const updated = submitHandwritingAnswer(session, 1);

    expect(updated.questions[1].answerType).toBe('handwriting');
    expect(updated.questions[1].status).toBe('answered');
  });
});

// --- skipQuestion ---

describe('QuizEngine: skipQuestion', () => {
  it('sets status to skipped', () => {
    const entries = makeEntries(3);
    const session = startQuiz(entries, 'test');
    const updated = skipQuestion(session, 2);

    expect(updated.questions[2].status).toBe('skipped');
  });
});

// --- showAnswer ---

describe('QuizEngine: showAnswer', () => {
  it('sets status to shown and result to incorrect', () => {
    const entries = makeEntries(3);
    const session = startQuiz(entries, 'practice');
    const updated = showAnswer(session, 0);

    expect(updated.questions[0].status).toBe('shown');
    expect(updated.questions[0].result).toBe('incorrect');
  });
});

// --- selfCheck ---

describe('QuizEngine: selfCheck', () => {
  it('sets result to correct when isCorrect=true', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'practice');
    session = submitHandwritingAnswer(session, 0);
    const updated = selfCheck(session, 0, true);

    expect(updated.questions[0].result).toBe('correct');
  });

  it('sets result to incorrect when isCorrect=false', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'practice');
    session = submitHandwritingAnswer(session, 0);
    const updated = selfCheck(session, 0, false);

    expect(updated.questions[0].result).toBe('incorrect');
  });
});

// --- gradeTextAnswer ---

describe('QuizEngine: gradeTextAnswer', () => {
  it('returns true for exact match', () => {
    expect(gradeTextAnswer('漢字', '漢字')).toBe(true);
  });

  it('returns false for non-match', () => {
    expect(gradeTextAnswer('漢字A', '漢字B')).toBe(false);
  });

  it('returns false for partial match', () => {
    expect(gradeTextAnswer('漢', '漢字')).toBe(false);
  });

  it('is case/space sensitive', () => {
    expect(gradeTextAnswer('漢字 ', '漢字')).toBe(false);
  });
});

// --- calculateResult ---

describe('QuizEngine: calculateResult', () => {
  it('computes correct counts and score', () => {
    const entries = makeEntries(4);
    let session = startQuiz(entries, 'practice');
    // 手動でresultを設定（calculateResultはresultフィールドを参照）
    session = submitAnswer(session, 0, entries[0] ? session.questions[0].correctAnswer : '');
    session = { ...session, questions: session.questions.map((q, i) => {
      if (i === 0) return { ...q, result: 'correct' };
      if (i === 1) return { ...q, result: 'incorrect', status: 'answered' };
      if (i === 2) return { ...q, status: 'skipped' };
      return { ...q, result: 'incorrect', status: 'answered' };
    }) };

    const result = calculateResult(session);

    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.totalCount).toBe(4);
    expect(result.score).toBe(25); // 1/4 * 100
  });

  it('handles all correct', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'test');
    session = { ...session, questions: session.questions.map(q => ({ ...q, result: 'correct', status: 'answered' })) };

    const result = calculateResult(session);

    expect(result.correctCount).toBe(3);
    expect(result.score).toBe(100);
  });
});

// --- finishTestMode ---

describe('QuizEngine: finishTestMode', () => {
  it('returns testResult when all answers are text', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'test');
    // Submit correct text answers
    for (let i = 0; i < session.questions.length; i++) {
      session = submitAnswer(session, i, session.questions[i].correctAnswer);
    }

    const result = finishTestMode(session);

    expect(result.pendingTest).toBeNull();
    expect(result.strokesStore).toBeNull();
    expect(result.testResult).not.toBeNull();
    expect(result.testResult.correctCount).toBe(3);
    expect(result.testResult.score).toBe(100);
  });

  it('returns pendingTest when handwriting answers exist', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'test');
    session = submitAnswer(session, 0, session.questions[0].correctAnswer);
    session = submitHandwritingAnswer(session, 1);
    session = skipQuestion(session, 2);

    const result = finishTestMode(session);

    expect(result.pendingTest).not.toBeNull();
    expect(result.testResult).toBeNull();
    expect(result.pendingTest.totalCount).toBe(3);
    expect(result.pendingTest.textGradedCorrect).toBe(1);
    expect(result.pendingTest.skippedCount).toBe(1);
    // handwriting question should be pending_grading
    const hwQuestion = result.pendingTest.questions[1];
    expect(hwQuestion.hasHandwritingAnswer).toBe(true);
    expect(hwQuestion.result).toBe('pending_grading');
  });

  it('grades incorrect text answers properly', () => {
    const entries = makeEntries(2);
    let session = startQuiz(entries, 'test');
    session = submitAnswer(session, 0, 'wrong');
    session = submitAnswer(session, 1, session.questions[1].correctAnswer);

    const result = finishTestMode(session);

    expect(result.testResult.correctCount).toBe(1);
    expect(result.testResult.incorrectCount).toBe(1);
    expect(result.testResult.score).toBe(50);
  });
});

// --- getReviewList ---

describe('QuizEngine: getReviewList', () => {
  it('returns review items with correct statuses', () => {
    const entries = makeEntries(3);
    let session = startQuiz(entries, 'test');
    session = submitAnswer(session, 0, '回答1');
    session = submitHandwritingAnswer(session, 1);
    session = skipQuestion(session, 2);

    const reviewList = getReviewList(session);

    expect(reviewList).toHaveLength(3);
    expect(reviewList[0].status).toBe('answered');
    expect(reviewList[0].userAnswer).toBe('回答1');
    expect(reviewList[0].hasStrokes).toBe(false);
    expect(reviewList[1].status).toBe('answered');
    expect(reviewList[1].hasStrokes).toBe(true);
    expect(reviewList[2].status).toBe('skipped');
  });
});

// --- updateAnswer ---

describe('QuizEngine: updateAnswer', () => {
  it('modifies an existing text answer', () => {
    const entries = makeEntries(2);
    let session = startQuiz(entries, 'test');
    session = submitAnswer(session, 0, '旧回答');
    session = updateAnswer(session, 0, '新回答');

    expect(session.questions[0].userAnswer).toBe('新回答');
    expect(session.questions[0].answerType).toBe('text');
    expect(session.questions[0].status).toBe('answered');
  });
});

// --- updateHandwritingAnswer ---

describe('QuizEngine: updateHandwritingAnswer', () => {
  it('updates a handwriting answer', () => {
    const entries = makeEntries(2);
    let session = startQuiz(entries, 'test');
    session = submitAnswer(session, 0, 'text answer');
    session = updateHandwritingAnswer(session, 0);

    expect(session.questions[0].answerType).toBe('handwriting');
    expect(session.questions[0].status).toBe('answered');
  });
});

// --- getRetryEntries ---

describe('QuizEngine: getRetryEntries', () => {
  it('returns entryIds for incorrect and skipped questions', () => {
    const testResult = {
      questions: [
        { entryId: 'e1', result: 'correct' },
        { entryId: 'e2', result: 'incorrect' },
        { entryId: 'e3', result: 'skipped' },
        { entryId: 'e4', result: 'correct' },
      ],
    };

    const retryIds = getRetryEntries(testResult);

    expect(retryIds).toHaveLength(2);
    expect(retryIds).toContain('e2');
    expect(retryIds).toContain('e3');
  });

  it('returns empty array when all correct', () => {
    const testResult = {
      questions: [
        { entryId: 'e1', result: 'correct' },
        { entryId: 'e2', result: 'correct' },
      ],
    };

    expect(getRetryEntries(testResult)).toHaveLength(0);
  });
});
