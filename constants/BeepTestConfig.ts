/**
 * BeepRunner Configuration
 * Contains all standard level configurations and constants for beep tests
 */

import { MODE_COLORS_MUTED } from './Colors';

export interface LevelConfig {
  level: number;
  reps: number;
  interval: number; // seconds between beeps
}

export interface CalibrationMultipliers {
  too_easy: number;
  perfect: number;
  too_hard: number;
}

// Standard 20m Beep Test Level Configuration (from PRD)
export const STANDARD_LEVELS: LevelConfig[] = [
  { level: 1, reps: 7, interval: 9.0 },    // 1-7회, 9초 간격
  { level: 2, reps: 8, interval: 8.0 },    // 8-15회, 8초 간격
  { level: 3, reps: 8, interval: 7.5 },    // 16-23회, 7.5초 간격
  { level: 4, reps: 8, interval: 7.0 },    // 24-31회, 7초 간격
  { level: 5, reps: 9, interval: 6.5 },    // 32-40회, 6.5초 간격
  { level: 6, reps: 9, interval: 6.2 },    // 41-49회, 6.2초 간격
  { level: 7, reps: 9, interval: 6.0 },    // 50-58회, 6초 간격
  { level: 8, reps: 9, interval: 5.9 },    // 59-67회, 5.9초 간격
  { level: 9, reps: 16, interval: 5.8 }    // 68-83회, 5.8초 간격
];

// Personal Mode Calibration Constants
export const CALIBRATION_CONFIG = {
  STANDARD_DISTANCE: 20, // meters
  STANDARD_TIME: 9.0,    // seconds (Level 1 baseline)
  
  // Adaptive difficulty adjustment multipliers
  DIFFICULTY_MULTIPLIERS: {
    too_easy: 0.9,      // 10% faster
    perfect: 1.0,       // No change
    too_hard: 1.15      // 15% slower
  } as CalibrationMultipliers
};

// Timer Configuration
export const TIMER_CONFIG = {
  COUNTDOWN_DURATION: 3, // seconds for calibration countdown
  UPDATE_INTERVAL: 100,  // milliseconds for timer updates
};

// Audio Configuration
export const AUDIO_CONFIG = {
  BEEP_FREQUENCY: 800,   // Hz
  BEEP_DURATION: 200,    // milliseconds
  COUNTDOWN_FREQUENCY: 600, // Hz for countdown beeps
  COUNTDOWN_DURATION: 500,  // milliseconds for countdown beeps
};

// UI Constants
export const UI_CONFIG = {
  MIN_TOUCH_TARGET: 44, // minimum touch target size (pt)
  LARGE_TEXT_SIZE: 32,  // for workout displays
  TIMER_UPDATE_MS: 100, // timer display update frequency
};

// Mode Colors - Updated to muted palette for modern design
export const MODE_COLORS = {
  PERSONAL: MODE_COLORS_MUTED.PERSONAL,        // Muted blue #6B8FB5
  PERSONAL_LIGHT: MODE_COLORS_MUTED.PERSONAL_LIGHT, // #A8C1E0
  PERSONAL_TINT: MODE_COLORS_MUTED.PERSONAL_TINT,   // #F0F4F8
  STANDARD: MODE_COLORS_MUTED.STANDARD,        // Muted green #7BA05B
  STANDARD_LIGHT: MODE_COLORS_MUTED.STANDARD_LIGHT, // #A8C487
  STANDARD_TINT: MODE_COLORS_MUTED.STANDARD_TINT,   // #F4F7F0
  ACCENT: MODE_COLORS_MUTED.ACCENT,            // Muted orange #E17B47
  DANGER: MODE_COLORS_MUTED.DANGER,            // Muted red #D14343
};

/**
 * Calculate personal intervals based on calibration time
 */
export function calculatePersonalIntervals(measuredTime: number): LevelConfig[] {
  const distanceRatio = CALIBRATION_CONFIG.STANDARD_TIME / measuredTime;
  
  return STANDARD_LEVELS.map(level => ({
    ...level,
    interval: level.interval / distanceRatio
  }));
}

/**
 * Apply difficulty adjustment to intervals
 */
export function adjustDifficulty(
  currentIntervals: LevelConfig[], 
  feedback: keyof CalibrationMultipliers
): LevelConfig[] {
  const multiplier = CALIBRATION_CONFIG.DIFFICULTY_MULTIPLIERS[feedback];
  
  return currentIntervals.map(level => ({
    ...level,
    interval: level.interval * multiplier
  }));
}

/**
 * Get total reps for a given level (cumulative)
 */
export function getTotalRepsUpToLevel(targetLevel: number): number {
  return STANDARD_LEVELS
    .filter(level => level.level <= targetLevel)
    .reduce((total, level) => total + level.reps, 0);
}