# BeepRunner Frontend Architecture Document

## Template and Framework Selection

BeepRunner is built using **React Native Expo** managed workflow, providing a unified development experience across iOS, Android, and web platforms. The project utilizes Expo SDK 53+ with the latest React Native capabilities while maintaining cross-platform compatibility.

### Framework Rationale

**Expo React Native** was selected for:
- **Cross-platform deployment**: Single codebase supporting iOS, Android, and web
- **Managed workflow**: Streamlined development without native code complexity
- **Rich ecosystem**: Built-in modules for audio, database, navigation, and device APIs
- **Testing integration**: Excellent Jest and React Native Testing Library support
- **Rapid prototyping**: Hot reloading and expo-dev-client for fast iteration

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-06-21 | 1.0 | Initial architecture document reflecting current implementation | AI Development Team |

## Frontend Tech Stack

### Technology Stack Table

| Category              | Technology                | Version     | Purpose                           | Rationale                                                    |
| :-------------------- | :------------------------ | :---------- | :-------------------------------- | :----------------------------------------------------------- |
| **Framework**         | React Native              | 0.79.3      | Cross-platform mobile framework  | Industry standard for cross-platform mobile development     |
| **Development Tools** | Expo                      | 53.0.11     | Development and build platform    | Managed workflow reducing native complexity                  |
| **Language**          | TypeScript                | ~5.8.3      | Type-safe JavaScript              | Enhanced developer experience and error prevention           |
| **Routing**           | Expo Router               | ~5.0.7      | File-based navigation             | Simplified routing with type safety                         |
| **Database**          | expo-sqlite               | ~15.2.12    | Local data persistence            | Offline-first architecture without external dependencies    |
| **Audio**             | expo-audio                | ~0.4.6      | Cross-platform audio management  | Modern replacement for deprecated expo-av                   |
| **State Management**  | React Hooks               | 19.0.0      | Component state management        | Lightweight solution avoiding heavy frameworks              |
| **Styling**           | StyleSheet + Theme System | React Native | Component styling with theming   | Native React Native styling with custom theme abstraction  |
| **Testing**           | Jest + React Native TL    | ~29.7.0     | Unit and component testing        | Comprehensive testing with Expo compatibility              |
| **Icons**             | @expo/vector-icons        | ^14.1.0     | Icon library                      | Material Design icons with cross-platform consistency      |
| **Font Loading**      | expo-font                 | ~13.3.1     | Custom font management            | Typography control for brand consistency                    |
| **Build Tool**        | Expo CLI                  | 53.0.11     | Development and production builds | Integrated build system with EAS Build for distribution    |
| **Dev Tools**         | ESLint + Expo Config      | ^9.25.0     | Code quality and consistency      | Enforced coding standards with framework-specific rules    |

## Project Structure

```
BeepRunner/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with theme provider
│   ├── index.tsx                # Home screen with mode selection
│   ├── personal-timer.tsx       # Personal calibration and timer
│   ├── standard-timer.tsx       # Standard beep test timer
│   └── +not-found.tsx          # 404 error screen
├── components/                   # Reusable UI components
│   ├── timer/                   # Timer-specific components
│   │   ├── CountdownDisplay.tsx # Workout timer display
│   │   ├── LevelIndicator.tsx   # Current level and rep display
│   │   ├── ProgressBar.tsx      # Workout progress visualization
│   │   ├── ScreenHeader.tsx     # Custom navigation headers
│   │   ├── TimerControls.tsx    # Play/pause/finish controls
│   │   ├── WorkoutSummary.tsx   # Post-workout results
│   │   └── index.ts             # Component exports
│   ├── ui/                      # Generic UI components
│   │   ├── IconSymbol.tsx       # Cross-platform icon wrapper
│   │   └── IconSymbol.ios.tsx   # iOS-specific icon implementation
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
│   │   ├── useCalibration.tsx   # Personal mode calibration
│   │   └── index.ts             # Hook exports
│   ├── useColorScheme.ts        # Theme detection
│   └── useThemeColor.ts         # Theme color access
├── services/                     # Business logic and external integrations
│   └── DatabaseService.ts       # SQLite database operations
├── __tests__/                    # Comprehensive testing suite
│   ├── unit/                    # Unit tests for utilities and hooks
│   ├── components/              # Component testing
│   ├── integration/             # End-to-end workflow tests
│   ├── e2e/                     # Cross-platform testing
│   └── setup/                   # Test configuration and mocks
├── assets/                       # Static assets
│   ├── audio/                   # MP3 audio files
│   ├── fonts/                   # Custom fonts
│   └── images/                  # Icons and splash screens
└── docs/                         # Project documentation
    ├── PRD.md                   # Product requirements
    ├── architecture.md          # This document
    ├── CLAUDE_CONTEXT.md        # Development context
    └── TESTING.md               # Testing guide
```

## Component Standards

### Component Template

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ExampleComponentProps {
  title: string;
  mode: 'personal' | 'standard';
  onPress?: () => void;
}

