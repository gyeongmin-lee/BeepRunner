/**
 * DatabaseService for BeepRunner
 * Handles SQLite database operations for workout history and calibration storage
 */

import * as SQLite from 'expo-sqlite';

// Database schema types
export interface CalibrationRecord {
  id?: number;
  measured_time: number;
  estimated_distance: number;
  created_at?: string;
}

export interface WorkoutSession {
  id?: number;
  date: string;
  workout_mode: 'personal' | 'standard';
  max_level: number;
  total_reps: number;
  duration_minutes: number;
  notes?: string;
  created_at?: string;
}

export interface CalibrationSuggestion {
  id?: number;
  workout_session_id: number;
  suggestion_type: 'too_easy' | 'perfect' | 'too_hard';
  user_action?: 'accepted' | 'declined' | 'ignored';
  difficulty_multiplier?: number;
  created_at?: string;
}

export interface AppSetting {
  id?: number;
  setting_key: string;
  setting_value: string;
  updated_at?: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize database and create tables
   */
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('beeprunner.db');
      await this.createTables();
      await this.seedDefaultSettings();
      this.isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // User calibration settings
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS calibration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        measured_time REAL NOT NULL,
        estimated_distance REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Workout history
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        workout_mode TEXT NOT NULL CHECK (workout_mode IN ('personal', 'standard')),
        max_level INTEGER NOT NULL,
        total_reps INTEGER NOT NULL,
        duration_minutes INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adaptive difficulty feedback (Personal mode only)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS calibration_suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_session_id INTEGER NOT NULL,
        suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('too_easy', 'perfect', 'too_hard')),
        user_action TEXT CHECK (user_action IN ('accepted', 'declined', 'ignored')),
        difficulty_multiplier REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id)
      );
    `);

    // App settings storage
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Seed default app settings
   */
  private async seedDefaultSettings(): Promise<void> {
    if (!this.db) return;

    const defaultSettings = [
      { setting_key: 'language', setting_value: 'auto' },
      { setting_key: 'theme', setting_value: 'system' },
      { setting_key: 'voice_guidance', setting_value: 'true' },
      { setting_key: 'haptic_feedback', setting_value: 'true' },
      { setting_key: 'default_mode', setting_value: 'personal' },
    ];

    for (const setting of defaultSettings) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO app_settings (setting_key, setting_value) VALUES (?, ?)`,
        [setting.setting_key, setting.setting_value]
      );
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // CALIBRATION OPERATIONS

  /**
   * Save calibration data
   */
  async saveCalibration(measuredTime: number, estimatedDistance: number): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.runAsync(
      `INSERT INTO calibration (measured_time, estimated_distance) VALUES (?, ?)`,
      [measuredTime, estimatedDistance]
    );

    return result.lastInsertRowId;
  }

  /**
   * Get latest calibration
   */
  async getLatestCalibration(): Promise<CalibrationRecord | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.getFirstAsync<CalibrationRecord>(
      `SELECT * FROM calibration ORDER BY created_at DESC LIMIT 1`
    );

    return result || null;
  }

  /**
   * Get calibration history
   */
  async getCalibrationHistory(limit = 10): Promise<CalibrationRecord[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const results = await this.db.getAllAsync<CalibrationRecord>(
      `SELECT * FROM calibration ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return results;
  }

  // WORKOUT OPERATIONS

  /**
   * Save workout session
   */
  async saveWorkout(workout: Omit<WorkoutSession, 'id' | 'created_at'>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.runAsync(
      `INSERT INTO workout_sessions (date, workout_mode, max_level, total_reps, duration_minutes, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        workout.date,
        workout.workout_mode,
        workout.max_level,
        workout.total_reps,
        workout.duration_minutes,
        workout.notes || null
      ]
    );

    return result.lastInsertRowId;
  }

  /**
   * Get workout history
   */
  async getWorkoutHistory(mode?: 'personal' | 'standard', limit = 50): Promise<WorkoutSession[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    let query = `SELECT * FROM workout_sessions`;
    const params: any[] = [];

    if (mode) {
      query += ` WHERE workout_mode = ?`;
      params.push(mode);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const results = await this.db.getAllAsync<WorkoutSession>(query, params);
    return results;
  }

  /**
   * Get workout by date range
   */
  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const results = await this.db.getAllAsync<WorkoutSession>(
      `SELECT * FROM workout_sessions 
       WHERE date BETWEEN ? AND ? 
       ORDER BY date DESC`,
      [startDate, endDate]
    );

    return results;
  }

  /**
   * Get personal best for a mode
   */
  async getPersonalBest(mode: 'personal' | 'standard'): Promise<WorkoutSession | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.getFirstAsync<WorkoutSession>(
      `SELECT * FROM workout_sessions 
       WHERE workout_mode = ? 
       ORDER BY max_level DESC, total_reps DESC 
       LIMIT 1`,
      [mode]
    );

    return result || null;
  }

  /**
   * Delete a workout session
   */
  async deleteWorkout(workoutId: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    // First delete any associated calibration suggestions
    await this.db.runAsync(
      `DELETE FROM calibration_suggestions WHERE workout_session_id = ?`,
      [workoutId]
    );

    // Then delete the workout session
    await this.db.runAsync(
      `DELETE FROM workout_sessions WHERE id = ?`,
      [workoutId]
    );
  }

  // CALIBRATION SUGGESTIONS

  /**
   * Save calibration suggestion
   */
  async saveCalibrationSuggestion(suggestion: Omit<CalibrationSuggestion, 'id' | 'created_at'>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.runAsync(
      `INSERT INTO calibration_suggestions (workout_session_id, suggestion_type, user_action, difficulty_multiplier) 
       VALUES (?, ?, ?, ?)`,
      [
        suggestion.workout_session_id,
        suggestion.suggestion_type,
        suggestion.user_action || null,
        suggestion.difficulty_multiplier || null
      ]
    );

    return result.lastInsertRowId;
  }

  // APP SETTINGS

  /**
   * Get app setting
   */
  async getSetting(key: string): Promise<string | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const result = await this.db.getFirstAsync<{ setting_value: string }>(
      `SELECT setting_value FROM app_settings WHERE setting_key = ?`,
      [key]
    );

    return result?.setting_value || null;
  }

  /**
   * Set app setting
   */
  async setSetting(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO app_settings (setting_key, setting_value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [key, value]
    );
  }

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<Record<string, string>> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    const results = await this.db.getAllAsync<AppSetting>(
      `SELECT setting_key, setting_value FROM app_settings`
    );

    const settings: Record<string, string> = {};
    results.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });

    return settings;
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not available');

    await this.db.execAsync(`
      DELETE FROM calibration_suggestions;
      DELETE FROM workout_sessions;
      DELETE FROM calibration;
    `);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();