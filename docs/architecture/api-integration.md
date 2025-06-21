# API Integration

## Service Template

```typescript
import * as SQLite from 'expo-sqlite';

interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('beeprunner.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async saveWorkout(workout: WorkoutSession): Promise<DatabaseResult<number>> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      
      const result = await this.db.runAsync(
        'INSERT INTO workout_sessions (date, workout_mode, max_level, total_reps, duration_minutes) VALUES (?, ?, ?, ?, ?)',
        workout.date, workout.workoutMode, workout.maxLevel, workout.totalReps, workout.durationMinutes
      );
      
      return { success: true, data: result.lastInsertRowId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const databaseService = new DatabaseService();
```

## API Client Configuration

BeepRunner operates **offline-first** with local SQLite database, eliminating need for HTTP client configuration. All data operations are handled through the DatabaseService with the following patterns:

- **Async/await**: All database operations return Promises
- **Error handling**: Consistent error objects with success/failure states  
- **Transaction support**: Batch operations for data integrity
- **Type safety**: TypeScript interfaces for all data models
