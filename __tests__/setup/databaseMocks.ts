/**
 * Database Mocking Utilities for BeepRunner Tests
 * In-memory database setup and utilities for testing database operations
 */

import { CalibrationRecord, WorkoutSession } from '@/services/DatabaseService';

// In-memory database storage for testing
class MockDatabase {
  private calibrationTable: CalibrationRecord[] = [];
  private workoutSessionsTable: WorkoutSession[] = [];
  private settingsTable: { setting_key: string; setting_value: string }[] = [];
  private idCounter = 1;

  constructor() {
    this.reset();
  }

  reset() {
    this.calibrationTable = [];
    this.workoutSessionsTable = [];
    this.settingsTable = [
      { setting_key: 'language', setting_value: 'auto' },
      { setting_key: 'theme', setting_value: 'system' },
      { setting_key: 'voice_guidance', setting_value: 'true' },
      { setting_key: 'haptic_feedback', setting_value: 'true' },
      { setting_key: 'default_mode', setting_value: 'personal' },
    ];
    this.idCounter = 1;
  }

  // Calibration operations
  async saveCalibration(measuredTime: number, estimatedDistance: number): Promise<number> {
    const id = this.idCounter++;
    const record: CalibrationRecord = {
      id,
      measured_time: measuredTime,
      estimated_distance: estimatedDistance,
      created_at: new Date().toISOString(),
    };
    this.calibrationTable.push(record);
    return id;
  }

  async getLatestCalibration(): Promise<CalibrationRecord | null> {
    if (this.calibrationTable.length === 0) return null;
    return this.calibrationTable[this.calibrationTable.length - 1];
  }

  async getCalibrationHistory(limit = 10): Promise<CalibrationRecord[]> {
    return this.calibrationTable
      .slice(-limit)
      .reverse();
  }

  // Workout operations
  async saveWorkout(workout: Omit<WorkoutSession, 'id' | 'created_at'>): Promise<number> {
    const id = this.idCounter++;
    const record: WorkoutSession = {
      id,
      ...workout,
      created_at: new Date().toISOString(),
    };
    this.workoutSessionsTable.push(record);
    return id;
  }

  async getWorkoutHistory(mode?: 'personal' | 'standard', limit = 50): Promise<WorkoutSession[]> {
    let filtered = this.workoutSessionsTable;
    if (mode) {
      filtered = filtered.filter(w => w.workout_mode === mode);
    }
    return filtered.slice(-limit).reverse();
  }

  async getPersonalBest(mode: 'personal' | 'standard'): Promise<WorkoutSession | null> {
    const workouts = this.workoutSessionsTable.filter(w => w.workout_mode === mode);
    if (workouts.length === 0) return null;
    
    return workouts.sort((a, b) => {
      if (a.max_level !== b.max_level) {
        return b.max_level - a.max_level;
      }
      return b.total_reps - a.total_reps;
    })[0];
  }

  // Settings operations
  async getSetting(key: string): Promise<string | null> {
    const setting = this.settingsTable.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existingIndex = this.settingsTable.findIndex(s => s.setting_key === key);
    if (existingIndex >= 0) {
      this.settingsTable[existingIndex].setting_value = value;
    } else {
      this.settingsTable.push({ setting_key: key, setting_value: value });
    }
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings: Record<string, string> = {};
    this.settingsTable.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });
    return settings;
  }

  async clearAllData(): Promise<void> {
    this.calibrationTable = [];
    this.workoutSessionsTable = [];
  }

  // Testing utilities
  seedCalibration(records: Partial<CalibrationRecord>[]) {
    records.forEach(record => {
      const id = this.idCounter++;
      this.calibrationTable.push({
        id,
        measured_time: 8.5,
        estimated_distance: 18.9,
        created_at: new Date().toISOString(),
        ...record,
      } as CalibrationRecord);
    });
  }

  seedWorkouts(records: Partial<WorkoutSession>[]) {
    records.forEach(record => {
      const id = this.idCounter++;
      this.workoutSessionsTable.push({
        id,
        date: new Date().toISOString().split('T')[0],
        workout_mode: 'personal',
        max_level: 1,
        total_reps: 10,
        duration_minutes: 5,
        created_at: new Date().toISOString(),
        ...record,
      } as WorkoutSession);
    });
  }
}

// Create a singleton mock database instance
export const mockDatabase = new MockDatabase();

// Mock the database service module
export const mockDatabaseService = {
  initialize: jest.fn(() => Promise.resolve()),
  saveCalibration: jest.fn((...args) => mockDatabase.saveCalibration(...args)),
  getLatestCalibration: jest.fn((...args) => mockDatabase.getLatestCalibration(...args)),
  getCalibrationHistory: jest.fn((...args) => mockDatabase.getCalibrationHistory(...args)),
  saveWorkout: jest.fn((...args) => mockDatabase.saveWorkout(...args)),
  getWorkoutHistory: jest.fn((...args) => mockDatabase.getWorkoutHistory(...args)),
  getPersonalBest: jest.fn((...args) => mockDatabase.getPersonalBest(...args)),
  getSetting: jest.fn((...args) => mockDatabase.getSetting(...args)),
  setSetting: jest.fn((...args) => mockDatabase.setSetting(...args)),
  getAllSettings: jest.fn((...args) => mockDatabase.getAllSettings(...args)),
  clearAllData: jest.fn((...args) => mockDatabase.clearAllData(...args)),
};

// Test utilities
export const resetMockDatabase = () => {
  mockDatabase.reset();
  jest.clearAllMocks();
};

export const seedMockDatabase = {
  withCalibration: (records: Partial<CalibrationRecord>[]) => mockDatabase.seedCalibration(records),
  withWorkouts: (records: Partial<WorkoutSession>[]) => mockDatabase.seedWorkouts(records),
};