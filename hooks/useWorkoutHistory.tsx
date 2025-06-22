import { useState, useEffect, useCallback } from 'react';
import { databaseService, WorkoutSession } from '@/services/DatabaseService';

export interface UseWorkoutHistoryOptions {
  mode?: 'personal' | 'standard';
  limit?: number;
  autoLoad?: boolean;
}

export interface UseWorkoutHistoryReturn {
  workouts: WorkoutSession[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Promise<WorkoutSession[]>;
  getPersonalBest: (mode: 'personal' | 'standard') => Promise<WorkoutSession | null>;
}

export function useWorkoutHistory(options: UseWorkoutHistoryOptions = {}): UseWorkoutHistoryReturn {
  const { mode, limit = 50, autoLoad = true } = options;
  
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(limit);

  const loadWorkouts = useCallback(async (resetData = false) => {
    try {
      setLoading(true);
      setError(null);

      const loadLimit = resetData ? limit : currentLimit;
      const workoutData = await databaseService.getWorkoutHistory(mode, loadLimit);
      
      if (resetData) {
        setWorkouts(workoutData);
      } else {
        setWorkouts(prev => {
          // Merge new data, avoiding duplicates
          const existingIds = new Set(prev.map(w => w.id));
          const newWorkouts = workoutData.filter(w => !existingIds.has(w.id));
          return [...prev, ...newWorkouts];
        });
      }
      
      // Check if we have more data to load
      setHasMore(workoutData.length === loadLimit);
      
    } catch (err) {
      console.error('Failed to load workout history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout history');
    } finally {
      setLoading(false);
    }
  }, [mode, limit, currentLimit]);

  const refresh = useCallback(async () => {
    setCurrentLimit(limit);
    setError(null);
    setWorkouts([]);
    await loadWorkouts(true);
  }, [loadWorkouts, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const newLimit = currentLimit + limit;
    setCurrentLimit(newLimit);
    
    try {
      setLoading(true);
      const workoutData = await databaseService.getWorkoutHistory(mode, newLimit);
      
      setWorkouts(workoutData);
      setHasMore(workoutData.length === newLimit);
      
    } catch (err) {
      console.error('Failed to load more workouts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more workouts');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentLimit, limit, mode]);

  const getWorkoutsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await databaseService.getWorkoutsByDateRange(startDate, endDate);
    } catch (err) {
      console.error('Failed to get workouts by date range:', err);
      throw err;
    }
  }, []);

  const getPersonalBest = useCallback(async (mode: 'personal' | 'standard') => {
    try {
      return await databaseService.getPersonalBest(mode);
    } catch (err) {
      console.error('Failed to get personal best:', err);
      throw err;
    }
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, mode]); // Re-load when mode changes

  return {
    workouts,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
    getWorkoutsByDateRange,
    getPersonalBest,
  };
}