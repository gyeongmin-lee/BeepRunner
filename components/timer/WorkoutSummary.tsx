import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface WorkoutSummaryProps {
  level: number;
  totalReps: number;
  duration: number; // in seconds
  onDone: () => void;
  mode: 'personal' | 'standard';
}

export const WorkoutSummary = React.memo(function WorkoutSummary({ 
  level, 
  totalReps, 
  duration, 
  onDone, 
  mode 
}: WorkoutSummaryProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );

  return (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="celebration" size={32} color={modeColor} />
        <ThemedText type="title" style={[styles.stepTitle, { color: modeColor }]}>
          Workout Complete!
        </ThemedText>
      </View>
      
      <View style={styles.completionContainer}>
        <ThemedText type="headline" style={[styles.resultText, { color: modeColor }]}>
          Level {level} • {totalReps} total reps
        </ThemedText>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="trending-up" size={20} color={modeColor} />
            <ThemedText type="body" style={styles.summaryLabel}>Max Level:</ThemedText>
            <ThemedText type="subtitle" style={[styles.summaryValue, { color: modeColor }]}>{level}</ThemedText>
          </View>
          
          <View style={styles.summaryItem}>
            <MaterialIcons name="repeat" size={20} color={modeColor} />
            <ThemedText type="body" style={styles.summaryLabel}>Total Reps:</ThemedText>
            <ThemedText type="subtitle" style={[styles.summaryValue, { color: modeColor }]}>{totalReps}</ThemedText>
          </View>
          
          <View style={styles.summaryItem}>
            <MaterialIcons name="schedule" size={20} color={modeColor} />
            <ThemedText type="body" style={styles.summaryLabel}>Duration:</ThemedText>
            <ThemedText type="subtitle" style={[styles.summaryValue, { color: modeColor }]}>
              {Math.floor(duration / 60)} min {duration % 60} sec
            </ThemedText>
          </View>
        </View>
        
        <Pressable 
          style={[styles.button, styles.doneButton, { backgroundColor: modeColor }]}
          onPress={onDone}
        >
          <ThemedText type="button" style={styles.buttonText}>Done</ThemedText>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 100,
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
  completionContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  resultText: {
    marginBottom: 32,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    flex: 1,
    opacity: 0.8,
  },
  summaryValue: {
    fontWeight: '600',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    width: '100%',
  },
  doneButton: {
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});