import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { 
  ScreenHeader, 
  LevelIndicator, 
  CountdownDisplay, 
  ProgressBar, 
  TimerControls 
} from '@/components/timer';
import { calculatePersonalIntervals, MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';
import { databaseService } from '@/services/DatabaseService';
import { useCalibration, useTimer } from '@/hooks/timer';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type PersonalTimerStep = 'previous-calibration' | 'calibration' | 'countdown' | 'measuring' | 'results' | 'timer' | 'feedback';

export default function PersonalTimerScreen() {
  const [currentStep, setCurrentStep] = useState<PersonalTimerStep>('calibration');
  
  // Calibration hook
  const {
    calibrationState,
    previousCalibration,
    currentMeasurementTime,
    startCalibration,
    stopMeasurement,
    saveCalibration,
    loadPreviousCalibration,
    resetCalibration
  } = useCalibration();

  // Memoize expensive personal intervals calculation
  const personalLevelConfigs = React.useMemo(() => {
    return calibrationState.measuredTime ? calculatePersonalIntervals(calibrationState.measuredTime) : [];
  }, [calibrationState.measuredTime]);

  // Timer hook - will be initialized after calibration
  const {
    timerState,
    workoutSessionId,
    startTimer,
    pauseTimer,
    finishWorkout
  } = useTimer({
    mode: 'personal',
    levelConfigs: personalLevelConfigs,
    onWorkoutComplete: () => setCurrentStep('feedback'),
    workoutNotes: 'Personal calibration'
  });

  // Initialize previous calibration check
  React.useEffect(() => {
    if (previousCalibration) {
      setCurrentStep('previous-calibration');
    }
  }, [previousCalibration]);

  // Watch for calibration state changes to transition steps
  React.useEffect(() => {
    if (calibrationState.isMeasuring && currentStep === 'countdown') {
      setCurrentStep('measuring');
    }
  }, [calibrationState.isMeasuring, currentStep]);


  const goBack = () => {
    router.back();
  };

  const useLastCalibration = async () => {
    try {
      await loadPreviousCalibration();
      setCurrentStep('timer');
    } catch (error) {
      console.warn('Failed to use previous calibration:', error);
      setCurrentStep('calibration');
    }
  };

  const startNewCalibration = () => {
    resetCalibration();
    setCurrentStep('calibration');
  };

  const startCalibrationProcess = async () => {
    await startCalibration();
    setCurrentStep('countdown');
  };

  const handleMeasurementComplete = async () => {
    stopMeasurement();
    setCurrentStep('results');
  };

  const confirmCalibration = async () => {
    const saved = await saveCalibration();
    if (saved) {
      setCurrentStep('timer');
    } else {
      Alert.alert('Error', 'Failed to save calibration. Please try again.');
    }
  };

  const retryCalibration = () => {
    resetCalibration();
    setCurrentStep('calibration');
  };

  const handleFeedback = async (feedbackType: 'too_easy' | 'perfect' | 'too_hard') => {
    if (!workoutSessionId) {
      console.warn('No workout session ID available for feedback');
      router.back();
      return;
    }

    const difficultyMultipliers = {
      'too_easy': 0.9,
      'perfect': 1.0,
      'too_hard': 1.15
    };

    try {
      await databaseService.saveCalibrationSuggestion({
        workout_session_id: workoutSessionId,
        suggestion_type: feedbackType,
        user_action: 'accepted',
        difficulty_multiplier: difficultyMultipliers[feedbackType]
      });

      // Save new calibration record with adjusted time for cumulative feedback
      if (feedbackType !== 'perfect' && calibrationState.measuredTime) {
        const adjustedTime = calibrationState.measuredTime * difficultyMultipliers[feedbackType];
        const adjustedDistance = (adjustedTime / 9.0) * 20; // Same formula as original calibration
        await databaseService.saveCalibration(adjustedTime, adjustedDistance);
      }

      // Go back to home
      router.back();
    } catch (error) {
      console.warn('Failed to save feedback:', error);
      router.back();
    }
  };

  const renderPreviousCalibrationStep = () => {
    if (!previousCalibration) return null;
    
    let calibrationDate = 'Unknown';
    try {
      if (previousCalibration.created_at) {
        calibrationDate = new Date(previousCalibration.created_at).toLocaleDateString();
      }
    } catch (error) {
      console.warn('Failed to format calibration date:', error);
    }
    
    // Display the latest calibration values directly (includes any feedback adjustments)
    const displayTime = previousCalibration.measured_time;
    
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.titleWithIcon}>
          <MaterialIcons name="history" size={32} color={MODE_COLORS.PERSONAL} />
          <ThemedText type="title" style={styles.stepTitle}>
            Previous Calibration Found
          </ThemedText>
        </View>
        
        <View style={styles.previousCalibrationContainer}>
          <ThemedText type="bodyLarge" style={styles.instructionText}>
            We found your previous space calibration. Would you like to use it or measure again?
          </ThemedText>
          
          <View style={styles.previousCalibrationInfo}>
            <View style={styles.calibrationInfoHeader}>
              <MaterialIcons name="info-outline" size={20} color={MODE_COLORS.PERSONAL} />
              <ThemedText type="subtitle" style={styles.calibrationInfoTitle}>Last Calibration</ThemedText>
            </View>
            
            <View style={styles.calibrationDataGrid}>
              <View style={styles.calibrationDataItem}>
                <ThemedText type="caption" style={styles.calibrationDataLabel}>Date:</ThemedText>
                <ThemedText type="body" style={styles.calibrationDataValue}>{calibrationDate}</ThemedText>
              </View>
              
              <View style={styles.calibrationDataItem}>
                <ThemedText type="caption" style={styles.calibrationDataLabel}>Time:</ThemedText>
                <ThemedText type="body" style={styles.calibrationDataValue}>
                  {displayTime.toFixed(2)}s
                </ThemedText>
              </View>
              
              
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable 
            style={[styles.button, styles.secondaryButton, styles.iconButton]}
            onPress={startNewCalibration}
          >
            <MaterialIcons name="refresh" size={20} color={MODE_COLORS.PERSONAL} style={styles.buttonIcon} />
            <ThemedText type="button" style={styles.secondaryButtonText}>Re-calibrate</ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.primaryButton, styles.iconButton]}
            onPress={useLastCalibration}
          >
            <MaterialIcons name="play-arrow" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText type="button" style={styles.buttonText}>Use Last Settings</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCalibrationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="directions-run" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Space Calibration
        </ThemedText>
      </View>
      
      <View style={styles.instructionContainer}>
        <ThemedText type="bodyLarge" style={styles.instructionText}>
          Measure your available space by running from point A to point B
        </ThemedText>
        
        <View style={styles.guidelineContainer}>
          <View style={styles.guidelineHeader}>
            <MaterialIcons name="lightbulb-outline" size={20} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="subtitle" style={styles.guidelineTitle}>Guidelines:</ThemedText>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="body" style={styles.guidelineText}>
              Run at a conversational pace
            </ThemedText>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="body" style={styles.guidelineText}>
              Maintain consistent comfortable speed
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, styles.primaryButton]} 
          onPress={startCalibrationProcess}
        >
          <ThemedText type="button" style={styles.buttonText}>Start Calibration</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderCountdownStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.countdownDisplay}>
        <View style={styles.calibrationCountdownContainer}>
          <ThemedText type="display" style={styles.countdownText}>
            {calibrationState.countdownNumber}
          </ThemedText>
        </View>
        <ThemedText type="bodyLarge" style={styles.countdownInstructions}>
          Get ready to run...
        </ThemedText>
      </View>
    </View>
  );

  const renderMeasuringStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="timer" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Measuring...
        </ThemedText>
      </View>
      
      <View style={styles.timerDisplay}>
        <View style={styles.measurementTimerContainer}>
          <ThemedText type="display" style={styles.runningTime}>
            {currentMeasurementTime.toFixed(2)}s
          </ThemedText>
        </View>
        <ThemedText type="bodyLarge" style={styles.measureInstructions}>
          Tap when you reach the end
        </ThemedText>
      </View>

      <View style={styles.measureButtonContainer}>
        <Pressable 
          style={[styles.button, styles.primaryButton, styles.iconButton]} 
          onPress={handleMeasurementComplete}
        >
          <MaterialIcons name="flag" size={20} color="white" style={styles.buttonIcon} />
          <ThemedText type="button" style={styles.buttonText}>I&apos;ve arrived</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderResultsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="check-circle" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Calibration Results
        </ThemedText>
      </View>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultItem}>
          <ThemedText type="body" style={styles.resultLabel}>Measured Time:</ThemedText>
          <ThemedText type="subtitle" style={styles.resultValue}>
            {calibrationState.measuredTime?.toFixed(2)}s
          </ThemedText>
        </View>
        
        <View style={styles.resultItem}>
          <ThemedText type="body" style={styles.resultLabel}>Estimated Distance:</ThemedText>
          <ThemedText type="subtitle" style={styles.resultValue}>
            ~{calibrationState.estimatedDistance?.toFixed(1)}m
          </ThemedText>
        </View>
        
        <View style={styles.resultItem}>
          <ThemedText type="body" style={styles.resultLabel}>Distance Ratio:</ThemedText>
          <ThemedText type="subtitle" style={styles.resultValue}>
            {((calibrationState.estimatedDistance || 20) / 20 * 100).toFixed(0)}% of 20m
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" style={styles.confirmationText}>
        These settings will be used to customize your workout intervals.
      </ThemedText>

      <View style={styles.buttonRow}>
        <Pressable 
          style={[styles.button, styles.secondaryButton, styles.iconButton]}
          onPress={retryCalibration}
        >
          <MaterialIcons name="refresh" size={20} color={MODE_COLORS.PERSONAL} style={styles.buttonIcon} />
          <ThemedText type="button" style={styles.secondaryButtonText}>Retry</ThemedText>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.primaryButton, styles.iconButton]}
          onPress={confirmCalibration}
        >
          <MaterialIcons name="check" size={20} color="white" style={styles.buttonIcon} />
          <ThemedText type="button" style={styles.buttonText}>Confirm</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderTimerStep = () => {
    if (!timerState || !calibrationState.measuredTime) return null;
    
    const currentLevelConfig = personalLevelConfigs[timerState.currentLevel - 1];
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.personalTimerDisplay}>
          <LevelIndicator level={timerState.currentLevel} mode="personal" />
          
          <CountdownDisplay
            timeRemaining={timerState.timeRemaining}
            currentRep={timerState.currentRep}
            totalReps={timerState.totalReps}
            maxReps={currentLevelConfig?.reps || 0}
            mode="personal"
          />
          
        </View>

        <ProgressBar
          current={timerState.currentRep}
          total={currentLevelConfig?.reps || 0}
          mode="personal"
        />

        <TimerControls
          isRunning={timerState.isRunning}
          isPaused={timerState.isPaused}
          onStart={startTimer}
          onPause={pauseTimer}
          onFinish={finishWorkout}
          mode="personal"
        />
      </View>
    );
  };

  const renderFeedbackStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="celebration" size={32} color={MODE_COLORS.ACCENT} />
        <ThemedText type="title" style={styles.stepTitle}>
          Workout Complete!
        </ThemedText>
      </View>
      
      <View style={styles.feedbackContainer}>
        <ThemedText type="headline" style={styles.resultText}>
          Reached Level {timerState.currentLevel} • {timerState.totalReps} total reps
        </ThemedText>
        
        <ThemedText type="bodyLarge" style={styles.feedbackPrompt}>
          How was this workout?
        </ThemedText>
        
        <View style={styles.feedbackButtons}>
          <Pressable 
            style={[styles.button, styles.feedbackButton]}
            onPress={() => handleFeedback('too_easy')}
          >
            <MaterialIcons name="sentiment-very-satisfied" size={32} color={MODE_COLORS.ACCENT} />
            <ThemedText type="subtitle" style={styles.feedbackText}>Too Easy</ThemedText>
            <ThemedText type="caption" style={styles.feedbackSubtext}>(Next: faster)</ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.feedbackButton]}
            onPress={() => handleFeedback('perfect')}
          >
            <MaterialIcons name="thumb-up" size={32} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="subtitle" style={styles.feedbackText}>Perfect</ThemedText>
            <ThemedText type="caption" style={styles.feedbackSubtext}>(Keep settings)</ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.feedbackButton]}
            onPress={() => handleFeedback('too_hard')}
          >
            <MaterialIcons name="sentiment-very-dissatisfied" size={32} color={MODE_COLORS.DANGER} />
            <ThemedText type="subtitle" style={styles.feedbackText}>Too Hard</ThemedText>
            <ThemedText type="caption" style={styles.feedbackSubtext}>(Next: slower)</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Personal Beep Test"
          mode="personal"
          onBack={goBack}
        />

        {/* Step Content */}
        {currentStep === 'previous-calibration' && renderPreviousCalibrationStep()}
        {currentStep === 'calibration' && renderCalibrationStep()}
        {currentStep === 'countdown' && renderCountdownStep()}
        {currentStep === 'measuring' && renderMeasuringStep()}
        {currentStep === 'results' && renderResultsStep()}
        {currentStep === 'timer' && renderTimerStep()}
        {currentStep === 'feedback' && renderFeedbackStep()}

        {/* Personal Mode Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={16} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="caption" style={styles.infoText}>Customized for your space</ThemedText>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="tune" size={16} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="caption" style={styles.infoText}>Adaptive difficulty • Time-based scaling</ThemedText>
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
    paddingBottom: 20,
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 400,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  stepTitle: {
    textAlign: 'center',
  },
  instructionContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    width: '100%'
  },
  measureButtonContainer: {
    paddingHorizontal: 13,
    width: '100%'
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  guidelineContainer: {
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guidelineTitle: {
    color: MODE_COLORS.PERSONAL,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  guidelineText: {
    flex: 1,
    opacity: 0.8,
  },
  feedbackContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultText: {
    marginBottom: 24,
    textAlign: 'center',
    color: MODE_COLORS.PERSONAL,
  },
  feedbackPrompt: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  feedbackButtons: {
    gap: 16,
    width: '100%',
  },
  feedbackButton: {
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  feedbackText: {
    marginBottom: 4,
  },
  feedbackSubtext: {
    opacity: 0.7,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: MODE_COLORS.PERSONAL,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
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
  countdownDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  calibrationCountdownContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: MODE_COLORS.PERSONAL,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownInstructions: {
    textAlign: 'center',
    opacity: 0.8,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 30,
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  measurementTimerContainer: {
    width: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningTime: {
    color: MODE_COLORS.PERSONAL,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginBottom: 12,
  },
  measureInstructions: {
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  resultLabel: {
    opacity: 0.8,
  },
  resultValue: {
    color: MODE_COLORS.PERSONAL,
  },
  confirmationText: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MODE_COLORS.PERSONAL,
    flex: 1,
    width: undefined,
  },
  secondaryButtonText: {
    color: MODE_COLORS.PERSONAL,
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  personalTimerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
    width: '100%',
  },
  calibrationInfo: {
    backgroundColor: MODE_COLORS.PERSONAL_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calibrationInfoText: {
    opacity: 0.9,
    textAlign: 'center',
    color: MODE_COLORS.PERSONAL,
  },
  previousCalibrationContainer: {
    width: '100%',
    marginBottom: 32,
  },
  previousCalibrationInfo: {
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: MODE_COLORS.PERSONAL_LIGHT,
    marginTop: 20,
  },
  calibrationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calibrationInfoTitle: {
    color: MODE_COLORS.PERSONAL,
  },
  calibrationDataGrid: {
    gap: 12,
  },
  calibrationDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: MODE_COLORS.PERSONAL_LIGHT,
  },
  calibrationDataLabel: {
    opacity: 0.7,
  },
  calibrationDataValue: {
    color: MODE_COLORS.PERSONAL,
    fontWeight: '500',
  },
});