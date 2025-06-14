import { useAudio } from '@/components/AudioProvider';
import { calculatePersonalIntervals } from '@/constants/BeepTestConfig';
import { CalibrationRecord, databaseService } from '@/services/DatabaseService';
import { useCallback, useEffect, useState } from 'react';

export interface CalibrationState {
  measuredTime: number | null;
  estimatedDistance: number | null;
  isCountingDown: boolean;
  countdownNumber: number;
  isMeasuring: boolean;
  measureStartTime: number | null;
}

export interface UseCalibrationReturn {
  calibrationState: CalibrationState;
  previousCalibration: CalibrationRecord | null;
  currentMeasurementTime: number;
  startCalibration: () => Promise<void>;
  startMeasurement: () => void;
  stopMeasurement: () => void;
  saveCalibration: () => Promise<boolean>;
  loadPreviousCalibration: () => Promise<void>;
  resetCalibration: () => void;
}

export function useCalibration(): UseCalibrationReturn {
  const audio = useAudio();
  const [previousCalibration, setPreviousCalibration] = useState<CalibrationRecord | null>(null);
  const [currentMeasurementTime, setCurrentMeasurementTime] = useState<number>(0);
  
  const [calibrationState, setCalibrationState] = useState<CalibrationState>({
    measuredTime: null,
    estimatedDistance: null,
    isCountingDown: false,
    countdownNumber: 3,
    isMeasuring: false,
    measureStartTime: null,
  });

  // Check for existing calibration on mount
  useEffect(() => {
    const checkExistingCalibration = async () => {
      try {
        const latestCalibration = await databaseService.getLatestCalibration();
        if (latestCalibration) {
          setPreviousCalibration(latestCalibration);
        }
      } catch (error) {
        console.warn('Failed to check existing calibration:', error);
      }
    };

    checkExistingCalibration();
  }, []);

  // Countdown effect
  useEffect(() => {
    if (calibrationState.isCountingDown) {
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
  }, [calibrationState.isCountingDown, calibrationState.countdownNumber, audio]);

  // Measurement timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (calibrationState.isMeasuring && calibrationState.measureStartTime) {
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
  }, [calibrationState.isMeasuring, calibrationState.measureStartTime]);

  const startCalibration = useCallback(async () => {
    await audio.initialize();
    setCalibrationState(prev => ({ 
      ...prev, 
      isCountingDown: true, 
      countdownNumber: 3 
    }));
  }, [audio]);

  const startMeasurement = useCallback(() => {
    const now = Date.now();
    setCalibrationState(prev => ({
      ...prev,
      isCountingDown: false,
      isMeasuring: true,
      measureStartTime: now
    }));
    setCurrentMeasurementTime(0);
  }, []);

  const stopMeasurement = useCallback(() => {
    if (calibrationState.measureStartTime) {
      const measuredTime = (Date.now() - calibrationState.measureStartTime) / 1000;
      const estimatedDistance = (measuredTime / 9.0) * 20; // Calculate distance based on 20m/9s standard
      
      setCalibrationState(prev => ({
        ...prev,
        isMeasuring: false,
        measuredTime,
        estimatedDistance
      }));
      
      audio.playComplete();
    }
  }, [calibrationState.measureStartTime, audio]);

  const saveCalibration = useCallback(async (): Promise<boolean> => {
    if (calibrationState.measuredTime && calibrationState.estimatedDistance) {
      try {
        await databaseService.saveCalibration(
          calibrationState.measuredTime,
          calibrationState.estimatedDistance
        );
        return true;
      } catch (error) {
        console.warn('Failed to save calibration:', error);
        return false;
      }
    }
    return false;
  }, [calibrationState.measuredTime, calibrationState.estimatedDistance]);

  const loadPreviousCalibration = useCallback(async () => {
    if (previousCalibration) {
      try {
        // Load latest calibration directly (includes any feedback adjustments)
        setCalibrationState(prev => ({
          ...prev,
          measuredTime: previousCalibration.measured_time,
          estimatedDistance: previousCalibration.estimated_distance,
        }));
        
        return previousCalibration.measured_time;
      } catch (error) {
        console.warn('Failed to load previous calibration:', error);
        throw error;
      }
    }
    throw new Error('No previous calibration available');
  }, [previousCalibration]);

  const resetCalibration = useCallback(() => {
    setCalibrationState({
      measuredTime: null,
      estimatedDistance: null,
      isCountingDown: false,
      countdownNumber: 3,
      isMeasuring: false,
      measureStartTime: null,
    });
    setCurrentMeasurementTime(0);
  }, []);

  return {
    calibrationState,
    previousCalibration,
    currentMeasurementTime,
    startCalibration,
    startMeasurement,
    stopMeasurement,
    saveCalibration,
    loadPreviousCalibration,
    resetCalibration
  };
}