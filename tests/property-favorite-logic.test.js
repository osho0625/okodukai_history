/**
 * Property Tests: お気に入りトグル冪等性 / ユーザー別お気に入り独立性
 *
 * **Property 11: お気に入りトグル冪等性**
 * **Validates: Requirements 5.2**
 *
 * **Property 12: ユーザー別お気に入り独立性**
 * **Validates: Requirements 5.3**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { simulateToggle, toggleUserFavorite } from '../js/recipe-utils.js';

describe('Property 11: お気に入りトグル冪等性', () => {
  it('toggling favorite twice returns to the original state: toggle(toggle(state)) === state', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initialState) => {
          const afterFirst = simulateToggle(initialState);
          const afterSecond = simulateToggle(afterFirst);
          expect(afterSecond).toBe(initialState);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('single toggle always inverts the state', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (state) => {
          expect(simulateToggle(state)).toBe(!state);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 12: ユーザー別お気に入り独立性', () => {
  it('toggling user A favorite does not change user B favorite state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.boolean(),
        fc.boolean(),
        (userA, userB, stateA, stateB) => {
          // Ensure distinct users
          fc.pre(userA !== userB);

          var favoritesMap = Object.create(null);
          favoritesMap[userA] = stateA;
          favoritesMap[userB] = stateB;

          // Toggle user A's favorite
          var newMap = toggleUserFavorite(favoritesMap, userA);

          // User B's state must remain unchanged
          expect(newMap[userB]).toBe(stateB);

          // User A's state must have toggled
          expect(newMap[userA]).toBe(!stateA);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('toggling any user in a multi-user map only affects that user', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 2, maxLength: 5 }),
        fc.nat({ max: 4 }),
        (users, toggleIndex) => {
          // Build a favorites map with random states
          var favoritesMap = Object.create(null);
          for (var i = 0; i < users.length; i++) {
            favoritesMap[users[i]] = Math.random() > 0.5;
          }

          var targetUser = users[toggleIndex % users.length];
          var originalState = Object.create(null);
          for (var k = 0; k < users.length; k++) {
            originalState[users[k]] = favoritesMap[users[k]];
          }

          // Toggle the target user
          var newMap = toggleUserFavorite(favoritesMap, targetUser);

          // All other users remain unchanged
          for (var j = 0; j < users.length; j++) {
            if (users[j] !== targetUser) {
              expect(newMap[users[j]]).toBe(originalState[users[j]]);
            }
          }

          // Target user is toggled
          expect(newMap[targetUser]).toBe(!originalState[targetUser]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
