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
- **Audio**: expo-av for beep sounds and voice announcements
- **Background**: expo-background-task for continuous timer operation
- **Charts**: react-native-chart-kit for progress visualization
- **Navigation**: React Navigation v6 with Expo Router

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
```

### Theme System

Components use `useThemeColor` hook to automatically adapt to light/dark mode. ThemedText and ThemedView components provide consistent styling across the app.

### Design Guidelines

- **Mode Colors**: Blue (Personal mode), Green (Standard mode)
- **Large touch targets**: Minimum 44x44pt for workout controls
- **High contrast text**: Readable during exercise
- **Immediate feedback**: Visual/audio response to all actions

### Configuration

- Expo SDK ~53 with New Architecture enabled
- TypeScript with strict mode
- Path mapping configured for `@/*` imports
- ESLint with Expo flat config

## Development Workflow

### Required References
**ALWAYS** reference these files when performing development tasks:

1. **PRD.md**: Contains complete feature specifications, acceptance criteria, user stories, and business logic
2. **CLAUDE_CONTEXT.md**: Tracks current development status, completed tasks, and next steps

### Task Execution Protocol

When performing any development task:

1. **Before Starting**:
   - Read `CLAUDE_CONTEXT.md` to understand current project status
   - Reference `PRD.md` for relevant feature specifications and acceptance criteria
   - Check if task aligns with development milestones (Phase 1: MVP, Phase 2: Enhancement)

2. **During Development**:
   - Follow acceptance criteria exactly as specified in PRD.md
   - Implement standard level configurations and calibration logic as documented
   - Adhere to design guidelines (mode colors, touch targets, feedback requirements)
   - Use established database schema and API interfaces

3. **After Completion**:
   - **ALWAYS** update `CLAUDE_CONTEXT.md`:
     - Move completed items from "Current Tasks" to "Completed Tasks"
     - Add any new issues discovered to "Known Issues" 
     - Update "Recent Changes" with what was accomplished
     - Adjust "Next Steps" based on current progress
   - Test implementation against acceptance criteria
   - Run linting: `npm run lint`

### Priority Guidelines

- **P0 (MVP)**: Must be completed for initial release
  - Epic 0: Home screen and mode selection
  - Epic 1: Standard Beep Test
  - Epic 2: Personal Beep Test with calibration  
  - Epic 3: Core timer engine
- **P1 (Post-MVP)**: Enhanced features for later releases
  - Epic 4: Advanced record management and analytics

### Context Management

The `CLAUDE_CONTEXT.md` file serves as the single source of truth for:
- What has been completed vs what needs to be done
- Current development priorities and blockers
- Session-to-session continuity for development work

**Never start development work without first updating your understanding from CLAUDE_CONTEXT.md**