export function ExampleComponent({ title, mode, onPress }: ExampleComponentProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
  },
});
```

### Naming Conventions

- **Components**: PascalCase (e.g., `CountdownDisplay`, `TimerControls`)
- **Files**: PascalCase matching component name (e.g., `CountdownDisplay.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useTimer`, `useCalibration`)
- **Services**: PascalCase with "Service" suffix (e.g., `DatabaseService`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `STANDARD_LEVELS`, `MODE_COLORS`)
- **Interfaces**: PascalCase with descriptive naming (e.g., `LevelConfig`, `CalibrationData`)
- **Props interfaces**: ComponentName + "Props" (e.g., `CountdownDisplayProps`)

## State Management

### Store Structure

BeepRunner uses **custom React hooks** for state management, avoiding heavy frameworks:

```
State Management Architecture:
├── useTimer.tsx              # Unified timer logic for both modes
│   ├── Timer state (running, paused, current level/rep)
│   ├── Workout progression tracking
│   ├── Pause/resume functionality
│   └── Completion detection
├── useCalibration.tsx        # Personal mode calibration
│   ├── Measurement state (countdown, measuring, completed)
│   ├── Previous calibration detection
│   ├── Distance calculation and validation
│   └── Difficulty feedback processing
└── AudioProvider.tsx         # Audio context management
    ├── Audio player initialization
    ├── Beep playback coordination
    ├── Volume and permission handling
    └── Error recovery and fallbacks
```

### State Management Template

```typescript
import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '@/services/DatabaseService';

interface TimerState {
  isRunning: boolean;
  currentLevel: number;
  currentRep: number;
  totalReps: number;
  timeRemaining: number;
}

export function useTimer(levels: LevelConfig[], mode: 'personal' | 'standard') {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentLevel: 1,
    currentRep: 0,
    totalReps: 0,
    timeRemaining: levels[0]?.interval || 9.0,
  });

  const startTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Timer logic implementation...

  return {
    timerState,
    startTimer,
    pauseTimer,
    // Additional timer controls...
  };
}
```

## API Integration

### Service Template

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

### API Client Configuration

BeepRunner operates **offline-first** with local SQLite database, eliminating need for HTTP client configuration. All data operations are handled through the DatabaseService with the following patterns:

- **Async/await**: All database operations return Promises
- **Error handling**: Consistent error objects with success/failure states  
- **Transaction support**: Batch operations for data integrity
- **Type safety**: TypeScript interfaces for all data models

## Routing

### Route Configuration

Expo Router provides file-based routing with automatic screen generation:

```typescript
// app/_layout.tsx - Root layout
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'BeepRunner' }} />
          <Stack.Screen name="personal-timer" options={{ title: 'Personal Training' }} />
          <Stack.Screen name="standard-timer" options={{ title: 'Standard Test' }} />
        </Stack>
      </AudioProvider>
    </ThemeProvider>
  );
}

// Navigation patterns
import { router } from 'expo-router';

// Programmatic navigation
router.push('/personal-timer');
router.replace('/standard-timer'); 
router.back();

// Navigation with parameters
router.push({
  pathname: '/workout-summary',
  params: { workoutId: '123', mode: 'personal' }
});
```

## Styling Guidelines

### Styling Approach

BeepRunner uses **React Native StyleSheet** with a custom theme system:

```typescript
// Theme-aware styling pattern
import { StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MODE_COLORS } from '@/constants/BeepTestConfig';

export function ThemedComponent({ mode }: { mode: 'personal' | 'standard' }) {
  const backgroundColor = useThemeColor({}, 'background');
  const modeColor = MODE_COLORS[mode.toUpperCase()];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: modeColor }]}>
        Timer Display
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    minHeight: 44, // Accessibility minimum touch target
  },
  title: {
    fontSize: 32,
    fontWeight: '500', // Modern medium weight
    textAlign: 'center',
  },
});
```

### Global Theme Variables

```typescript
// constants/Colors.ts - Theme system
export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    surface: '#1E1E1E',
    border: '#333333',
  },
};

