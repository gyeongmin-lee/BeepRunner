# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BeepRunner is a specialized shuttle run timer app built with Expo React Native. It provides two main modes: Standard Beep Test (20m regulation) and Personal Beep Test (customizable for any space). The app supports iOS, Android, and web platforms.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with tunnel for device testing)
npm start

# Platform-specific development
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser

# Testing (REQUIRED for all feature development)
npm run test             # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
npm run test:unit        # Run unit tests only
npm run test:components  # Run component tests only
npm run test:integration # Run integration tests only

# Code quality
npm run lint       # ESLint with Expo config

# Reset to blank project (removes starter code)
npm run reset-project
```

## Core Features & Business Logic

### Two Main Workout Modes
1. **Standard Beep Test**: Regulation 20m shuttle run with fixed 9-level progression
2. **Personal Beep Test**: Space-calibrated version with adaptive difficulty

### Standard Level Configuration
```typescript
const STANDARD_LEVELS = [
  { level: 1, reps: 7, interval: 9.0 },    // 1-7회, 9초 간격
  { level: 2, reps: 8, interval: 8.0 },    // 8-15회, 8초 간격
  { level: 3, reps: 8, interval: 7.5 },    // 16-23회, 7.5초 간격
  { level: 4, reps: 8, interval: 7.0 },    // 24-31회, 7초 간격
  { level: 5, reps: 9, interval: 6.5 },    // 32-40회, 6.5초 간격
  { level: 6, reps: 9, interval: 6.2 },    // 41-49회, 6.2초 간격
  { level: 7, reps: 9, interval: 6.0 },    // 50-58회, 6초 간격
  { level: 8, reps: 9, interval: 5.9 },    // 59-67회, 5.9초 간격
  { level: 9, reps: 16, interval: 5.8 }    // 68-83회, 5.8초 간격
];
```

### Personal Mode Calibration Logic
```typescript
// Distance scaling calculation
user_time = measured_time  // User's calibration time
standard_time = 9.0       // 20m level 1 baseline
distance_ratio = standard_time / user_time
scaled_intervals = STANDARD_LEVELS.map(level => level.interval / distance_ratio)

