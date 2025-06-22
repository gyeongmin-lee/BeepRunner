import React from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WorkoutSession } from '@/services/DatabaseService';
import { MODE_COLORS } from '@/constants/BeepTestConfig';

interface WorkoutListItemProps {
  workout: WorkoutSession;
  onPress?: () => void;
  onDelete?: (workoutId: number) => void;
  showNotes?: boolean;
}

export function WorkoutListItem({ workout, onPress, onDelete, showNotes = true }: WorkoutListItemProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  
  const modeColor = workout.workout_mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m 0s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m 0s`;
  };

  const handleDelete = () => {
    if (!workout.id || !onDelete) return;
    
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(workout.id!)
        }
      ]
    );
  };

  const content = (
    <View style={[styles.container, { borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.modeIndicator, { backgroundColor: modeColor }]} />
        <View style={styles.workoutInfo}>
          <ThemedText type="bodyLarge" style={styles.workoutDate}>
            {formatDate(workout.date)}
          </ThemedText>
          <ThemedText type="caption" style={[styles.workoutMode, { color: modeColor }]}>
            {workout.workout_mode.charAt(0).toUpperCase() + workout.workout_mode.slice(1)} Mode
          </ThemedText>
        </View>
        <View style={styles.workoutStats}>
          <ThemedText type="bodyLarge" style={styles.statValue}>
            Level {workout.max_level}
          </ThemedText>
          <ThemedText type="caption" style={styles.statLabel}>
            Max Level
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.statItem}>
          <MaterialIcons name="repeat" size={16} color={textColor} />
          <ThemedText type="body" style={styles.statText}>
            {workout.total_reps} reps
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="timer" size={16} color={textColor} />
          <ThemedText type="body" style={styles.statText}>
            {formatDuration(workout.duration_minutes)}
          </ThemedText>
        </View>
        
        {showNotes && workout.notes && (
          <View style={styles.notesContainer}>
            <MaterialIcons name="note" size={16} color={textColor} />
            <ThemedText type="body" style={styles.notesText}>
              {workout.notes}
            </ThemedText>
          </View>
        )}
        
        {onDelete && (
          <Pressable 
            onPress={handleDelete} 
            style={styles.deleteButton}
            testID="delete-button"
          >
            <ThemedText type="body" style={[styles.deleteButtonText, { color: MODE_COLORS.DANGER }]}>
              Delete
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
  },
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontWeight: '500',
  },
  workoutMode: {
    marginTop: 2,
    fontWeight: '500',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontWeight: '600',
  },
  statLabel: {
    opacity: 0.6,
    marginTop: 2,
  },
  details: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    opacity: 0.8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  notesText: {
    flex: 1,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
});