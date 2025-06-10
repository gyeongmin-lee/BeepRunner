import { useAudio } from '@/components/AudioProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { calculatePersonalIntervals, CALIBRATION_CONFIG, LevelConfig, MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';
import { CalibrationRecord, databaseService } from '@/services/DatabaseService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type PersonalTimerStep = 'previous-calibration' | 'calibration' | 'countdown' | 'measuring' | 'results' | 'timer' | 'feedback';

interface CalibrationState {
  measuredTime: number | null;
  estimatedDistance: number | null;
  isCountingDown: boolean;
  countdownNumber: number;
  isMeasuring: boolean;
  measureStartTime: number | null;
}

interface PersonalTimerState {
  currentLevel: number;
  currentRep: number;
  totalReps: number;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  personalLevels: LevelConfig[];
  workoutStartTime: number | null;
  repStartTime: number | null;
  pausedTime: number;
}

export default function PersonalTimerScreen() {
  const audio = useAudio();
  const [currentStep, setCurrentStep] = useState<PersonalTimerStep>('calibration');
  const [previousCalibration, setPreviousCalibration] = useState<CalibrationRecord | null>(null);
  const [calibrationState, setCalibrationState] = useState<CalibrationState>({
    measuredTime: null,
    estimatedDistance: null,
    isCountingDown: false,
    countdownNumber: 3,
    isMeasuring: false,
    measureStartTime: null,
  });

  const [timerState, setTimerState] = useState<PersonalTimerState>({
    currentLevel: 1,
    currentRep: 1,
    totalReps: 0,
    isRunning: false,
    isPaused: false,
    timeRemaining: 0,
    personalLevels: [],
    workoutStartTime: null,
    repStartTime: null,
    pausedTime: 0,
  });

  const [currentMeasurementTime, setCurrentMeasurementTime] = useState<number>(0);

  // Check for existing calibration on component mount
  useEffect(() => {
    const checkExistingCalibration = async () => {
      try {
        const latestCalibration = await databaseService.getLatestCalibration();
        if (latestCalibration) {
          setPreviousCalibration(latestCalibration);
          setCurrentStep('previous-calibration');
        }
        // If no calibration exists, stay on 'calibration' step (default)
      } catch (error) {
        console.warn('Failed to check existing calibration:', error);
        // On error, proceed with calibration flow
      }
    };

    checkExistingCalibration();
  }, []);

  const goBack = () => {
    router.back();
  };

  const useLastCalibration = async () => {
    if (previousCalibration) {
      try {
        const personalLevels = calculatePersonalIntervals(previousCalibration.measured_time);
        setCalibrationState(prev => ({
          ...prev,
          measuredTime: previousCalibration.measured_time,
          estimatedDistance: previousCalibration.estimated_distance,
        }));
        setTimerState(prev => ({
          ...prev,
          personalLevels,
          timeRemaining: personalLevels[0].interval,
        }));
        setCurrentStep('timer');
      } catch (error) {
        console.warn('Failed to use previous calibration:', error);
        // Fallback to new calibration if calculation fails
        setCurrentStep('calibration');
      }
    }
  };

  const startNewCalibration = () => {
    setCurrentStep('calibration');
  };

  const startCalibration = async () => {
    await audio.initialize();
    setCurrentStep('countdown');
    setCalibrationState(prev => ({ ...prev, isCountingDown: true, countdownNumber: 3 }));
  };

  const startMeasurement = () => {
    setCurrentStep('measuring');
    setCurrentMeasurementTime(0);
    setCalibrationState(prev => ({
      ...prev,
      isMeasuring: true,
      measureStartTime: Date.now(),
      isCountingDown: false,
    }));
  };

  const stopMeasurement = () => {
    if (calibrationState.measureStartTime) {
      const measuredTime = (Date.now() - calibrationState.measureStartTime) / 1000;
      const estimatedDistance = (measuredTime / CALIBRATION_CONFIG.STANDARD_TIME) * CALIBRATION_CONFIG.STANDARD_DISTANCE;
      
      setCalibrationState(prev => ({
        ...prev,
        measuredTime,
        estimatedDistance,
        isMeasuring: false,
        measureStartTime: null,
      }));
      setCurrentStep('results');
    }
  };

  const confirmCalibration = async () => {
    if (calibrationState.measuredTime && calibrationState.estimatedDistance) {
      try {
        // Save calibration to database
        await databaseService.saveCalibration(
          calibrationState.measuredTime,
          calibrationState.estimatedDistance
        );

        const personalLevels = calculatePersonalIntervals(calibrationState.measuredTime);
        setTimerState(prev => ({
          ...prev,
          personalLevels,
          timeRemaining: personalLevels[0].interval,
        }));
        setCurrentStep('timer');
      } catch (error) {
        console.warn('Failed to save calibration:', error);
        // Still proceed to timer even if save fails
        const personalLevels = calculatePersonalIntervals(calibrationState.measuredTime);
        setTimerState(prev => ({
          ...prev,
          personalLevels,
          timeRemaining: personalLevels[0].interval,
        }));
        setCurrentStep('timer');
      }
    }
  };

  const retryCalibration = () => {
    setCalibrationState({
      measuredTime: null,
      estimatedDistance: null,
      isCountingDown: false,
      countdownNumber: 3,
      isMeasuring: false,
      measureStartTime: null,
    });
    setCurrentStep('calibration');
  };

  // Personal Timer Control Functions
  const startPersonalTimer = async () => {
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

  const pausePersonalTimer = () => {
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

  const stopPersonalTimer = () => {
    setTimerState(prev => ({
      ...prev,
      currentLevel: 1,
      currentRep: 1,
      totalReps: 0,
      isRunning: false,
      isPaused: false,
      timeRemaining: prev.personalLevels.length > 0 ? prev.personalLevels[0].interval : 0,
      workoutStartTime: null,
      repStartTime: null,
      pausedTime: 0,
    }));
  };

  const completePersonalWorkout = useCallback(async () => {
    // Save workout data to database
    if (timerState.workoutStartTime) {
      try {
        const workoutDuration = Math.round((Date.now() - timerState.workoutStartTime) / 60000); // minutes
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        await databaseService.saveWorkout({
          date: today,
          workout_mode: 'personal',
          max_level: timerState.currentLevel,
          total_reps: timerState.totalReps,
          duration_minutes: workoutDuration,
          notes: `Calibrated for ${calibrationState.estimatedDistance?.toFixed(1)}m space`
        });
      } catch (error) {
        console.warn('Failed to save workout:', error);
      }
    }
    
    setCurrentStep('feedback');
  }, [timerState.workoutStartTime, timerState.currentLevel, timerState.totalReps, calibrationState.estimatedDistance]);

  // Countdown effect
  useEffect(() => {
    if (currentStep === 'countdown' && calibrationState.isCountingDown) {
      const timer = setInterval(() => {
        setCalibrationState(prev => {
          if (prev.countdownNumber > 1) {
            audio.playCountdownBeep();
            return { ...prev, countdownNumber: prev.countdownNumber - 1 };
          } else {
            audio.playStart();
            startMeasurement();
            return prev;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, calibrationState.isCountingDown, calibrationState.countdownNumber, audio]);

  // Measurement timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (currentStep === 'measuring' && calibrationState.isMeasuring && calibrationState.measureStartTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - calibrationState.measureStartTime!) / 1000;
        setCurrentMeasurementTime(elapsed);
      }, 20); // Update every 20ms for smooth timer display
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentStep, calibrationState.isMeasuring, calibrationState.measureStartTime]);

  // Personal Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerState.isRunning && !timerState.isPaused && timerState.personalLevels.length > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev.repStartTime) return prev;
          
          // Calculate actual elapsed time since rep started
          const now = Date.now();
          const elapsedTime = (now - prev.repStartTime) / 1000; // Convert to seconds
          const currentLevelIndex = prev.currentLevel - 1;
          const currentLevelConfig = prev.personalLevels[currentLevelIndex];
          const timeRemaining = Math.max(0, currentLevelConfig.interval - elapsedTime);
          
          // If timer reached 0, advance to next rep/level
          if (timeRemaining <= 0) {
            const newRep = prev.currentRep + 1;
            
            // Check if current level is complete
            if (newRep > currentLevelConfig.reps) {
              // Move to next level
              const nextLevel = prev.currentLevel + 1;
              
              // Check if all levels are complete
              if (nextLevel > prev.personalLevels.length) {
                // Workout complete
                audio.playComplete();
                // Workout complete - will trigger completePersonalWorkout via effect
                return {
                  ...prev,
                  isRunning: false,
                  isPaused: false,
                  timeRemaining: 0,
                  repStartTime: null
                };
              }
              
              // Level up - only play level up sound (not rep beep)
              audio.playLevelUp();
              
              // Start next level
              const nextLevelConfig = prev.personalLevels[nextLevel - 1];
              return {
                ...prev,
                currentLevel: nextLevel,
                currentRep: 1,
                totalReps: prev.totalReps + 1,
                timeRemaining: nextLevelConfig.interval,
                repStartTime: now // Start timing for new level
              };
            }
            
            // Continue current level, next rep - play rep beep
            audio.playBeep();
            
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
  }, [timerState.isRunning, timerState.isPaused, timerState.personalLevels, audio]);

  // Handle workout completion
  useEffect(() => {
    if (!timerState.isRunning && timerState.workoutStartTime && timerState.timeRemaining === 0 && timerState.personalLevels.length > 0) {
      completePersonalWorkout();
    }
  }, [timerState.isRunning, timerState.workoutStartTime, timerState.timeRemaining, timerState.personalLevels.length, completePersonalWorkout]);

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
                  {previousCalibration.measured_time.toFixed(2)}s
                </ThemedText>
              </View>
              
              <View style={styles.calibrationDataItem}>
                <ThemedText type="caption" style={styles.calibrationDataLabel}>Distance:</ThemedText>
                <ThemedText type="body" style={styles.calibrationDataValue}>
                  ~{previousCalibration.estimated_distance.toFixed(1)}m
                </ThemedText>
              </View>
              
              <View style={styles.calibrationDataItem}>
                <ThemedText type="caption" style={styles.calibrationDataLabel}>Ratio:</ThemedText>
                <ThemedText type="body" style={styles.calibrationDataValue}>
                  {((previousCalibration.estimated_distance / 20) * 100).toFixed(0)}% of 20m
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
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="body" style={styles.guidelineText}>
              Stop when you reach your end point
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
      <Pressable 
        style={[styles.button, styles.primaryButton]} 
        onPress={startCalibration}
      >
        <ThemedText type="button" style={styles.buttonText}>Start Calibration</ThemedText>
      </Pressable>
      </View>
    </View>
  );

  const renderCountdownStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="timer" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Get Ready!
        </ThemedText>
      </View>
      
      <View style={styles.countdownDisplay}>
        <View style={styles.calibrationCountdownContainer}>
          <ThemedText type="display" style={styles.countdownText}>
            {calibrationState.countdownNumber}
          </ThemedText>
        </View>
        <ThemedText type="bodyLarge" style={styles.countdownInstructions}>
          Run to your end point when you hear the start signal
        </ThemedText>
      </View>
    </View>
  );

  const renderMeasuringStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="directions-run" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Measuring...
        </ThemedText>
      </View>
      
      <View style={styles.timerDisplay}>
        <View style={styles.measurementTimerContainer}>
          <ThemedText type="display" style={styles.runningTime}>
            {currentMeasurementTime.toFixed(2)}
          </ThemedText>
        </View>
        <ThemedText type="bodyLarge" style={styles.measureInstructions}>
          Run at a comfortable pace to your end point
        </ThemedText>
      </View>

      <Pressable 
        style={[styles.button, styles.primaryButton]} 
        onPress={stopMeasurement}
      >
        <MaterialIcons name="flag" size={24} color="white" style={styles.buttonIcon} />
        <ThemedText type="button" style={styles.buttonText}>I&apos;ve Arrived!</ThemedText>
      </Pressable>
    </View>
  );

  const renderResultsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="check-circle" size={32} color={MODE_COLORS.ACCENT} />
        <ThemedText type="title" style={styles.stepTitle}>
          Measurement Complete
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

      <ThemedText type="bodyLarge" style={styles.confirmationText}>
        This setting will customize the beep test intervals for your space. 
        Ready to start your personal beep test?
      </ThemedText>

      <View style={styles.buttonRow}>
        <Pressable 
          style={[styles.button, styles.secondaryButton]} 
          onPress={retryCalibration}
        >
          <ThemedText type="button" style={styles.secondaryButtonText}>Retry</ThemedText>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.primaryButtonInRow]} 
          onPress={confirmCalibration}
        >
          <ThemedText type="button" style={styles.buttonText}>Confirm</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderTimerStep = () => {
    const currentLevelConfig = timerState.personalLevels[timerState.currentLevel - 1];
    
    return (
      <View style={styles.stepContainer}>
        {/* Main Timer Display */}
        <View style={styles.personalTimerDisplay}>
          <ThemedText type="timerLarge" style={styles.personalLevelText}>
            Level {timerState.currentLevel}
          </ThemedText>
          
          <ThemedText type="headline" style={styles.personalRepText}>
            Rep {timerState.currentRep} of {currentLevelConfig?.reps || 0}
          </ThemedText>
          
          <View style={styles.personalCountdownContainer}>
            <ThemedText type="display" style={styles.personalCountdownText}>
              {timerState.timeRemaining.toFixed(2)}
            </ThemedText>
          </View>
          
          <ThemedText type="bodyLarge" style={styles.personalTotalRepsText}>
            Total Reps: {timerState.totalReps}
          </ThemedText>

          {/* Calibration Info */}
          <View style={styles.calibrationInfo}>
            <ThemedText type="caption" style={styles.calibrationInfoText}>
              Calibrated for {calibrationState.estimatedDistance?.toFixed(1)}m space
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.personalProgressContainer}>
          <View style={styles.personalProgressBar}>
            <View 
              style={[
                styles.personalProgressFill, 
                { 
                  width: `${(timerState.currentRep / (currentLevelConfig?.reps || 1)) * 100}%`,
                  backgroundColor: MODE_COLORS.PERSONAL
                }
              ]} 
            />
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.personalControlsContainer}>
          {!timerState.isRunning ? (
            <Pressable 
              style={[styles.button, styles.primaryButton]} 
              onPress={startPersonalTimer}
            >
              <ThemedText type="button" style={styles.buttonText}>Start</ThemedText>
            </Pressable>
          ) : (
            <View style={styles.runningControls}>
              <Pressable 
                style={[styles.button, styles.pauseButton, styles.buttonInRow]} 
                onPress={pausePersonalTimer}
              >
                <ThemedText type="button" style={styles.buttonText}>
                  {timerState.isPaused ? 'Resume' : 'Pause'}
                </ThemedText>
              </Pressable>
              
              <Pressable 
                style={[styles.button, styles.stopButton, styles.buttonInRow]} 
                onPress={stopPersonalTimer}
              >
                <ThemedText type="button" style={styles.buttonText}>Stop</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
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
          Reached Level 4 • 31 total reps
        </ThemedText>
        
        <ThemedText type="bodyLarge" style={styles.feedbackPrompt}>
          How was this workout?
        </ThemedText>
        
        <View style={styles.feedbackButtons}>
          <Pressable style={[styles.button, styles.feedbackButton]}>
            <MaterialIcons name="sentiment-very-satisfied" size={32} color={MODE_COLORS.ACCENT} />
            <ThemedText type="subtitle" style={styles.feedbackText}>Too Easy</ThemedText>
            <ThemedText type="caption" style={styles.feedbackSubtext}>(Next: faster)</ThemedText>
          </Pressable>
          
          <Pressable style={[styles.button, styles.feedbackButton]}>
            <MaterialIcons name="thumb-up" size={32} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="subtitle" style={styles.feedbackText}>Perfect</ThemedText>
            <ThemedText type="caption" style={styles.feedbackSubtext}>(Keep settings)</ThemedText>
          </Pressable>
          
          <Pressable style={[styles.button, styles.feedbackButton]}>
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={MODE_COLORS.PERSONAL} />
          </Pressable>
          <ThemedText type="title" style={[styles.title, { color: MODE_COLORS.PERSONAL }]}>
            Personal Beep Test
          </ThemedText>
        </View>

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
    paddingBottom: 20, // Extra space for better scrolling
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
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 400, // Ensure minimum height for content
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
  primaryButtonInRow: {
    backgroundColor: MODE_COLORS.PERSONAL,
    flex: 1,
    width: undefined, // Override inherited width: '100%' for row layouts
  },
  buttonText: {
    color: 'white',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
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
    width: undefined, // Override inherited width: '100%' for row layouts
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
  personalLevelText: {
    marginBottom: 8,
    color: MODE_COLORS.PERSONAL,
    textAlign: 'center',
  },
  personalRepText: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  personalCountdownContainer: {
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalCountdownText: {
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    color: MODE_COLORS.PERSONAL,
  },
  personalTotalRepsText: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
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
  personalProgressContainer: {
    marginBottom: 30,
    width: '100%',
  },
  personalProgressBar: {
    height: 6,
    backgroundColor: MODE_COLORS.PERSONAL_TINT,
    borderRadius: 3,
    overflow: 'hidden',
  },
  personalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  personalControlsContainer: {
    width: '100%',
  },
  pauseButton: {
    backgroundColor: MODE_COLORS.ACCENT,
  },
  stopButton: {
    backgroundColor: MODE_COLORS.DANGER,
  },
  buttonInRow: {
    flex: 1,
    width: undefined, // Override inherited width: '100%' for row layouts
  },
  singleButton: {
    alignSelf: 'stretch', // Override parent's alignItems: 'center' to take full width
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
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