// Adaptive difficulty adjustment
const DIFFICULTY_MULTIPLIERS = {
  'too_easy': 0.9,      // 10% faster
  'perfect': 1.0,       // No change
  'too_hard': 1.15      // 15% slower
};
```

## Technology Stack

- **Framework**: React Native Expo SDK ~53
- **Database**: SQLite (expo-sqlite) for offline workout history
- **Audio**: expo-audio for beep sounds and voice announcements
- **Background**: expo-background-task for continuous timer operation
- **Charts**: react-native-chart-kit for progress visualization
- **Navigation**: React Navigation v6 with Expo Router
- **Internationalization**: expo-localization + i18next for multi-language support
- **Theme Management**: React Context + AsyncStorage for dark/light mode
- **Settings Storage**: AsyncStorage (expo-async-storage) for user preferences
- **Testing**: Jest with jest-expo preset + React Native Testing Library
- **Test Coverage**: Jest coverage reporting with 80%+ target

## Architecture

- **Routing**: Expo Router with file-based routing in `/app` directory
- **Navigation**: Tab navigation using `@react-navigation/bottom-tabs`
- **Theming**: Custom theme system with light/dark mode support
- **Styling**: StyleSheet with theme-aware components (ThemedText, ThemedView)
- **Path Aliases**: `@/` maps to project root for imports

### Key Structure

- `/app/(tabs)/` - Tab-based screens (index.tsx, explore.tsx)
- `/app/_layout.tsx` - Root layout with theme provider and font loading
- `/components/` - Reusable UI components with themed variants
- `/constants/Colors.ts` - Theme color definitions
- `/hooks/` - Custom hooks including theme utilities
- `/__tests__/` - Comprehensive test suite organization
  - `/unit/` - Unit tests for hooks, utilities, and business logic
  - `/components/` - Component testing with React Native Testing Library
  - `/integration/` - Integration tests for feature workflows
  - `/e2e/` - End-to-end tests for critical user paths
  - `/setup/` - Test configuration, mocks, and utilities

### Database Schema

```sql
-- User calibration settings
CREATE TABLE calibration (
    id INTEGER PRIMARY KEY,
    measured_time REAL NOT NULL,
    estimated_distance REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workout history
CREATE TABLE workout_sessions (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    workout_mode TEXT NOT NULL, -- 'personal' | 'standard'
    max_level INTEGER NOT NULL,
    total_reps INTEGER NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Adaptive difficulty feedback (Personal mode only)
CREATE TABLE calibration_suggestions (
    id INTEGER PRIMARY KEY,
    workout_session_id INTEGER NOT NULL,
    suggestion_type TEXT NOT NULL, -- 'too_easy' | 'too_hard' | 'perfect'
    user_action TEXT, -- 'accepted' | 'declined' | 'ignored'
    difficulty_multiplier REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App settings storage
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Theme System

Enhanced theme system supporting dynamic light/dark mode switching:

```typescript
// Theme Context structure
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  currentTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  colors: ThemeColors;
}

// Color palette for both themes
interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  personal: string;    // Personal mode color
  standard: string;    // Standard mode color
  accent: string;      // Accent color
  danger: string;      // Danger/stop color
}
```

Components use the `useTheme` hook to access current theme colors and the theme switching function.

### Internationalization System

Multi-language support using i18next:

```typescript
// Language Context structure
interface LanguageContextType {
  language: 'ko' | 'en';
  setLanguage: (language: 'ko' | 'en' | 'auto') => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
}

// Translation file structure
// locales/ko.json - Korean translations
// locales/en.json - English translations
```

### Design Guidelines

- **Mode Colors**: Blue (Personal mode), Green (Standard mode) - consistent across themes
- **Large touch targets**: Minimum 44x44pt for workout controls
- **High contrast text**: Readable during exercise in both light and dark themes
- **Immediate feedback**: Visual/audio response to all actions
- **Theme-aware components**: All UI elements adapt to current theme
- **Language-aware layouts**: Text sizing and spacing optimized for Korean and English

### Configuration

- Expo SDK ~53 with New Architecture enabled
- TypeScript with strict mode
- Path mapping configured for `@/*` imports
- ESLint with Expo flat config

### Required Dependencies

For implementing the new features, ensure these dependencies are added:

```json
{
  "dependencies": {
    "expo-localization": "latest",
    "i18next": "latest",
    "react-i18next": "latest",
    "@react-native-async-storage/async-storage": "latest"
  },
  "devDependencies": {
    "jest": "~29.7.0",
    "jest-expo": "~53.0.7",
    "@testing-library/react-native": "^13.2.0",
    "@types/jest": "^29.5.14"
  }
}
```

## Testing Infrastructure

### Framework & Setup
- **Primary Framework**: Jest with `jest-expo` preset for Expo compatibility
- **Component Testing**: React Native Testing Library for UI component testing
- **Coverage Reporting**: Jest coverage with HTML and LCOV reports
- **Mock Strategy**: Comprehensive mocking for SQLite, Audio, and Timer systems

### Test Organization
```
__tests__/
├── unit/           # Business logic and utilities (90%+ coverage required)
│   ├── constants/  # Configuration and calculation functions
│   ├── hooks/      # Custom React hooks
│   └── utils/      # Database services and utilities
├── components/     # UI component tests (80%+ coverage required)
├── integration/    # Feature workflow tests
├── e2e/           # End-to-end user journey tests
└── setup/         # Test configuration and shared utilities
    ├── setupTests.ts     # Global test setup and mocks
    ├── testUtils.tsx     # Reusable test utilities and providers
    └── databaseMocks.ts  # Database mocking utilities
```

### Testing Best Practices

#### Unit Testing
- **Pure Functions**: Test all utility functions with edge cases
- **React Hooks**: Use `@testing-library/react-native` for hook testing
- **Business Logic**: Achieve 90%+ coverage for core calculations and algorithms
- **Error Handling**: Test both success and failure scenarios

#### Component Testing
- **Rendering**: Verify components render without crashing
- **Props**: Test all prop combinations and edge cases
- **User Interactions**: Test button presses, form inputs, and gestures
- **State Changes**: Verify component state updates correctly
- **Theme Integration**: Test both light and dark theme rendering

#### Integration Testing
- **User Workflows**: Test complete user journeys (calibration → workout → completion)
- **Database Integration**: Test data persistence and retrieval
- **Audio Integration**: Test audio cue coordination with timer state
- **Cross-Component**: Test component interactions and data flow

#### Mocking Strategy
- **SQLite Database**: In-memory database for integration tests, full mocks for unit tests
- **Audio System**: Mock `expo-audio` players and contexts
- **Timer Functions**: Jest fake timers with careful async handling
- **React Native APIs**: Mock platform-specific functionality

### Test Execution
- **Development**: Use `npm run test:watch` for continuous testing
- **Pre-commit**: Run `npm run test` before committing changes
- **Coverage**: Use `npm run test:coverage` for coverage analysis
- **CI/CD**: All tests must pass before deployment

### Quality Gates
- **Minimum Coverage**: 80% overall, 90% for business logic
- **Test Performance**: All tests complete in <30 seconds
- **Zero Failing Tests**: No failing tests in main branch
- **Regression Prevention**: Tests catch timer, audio, and database issues

## Development Workflow

### Required References
**ALWAYS** reference these files when performing development tasks:

1. **PRD.md**: Contains complete feature specifications, acceptance criteria, user stories, and business logic
2. **CLAUDE_CONTEXT.md**: Tracks current development status, completed tasks, and next steps

### Task Execution Protocol

**CRITICAL: When prompted, do not begin coding until you have 95% confidence that you know what to build. Ask follow-up questions until you have 95% confidence.**

When performing any development task:

1. **Before Starting**:
   - Read `CLAUDE_CONTEXT.md` to understand current project status
   - Reference `PRD.md` for relevant feature specifications and acceptance criteria
   - Check if task aligns with development milestones (Phase 1: MVP, Phase 2: Enhancement)
   - **TESTING**: Review existing tests related to the feature area
   - **TESTING**: Plan test cases alongside feature implementation

2. **During Development**:
   - Follow acceptance criteria exactly as specified in PRD.md
   - Implement standard level configurations and calibration logic as documented
   - Adhere to design guidelines (mode colors, touch targets, feedback requirements)
   - Use established database schema and API interfaces
   - **TESTING**: Write tests alongside feature code (Test-Driven Development)
   - **TESTING**: Run relevant test suites frequently during development
   - **TESTING**: Maintain test coverage as features are implemented

3. **After Completion** (ALL ITEMS MANDATORY):
   - **TESTING**: Run full test suite: `npm run test` (MUST PASS)
   - **TESTING**: Verify test coverage meets requirements (80%+ overall, 90%+ business logic)
   - **QUALITY**: Run linting: `npm run lint` (MUST PASS)
   - **DOCUMENTATION**: Update `CLAUDE_CONTEXT.md`:
     - Move completed items from "Current Tasks" to "Completed Tasks"
     - Add any new issues discovered to "Known Issues" 
     - Update "Recent Changes" with what was accomplished
     - Update testing status and coverage metrics
     - Adjust "Next Steps" based on current progress
   - **VALIDATION**: Test implementation against all acceptance criteria
   - **TESTING**: Update test documentation if new patterns introduced

### Quality Gates (MANDATORY)

**No feature is considered complete until ALL criteria are met:**

1. ✅ **All Tests Pass**: `npm run test` returns 0 failing tests
2. ✅ **Linting Passes**: `npm run lint` returns no errors  
3. ✅ **Coverage Requirements**: Meet minimum coverage thresholds
4. ✅ **Acceptance Criteria**: All PRD.md criteria verified
5. ✅ **Documentation Updated**: CLAUDE_CONTEXT.md reflects current state

**If any quality gate fails, the feature is NOT complete and must be fixed before moving to the next task.**

### Priority Guidelines

- **P0 (MVP)**: Must be completed for initial release
  - Epic 0: Home screen and mode selection
  - Epic 1: Standard Beep Test
  - Epic 2: Personal Beep Test with calibration  
  - Epic 3: Core timer engine
- **P1 (Post-MVP)**: Enhanced features for later releases
  - Epic 4: Advanced record management and analytics
  - Epic 5: App settings and personalization (multi-language, theme switching)

### Context Management

The `CLAUDE_CONTEXT.md` file serves as the single source of truth for:
- What has been completed vs what needs to be done
- Current development priorities and blockers
- Session-to-session continuity for development work

**Never start development work without first updating your understanding from CLAUDE_CONTEXT.md**