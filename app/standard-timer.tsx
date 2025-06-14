import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  ScreenHeader,
  LevelIndicator,
  CountdownDisplay,
  ProgressBar,
  TimerControls,
  WorkoutSummary
} from '@/components/timer';
import { MODE_COLORS, STANDARD_LEVELS } from '@/constants/BeepTestConfig';
import { useTimer } from '@/hooks/timer';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type StandardTimerStep = 'timer' | 'completion';

export default function StandardTimerScreen() {
  const [currentStep, setCurrentStep] = useState<StandardTimerStep>('timer');

  const {
    timerState,
    startTimer,
    pauseTimer,
    finishWorkout
  } = useTimer({
    mode: 'standard',
    levelConfigs: STANDARD_LEVELS,
    onWorkoutComplete: () => setCurrentStep('completion'),
    workoutNotes: 'Standard 20m beep test'
  });

  const currentLevelConfig = STANDARD_LEVELS[timerState.currentLevel - 1];

  const goBack = () => {
    router.back();
  };

  const renderTimerStep = () => (
    <>
      {/* Main Timer Display */}
      <View style={styles.timerDisplay}>
        <LevelIndicator level={timerState.currentLevel} mode="standard" />
        
        <CountdownDisplay
          timeRemaining={timerState.timeRemaining}
          currentRep={timerState.currentRep}
          totalReps={timerState.totalReps}
          maxReps={currentLevelConfig?.reps || 0}
          mode="standard"
        />
      </View>

      {/* Progress Bar */}
      <ProgressBar
        current={timerState.currentRep}
        total={currentLevelConfig?.reps || 0}
        mode="standard"
      />

      {/* Control Buttons */}
      <TimerControls
        isRunning={timerState.isRunning}
        isPaused={timerState.isPaused}
        onStart={startTimer}
        onPause={pauseTimer}
        onFinish={finishWorkout}
        mode="standard"
      />
    </>
  );

  const renderCompletionStep = () => {
    // Calculate theoretical duration based on completed levels and reps
    let theoreticalDuration = 0; // in seconds
    
    for (let level = 0; level < timerState.currentLevel; level++) {
      if (level < STANDARD_LEVELS.length) {
        const levelConfig = STANDARD_LEVELS[level];
        
        if (level < timerState.currentLevel - 1) {
          // Full level completed
          theoreticalDuration += levelConfig.reps * levelConfig.interval;
        } else {
          // Partial level (current level)
          const repsInCurrentLevel = timerState.totalReps - 
            STANDARD_LEVELS.slice(0, level).reduce((sum, l) => sum + l.reps, 0);
          theoreticalDuration += Math.min(repsInCurrentLevel, levelConfig.reps) * levelConfig.interval;
        }
      }
    }

    return (
      <WorkoutSummary
        level={timerState.currentLevel}
        totalReps={timerState.totalReps}
        duration={Math.round(theoreticalDuration)}
        onDone={goBack}
        mode="standard"
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Standard Beep Test"
          mode="standard"
          onBack={goBack}
        />

        {/* Step Content */}
        <View style={styles.contentWrapper}>
          {currentStep === 'timer' && renderTimerStep()}
          {currentStep === 'completion' && renderCompletionStep()}
        </View>

        {/* Standard Mode Info */}
        {currentStep === 'timer' && (
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
        )}
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
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    width: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 20,
    paddingBottom: 40,
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
});