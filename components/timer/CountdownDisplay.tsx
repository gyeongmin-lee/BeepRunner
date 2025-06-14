import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS } from '@/constants/BeepTestConfig';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CountdownDisplayProps {
  timeRemaining: number;
  currentRep: number;
  totalReps: number;
  maxReps: number;
  mode: 'personal' | 'standard';
}

export const CountdownDisplay = React.memo(function CountdownDisplay({ 
  timeRemaining, 
  currentRep, 
  totalReps, 
  maxReps, 
  mode 
}: CountdownDisplayProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );

  return (
    <View style={styles.container}>
      <ThemedText type="headline" style={styles.repText}>
        Rep {currentRep} of {maxReps}
      </ThemedText>
      
      <View style={styles.countdownContainer}>
        <ThemedText type="display" style={[styles.countdownText, { color: modeColor }]}>
          {timeRemaining.toFixed(2)}
        </ThemedText>
      </View>
      
      <ThemedText type="bodyLarge" style={styles.totalRepsText}>
        Total Reps: {totalReps}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  totalRepsText: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
});