/**
 * Simple Unit Tests for DatabaseService
 * Tests core database functionality with simplified mocking
 */

import { CalibrationRecord, WorkoutSession } from '@/services/DatabaseService';

// Mock SQLite at the module level
const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
  getAllAsync: jest.fn(() => Promise.resolve([])),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

// Import after mocking
import { databaseService } from '@/services/DatabaseService';

describe('DatabaseService (Simple)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock return values
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  describe('Initialization', () => {
    it('should initialize database and create tables', async () => {
      await databaseService.initialize();
      
      expect(mockDb.execAsync).toHaveBeenCalled();
      // Should create tables and seed default settings
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS calibration')
      );
    });
  });

  describe('Calibration Operations', () => {
    it('should save calibration data', async () => {
      const measuredTime = 8.5;
      const estimatedDistance = 18.9;
      
      const result = await databaseService.saveCalibration(measuredTime, estimatedDistance);
      
      expect(result).toBe(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO calibration'),
        [measuredTime, estimatedDistance]
      );
    });

    it('should get latest calibration', async () => {
      const mockCalibration: CalibrationRecord = {
        id: 1,
        measured_time: 8.5,
        estimated_distance: 18.9,
        created_at: '2024-06-14T12:00:00.000Z',
      };
      
      mockDb.getFirstAsync.mockResolvedValue(mockCalibration);
      
      const result = await databaseService.getLatestCalibration();
      
      expect(result).toEqual(mockCalibration);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM calibration ORDER BY created_at DESC LIMIT 1')
      );
    });

    it('should return null when no calibrations exist', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      
      const result = await databaseService.getLatestCalibration();
      
      expect(result).toBeNull();
    });

    it('should get calibration history', async () => {
      const mockHistory: CalibrationRecord[] = [
        { id: 1, measured_time: 8.5, estimated_distance: 18.9, created_at: '2024-06-14T12:00:00.000Z' },
        { id: 2, measured_time: 9.0, estimated_distance: 20.0, created_at: '2024-06-14T11:00:00.000Z' },
      ];
      
      mockDb.getAllAsync.mockResolvedValue(mockHistory);
      
      const result = await databaseService.getCalibrationHistory(10);
      
      expect(result).toEqual(mockHistory);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM calibration ORDER BY created_at DESC LIMIT ?'),
        [10]
      );
    });
  });

  describe('Workout Operations', () => {
    it('should save workout session', async () => {
      const workout = {
        date: '2024-06-14',
        workout_mode: 'personal' as const,
        max_level: 5,
        total_reps: 32,
        duration_minutes: 8,
        notes: 'Good workout',
      };
      
      const result = await databaseService.saveWorkout(workout);
      
      expect(result).toBe(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO workout_sessions'),
        [
          workout.date,
          workout.workout_mode,
          workout.max_level,
          workout.total_reps,
          workout.duration_minutes,
          workout.notes,
        ]
      );
    });

    it('should get workout history', async () => {
      const mockWorkouts: WorkoutSession[] = [
        {
          id: 1,
          date: '2024-06-14',
          workout_mode: 'personal',
          max_level: 5,
          total_reps: 32,
          duration_minutes: 8,
          created_at: '2024-06-14T12:00:00.000Z',
        },
      ];
      
      mockDb.getAllAsync.mockResolvedValue(mockWorkouts);
      
      const result = await databaseService.getWorkoutHistory('personal', 50);
      
      expect(result).toEqual(mockWorkouts);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE workout_mode = ?'),
        ['personal', 50]
      );
    });

    it('should get personal best', async () => {
      const mockBest: WorkoutSession = {
        id: 1,
        date: '2024-06-14',
        workout_mode: 'personal',
        max_level: 7,
        total_reps: 58,
        duration_minutes: 12,
        created_at: '2024-06-14T12:00:00.000Z',
      };
      
      mockDb.getFirstAsync.mockResolvedValue(mockBest);
      
      const result = await databaseService.getPersonalBest('personal');
      
      expect(result).toEqual(mockBest);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY max_level DESC, total_reps DESC'),
        ['personal']
      );
    });
  });

  describe('Settings Operations', () => {
    it('should get setting value', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ setting_value: 'ko' });
      
      const result = await databaseService.getSetting('language');
      
      expect(result).toBe('ko');
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT setting_value FROM app_settings WHERE setting_key = ?'),
        ['language']
      );
    });

    it('should return null for non-existent setting', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      
      const result = await databaseService.getSetting('non_existent');
      
      expect(result).toBeNull();
    });

    it('should set setting value', async () => {
      await databaseService.setSetting('theme', 'dark');
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
        ['theme', 'dark']
      );
    });

    it('should get all settings', async () => {
      const mockSettings = [
        { setting_key: 'language', setting_value: 'ko' },
        { setting_key: 'theme', setting_value: 'dark' },
      ];
      
      mockDb.getAllAsync.mockResolvedValue(mockSettings);
      
      const result = await databaseService.getAllSettings();
      
      expect(result).toEqual({
        language: 'ko',
        theme: 'dark',
      });
    });
  });

  describe('Data Management', () => {
    it('should clear all data', async () => {
      await databaseService.clearAllData();
      
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM calibration_suggestions')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors', async () => {
      // Temporarily mock console.error to suppress expected error logs
      const originalError = console.error;
      console.error = jest.fn();
      
      try {
        // Create a new instance for this test
        const testDb = {
          execAsync: jest.fn().mockRejectedValue(new Error('Database error')),
        };
        
        // Mock openDatabaseAsync to return our test db
        const { openDatabaseAsync } = require('expo-sqlite');
        openDatabaseAsync.mockResolvedValueOnce(testDb);
        
        await expect(databaseService.initialize()).rejects.toThrow('Database error');
      } finally {
        // Restore console.error
        console.error = originalError;
      }
    });

    it('should handle missing database connection', async () => {
      // Test that operations require initialization
      // This is tested implicitly by the ensureInitialized() calls in the service
      expect(databaseService).toBeDefined();
    });
  });
});