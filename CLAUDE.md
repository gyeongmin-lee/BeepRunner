# BeepRunner - BMAD-Integrated Development Guide

This file provides guidance for working with BeepRunner using the BMAD (Breakthrough Method of Agile AI-driven Development) methodology.

## BMAD Integration

BeepRunner is configured for **BMAD v4 methodology** with brownfield development patterns:

### Key BMAD Agents
- **`/dev`** (James) - Full Stack Developer for implementation and debugging
- **`/sm`** (Bob) - Scrum Master for story creation and epic management  
- **`/bmad-master`** - Universal expert for comprehensive tasks
- **`/architect`** - Solution architect for technical design
- **`/qa`** - QA specialist for testing strategies

### Agent Usage Patterns
```bash
# Story creation from PRD epics
/sm
*create  # Execute create-next-story task

# Development implementation  
/dev
# Agent auto-loads context from devLoadAlwaysFiles
# Implement story sequentially, update checkboxes

# Universal expert for complex tasks
/bmad-master
*help  # Show available commands
```

### Project Configuration
The project follows BMAD v4 conventions with sharded documents:
- **`docs/prd.md`** - Product Requirements Document
- **`docs/architecture.md`** - Technical Architecture Document
- **`docs/stories/`** - Generated user stories from SM agent
- **`.bmad-core/core-config.yml`** - BMAD configuration

## Project Overview

BeepRunner is a specialized shuttle run timer app built with Expo React Native. It provides two main modes: Standard Beep Test (20m regulation) and Personal Beep Test (customizable for any space). The app supports iOS, Android, and web platforms.

### Current Implementation Status
- ✅ **MVP Complete**: All core P0 features implemented
- ✅ **Testing Infrastructure**: 86 passing tests with 33.54% overall coverage
- ✅ **Component Architecture**: 6 reusable timer components
- ✅ **Database System**: SQLite with comprehensive schema
- 🟡 **Epic 6**: Workout History & Analytics (In Progress)
- ⏳ **Epic 7**: Settings & Personalization (Planned)

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

## BMAD Development Workflow

### Story-Based Development Process

BeepRunner follows **sequential story development** using BMAD agent handoffs:

#### 1. Story Creation (SM Agent)
```bash
/sm
*create  # Execute create-next-story from docs/prd/ epics
```
- SM agent reads sharded PRD epics from `docs/prd/`
- Generates detailed user stories in `docs/stories/`
- Stories include tasks, acceptance criteria, and testing requirements
- Initial status: **Draft**

#### 2. Story Approval
- Review generated story in `docs/stories/`
- Update status from **Draft** → **Approved**
- Only proceed to development with approved stories

#### 3. Story Implementation (Dev Agent)
```bash
/dev
# Agent auto-loads devLoadAlwaysFiles context
# Provide story content to save lookup time
```
- Dev agent loads context from `core-config.yml` devLoadAlwaysFiles
- Implements story tasks sequentially
- Updates checkboxes: `[ ]` → `[-]` → `[x]`
- Writes tests alongside code (Test-Driven Development)
- Updates status: **Approved** → **InProgress** → **Done**

#### 4. Quality Gates (Mandatory)
Every story must pass ALL quality gates:
1. ✅ **All Tests Pass**: `npm run test` returns 0 failing tests
2. ✅ **Linting Passes**: `npm run lint` returns no errors  
3. ✅ **Coverage Requirements**: 80%+ overall, 90%+ business logic
4. ✅ **Acceptance Criteria**: All PRD requirements verified
5. ✅ **Story Status**: Updated to "Done" with completion notes

### Agent Handoff Protocol

**Clean Handoffs**: Always start fresh chat windows when switching agents
- **SM → Dev**: Provide story content in new dev agent chat
- **Dev → SM**: Complete current story before requesting next story
- **Sequential Execution**: Only 1 story in progress at a time

### Story Status Tracking
Stories progress through defined statuses:
- **Draft** → **Approved** → **InProgress** → **Done**

Each status change requires verification before proceeding.

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

### Key Project Structure

```
BeepRunner/
├── .bmad-core/                   # BMAD methodology configuration
├── app/                          # Expo Router screens
│   ├── index.tsx                # Home screen with mode selection
│   ├── personal-timer.tsx       # Personal calibration and timer
│   └── standard-timer.tsx       # Standard beep test timer
├── components/                   # Reusable UI components
│   ├── timer/                   # Timer-specific components (6 components)
│   │   ├── CountdownDisplay.tsx # Workout timer display
│   │   ├── LevelIndicator.tsx   # Current level and rep display
│   │   ├── ProgressBar.tsx      # Workout progress visualization
│   │   ├── ScreenHeader.tsx     # Custom navigation headers
│   │   ├── TimerControls.tsx    # Play/pause/finish controls
│   │   └── WorkoutSummary.tsx   # Post-workout results
│   ├── AudioProvider.tsx        # Audio context and management
│   ├── ThemedText.tsx           # Theme-aware text component
│   └── ThemedView.tsx           # Theme-aware view component
├── constants/                    # Configuration and constants
│   ├── BeepTestConfig.ts        # Business logic and calculations
│   ├── Colors.ts                # Theme color definitions
│   └── Typography.ts            # Font size and weight constants
├── hooks/                        # Custom React hooks
│   ├── timer/                   # Timer-specific hooks
│   │   ├── useTimer.tsx         # Unified timer logic
│   │   └── useCalibration.tsx   # Personal mode calibration
│   └── useThemeColor.ts         # Theme color access
├── services/                     # Business logic and external integrations
│   └── DatabaseService.ts       # SQLite database operations
├── docs/                         # BMAD documentation structure
│   ├── prd.md                   # Product Requirements Document
│   ├── architecture.md          # Technical Architecture Document
│   ├── prd/                     # Sharded PRD sections (future)
│   ├── architecture/            # Sharded architecture sections (future)
│   └── stories/                 # Generated user stories from SM agent
└── __tests__/                    # Comprehensive testing suite
    ├── unit/                    # Business logic and utilities
    ├── components/              # UI component testing
    ├── integration/             # Feature workflow tests
    └── setup/                   # Test configuration and mocks
```

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

