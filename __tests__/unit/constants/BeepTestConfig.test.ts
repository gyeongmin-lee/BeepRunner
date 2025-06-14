/**
 * Unit Tests for BeepTestConfig
 * Tests utility functions for level configurations and calibration calculations
 */

import {
  STANDARD_LEVELS,
  CALIBRATION_CONFIG,
  calculatePersonalIntervals,
  adjustDifficulty,
  getTotalRepsUpToLevel,
} from '@/constants/BeepTestConfig';

describe('BeepTestConfig', () => {
  describe('STANDARD_LEVELS configuration', () => {
    it('should have 9 levels with correct structure', () => {
      expect(STANDARD_LEVELS).toHaveLength(9);
      
      STANDARD_LEVELS.forEach((level, index) => {
        expect(level).toHaveProperty('level', index + 1);
        expect(level).toHaveProperty('reps');
        expect(level).toHaveProperty('interval');
        expect(typeof level.reps).toBe('number');
        expect(typeof level.interval).toBe('number');
        expect(level.reps).toBeGreaterThan(0);
        expect(level.interval).toBeGreaterThan(0);
      });
    });

    it('should have decreasing intervals (increasing difficulty)', () => {
      for (let i = 1; i < STANDARD_LEVELS.length; i++) {
        expect(STANDARD_LEVELS[i].interval).toBeLessThanOrEqual(STANDARD_LEVELS[i - 1].interval);
      }
    });

    it('should match expected level configuration from PRD', () => {
      expect(STANDARD_LEVELS[0]).toEqual({ level: 1, reps: 7, interval: 9.0 });
      expect(STANDARD_LEVELS[1]).toEqual({ level: 2, reps: 8, interval: 8.0 });
      expect(STANDARD_LEVELS[8]).toEqual({ level: 9, reps: 16, interval: 5.8 });
    });
  });

  describe('CALIBRATION_CONFIG', () => {
    it('should have correct standard values', () => {
      expect(CALIBRATION_CONFIG.STANDARD_DISTANCE).toBe(20);
      expect(CALIBRATION_CONFIG.STANDARD_TIME).toBe(9.0);
    });

    it('should have valid difficulty multipliers', () => {
      const multipliers = CALIBRATION_CONFIG.DIFFICULTY_MULTIPLIERS;
      expect(multipliers.too_easy).toBe(0.9);
      expect(multipliers.perfect).toBe(1.0);
      expect(multipliers.too_hard).toBe(1.15);
    });
  });

  describe('calculatePersonalIntervals', () => {
    it('should scale intervals based on measured time', () => {
      // User takes 6 seconds (faster than 9s standard)
      const personalIntervals = calculatePersonalIntervals(6.0);
      
      expect(personalIntervals).toHaveLength(STANDARD_LEVELS.length);
      
      // All intervals should be scaled down (faster) since user is faster
      personalIntervals.forEach((level, index) => {
        expect(level.level).toBe(STANDARD_LEVELS[index].level);
        expect(level.reps).toBe(STANDARD_LEVELS[index].reps);
        expect(level.interval).toBeLessThan(STANDARD_LEVELS[index].interval);
      });
    });

    it('should handle slower times correctly', () => {
      // User takes 12 seconds (slower than 9s standard)
      const personalIntervals = calculatePersonalIntervals(12.0);
      
      // All intervals should be scaled up (slower) since user is slower
      personalIntervals.forEach((level, index) => {
        expect(level.interval).toBeGreaterThan(STANDARD_LEVELS[index].interval);
      });
    });

    it('should preserve structure when time equals standard', () => {
      const personalIntervals = calculatePersonalIntervals(9.0);
      
      personalIntervals.forEach((level, index) => {
        expect(level.level).toBe(STANDARD_LEVELS[index].level);
        expect(level.reps).toBe(STANDARD_LEVELS[index].reps);
        expect(level.interval).toBeCloseTo(STANDARD_LEVELS[index].interval, 5);
      });
    });

    it('should handle edge cases', () => {
      // Very fast time
      const fastIntervals = calculatePersonalIntervals(1.0);
      expect(fastIntervals[0].interval).toBeCloseTo(1.0, 5); // 9.0 / (9.0/1.0) = 1.0
      
      // Very slow time
      const slowIntervals = calculatePersonalIntervals(18.0);
      expect(slowIntervals[0].interval).toBeCloseTo(18.0, 5); // 9.0 / (9.0/18.0) = 18.0
    });
  });

  describe('adjustDifficulty', () => {
    const baseIntervals = [
      { level: 1, reps: 7, interval: 6.0 },
      { level: 2, reps: 8, interval: 5.0 },
    ];

    it('should make intervals faster when too_easy', () => {
      const adjusted = adjustDifficulty(baseIntervals, 'too_easy');
      
      adjusted.forEach((level, index) => {
        expect(level.level).toBe(baseIntervals[index].level);
        expect(level.reps).toBe(baseIntervals[index].reps);
        expect(level.interval).toBeCloseTo(baseIntervals[index].interval * 0.9, 5);
      });
    });

    it('should keep intervals same when perfect', () => {
      const adjusted = adjustDifficulty(baseIntervals, 'perfect');
      
      adjusted.forEach((level, index) => {
        expect(level.interval).toBeCloseTo(baseIntervals[index].interval, 5);
      });
    });

    it('should make intervals slower when too_hard', () => {
      const adjusted = adjustDifficulty(baseIntervals, 'too_hard');
      
      adjusted.forEach((level, index) => {
        expect(level.interval).toBeCloseTo(baseIntervals[index].interval * 1.15, 5);
      });
    });

    it('should preserve level and rep counts', () => {
      const adjusted = adjustDifficulty(baseIntervals, 'too_hard');
      
      adjusted.forEach((level, index) => {
        expect(level.level).toBe(baseIntervals[index].level);
        expect(level.reps).toBe(baseIntervals[index].reps);
      });
    });
  });

  describe('getTotalRepsUpToLevel', () => {
    it('should calculate cumulative reps correctly', () => {
      expect(getTotalRepsUpToLevel(1)).toBe(7);  // Level 1: 7 reps
      expect(getTotalRepsUpToLevel(2)).toBe(15); // Level 1-2: 7 + 8 = 15 reps
      expect(getTotalRepsUpToLevel(3)).toBe(23); // Level 1-3: 7 + 8 + 8 = 23 reps
    });

    it('should handle edge cases', () => {
      expect(getTotalRepsUpToLevel(0)).toBe(0);
      expect(getTotalRepsUpToLevel(9)).toBe(83); // All levels: total from PRD
    });

    it('should handle levels beyond available range', () => {
      expect(getTotalRepsUpToLevel(10)).toBe(83); // Same as level 9
      expect(getTotalRepsUpToLevel(100)).toBe(83); // Same as level 9
    });

    it('should match expected cumulative totals from PRD', () => {
      // Verify against PRD documentation
      expect(getTotalRepsUpToLevel(1)).toBe(7);   // 1-7회
      expect(getTotalRepsUpToLevel(2)).toBe(15);  // 8-15회
      expect(getTotalRepsUpToLevel(3)).toBe(23);  // 16-23회
      expect(getTotalRepsUpToLevel(4)).toBe(31);  // 24-31회
      expect(getTotalRepsUpToLevel(5)).toBe(40);  // 32-40회
      expect(getTotalRepsUpToLevel(6)).toBe(49);  // 41-49회
      expect(getTotalRepsUpToLevel(7)).toBe(58);  // 50-58회
      expect(getTotalRepsUpToLevel(8)).toBe(67);  // 59-67회
      expect(getTotalRepsUpToLevel(9)).toBe(83);  // 68-83회
    });
  });
});