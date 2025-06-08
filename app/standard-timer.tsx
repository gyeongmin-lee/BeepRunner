import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MODE_COLORS, STANDARD_LEVELS, UI_CONFIG } from '@/constants/BeepTestConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { audioService } from '@/services/AudioService';
import { databaseService } from '@/services/DatabaseService';

interface TimerState {
  currentLevel: number;
  currentRep: number;
  totalReps: number;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  workoutStartTime: number | null;
}

export default function StandardTimerScreen() {
  const [timerState, setTimerState] = useState<TimerState>({
    currentLevel: 1,
    currentRep: 1,
    totalReps: 0,
    isRunning: false,
    isPaused: false,
    timeRemaining: STANDARD_LEVELS[0].interval,
    workoutStartTime: null
  });

  const currentLevelConfig = STANDARD_LEVELS[timerState.currentLevel - 1];

  const startTimer = async () => {
    await audioService.initialize();
    await audioService.playStart();
    setTimerState(prev => ({ 
      ...prev, 
      isRunning: true, 
      isPaused: false,
      workoutStartTime: Date.now()
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const stopTimer = () => {
    setTimerState({
      currentLevel: 1,
      currentRep: 1,
      totalReps: 0,
      isRunning: false,
      isPaused: false,
      timeRemaining: STANDARD_LEVELS[0].interval,
      workoutStartTime: null
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
          // If timer reached 0, advance to next rep/level
          if (prev.timeRemaining <= 0.1) {
            const newRep = prev.currentRep + 1;
            const currentLevelIndex = prev.currentLevel - 1;
            
            // Play beep for completed rep
            audioService.playBeep();
            
            // Check if current level is complete
            if (newRep > STANDARD_LEVELS[currentLevelIndex].reps) {
              // Move to next level
              const nextLevel = prev.currentLevel + 1;
              
              // Check if all levels are complete
              if (nextLevel > STANDARD_LEVELS.length) {
                // Workout complete
                audioService.playComplete();
                
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
                  timeRemaining: 0
                };
              }
              
              // Level up sound
              audioService.playLevelUp();
              
              // Start next level
              const nextLevelConfig = STANDARD_LEVELS[nextLevel - 1];
              return {
                ...prev,
                currentLevel: nextLevel,
                currentRep: 1,
                totalReps: prev.totalReps + 1,
                timeRemaining: nextLevelConfig.interval
              };
            }
            
            // Continue current level, next rep
            return {
              ...prev,
              currentRep: newRep,
              totalReps: prev.totalReps + 1,
              timeRemaining: STANDARD_LEVELS[currentLevelIndex].interval
            };
          }
          
          // Countdown timer
          return {
            ...prev,
            timeRemaining: Math.max(0, prev.timeRemaining - 0.1)
          };
        });
      }, 100); // Update every 100ms for smooth countdown
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.isPaused]);

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
            <ThemedText type="defaultSemiBold" style={{ color: MODE_COLORS.STANDARD }}>
              Back
            </ThemedText>
          </Pressable>
          <ThemedText type="title" style={[styles.title, { color: MODE_COLORS.STANDARD }]}>
            Standard Beep Test
          </ThemedText>
        </View>

      {/* Main Timer Display */}
      <View style={styles.timerDisplay}>
        <ThemedText type="title" style={styles.levelText}>
          Level {timerState.currentLevel}
        </ThemedText>
        
        <ThemedText style={styles.repText}>
          Rep {timerState.currentRep} of {currentLevelConfig?.reps || 0}
        </ThemedText>
        
        <View style={styles.countdownContainer}>
          <ThemedText style={styles.countdownText}>
            {timerState.timeRemaining.toFixed(2)}
          </ThemedText>
        </View>
        
        <ThemedText style={styles.totalRepsText}>
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
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!timerState.isRunning ? (
          <Pressable 
            style={[styles.button, styles.startButton]} 
            onPress={startTimer}
          >
            <ThemedText style={styles.buttonText}>Start</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.runningControls}>
            <Pressable 
              style={[styles.button, styles.pauseButton]} 
              onPress={pauseTimer}
            >
              <ThemedText style={styles.buttonText}>
                {timerState.isPaused ? 'Resume' : 'Pause'}
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[styles.button, styles.stopButton]} 
              onPress={stopTimer}
            >
              <ThemedText style={styles.buttonText}>Stop</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Standard Mode Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="straighten" size={16} color={MODE_COLORS.STANDARD} />
          <ThemedText style={styles.infoText}>Standard 20m shuttle run</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="track-changes" size={16} color={MODE_COLORS.STANDARD} />
          <ThemedText style={styles.infoText}>9 levels • Fixed intervals</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
    gap: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 80, // Offset for back button
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  levelText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    color: MODE_COLORS.STANDARD,
    textAlign: 'center',
    lineHeight: 45
  },
  repText: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  countdownContainer: {
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    lineHeight: 60
  },
  totalRepsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  },
  pauseButton: {
    backgroundColor: MODE_COLORS.ACCENT,
  },
  stopButton: {
    backgroundColor: MODE_COLORS.DANGER,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});