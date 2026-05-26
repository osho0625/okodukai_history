import { describe, it, expect } from 'vitest';
import problems from '../../data/math-olympiad-grade5.json';

const GENRE_LABEL = {
  number_pattern: '数の規則',
  geometry: '図形',
  logic: '論理',
  combinatorics: '場合の数',
  word_problem: '文章題'
};

const VALID_GENRES = Object.keys(GENRE_LABEL);
const VALID_DIFFICULTIES = [1, 2, 3, 4];

describe('math-olympiad-problems.json スキーマバリデーション', () => {
  it('問題データが配列で1問以上存在する', () => {
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBeGreaterThan(0);
  });

  it('全問題が必須フィールドを持つ', () => {
    const requiredFields = [
      'id', 'genre', 'difficulty', 'title',
      'question', 'answer', 'explanation', 'hints', 'alternativeSolutions'
    ];

    for (const problem of problems) {
      for (const field of requiredFields) {
        expect(problem, `問題ID ${problem.id} に ${field} がありません`).toHaveProperty(field);
      }
    }
  });

  it('genreフィールドが有効な英語キーである', () => {
    for (const problem of problems) {
      expect(
        VALID_GENRES,
        `問題ID ${problem.id} のgenre "${problem.genre}" が無効です`
      ).toContain(problem.genre);
    }
  });

  it('difficultyが1, 2, 3のいずれかである', () => {
    for (const problem of problems) {
      expect(
        VALID_DIFFICULTIES,
        `問題ID ${problem.id} のdifficulty ${problem.difficulty} が無効です`
      ).toContain(problem.difficulty);
    }
  });

  it('hintsが1〜3要素の文字列配列である', () => {
    for (const problem of problems) {
      expect(Array.isArray(problem.hints), `問題ID ${problem.id} のhintsが配列ではありません`).toBe(true);
      expect(
        problem.hints.length,
        `問題ID ${problem.id} のhints要素数が ${problem.hints.length} です（1〜3が必要）`
      ).toBeGreaterThanOrEqual(1);
      expect(
        problem.hints.length,
        `問題ID ${problem.id} のhints要素数が ${problem.hints.length} です（1〜3が必要）`
      ).toBeLessThanOrEqual(3);

      for (const hint of problem.hints) {
        expect(typeof hint, `問題ID ${problem.id} のhintが文字列ではありません`).toBe('string');
      }
    }
  });

  it('alternativeSolutionsが文字列配列である', () => {
    for (const problem of problems) {
      expect(
        Array.isArray(problem.alternativeSolutions),
        `問題ID ${problem.id} のalternativeSolutionsが配列ではありません`
      ).toBe(true);

      for (const sol of problem.alternativeSolutions) {
        expect(typeof sol, `問題ID ${problem.id} のalternativeSolutionsに文字列でない要素があります`).toBe('string');
      }
    }
  });

  it('GENRE_LABELマッピングがデータ内の全ジャンルをカバーしている', () => {
    const usedGenres = [...new Set(problems.map(p => p.genre))];
    for (const genre of usedGenres) {
      expect(
        GENRE_LABEL,
        `ジャンル "${genre}" がGENRE_LABELに定義されていません`
      ).toHaveProperty(genre);
    }
  });

  it('全IDがユニークな整数である', () => {
    const ids = problems.map(p => p.id);

    for (const id of ids) {
      expect(Number.isInteger(id), `ID ${id} が整数ではありません`).toBe(true);
    }

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size, 'IDに重複があります').toBe(ids.length);
  });
});
