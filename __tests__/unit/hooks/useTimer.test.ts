/**
 * Unit Tests for useTimer hook
 * Tests timer state management, workout logic, and external interactions
 */

// Mock the database service
jest.mock('@/services/DatabaseService', () => {
  const { mockDatabaseService } = require('../../setup/databaseMocks');
  return {
    databaseService: mockDatabaseService,
  };
});

// Import Alert to access the mock
import { Alert } from 'react-native';

import { renderHook, act } from '@testing-library/react-native';
import { createTestLevelConfigs, createMockAudioPlayer } from '../../setup/testUtils';
import { mockDatabaseService, resetMockDatabase } from '../../setup/databaseMocks';
import { useTimer, UseTimerProps } from '@/hooks/timer/useTimer';

// Mock the audio provider
const mockAudio = {
  initialize: jest.fn(() => Promise.resolve()),
  playBeep: jest.fn(),
  playCountdownBeep: jest.fn(),
  playStart: jest.fn(() => Promise.resolve()),
  playLevelUp: jest.fn(),
  playComplete: jest.fn(() => Promise.resolve()),
  playCountdown: jest.fn(() => Promise.resolve()),
};

jest.mock('@/components/AudioProvider', () => ({
  useAudio: () => mockAudio,
}));

describe('useTimer', () => {
  const defaultProps: UseTimerProps = {
    mode: 'personal',
    levelConfigs: createTestLevelConfigs(),
    onWorkoutComplete: jest.fn(),
    workoutNotes: 'Test workout',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    resetMockDatabase();
    
    // Setup Alert mock properly
    (Alert.alert as jest.Mock) = jest.fn();
    
    // Reset the Date.now mock to a consistent time
    const mockTime = 1000000000000; // Fixed timestamp
    const dateSpy = jest.spyOn(Date, 'now');
    dateSpy.mockReturnValue(mockTime);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      expect(result.current.timerState).toEqual({
        currentLevel: 1,
        currentRep: 1,
        totalReps: 0,
        isRunning: false,
        isPaused: false,
        timeRemaining: 2.0, // First level interval from test config
        workoutStartTime: null,
        repStartTime: null,
        pausedTime: 0,
        pauseStartTime: null,
      });
      expect(result.current.workoutSessionId).toBeNull();
    });

    it('should update timeRemaining when levelConfigs change', () => {
      const { result, rerender } = renderHook(
        (props: UseTimerProps) => useTimer(props),
        { initialProps: { ...defaultProps, levelConfigs: [] } }
      );

      // Initially no configs, timeRemaining should be 0
      expect(result.current.timerState.timeRemaining).toBe(0);

      // Update with level configs
      rerender({ ...defaultProps, levelConfigs: createTestLevelConfigs() });

      expect(result.current.timerState.timeRemaining).toBe(2.0);
    });
  });

  describe('Timer Controls', () => {
    it('should start timer correctly', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      await act(async () => {
        await result.current.startTimer();
      });

      expect(mockAudio.initialize).toHaveBeenCalled();
      expect(mockAudio.playStart).toHaveBeenCalled();
      expect(result.current.timerState.isRunning).toBe(true);
      expect(result.current.timerState.isPaused).toBe(false);
      expect(result.current.timerState.workoutStartTime).toBe(1000000000000);
      expect(result.current.timerState.repStartTime).toBe(1000000000000);
    });

    it('should pause and resume timer correctly', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      // Start timer first
      await act(async () => {
        await result.current.startTimer();
      });

      // Pause
      await act(async () => {
        result.current.pauseTimer();
      });

      expect(result.current.timerState.isPaused).toBe(true);
      expect(result.current.timerState.pauseStartTime).toBe(1000000000000);

      // Advance time for pause duration
      const pauseDuration = 5000;
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + pauseDuration);

      // Resume
      await act(async () => {
        result.current.pauseTimer();
      });

      expect(result.current.timerState.isPaused).toBe(false);
      expect(result.current.timerState.pausedTime).toBe(pauseDuration);
      expect(result.current.timerState.pauseStartTime).toBeNull();
    });

    it('should reset timer to initial state', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      // Start and modify state
      await act(async () => {
        await result.current.startTimer();
      });

      // Reset
      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.timerState).toEqual({
        currentLevel: 1,
        currentRep: 1,
        totalReps: 0,
        isRunning: false,
        isPaused: false,
        timeRemaining: 2.0,
        workoutStartTime: null,
        repStartTime: null,
        pausedTime: 0,
        pauseStartTime: null,
      });
      expect(result.current.workoutSessionId).toBeNull();
    });
  });

  describe('Timer Countdown Logic', () => {
    it('should count down and advance to next rep', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));
      const startTime = 1000000000000;

      await act(async () => {
        await result.current.startTimer();
      });

      // Advance Date.now by 2.1 seconds and timer by same amount
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 2100);
      await act(async () => {
        jest.advanceTimersByTime(2100); // Slightly more than the 2s interval
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.timerState.currentRep).toBe(2);
      expect(result.current.timerState.totalReps).toBe(1);
      expect(mockAudio.playBeep).toHaveBeenCalled();
    });

    it('should advance to next level when current level is complete', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));
      const startTime = 1000000000000;

      // Mock Date.now to return a predictable time
      let currentTime = startTime;
      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Start the timer
      await act(async () => {
        await result.current.startTimer();
      });

      // Advance through level 1 (3 reps of 2.0s each = 6s)
      // Rep 1 complete (2s)
      await act(async () => {
        currentTime = startTime + 2100; // 2.1s to ensure rep completes
        jest.advanceTimersByTime(2100);
        await Promise.resolve();
      });

      expect(result.current.timerState.currentRep).toBe(2);
      expect(result.current.timerState.totalReps).toBe(1);
      expect(mockAudio.playBeep).toHaveBeenCalled();

      // Rep 2 complete (4s total)
      await act(async () => {
        currentTime = startTime + 4100;
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      expect(result.current.timerState.currentRep).toBe(3);
      expect(result.current.timerState.totalReps).toBe(2);

      // Rep 3 complete - should advance to level 2 (6s total)
      await act(async () => {
        currentTime = startTime + 6100;
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      expect(result.current.timerState.currentLevel).toBe(2);
      expect(result.current.timerState.currentRep).toBe(1);
      expect(result.current.timerState.totalReps).toBe(3);
      expect(mockAudio.playLevelUp).toHaveBeenCalled();
    });

    it('should complete workout when all levels are finished', async () => {
      const onWorkoutComplete = jest.fn();
      const { result } = renderHook(() => 
        useTimer({ ...defaultProps, onWorkoutComplete })
      );
      const startTime = 1000000000000;

      // Mock Date.now to return a predictable time
      let currentTime = startTime;
      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Start the timer
      await act(async () => {
        await result.current.startTimer();
      });

      // Complete all levels:
      // Level 1: 3 reps * 2.0s = 6s
      // Level 2: 3 reps * 1.5s = 4.5s  
      // Level 3: 3 reps * 1.0s = 3s
      // Total: 13.5s

      // Complete level 1 progressively
      // Rep 1
      await act(async () => {
        currentTime = startTime + 2100;
        jest.advanceTimersByTime(2100);
        await Promise.resolve();
      });

      // Rep 2
      await act(async () => {
        currentTime = startTime + 4100;
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      // Rep 3 - should advance to level 2
      await act(async () => {
        currentTime = startTime + 6100;
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      expect(result.current.timerState.currentLevel).toBe(2);

      // Complete level 2 progressively (1.5s per rep)
      // Rep 1
      await act(async () => {
        currentTime = startTime + 7600; // 6.1 + 1.5
        jest.advanceTimersByTime(1500);
        await Promise.resolve();
      });

      // Rep 2
      await act(async () => {
        currentTime = startTime + 9100; // 7.6 + 1.5
        jest.advanceTimersByTime(1500);
        await Promise.resolve();
      });

      // Rep 3 - should advance to level 3
      await act(async () => {
        currentTime = startTime + 10600; // 9.1 + 1.5
        jest.advanceTimersByTime(1500);
        await Promise.resolve();
      });

      expect(result.current.timerState.currentLevel).toBe(3);

      // Complete level 3 progressively (1.0s per rep)
      // Rep 1
      await act(async () => {
        currentTime = startTime + 11600; // 10.6 + 1.0
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Rep 2
      await act(async () => {
        currentTime = startTime + 12600; // 11.6 + 1.0
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Rep 3 - should complete workout
      await act(async () => {
        currentTime = startTime + 13600; // 12.6 + 1.0
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      expect(result.current.timerState.isRunning).toBe(false);
      expect(mockAudio.playComplete).toHaveBeenCalled();
      expect(mockDatabaseService.saveWorkout).toHaveBeenCalled();
      expect(onWorkoutComplete).toHaveBeenCalledWith(1); // Mock returns ID 1
    });
  });

  describe('Finish Workout', () => {
    it('should show confirmation dialog when finishing workout', () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      act(() => {
        result.current.finishWorkout();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Finish Workout',
        expect.stringContaining('Finish workout at Level 1 with 0 reps?'),
        expect.any(Array)
      );
    });

    it('should handle finish confirmation correctly', async () => {
      const onWorkoutComplete = jest.fn();
      const { result } = renderHook(() => 
        useTimer({ ...defaultProps, onWorkoutComplete })
      );

      // Start timer and advance some time
      await act(async () => {
        await result.current.startTimer();
      });

      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 1000);
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow async state updates
      });

      // Trigger finish
      act(() => {
        result.current.finishWorkout();
      });

      // Simulate user confirming finish
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1]; // Second button (Finish)

      await act(async () => {
        await confirmButton.onPress();
      });

      expect(result.current.timerState.isRunning).toBe(false);
      expect(mockDatabaseService.saveWorkout).toHaveBeenCalled();
      expect(onWorkoutComplete).toHaveBeenCalledWith(1);
    });

    it('should handle finish cancellation correctly', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      await act(async () => {
        await result.current.startTimer();
      });

      // Trigger finish
      act(() => {
        result.current.finishWorkout();
      });

      // Simulate user canceling finish
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2][0]; // First button (Cancel)

      act(() => {
        cancelButton.onPress();
      });

      expect(result.current.timerState.isRunning).toBe(true);
      expect(result.current.timerState.isPaused).toBe(false);
    });
  });

  describe('Workout Saving', () => {
    it('should save workout with correct data', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));

      await act(async () => {
        await result.current.startTimer();
      });

      // Advance some time and finish
      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 5000);
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve(); // Allow async state updates
      });

      act(() => {
        result.current.finishWorkout();
      });

      // Confirm finish
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1];

      await act(async () => {
        await confirmButton.onPress();
      });

      expect(mockDatabaseService.saveWorkout).toHaveBeenCalledWith({
        date: expect.any(String),
        workout_mode: 'personal',
        max_level: expect.any(Number),
        total_reps: expect.any(Number),
        duration_minutes: expect.any(Number),
        notes: 'Test workout',
      });
    });
  });

  describe('Pause Duration Calculation', () => {
    it('should correctly calculate time remaining with pauses', async () => {
      const { result } = renderHook(() => useTimer(defaultProps));
      const startTime = 1000000000000;

      await act(async () => {
        await result.current.startTimer();
      });

      // Run for 1 second
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 1000);
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow async state updates
      });

      // Pause for 2 seconds
      await act(async () => {
        result.current.pauseTimer();
      });

      // Advance time while paused - mock Date.now but advance by pause duration
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000); // Total: start + 1s run + 2s pause
      jest.advanceTimersByTime(2000);

      // Resume
      await act(async () => {
        result.current.pauseTimer();
      });

      // The timer should account for pause time correctly
      expect(result.current.timerState.pausedTime).toBe(2000);
      expect(result.current.timerState.isPaused).toBe(false);
    });
  });
});