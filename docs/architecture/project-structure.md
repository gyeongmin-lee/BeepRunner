# Project Structure

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
