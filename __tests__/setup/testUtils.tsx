/**
 * Test Utilities for BeepRunner
 * Reusable testing helpers and providers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AudioProvider } from '@/components/AudioProvider';

// Mock providers for testing
const MockAudioProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAudioContext = {
    initialize: jest.fn(() => Promise.resolve()),
    playBeep: jest.fn(),
    playCountdownBeep: jest.fn(),
    playStart: jest.fn(() => Promise.resolve()),
    playLevelUp: jest.fn(),
    playComplete: jest.fn(() => Promise.resolve()),
    playCountdown: jest.fn(() => Promise.resolve()),
  };

  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAudio?: boolean;
}

const customRender = (
  ui: ReactElement,
  { withAudio = false, ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withAudio) {
      return <MockAudioProvider>{children}</MockAudioProvider>;
    }
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Timer testing utilities
export const timerHelpers = {
  advanceTimersByTime: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },
  runAllTimers: () => {
    jest.runAllTimers();
  },
  runOnlyPendingTimers: () => {
    jest.runOnlyPendingTimers();
  },
};

// Database testing utilities
export const createMockDatabase = () => ({
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
  getAllAsync: jest.fn(() => Promise.resolve([])),
});

// Audio testing utilities
export const createMockAudioPlayer = () => ({
  play: jest.fn(),
  seekTo: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
});

// Level configuration utilities for testing
export const createTestLevelConfigs = () => [
  { level: 1, reps: 3, interval: 2.0 }, // Short intervals for testing
  { level: 2, reps: 3, interval: 1.5 },
  { level: 3, reps: 3, interval: 1.0 },
];

// Timer state utilities for testing
export const createTestTimerState = (overrides = {}) => ({
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
  ...overrides,
});

// Calibration state utilities for testing
export const createTestCalibrationState = (overrides = {}) => ({
  measuredTime: null,
  estimatedDistance: null,
  isCountingDown: false,
  countdownNumber: 3,
  isMeasuring: false,
  measureStartTime: null,
  ...overrides,
});

// Wait for async operations in tests
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Act wrappers for timer operations
export const actHelpers = {
  // Wrap timer advancement with proper act() and async resolution
  advanceTimers: async (ms: number) => {
    const { act } = await import('@testing-library/react-native');
    await act(async () => {
      jest.advanceTimersByTime(ms);
      await Promise.resolve(); // Allow async state updates
    });
  },
  
  // Wrap async operations with act()
  withAct: async (fn: () => Promise<void> | void) => {
    const { act } = await import('@testing-library/react-native');
    await act(async () => {
      await fn();
    });
  },
};

// Export custom render as the default render
export * from '@testing-library/react-native';
export { customRender as render };