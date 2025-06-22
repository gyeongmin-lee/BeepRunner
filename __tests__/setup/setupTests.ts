/**
 * Test Setup for BeepRunner
 * Global test configuration and mocks
 */

// Note: extend-expect may not be available in all versions of @testing-library/react-native

// Mock Expo modules
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  })),
}));

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    seekTo: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({
    didJustFinish: false,
  })),
  setAudioModeAsync: jest.fn(),
  requestRecordingPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: 'Svg',
    Svg: 'Svg',
    Circle: 'Circle',
    Path: 'Path',
    Line: 'Line',
    Text: 'Text',
    G: 'G',
    Rect: 'Rect',
  };
});

// Mock React Native Alert
const mockAlert = jest.fn();

// Set up the global mock
global.mockAlert = mockAlert;

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.Alert = {
    alert: mockAlert,
  };
  
  return RN;
});

// Mock @expo/vector-icons to prevent icon loading state updates
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    const MockedIcon = 'Icon';
    return React.createElement(MockedIcon, { ...props, ref });
  });
});

// Note: Async storage mocking can be added when needed for specific tests

// Global test utilities
global.testTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Silence console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});