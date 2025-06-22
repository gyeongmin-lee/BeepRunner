/**
 * Unit tests for useWorkoutHistory hook
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { databaseService } from '@/services/DatabaseService';

// Mock the database service
jest.mock('@/services/DatabaseService', () => ({
  databaseService: {
    getWorkoutHistory: jest.fn(),
    getWorkoutsByDateRange: jest.fn(),
    getPersonalBest: jest.fn(),
  },
}));

const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

const mockWorkouts = [
  {
    id: 1,
    date: '2024-01-15T10:00:00Z',
    workout_mode: 'personal' as const,
    max_level: 5,
    total_reps: 32,
    duration_minutes: 12,
    notes: 'Good workout',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    date: '2024-01-14T09:00:00Z',
    workout_mode: 'standard' as const,
    max_level: 4,
    total_reps: 24,
    duration_minutes: 10,
    created_at: '2024-01-14T09:00:00Z',
  },
];

describe('useWorkoutHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabaseService.getWorkoutHistory.mockResolvedValue(mockWorkouts);
  });

  describe('initialization', () => {
    it('should load workouts on mount when autoLoad is true', async () => {
      mockDatabaseService.getWorkoutHistory.mockResolvedValue(mockWorkouts);

      const { result } = renderHook(() => useWorkoutHistory());

      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith(undefined, 50);
      expect(result.current.workouts).toEqual(mockWorkouts);
      expect(result.current.error).toBeNull();
    });

    it('should not load workouts on mount when autoLoad is false', () => {
      const { result } = renderHook(() => 
        useWorkoutHistory({ autoLoad: false })
      );

      expect(result.current.loading).toBe(false);
      expect(mockDatabaseService.getWorkoutHistory).not.toHaveBeenCalled();
      expect(result.current.workouts).toEqual([]);
    });

    it('should load workouts with specified mode filter', async () => {
      const { result } = renderHook(() => 
        useWorkoutHistory({ mode: 'personal' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith('personal', 50);
    });

    it('should load workouts with custom limit', async () => {
      const { result } = renderHook(() => 
        useWorkoutHistory({ limit: 25 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith(undefined, 25);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      mockDatabaseService.getWorkoutHistory.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.workouts).toEqual([]);
    });

    it('should handle non-Error exceptions', async () => {
      mockDatabaseService.getWorkoutHistory.mockRejectedValue('String error');

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load workout history');
    });
  });

  describe('refresh functionality', () => {
    it('should refresh workout data', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock and set new data
      mockDatabaseService.getWorkoutHistory.mockClear();
      const newWorkouts = [mockWorkouts[0]];
      mockDatabaseService.getWorkoutHistory.mockResolvedValue(newWorkouts);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith(undefined, 50);
      expect(result.current.workouts).toEqual(newWorkouts);
    });

    it('should clear error state on refresh', async () => {
      // Initial error
      mockDatabaseService.getWorkoutHistory.mockRejectedValue(new Error('Initial error'));
      
      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      // Successful refresh
      mockDatabaseService.getWorkoutHistory.mockResolvedValue(mockWorkouts);
      
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.workouts).toEqual(mockWorkouts);
    });
  });

  describe('loadMore functionality', () => {
    it('should load more workouts when hasMore is true', async () => {
      // Mock full limit returned to indicate more data available
      mockDatabaseService.getWorkoutHistory.mockResolvedValue(
        Array(50).fill(mockWorkouts[0]).map((w, i) => ({ ...w, id: i + 1 }))
      );

      const { result } = renderHook(() => useWorkoutHistory({ limit: 50 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);

      // Mock additional data for loadMore
      mockDatabaseService.getWorkoutHistory.mockClear();
      mockDatabaseService.getWorkoutHistory.mockResolvedValue([
        ...Array(50).fill(mockWorkouts[0]).map((w, i) => ({ ...w, id: i + 1 })),
        mockWorkouts[1]
      ]);

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith(undefined, 100);
    });

    it('should not load more when hasMore is false', async () => {
      // Mock partial data to indicate no more data
      mockDatabaseService.getWorkoutHistory.mockResolvedValue([mockWorkouts[0]]);

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);

      mockDatabaseService.getWorkoutHistory.mockClear();
      
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockDatabaseService.getWorkoutHistory).not.toHaveBeenCalled();
    });

    it('should not load more when already loading', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      // Call loadMore while still loading initial data
      await act(async () => {
        await result.current.loadMore();
      });

      // Should only have initial call, not additional loadMore call
      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('date range functionality', () => {
    it('should get workouts by date range', async () => {
      const dateRangeWorkouts = [mockWorkouts[0]];
      mockDatabaseService.getWorkoutsByDateRange.mockResolvedValue(dateRangeWorkouts);

      const { result } = renderHook(() => useWorkoutHistory());

      const workouts = await act(async () => {
        return await result.current.getWorkoutsByDateRange('2024-01-01', '2024-01-31');
      });

      expect(mockDatabaseService.getWorkoutsByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(workouts).toEqual(dateRangeWorkouts);
    });

    it('should handle date range errors', async () => {
      const errorMessage = 'Date range query failed';
      mockDatabaseService.getWorkoutsByDateRange.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useWorkoutHistory());

      await expect(
        result.current.getWorkoutsByDateRange('2024-01-01', '2024-01-31')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('personal best functionality', () => {
    it('should get personal best for specified mode', async () => {
      const personalBest = mockWorkouts[0];
      mockDatabaseService.getPersonalBest.mockResolvedValue(personalBest);

      const { result } = renderHook(() => useWorkoutHistory());

      const best = await act(async () => {
        return await result.current.getPersonalBest('personal');
      });

      expect(mockDatabaseService.getPersonalBest).toHaveBeenCalledWith('personal');
      expect(best).toEqual(personalBest);
    });

    it('should handle personal best errors', async () => {
      const errorMessage = 'Personal best query failed';
      mockDatabaseService.getPersonalBest.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useWorkoutHistory());

      await expect(
        result.current.getPersonalBest('standard')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('mode change reloading', () => {
    it('should reload data when mode option changes', async () => {
      const { result, rerender } = renderHook(
        ({ mode }) => useWorkoutHistory({ mode }),
        { initialProps: { mode: undefined as 'personal' | 'standard' | undefined } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith(undefined, 50);

      // Change mode
      mockDatabaseService.getWorkoutHistory.mockClear();
      rerender({ mode: 'personal' });

      await waitFor(() => {
        expect(mockDatabaseService.getWorkoutHistory).toHaveBeenCalledWith('personal', 50);
      });
    });
  });
});