### Design Guidelines

- **Mode Colors**: Blue (Personal mode), Green (Standard mode) - consistent across themes
- **Large touch targets**: Minimum 44x44pt for workout controls
- **High contrast text**: Readable during exercise in both light and dark themes
- **Immediate feedback**: Visual/audio response to all actions
- **Theme-aware components**: All UI elements adapt to current theme
- **Language-aware layouts**: Text sizing and spacing optimized for Korean and English

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

### Current Test Status
- **86 passing tests** across 5 test suites
- **Coverage**: 33.54% overall, 100% business logic (BeepTestConfig), 95% hooks
- **Business Logic**: 100% coverage on critical calculations and algorithms
- **Database**: 88% coverage on SQLite operations
- **Performance**: Full test suite completes in <8 seconds

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

### Test Execution with BMAD
- **Development**: Use `npm run test:watch` for continuous testing
- **Story Completion**: Run `npm run test` before marking story as Done
- **Coverage**: Use `npm run test:coverage` for coverage analysis
- **Quality Gates**: All tests must pass before story completion

## BMAD Quality Gates

### Mandatory Quality Criteria

**No story is considered complete until ALL criteria are met:**

1. ✅ **All Tests Pass**: `npm run test` returns 0 failing tests
2. ✅ **Linting Passes**: `npm run lint` returns no errors  
3. ✅ **Coverage Requirements**: Meet minimum coverage thresholds
4. ✅ **Acceptance Criteria**: All PRD.md criteria verified
5. ✅ **Story Status**: Updated to "Done" with dev agent completion notes

**If any quality gate fails, the story is NOT complete and must be fixed before proceeding to the next story.**

### Testing Requirements
- **Minimum Coverage**: 80% overall, 90% for business logic
- **Test Performance**: All tests complete in <30 seconds
- **Zero Failing Tests**: No failing tests in main branch
- **Regression Prevention**: Tests catch timer, audio, and database issues

## BMAD Agent Context Loading

### Dev Agent Auto-Loaded Files
The dev agent automatically loads these files via `core-config.yml` devLoadAlwaysFiles:
- `docs/architecture/coding-standards.md` (future)
- `docs/architecture/tech-stack.md` (future)
- `docs/architecture/project-structure.md` (future)

### Current Context Files
- **docs/prd.md** - Complete product requirements
- **docs/architecture.md** - Technical architecture
- **This CLAUDE.md** - Development guide and project overview

## Configuration

- **Expo SDK**: ~53 with New Architecture enabled
- **TypeScript**: Strict mode enabled for type safety
- **Path Mapping**: `@/*` imports configured
- **ESLint**: Expo flat config with framework-specific rules
- **BMAD**: v4 methodology with brownfield patterns

### Required Dependencies

Current production dependencies ensure MVP functionality:
```json
{
  "dependencies": {
    "expo": "53.0.11",
    "expo-audio": "~0.4.6",
    "expo-sqlite": "~15.2.12",
    "react-native": "0.79.3",
    "expo-router": "~5.0.7"
  },
  "devDependencies": {
    "jest": "~29.7.0",
    "jest-expo": "~53.0.7",
    "@testing-library/react-native": "^13.2.0",
    "@types/jest": "^29.5.14",
    "typescript": "~5.8.3"
  }
}
```

For future Epic 7 (Settings & Personalization), additional dependencies will be needed:
```json
{
  "dependencies": {
    "expo-localization": "latest",
    "i18next": "latest",
    "react-i18next": "latest",
    "@react-native-async-storage/async-storage": "latest"
  }
}
```

## Next Development Phase

### Epic 6: Workout History & Analytics (In Progress)
Ready for story creation using `/sm` agent:
- Database foundation already complete
- UI components established
- Chart library integration needed

### Epic 7: Settings & Personalization (Planned)
Architecture foundation prepared:
- Theme system infrastructure exists
- Multi-language support planned
- Settings management interface needed

### BMAD Development Approach
1. Use `/sm` to create stories from `docs/prd/epic-6*.md`
2. Implement stories sequentially with `/dev` agent
3. Maintain quality gates for each story
4. Update story status through workflow

---

**Remember**: BeepRunner follows BMAD methodology - use story-based development with SM → Dev agent handoffs for all feature development. Quality gates are mandatory for every story completion.