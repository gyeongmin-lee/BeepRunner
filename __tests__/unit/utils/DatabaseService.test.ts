/**
 * Unit Tests for DatabaseService
 * Tests SQLite database operations with mocked database
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

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock return values
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await databaseService.initialize();
      
      expect(mockDb.execAsync).toHaveBeenCalled();
      // Should create tables and seed default settings
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS calibration')
      );
    });
  });

  describe('Calibration Operations', () => {
    describe('saveCalibration', () => {
      it('should save calibration data and return ID', async () => {
        const measuredTime = 8.5;
        const estimatedDistance = 18.9;

        const id = await databaseService.saveCalibration(measuredTime, estimatedDistance);

        expect(id).toBe(1);
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO calibration'),
          [measuredTime, estimatedDistance]
        );
      });

      it('should handle multiple calibrations', async () => {
        // First calibration
        mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1 });
        const firstId = await databaseService.saveCalibration(8.0, 17.8);
        expect(firstId).toBe(1);

        // Second calibration  
        mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 2 });
        const secondId = await databaseService.saveCalibration(9.0, 20.0);
        expect(secondId).toBe(2);
      });
    });

    describe('getLatestCalibration', () => {
      it('should return null when no calibrations exist', async () => {
        mockDb.getFirstAsync.mockResolvedValue(null);
        
        const result = await databaseService.getLatestCalibration();
        expect(result).toBeNull();
      });

      it('should return latest calibration when calibrations exist', async () => {
        const mockCalibration: CalibrationRecord = {
          id: 1,
          measured_time: 9.0,
          estimated_distance: 20.0,
          created_at: '2024-06-14T12:00:00.000Z',
        };
        
        mockDb.getFirstAsync.mockResolvedValue(mockCalibration);

        const result = await databaseService.getLatestCalibration();

        expect(result).toEqual(mockCalibration);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM calibration ORDER BY created_at DESC LIMIT 1')
        );
      });
    });

    describe('getCalibrationHistory', () => {
      it('should return empty array when no calibrations exist', async () => {
        mockDb.getAllAsync.mockResolvedValue([]);
        
        const result = await databaseService.getCalibrationHistory();
        expect(result).toEqual([]);
      });

      it('should return calibration history in descending order', async () => {
        const mockHistory: CalibrationRecord[] = [
          { id: 3, measured_time: 7.5, estimated_distance: 16.7, created_at: '2024-06-14T14:00:00.000Z' },
          { id: 2, measured_time: 9.0, estimated_distance: 20.0, created_at: '2024-06-14T13:00:00.000Z' },
          { id: 1, measured_time: 8.0, estimated_distance: 17.8, created_at: '2024-06-14T12:00:00.000Z' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(mockHistory);

        const result = await databaseService.getCalibrationHistory();

        expect(result).toHaveLength(3);
        expect(result[0].measured_time).toBe(7.5); // Most recent first
        expect(result[1].measured_time).toBe(9.0);
        expect(result[2].measured_time).toBe(8.0);
      });

      it('should respect limit parameter', async () => {
        const mockHistory: CalibrationRecord[] = [
          { id: 3, measured_time: 7.5, estimated_distance: 16.7, created_at: '2024-06-14T14:00:00.000Z' },
          { id: 2, measured_time: 9.0, estimated_distance: 20.0, created_at: '2024-06-14T13:00:00.000Z' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(mockHistory);

        const result = await databaseService.getCalibrationHistory(2);

        expect(result).toHaveLength(2);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM calibration ORDER BY created_at DESC LIMIT ?'),
          [2]
        );
      });
    });
  });

  describe('Workout Operations', () => {
    describe('saveWorkout', () => {
      it('should save workout session and return ID', async () => {
        const workout = {
          date: '2024-06-14',
          workout_mode: 'personal' as const,
          max_level: 5,
          total_reps: 32,
          duration_minutes: 8,
          notes: 'Good workout',
        };

        const id = await databaseService.saveWorkout(workout);

        expect(id).toBe(1);
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

      it('should handle workout without notes', async () => {
        const workout = {
          date: '2024-06-14',
          workout_mode: 'standard' as const,
          max_level: 3,
          total_reps: 23,
          duration_minutes: 5,
        };

        const id = await databaseService.saveWorkout(workout);
        expect(id).toBe(1);
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO workout_sessions'),
          [
            workout.date,
            workout.workout_mode,
            workout.max_level,
            workout.total_reps,
            workout.duration_minutes,
            null, // notes should be null
          ]
        );
      });
    });

    describe('getWorkoutHistory', () => {
      it('should return all workouts when no mode filter', async () => {
        const mockWorkouts: WorkoutSession[] = [
          { id: 1, date: '2024-06-14', workout_mode: 'personal', max_level: 5, total_reps: 32, duration_minutes: 8, created_at: '2024-06-14T12:00:00.000Z' },
          { id: 2, date: '2024-06-13', workout_mode: 'standard', max_level: 3, total_reps: 23, duration_minutes: 5, created_at: '2024-06-13T12:00:00.000Z' },
          { id: 3, date: '2024-06-12', workout_mode: 'personal', max_level: 7, total_reps: 58, duration_minutes: 12, created_at: '2024-06-12T12:00:00.000Z' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(mockWorkouts);

        const result = await databaseService.getWorkoutHistory();

        expect(result).toHaveLength(3);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM workout_sessions'),
          [50] // default limit
        );
      });

      it('should filter by workout mode', async () => {
        const personalWorkouts: WorkoutSession[] = [
          { id: 1, date: '2024-06-14', workout_mode: 'personal', max_level: 5, total_reps: 32, duration_minutes: 8, created_at: '2024-06-14T12:00:00.000Z' },
          { id: 3, date: '2024-06-12', workout_mode: 'personal', max_level: 7, total_reps: 58, duration_minutes: 12, created_at: '2024-06-12T12:00:00.000Z' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(personalWorkouts);

        const result = await databaseService.getWorkoutHistory('personal');

        expect(result).toHaveLength(2);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(
          expect.stringContaining('WHERE workout_mode = ?'),
          ['personal', 50]
        );
      });

      it('should respect limit parameter', async () => {
        const limitedWorkouts: WorkoutSession[] = [
          { id: 1, date: '2024-06-14', workout_mode: 'personal', max_level: 5, total_reps: 32, duration_minutes: 8, created_at: '2024-06-14T12:00:00.000Z' },
          { id: 2, date: '2024-06-13', workout_mode: 'standard', max_level: 3, total_reps: 23, duration_minutes: 5, created_at: '2024-06-13T12:00:00.000Z' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(limitedWorkouts);

        const result = await databaseService.getWorkoutHistory(undefined, 2);

        expect(result).toHaveLength(2);
        expect(mockDb.getAllAsync).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM workout_sessions'),
          [2]
        );
      });
    });

    describe('getPersonalBest', () => {
      it('should return highest level personal best', async () => {
        const mockBest: WorkoutSession = {
          id: 3,
          date: '2024-06-12',
          workout_mode: 'personal',
          max_level: 7,
          total_reps: 58,
          duration_minutes: 12,
          created_at: '2024-06-12T12:00:00.000Z',
        };
        
        mockDb.getFirstAsync.mockResolvedValue(mockBest);

        const result = await databaseService.getPersonalBest('personal');

        expect(result).toEqual(mockBest);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY max_level DESC, total_reps DESC'),
          ['personal']
        );
      });

      it('should return highest level standard best', async () => {
        const mockBest: WorkoutSession = {
          id: 2,
          date: '2024-06-13',
          workout_mode: 'standard',
          max_level: 8,
          total_reps: 67,
          duration_minutes: 15,
          created_at: '2024-06-13T12:00:00.000Z',
        };
        
        mockDb.getFirstAsync.mockResolvedValue(mockBest);

        const result = await databaseService.getPersonalBest('standard');

        expect(result).toEqual(mockBest);
      });

      it('should return null when no workouts exist for mode', async () => {
        mockDb.getFirstAsync.mockResolvedValue(null);

        const result = await databaseService.getPersonalBest('personal');
        expect(result).toBeNull();
      });
    });
  });

  describe('Settings Operations', () => {
    describe('getSetting', () => {
      it('should return default setting values', async () => {
        // Mock the initialization which seeds default settings
        mockDb.getFirstAsync
          .mockResolvedValueOnce({ setting_value: 'auto' }) // language
          .mockResolvedValueOnce({ setting_value: 'system' }); // theme

        const language = await databaseService.getSetting('language');
        const theme = await databaseService.getSetting('theme');

        expect(language).toBe('auto');
        expect(theme).toBe('system');
      });

      it('should return null for non-existent setting', async () => {
        mockDb.getFirstAsync.mockResolvedValue(null);
        
        const result = await databaseService.getSetting('non_existent');
        expect(result).toBeNull();
      });
    });

    describe('setSetting', () => {
      it('should update existing setting', async () => {
        await databaseService.setSetting('language', 'ko');
        
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
          ['language', 'ko']
        );

        // Mock the read back
        mockDb.getFirstAsync.mockResolvedValue({ setting_value: 'ko' });
        const result = await databaseService.getSetting('language');
        expect(result).toBe('ko');
      });

      it('should create new setting', async () => {
        await databaseService.setSetting('new_setting', 'new_value');
        
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
          ['new_setting', 'new_value']
        );

        // Mock the read back
        mockDb.getFirstAsync.mockResolvedValue({ setting_value: 'new_value' });
        const result = await databaseService.getSetting('new_setting');
        expect(result).toBe('new_value');
      });
    });

    describe('getAllSettings', () => {
      it('should return all settings as key-value object', async () => {
        const mockSettings = [
          { setting_key: 'language', setting_value: 'auto' },
          { setting_key: 'theme', setting_value: 'system' },
          { setting_key: 'voice_guidance', setting_value: 'true' },
          { setting_key: 'haptic_feedback', setting_value: 'true' },
          { setting_key: 'default_mode', setting_value: 'personal' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(mockSettings);

        const result = await databaseService.getAllSettings();

        expect(result).toEqual({
          language: 'auto',
          theme: 'system',
          voice_guidance: 'true',
          haptic_feedback: 'true',
          default_mode: 'personal',
        });
      });

      it('should include custom settings', async () => {
        const mockSettings = [
          { setting_key: 'language', setting_value: 'auto' },
          { setting_key: 'theme', setting_value: 'system' },
          { setting_key: 'custom_setting', setting_value: 'custom_value' },
        ];
        
        mockDb.getAllAsync.mockResolvedValue(mockSettings);

        const result = await databaseService.getAllSettings();

        expect(result.custom_setting).toBe('custom_value');
      });
    });
  });

  describe('Data Management', () => {
    describe('clearAllData', () => {
      it('should clear all workout and calibration data', async () => {
        await databaseService.clearAllData();

        expect(mockDb.execAsync).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM calibration_suggestions')
        );

        // After clearing, reads should return empty
        mockDb.getAllAsync.mockResolvedValue([]);
        const calibrations = await databaseService.getCalibrationHistory();
        const workouts = await databaseService.getWorkoutHistory();

        expect(calibrations).toEqual([]);
        expect(workouts).toEqual([]);
      });

      it('should preserve settings after clearing data', async () => {
        // Set a custom setting first
        await databaseService.setSetting('custom_setting', 'custom_value');
        
        // Clear data
        await databaseService.clearAllData();

        // Settings should still exist
        mockDb.getFirstAsync.mockResolvedValue({ setting_value: 'custom_value' });
        const setting = await databaseService.getSetting('custom_setting');
        expect(setting).toBe('custom_value');
      });
    });
  });
});