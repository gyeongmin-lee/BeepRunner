import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  mode: 'personal' | 'standard';
}

export const TimerControls = React.memo(function TimerControls({ 
  isRunning, 
  isPaused, 
  onStart, 
  onPause, 
  onFinish, 
  mode 
}: TimerControlsProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );

  return (
    <View style={styles.container}>
      {!isRunning ? (
        <Pressable 
          style={[styles.button, styles.startButton, { backgroundColor: modeColor }]} 
          onPress={onStart}
        >
          <ThemedText type="button" style={styles.buttonText}>Start</ThemedText>
        </Pressable>
      ) : (
        <View style={styles.runningControls}>
          <Pressable 
            style={[styles.button, styles.pauseButton, styles.buttonInRow]} 
            onPress={onPause}
          >
            <ThemedText type="button" style={styles.buttonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.finishButton, styles.buttonInRow]} 
            onPress={onFinish}
          >
            <ThemedText type="button" style={styles.buttonText}>Finish</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    // backgroundColor set dynamically by mode
  },
  pauseButton: {
    backgroundColor: MODE_COLORS.ACCENT,
    shadowColor: MODE_COLORS.ACCENT,
  },
  finishButton: {
    backgroundColor: '#4CAF50', // Green color for positive action
    shadowColor: '#4CAF50',
  },
  buttonInRow: {
    flex: 1,
    width: undefined, // Override inherited width: '100%' for row layouts
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});