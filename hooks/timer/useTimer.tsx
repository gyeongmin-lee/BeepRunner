import { useAudio } from '@/components/AudioProvider';
import { LevelConfig } from '@/constants/BeepTestConfig';
import { databaseService } from '@/services/DatabaseService';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface TimerState {
  currentLevel: number;
  currentRep: number;
  totalReps: number;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  workoutStartTime: number | null;
  repStartTime: number | null;
  pausedTime: number;
  pauseStartTime: number | null;
}

export interface UseTimerProps {
  mode: 'personal' | 'standard';
  levelConfigs: LevelConfig[];
  onWorkoutComplete?: (sessionId: number) => void;
  workoutNotes?: string;
}

export interface UseTimerReturn {
  timerState: TimerState;
  workoutSessionId: number | null;
  startTimer: () => Promise<void>;
  pauseTimer: () => void;
  finishWorkout: () => void;
  resetTimer: () => void;
}

export function useTimer({
  mode,
  levelConfigs,
  onWorkoutComplete,
  workoutNotes = ''
}: UseTimerProps): UseTimerReturn {
  const audio = useAudio();
  const [workoutSessionId, setWorkoutSessionId] = useState<number | null>(null);
  
  const [timerState, setTimerState] = useState<TimerState>({
    currentLevel: 1,
    currentRep: 1,
    totalReps: 0,
    isRunning: false,
    isPaused: false,
    timeRemaining: levelConfigs.length > 0 ? levelConfigs[0].interval : 0,
    workoutStartTime: null,
    repStartTime: null,
    pausedTime: 0,
    pauseStartTime: null,
  });

  const getCurrentLevelConfig = useCallback(() => {
    return levelConfigs[timerState.currentLevel - 1];
  }, [levelConfigs, timerState.currentLevel]);

  const startTimer = useCallback(async () => {
    await audio.initialize();
    await audio.playStart();
    const now = Date.now();
    setTimerState(prev => ({ 
      ...prev, 
      isRunning: true, 
      isPaused: false,
      workoutStartTime: prev.workoutStartTime || now, // Keep original start time if resuming
      repStartTime: now,
      pausedTime: 0
    }));
  }, [audio]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.isPaused) {
        // Resuming: calculate pause duration and adjust timing
        const pauseDuration = prev.pauseStartTime ? Date.now() - prev.pauseStartTime : 0;
        return { 
          ...prev, 
          isPaused: false,
          pausedTime: prev.pausedTime + pauseDuration,
          pauseStartTime: null
        };
      } else {
        // Pausing: track when pause started
        return { ...prev, isPaused: true, pauseStartTime: Date.now() };
      }
    });
  }, []);

  const saveWorkout = useCallback(async () => {
    if (!timerState.workoutStartTime) return null;

    try {
      const workoutDuration = Math.round((Date.now() - timerState.workoutStartTime) / 60000); // minutes
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const sessionId = await databaseService.saveWorkout({
        date: today,
        workout_mode: mode,
        max_level: timerState.currentLevel,
        total_reps: timerState.totalReps,
        duration_minutes: workoutDuration,
        notes: workoutNotes
      });
      
      setWorkoutSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.warn('Failed to save workout:', error);
      return null;
    }
  }, [mode, timerState.workoutStartTime, timerState.currentLevel, timerState.totalReps, workoutNotes]);

  const finishWorkout = useCallback(() => {
    // Check if timer was already paused before showing dialog
    const wasAlreadyPaused = timerState.isPaused;
    
    if (!wasAlreadyPaused) {
      // Only pause if not already paused
      setTimerState(prev => ({ ...prev, isPaused: true, pauseStartTime: Date.now() }));
    }
    
    Alert.alert(
      "Finish Workout",
      `Finish workout at Level ${timerState.currentLevel} with ${timerState.totalReps} reps?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            if (!wasAlreadyPaused) {
              // Was running before dialog - resume with pause duration calculation
              setTimerState(prev => {
                const pauseDuration = prev.pauseStartTime ? Date.now() - prev.pauseStartTime : 0;
                return { 
                  ...prev, 
                  isPaused: false,
                  pausedTime: prev.pausedTime + pauseDuration,
                  pauseStartTime: null
                };
              });
            }
            // If wasAlreadyPaused is true, do nothing - timer stays paused
          }
        },
        {
          text: "Finish",
          style: "default",
          onPress: async () => {
            // Stop the timer
            setTimerState(prev => ({ ...prev, isRunning: false, isPaused: false }));
            
            // Save workout and trigger completion
            const sessionId = await saveWorkout();
            if (sessionId && onWorkoutComplete) {
              onWorkoutComplete(sessionId);
            }
          }
        }
      ]
    );
  }, [timerState.currentLevel, timerState.totalReps, saveWorkout, onWorkoutComplete]);

  const resetTimer = useCallback(() => {
    setTimerState({
      currentLevel: 1,
      currentRep: 1,
      totalReps: 0,
      isRunning: false,
      isPaused: false,
      timeRemaining: levelConfigs.length > 0 ? levelConfigs[0].interval : 0,
      workoutStartTime: null,
      repStartTime: null,
      pausedTime: 0,
      pauseStartTime: null,
    });
    setWorkoutSessionId(null);
  }, [levelConfigs]);

  // Update timer when level configs change (e.g., when calibration is loaded)
  useEffect(() => {
    if (levelConfigs.length > 0 && timerState.timeRemaining === 0) {
      setTimerState(prev => ({
        ...prev,
        timeRemaining: levelConfigs[0].interval
      }));
    }
  }, [levelConfigs]);

  // Core timer countdown logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerState.isRunning && !timerState.isPaused && levelConfigs.length > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev.repStartTime) return prev;
          
          // Calculate actual elapsed time since rep started, accounting for pauses
          const now = Date.now();
          const elapsedTime = (now - prev.repStartTime - prev.pausedTime) / 1000; // Convert to seconds
          const currentLevelConfig = levelConfigs[prev.currentLevel - 1];
          const timeRemaining = Math.max(0, currentLevelConfig.interval - elapsedTime);
          
          // If timer reached 0, advance to next rep/level
          if (timeRemaining <= 0) {
            const newRep = prev.currentRep + 1;
            const currentLevelIndex = prev.currentLevel - 1;
            
            // Check if current level is complete
            if (newRep > levelConfigs[currentLevelIndex].reps) {
              // Move to next level
              const nextLevel = prev.currentLevel + 1;
              
              // Check if all levels are complete
              if (nextLevel > levelConfigs.length) {
                // Workout complete
                audio.playComplete();
                
                // Auto-save and trigger completion
                saveWorkout().then(sessionId => {
                  if (sessionId && onWorkoutComplete) {
                    onWorkoutComplete(sessionId);
                  }
                });
                
                return {
                  ...prev,
                  isRunning: false,
                  totalReps: prev.totalReps + 1, // Include the final rep
                };
              }
              
              // Level up - play level up sound
              audio.playLevelUp();
              
              // Start next level
              const nextLevelConfig = levelConfigs[nextLevel - 1];
              return {
                ...prev,
                currentLevel: nextLevel,
                currentRep: 1,
                totalReps: prev.totalReps + 1,
                timeRemaining: nextLevelConfig.interval,
                repStartTime: now, // Start timing for new level
                pausedTime: 0 // Reset pause time for new rep
              };
            }
            
            // Continue current level, next rep - play rep beep
            audio.playBeep();
            
            return {
              ...prev,
              currentRep: newRep,
              totalReps: prev.totalReps + 1,
              timeRemaining: currentLevelConfig.interval,
              repStartTime: now, // Start timing for new rep
              pausedTime: 0 // Reset pause time for new rep
            };
          }
          
          // Update display with accurate time remaining (only if changed significantly)
          if (Math.abs(prev.timeRemaining - timeRemaining) >= 0.01) {
            return {
              ...prev,
              timeRemaining
            };
          }
          
          // No significant change, don't update state
          return prev;
        });
      }, 33); // Update every 33ms for 30 FPS countdown
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, levelConfigs, audio, saveWorkout, onWorkoutComplete]);

  return {
    timerState,
    workoutSessionId,
    startTimer,
    pauseTimer,
    finishWorkout,
    resetTimer
  };
}