# Testing Guide for BeepRunner

This guide provides comprehensive information about testing in the BeepRunner project, including setup, conventions, and best practices.

## Quick Start

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test categories
npm run test:unit        # Unit tests only
npm run test:components  # Component tests only
npm run test:integration # Integration tests only
```

## Test Organization

```
__tests__/
├── unit/           # Pure logic testing (90%+ coverage required)
│   ├── constants/  # Configuration and calculation functions
│   ├── hooks/      # React hooks testing
│   └── utils/      # Database services and utilities
├── components/     # UI component testing (80%+ coverage required)
├── integration/    # Feature workflow testing
├── e2e/           # End-to-end user journey testing
└── setup/         # Test configuration and utilities
    ├── setupTests.ts     # Global test setup and mocks
    ├── testUtils.tsx     # Reusable test utilities
    └── databaseMocks.ts  # Database testing utilities
```

## Testing Framework

- **Test Runner**: Jest with `jest-expo` preset
- **Component Testing**: React Native Testing Library
- **Mocking**: Jest mocks for Expo modules and React Native APIs
- **Coverage**: Jest coverage reporting with HTML and LCOV outputs

## Writing Tests

### Unit Tests

Test pure functions and business logic:

```typescript
// Example: Testing utility functions
describe('calculatePersonalIntervals', () => {
  it('should scale intervals based on measured time', () => {
    const personalIntervals = calculatePersonalIntervals(6.0);
    
    expect(personalIntervals).toHaveLength(STANDARD_LEVELS.length);
    personalIntervals.forEach((level, index) => {
      expect(level.interval).toBeLessThan(STANDARD_LEVELS[index].interval);
    });
  });
});
```

### Hook Tests

Test React hooks with `renderHook`:

```typescript
import { renderHook, act } from '@testing-library/react-native';

describe('useTimer', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTimer(defaultProps));
    
    expect(result.current.timerState.isRunning).toBe(false);
    expect(result.current.timerState.currentLevel).toBe(1);
  });
});
```

### Component Tests

Test UI components with React Native Testing Library:

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('CountdownDisplay', () => {
  it('should display countdown time correctly', () => {
    const { getByText } = render(
      <CountdownDisplay 
        timeRemaining={2.5} 
        currentRep={1} 
        totalReps={0} 
        maxReps={7} 
        mode="personal" 
      />
    );
    
    expect(getByText('2.50')).toBeTruthy();
  });
});
```

### Integration Tests

Test feature workflows and component interactions:

```typescript
describe('Calibration Workflow', () => {
  it('should complete calibration flow from start to finish', async () => {
    // Test complete user workflow
    // 1. Start calibration
    // 2. Complete measurement
    // 3. Save results
    // 4. Verify database persistence
  });
});
```

## Mocking Strategy

### Database Mocking

Use the provided database mocks for consistent testing:

```typescript
import { mockDatabaseService, resetMockDatabase } from '../setup/databaseMocks';

beforeEach(() => {
  resetMockDatabase();
});
```

### Audio Mocking

Audio functions are automatically mocked in `setupTests.ts`:

```typescript
const mockAudio = {
  initialize: jest.fn(() => Promise.resolve()),
  playBeep: jest.fn(),
  playStart: jest.fn(() => Promise.resolve()),
  // ... other audio methods
};
```

### Timer Mocking

Use Jest fake timers for timer-related tests:

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// In tests
act(() => {
  jest.advanceTimersByTime(2000); // Advance by 2 seconds
});
```

## Test Utilities

### Custom Render

Use the custom render function for components that need providers:

```typescript
import { render } from '../setup/testUtils';

// Automatically wraps with necessary providers
const { getByText } = render(<MyComponent />, { withAudio: true });
```

### Test Data Factories

Create test data using the provided utilities:

```typescript
import { createTestLevelConfigs, createTestTimerState } from '../setup/testUtils';

const testLevels = createTestLevelConfigs(); // Short intervals for testing
const testState = createTestTimerState({ isRunning: true });
```

## Coverage Requirements

- **Overall Coverage**: 80% minimum
- **Business Logic**: 90% minimum (constants, hooks, utilities)
- **Components**: 80% minimum
- **Critical Paths**: 95% minimum (timer logic, calibration)

### Checking Coverage

```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Best Practices

### Test Naming

- Use descriptive test names that explain the expected behavior
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### Test Structure

- **Arrange**: Set up test data and mocks
- **Act**: Execute the function or trigger the event
- **Assert**: Verify the expected outcome

### Mock Usage

- Mock external dependencies, not the code under test
- Use real implementations for simple utilities
- Mock complex systems (database, audio, network)

### Async Testing

- Always use `act()` wrapper for React state updates
- Properly await async operations
- Use `waitFor` for async assertions

## Debugging Tests

### Common Issues

1. **Timer Tests Failing**
   - Ensure fake timers are properly set up
   - Use `act()` when advancing timers
   - Clear timers between tests

2. **Component Tests Failing**
   - Check if components need providers (Audio, Theme)
   - Verify all required props are provided
   - Use the custom render function when needed

3. **Database Tests Failing**
   - Reset database mocks between tests
   - Check mock return values
   - Verify database service methods are properly mocked

### Debug Commands

```bash
# Run tests with verbose output
npm run test -- --verbose

# Run a specific test file
npm run test -- __tests__/unit/constants/BeepTestConfig.test.ts

# Debug failing tests
npm run test -- --no-coverage --verbose
```

## Continuous Integration

Tests are designed to run in CI environments:

- No external dependencies required
- All network calls are mocked
- Deterministic test results
- Fast execution (< 30 seconds for full suite)

## Contributing

When adding new features:

1. Write tests alongside feature code (TDD approach)
2. Ensure all tests pass: `npm run test`
3. Maintain coverage requirements
4. Update this guide if introducing new testing patterns
5. Run linting: `npm run lint`

## Test Categories

### Unit Tests ✅
- BeepTestConfig utility functions (17 tests)
- DatabaseService operations (15 tests)
- Hook logic (partial - needs completion)

### Component Tests ⏳
- Timer display components
- Control components
- UI components with theme support

### Integration Tests ⏳
- Complete user workflows
- Database + UI integration
- Audio + Timer coordination

### E2E Tests ⏳
- Critical user paths
- Cross-platform compatibility
- Performance validation

---

For questions or issues with testing, refer to the Jest documentation or the React Native Testing Library guides.