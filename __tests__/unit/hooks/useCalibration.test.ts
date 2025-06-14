/**
 * Unit Tests for useCalibration hook
 * Tests calibration state management, measurement logic, and database interactions
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCalibration } from '@/hooks/timer/useCalibration';
import { mockDatabaseService, resetMockDatabase } from '../../setup/databaseMocks';

// Mock the database service using the same approach as working tests
jest.mock('@/services/DatabaseService', () => {
  const { mockDatabaseService } = require('../../setup/databaseMocks');
  return {
    databaseService: mockDatabaseService,
  };
});

// Mock the audio provider
const mockAudio = {
  initialize: jest.fn(() => Promise.resolve()),
  playCountdownBeep: jest.fn(),
  playStart: jest.fn(),
  playComplete: jest.fn(),
};

jest.mock('@/components/AudioProvider', () => ({
  useAudio: () => mockAudio,
}));

describe('useCalibration', () => {
  // Helper to setup hooks without previous calibration
  const setupDefaultHook = () => {
    mockDatabaseService.getLatestCalibration.mockResolvedValue(null);
    return renderHook(() => useCalibration());
  };

  beforeEach(() => {
    jest.useFakeTimers();
    resetMockDatabase();
    
    // Mock Date.now for consistent timing
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = setupDefaultHook();

      expect(result.current.calibrationState).toEqual({
        measuredTime: null,
        estimatedDistance: null,
        isCountingDown: false,
        countdownNumber: 3,
        isMeasuring: false,
        measureStartTime: null,
      });
      expect(result.current.previousCalibration).toBeNull();
      expect(result.current.currentMeasurementTime).toBe(0);
    });

    it('should load previous calibration on mount', async () => {
      const mockPreviousCalibration = {
        id: 1,
        measured_time: 8.5,
        estimated_distance: 18.9,
        created_at: '2024-06-14T12:00:00.000Z',
      };
      
      mockDatabaseService.getLatestCalibration.mockResolvedValue(mockPreviousCalibration);

      const { result } = renderHook(() => useCalibration());

      // Just check if the mock was called
      await waitFor(() => {
        expect(mockDatabaseService.getLatestCalibration).toHaveBeenCalled();
      });

      // Then check if the state was updated
      await waitFor(() => {
        expect(result.current.previousCalibration).toEqual(mockPreviousCalibration);
      });
    });
  });

  describe('Calibration Controls', () => {
    it('should start calibration countdown', async () => {
      const { result } = setupDefaultHook();

      await act(async () => {
        await result.current.startCalibration();
      });

      expect(mockAudio.initialize).toHaveBeenCalled();
      expect(result.current.calibrationState.isCountingDown).toBe(true);
      expect(result.current.calibrationState.countdownNumber).toBe(3);
    });

    it('should handle countdown progression', async () => {
      const { result } = setupDefaultHook();

      await act(async () => {
        await result.current.startCalibration();
      });

      expect(result.current.calibrationState.isCountingDown).toBe(true);
      expect(result.current.calibrationState.countdownNumber).toBe(3);

      // First countdown tick (3 -> 2)
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.calibrationState.countdownNumber).toBe(2);
      expect(mockAudio.playCountdownBeep).toHaveBeenCalled();

      // Second countdown tick (2 -> 1)
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.calibrationState.countdownNumber).toBe(1);

      // Final countdown tick - should start measurement
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.calibrationState.isCountingDown).toBe(false);
      expect(result.current.calibrationState.isMeasuring).toBe(true);
      expect(mockAudio.playStart).toHaveBeenCalled();
    });

    it('should start measurement correctly', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startMeasurement();
      });

      expect(result.current.calibrationState.isMeasuring).toBe(true);
      expect(result.current.calibrationState.measureStartTime).toBe(1000000000000);
      expect(result.current.currentMeasurementTime).toBe(0);
    });

    it('should stop measurement and calculate results', () => {
      const { result } = renderHook(() => useCalibration());

      // Start measurement
      act(() => {
        result.current.startMeasurement();
      });

      // Advance time by 8.5 seconds
      const measurementDuration = 8500;
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + measurementDuration);

      act(() => {
        result.current.stopMeasurement();
      });

      expect(result.current.calibrationState.isMeasuring).toBe(false);
      expect(result.current.calibrationState.measuredTime).toBeCloseTo(8.5, 1);
      expect(result.current.calibrationState.estimatedDistance).toBeCloseTo(18.9, 1); // (8.5/9.0) * 20
      expect(mockAudio.playComplete).toHaveBeenCalled();
    });

    it('should reset calibration state', () => {
      const { result } = renderHook(() => useCalibration());

      // Set some state first
      act(() => {
        result.current.startMeasurement();
      });

      // Reset
      act(() => {
        result.current.resetCalibration();
      });

      expect(result.current.calibrationState).toEqual({
        measuredTime: null,
        estimatedDistance: null,
        isCountingDown: false,
        countdownNumber: 3,
        isMeasuring: false,
        measureStartTime: null,
      });
      expect(result.current.currentMeasurementTime).toBe(0);
    });
  });

  describe('Measurement Timer', () => {
    it('should update current measurement time during measurement', async () => {
      const { result } = renderHook(() => useCalibration());
      
      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      // Start measurement
      act(() => {
        result.current.startMeasurement();
      });

      // Advance Date.now by 2 seconds and advance timers
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 2000);
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.currentMeasurementTime).toBeCloseTo(2.0, 1);

      // Advance Date.now by another 3 seconds (total 5 seconds)
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 5000);
      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.currentMeasurementTime).toBeCloseTo(5.0, 1);
    });

    it('should stop updating time when measurement stops', async () => {
      const { result } = renderHook(() => useCalibration());
      
      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      // Start measurement
      act(() => {
        result.current.startMeasurement();
      });

      // Advance time to 2 seconds
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 2000);
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve(); // Allow async state updates
      });

      expect(result.current.currentMeasurementTime).toBeCloseTo(2.0, 1);

      // Stop measurement - this should clear the interval
      act(() => {
        result.current.stopMeasurement();
      });

      // Advance Date.now more but don't update currentMeasurementTime since measurement stopped
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 5000);
      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve(); // Allow async state updates
      });

      // Should still be around 2.0, not 5.0, because measurement was stopped
      expect(result.current.currentMeasurementTime).toBeCloseTo(2.0, 1);
    });
  });

  describe('Data Persistence', () => {
    it('should save calibration data', async () => {
      const { result } = setupDefaultHook();

      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      // Start measurement
      act(() => {
        result.current.startMeasurement();
      });

      expect(result.current.calibrationState.isMeasuring).toBe(true);
      expect(result.current.calibrationState.measureStartTime).toBe(startTime);

      // Advance time by 8.5 seconds
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 8500);

      // Stop measurement - this calculates measuredTime and estimatedDistance
      act(() => {
        result.current.stopMeasurement();
      });

      // Wait for state update to complete
      await waitFor(() => {
        expect(result.current.calibrationState.measuredTime).toBeCloseTo(8.5, 1);
        expect(result.current.calibrationState.estimatedDistance).toBeCloseTo(18.89, 1);
      });

      // Save calibration
      const saveResult = await result.current.saveCalibration();

      expect(saveResult).toBe(true);
      expect(mockDatabaseService.saveCalibration).toHaveBeenCalledWith(8.5, expect.any(Number));
    });

    it('should not save when no measurement data', async () => {
      const { result } = renderHook(() => useCalibration());

      const saveResult = await act(async () => {
        return result.current.saveCalibration();
      });

      expect(saveResult).toBe(false);
      expect(mockDatabaseService.saveCalibration).not.toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      const { result } = renderHook(() => useCalibration());

      // Set measurement results
      act(() => {
        result.current.startMeasurement();
      });

      jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + 8500);

      act(() => {
        result.current.stopMeasurement();
      });

      // Mock database error
      mockDatabaseService.saveCalibration.mockRejectedValue(new Error('Database error'));

      const saveResult = await act(async () => {
        return result.current.saveCalibration();
      });

      expect(saveResult).toBe(false);
    });

    it('should load previous calibration data when available', async () => {
      const mockPreviousCalibration = {
        id: 1,
        measured_time: 8.5,
        estimated_distance: 18.9,
        created_at: '2024-06-14T12:00:00.000Z',
      };

      // Mock the database to return previous calibration on mount
      mockDatabaseService.getLatestCalibration.mockResolvedValue(mockPreviousCalibration);

      const { result } = renderHook(() => useCalibration());

      // Wait for the mount effect to load previous calibration
      await waitFor(() => {
        expect(result.current.previousCalibration).toEqual(mockPreviousCalibration);
      });

      // Now the previous calibration should be loaded and we can use it
      await act(async () => {
        await result.current.loadPreviousCalibration();
      });

      expect(result.current.calibrationState.measuredTime).toBe(8.5);
      expect(result.current.calibrationState.estimatedDistance).toBe(18.9);
    });

    it('should handle load previous calibration when none exists', async () => {
      const { result } = renderHook(() => useCalibration());

      await expect(act(async () => {
        await result.current.loadPreviousCalibration();
      })).rejects.toThrow('No previous calibration available');
    });
  });

  describe('Edge Cases', () => {
    it('should handle stopMeasurement when not measuring', () => {
      const { result } = renderHook(() => useCalibration());

      // Should not crash when stopping measurement that wasn't started
      act(() => {
        result.current.stopMeasurement();
      });

      expect(result.current.calibrationState.isMeasuring).toBe(false);
      expect(mockAudio.playComplete).not.toHaveBeenCalled();
    });

    it('should handle very short measurements', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startMeasurement();
      });

      // Advance time by just 100ms
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + 100);

      act(() => {
        result.current.stopMeasurement();
      });

      expect(result.current.calibrationState.measuredTime).toBeCloseTo(0.1, 2);
      expect(result.current.calibrationState.estimatedDistance).toBeCloseTo(0.222, 2);
    });

    it('should handle very long measurements', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startMeasurement();
      });

      // Advance time by 30 seconds (very slow)
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000 + 30000);

      act(() => {
        result.current.stopMeasurement();
      });

      expect(result.current.calibrationState.measuredTime).toBeCloseTo(30.0, 1);
      expect(result.current.calibrationState.estimatedDistance).toBeCloseTo(66.7, 1); // (30/9) * 20
    });
  });
});