// Mode-specific colors (consistent across themes)
export const MODE_COLORS_MUTED = {
  PERSONAL: '#6B8FB5',        // Muted blue
  PERSONAL_LIGHT: '#A8C1E0',  // Light blue
  PERSONAL_TINT: '#F0F4F8',   // Blue tint
  STANDARD: '#7BA05B',        // Muted green
  STANDARD_LIGHT: '#A8C487',  // Light green
  STANDARD_TINT: '#F4F7F0',   // Green tint
  ACCENT: '#E17B47',          // Muted orange
  DANGER: '#D14343',          // Muted red
};
```

## Testing Requirements

### Component Test Template

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CountdownDisplay } from '@/components/timer/CountdownDisplay';

describe('CountdownDisplay', () => {
  const defaultProps = {
    timeRemaining: 5.5,
    currentRep: 3,
    totalReps: 15,
    maxReps: 7,
    mode: 'personal' as const,
  };

  it('should render countdown time correctly', () => {
    const { getByText } = render(<CountdownDisplay {...defaultProps} />);
    
    expect(getByText('5.50')).toBeTruthy();
  });

  it('should display rep progress', () => {
    const { getByText } = render(<CountdownDisplay {...defaultProps} />);
    
    expect(getByText('Rep 3 of 7')).toBeTruthy();
    expect(getByText('Total: 15')).toBeTruthy();
  });

  it('should apply mode-specific styling', () => {
    const { getByTestId } = render(
      <CountdownDisplay {...defaultProps} mode="standard" />
    );
    
    const container = getByTestId('countdown-container');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.any(String), // Theme-specific color
    });
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components and utilities in isolation
2. **Integration Tests**: Test component interactions and data flow
3. **Hook Tests**: Test custom hooks with `renderHook` from React Native Testing Library
4. **Database Tests**: Use in-memory SQLite for testing database operations
5. **Timer Tests**: Use Jest fake timers for deterministic time-based testing
6. **Coverage Goals**: Maintain 80% overall, 90% business logic, 95% critical paths
7. **Mock Strategy**: Mock external dependencies (audio, database) while testing real logic

## Environment Configuration

### Required Environment Variables

```bash
# .env (for development)
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1

# Optional: Development flags
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false
```

### Platform-Specific Configuration

```javascript
// app.json - Expo configuration
{
  "expo": {
    "name": "BeepRunner",
    "slug": "beeprunner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "beeprunner",
    "userInterfaceStyle": "automatic", // Supports dark mode
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#6B8FB5"
    },
    "ios": {
      "bundleIdentifier": "com.beeprunner.app",
      "supportsTablet": true
    },
    "android": {
      "package": "com.beeprunner.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

## Frontend Developer Standards

### Critical Coding Rules

1. **Type Safety**: Always use TypeScript interfaces for props and data models
2. **Hook Dependencies**: Include all dependencies in useEffect dependency arrays
3. **Memory Management**: Clean up timers, subscriptions, and event listeners
4. **Error Boundaries**: Wrap critical components with error handling
5. **Accessibility**: Include testID for testing and accessibilityLabel for screen readers
6. **Performance**: Use React.memo() for expensive component re-renders
7. **Theme Compliance**: Always use ThemedText/ThemedView for consistent styling
8. **Mode Awareness**: Components should adapt to Personal/Standard mode contexts

### Quick Reference

```bash
# Common development commands
npm start              # Start Expo development server with tunnel
npm run android        # Launch Android emulator
npm run ios           # Launch iOS simulator
npm run web           # Launch web browser
npm run lint          # Run ESLint
npm run test          # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report

# Key import patterns
import { router } from 'expo-router';                    # Navigation
import { ThemedText } from '@/components/ThemedText';    # Themed components
import { MODE_COLORS } from '@/constants/BeepTestConfig'; # Mode colors
import { databaseService } from '@/services/DatabaseService'; # Database

# File naming conventions
ComponentName.tsx      # React components
serviceName.ts        # Business logic services
useHookName.tsx       # Custom React hooks
CONSTANTS.ts          # Configuration constants
```

### Architecture Decision Record

**Timer Architecture**: Custom hooks over Redux/Context for state management
- **Rationale**: Lightweight solution for focused fitness app without complex global state
- **Trade-offs**: More hook composition required, but better performance and simpler testing

**Database Choice**: SQLite over cloud storage for MVP
- **Rationale**: Offline-first fitness app, privacy-focused, no server infrastructure needed
- **Trade-offs**: No cross-device sync initially, but guaranteed privacy and performance

**Audio System**: expo-audio over react-native-sound
- **Rationale**: Better Expo integration, modern API, cross-platform consistency
- **Trade-offs**: Expo ecosystem dependency, but excellent development experience

**Testing Strategy**: Jest + React Native Testing Library over Detox for initial coverage
- **Rationale**: Faster feedback loop, easier to maintain, excellent unit/component coverage
- **Trade-offs**: Limited E2E coverage initially, but comprehensive logic testing

### Performance Considerations

1. **Timer Precision**: useRef for timer intervals preventing React re-render overhead
2. **Audio Loading**: Lazy loading of audio files with graceful fallbacks
3. **Database Queries**: Prepared statements and transaction batching for performance
4. **Component Optimization**: React.memo for timer components preventing unnecessary re-renders
5. **Memory Management**: Proper cleanup in useEffect hooks preventing memory leaks

### Future Architecture Considerations

**Phase 2 Enhancements** (Epic 6-7):
- **Chart Library**: react-native-chart-kit for workout analytics
- **Internationalization**: i18next for multi-language support
- **Theme Context**: Enhanced theme system for dark/light mode switching
- **Background Tasks**: expo-task-manager for background timer operation

**Scalability Patterns**:
- **Component Library**: Standardized UI components for rapid feature development
- **State Normalization**: Database schema designed for analytics and reporting
- **Plugin Architecture**: Modular features enabling future workout types (Yo-Yo test)
- **Performance Monitoring**: Integration points for analytics and crash reporting