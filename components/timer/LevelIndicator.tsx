import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS } from '@/constants/BeepTestConfig';
import React from 'react';
import { StyleSheet } from 'react-native';

interface LevelIndicatorProps {
  level: number;
  mode: 'personal' | 'standard';
}

export const LevelIndicator = React.memo(function LevelIndicator({ level, mode }: LevelIndicatorProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );

  return (
    <ThemedText type="timerLarge" style={[styles.levelText, { color: modeColor }]}>
      Level {level}
    </ThemedText>
  );
});

const styles = StyleSheet.create({
  levelText: {
    textAlign: 'center',
    marginBottom: 8,
  },
});