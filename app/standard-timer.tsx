import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MODE_COLORS, STANDARD_LEVELS, UI_CONFIG } from '@/constants/BeepTestConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAudio } from '@/components/AudioProvider';
import { databaseService } from '@/services/DatabaseService';

interface TimerState {
  currentLevel: number;
  currentRep: number;
  totalReps: number;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  workoutStartTime: number | null;
  repStartTime: number | null;
  pausedTime: number;
}

export default function StandardTimerScreen() {
  const audio = useAudio();
  const [timerState, setTimerState] = useState<TimerState>({
    currentLevel: 1,
    currentRep: 1,
    totalReps: 0,
    isRunning: false,
    isPaused: false,
    timeRemaining: STANDARD_LEVELS[0].interval,
    workoutStartTime: null,
    repStartTime: null,
    pausedTime: 0
  });

  const currentLevelConfig = STANDARD_LEVELS[timerState.currentLevel - 1];

  const startTimer = async () => {
    await audio.initialize();
    await audio.playStart();
    const now = Date.now();
    setTimerState(prev => ({ 
      ...prev, 
      isRunning: true, 
      isPaused: false,
      workoutStartTime: now,
      repStartTime: now,
      pausedTime: 0
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => {
      if (prev.isPaused) {
        // Resuming: reset rep start time to account for pause duration
        const pauseDuration = Date.now() - (prev.repStartTime || Date.now());
        return { 
          ...prev, 
          isPaused: false,
          pausedTime: prev.pausedTime + pauseDuration,
          repStartTime: Date.now()
        };
      } else {
        // Pausing: track when pause started
        return { ...prev, isPaused: true };
      }
    });
  };

  const stopTimer = () => {
    setTimerState({
      currentLevel: 1,
      currentRep: 1,
      totalReps: 0,
      isRunning: false,
      isPaused: false,
      timeRemaining: STANDARD_LEVELS[0].interval,
      workoutStartTime: null,
      repStartTime: null,
      pausedTime: 0
    });
  };

  const goBack = () => {
    router.back();
  };

  // Core timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerState.isRunning && !timerState.isPaused) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev.repStartTime) return prev;
          
          // Calculate actual elapsed time since rep started
          const now = Date.now();
          const elapsedTime = (now - prev.repStartTime) / 1000; // Convert to seconds
          const currentLevelConfig = STANDARD_LEVELS[prev.currentLevel - 1];
          const timeRemaining = Math.max(0, currentLevelConfig.interval - elapsedTime);
          
          // If timer reached 0, advance to next rep/level
          if (timeRemaining <= 0) {
            const newRep = prev.currentRep + 1;
            const currentLevelIndex = prev.currentLevel - 1;
            
            // Play beep for completed rep
            audio.playBeep();
            
            // Check if current level is complete
            if (newRep > STANDARD_LEVELS[currentLevelIndex].reps) {
              // Move to next level
              const nextLevel = prev.currentLevel + 1;
              
              // Check if all levels are complete
              if (nextLevel > STANDARD_LEVELS.length) {
                // Workout complete
                audio.playComplete();
                
                // Save workout to database
                if (prev.workoutStartTime) {
                  const workoutDuration = Math.round((Date.now() - prev.workoutStartTime) / 60000);
                  const today = new Date().toISOString().split('T')[0];
                  
                  databaseService.saveWorkout({
                    date: today,
                    workout_mode: 'standard',
                    max_level: prev.currentLevel,
                    total_reps: prev.totalReps + 1, // Include the final rep
                    duration_minutes: workoutDuration,
                    notes: 'Standard 20m beep test completed'
                  }).catch(error => console.warn('Failed to save workout:', error));
                }
                
                return {
                  ...prev,
                  isRunning: false,
                  isPaused: false,
                  timeRemaining: 0,
                  repStartTime: null
                };
              }
              
              // Level up sound
              audio.playLevelUp();
              
              // Start next level
              const nextLevelConfig = STANDARD_LEVELS[nextLevel - 1];
              return {
                ...prev,
                currentLevel: nextLevel,
                currentRep: 1,
                totalReps: prev.totalReps + 1,
                timeRemaining: nextLevelConfig.interval,
                repStartTime: now // Start timing for new level
              };
            }
            
            // Continue current level, next rep
            return {
              ...prev,
              currentRep: newRep,
              totalReps: prev.totalReps + 1,
              timeRemaining: currentLevelConfig.interval,
              repStartTime: now // Start timing for new rep
            };
          }
          
          // Update display with accurate time remaining
          return {
            ...prev,
            timeRemaining
          };
        });
      }, 20); // Update every 20ms for smooth countdown
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, audio]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={MODE_COLORS.STANDARD} />
          </Pressable>
          <ThemedText type="title" style={[styles.title, { color: MODE_COLORS.STANDARD }]}>
            Standard Beep Test
          </ThemedText>
        </View>

      {/* Main Timer Display */}
      <View style={styles.timerDisplay}>
        <ThemedText type="timerLarge" style={styles.levelText}>
          Level {timerState.currentLevel}
        </ThemedText>
        
        <ThemedText type="headline" style={styles.repText}>
          Rep {timerState.currentRep} of {currentLevelConfig?.reps || 0}
        </ThemedText>
        
        <View style={styles.countdownContainer}>
          <ThemedText type="display" style={styles.countdownText}>
            {timerState.timeRemaining.toFixed(2)}
          </ThemedText>
        </View>
        
        <ThemedText type="bodyLarge" style={styles.totalRepsText}>
          Total Reps: {timerState.totalReps}
        </ThemedText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(timerState.currentRep / (currentLevelConfig?.reps || 1)) * 100}%`,
                backgroundColor: MODE_COLORS.STANDARD
              }
            ]} 
          />
        </View>
        <ThemedText type="caption" style={styles.progressText}>
          {timerState.currentRep} / {currentLevelConfig?.reps || 0} reps
        </ThemedText>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!timerState.isRunning ? (
          <Pressable 
            style={[styles.button, styles.startButton]} 
            onPress={startTimer}
          >
            <ThemedText type="button" style={styles.buttonText}>Start</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.runningControls}>
            <Pressable 
              style={[styles.button, styles.pauseButton]} 
              onPress={pauseTimer}
            >
              <ThemedText type="button" style={styles.buttonText}>
                {timerState.isPaused ? 'Resume' : 'Pause'}
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[styles.button, styles.stopButton]} 
              onPress={stopTimer}
            >
              <ThemedText type="button" style={styles.buttonText}>Stop</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Standard Mode Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="straighten" size={16} color={MODE_COLORS.STANDARD} />
          <ThemedText type="caption" style={styles.infoText}>Standard 20m shuttle run</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="track-changes" size={16} color={MODE_COLORS.STANDARD} />
          <ThemedText type="caption" style={styles.infoText}>9 levels • Fixed intervals</ThemedText>
        </View>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space for better scrolling
    flexGrow: 1, // Allow content to grow naturally
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60, // Account for modal screen safe area
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 12,
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: MODE_COLORS.STANDARD_TINT,
    borderWidth: 1,
    borderColor: MODE_COLORS.STANDARD_LIGHT,
  },
  levelText: {
    marginBottom: 8,
    color: MODE_COLORS.STANDARD,
    textAlign: 'center',
  },
  repText: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  countdownContainer: {
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    marginBottom: 16,
    textAlign: 'center',
    color: MODE_COLORS.STANDARD,
    fontVariant: ['tabular-nums'],
  },
  totalRepsText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: MODE_COLORS.STANDARD_TINT,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  controlsContainer: {
    marginBottom: 30,
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    flex: 1,
  },
  startButton: {
    backgroundColor: MODE_COLORS.STANDARD,
    shadowColor: MODE_COLORS.STANDARD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pauseButton: {
    backgroundColor: MODE_COLORS.ACCENT,
    shadowColor: MODE_COLORS.ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    backgroundColor: MODE_COLORS.DANGER,
    shadowColor: MODE_COLORS.DANGER,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  progressText: {
    opacity: 0.6,
    textAlign: 'center',
  },
});