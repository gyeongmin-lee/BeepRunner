# State Management

## Store Structure

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

## State Management Template

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
