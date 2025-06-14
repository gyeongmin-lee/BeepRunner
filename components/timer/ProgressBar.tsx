import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS } from '@/constants/BeepTestConfig';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  mode: 'personal' | 'standard';
}

export const ProgressBar = React.memo(function ProgressBar({ current, total, mode }: ProgressBarProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );
  const modeTintColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL_TINT : '#e8f5e8',
    [mode]
  );
  const progressPercentage = React.useMemo(() => 
    total > 0 ? (current / total) * 100 : 0,
    [current, total]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { backgroundColor: modeTintColor }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: modeColor
            }
          ]} 
        />
      </View>
      <ThemedText type="caption" style={styles.progressText}>
        {current} / {total} reps
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    width: '100%',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
});