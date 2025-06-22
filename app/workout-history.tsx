import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WorkoutListItem, WorkoutCalendar, WorkoutGraph } from '@/components/history';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { MODE_COLORS } from '@/constants/BeepTestConfig';
import { databaseService } from '@/services/DatabaseService';

type ViewMode = 'list' | 'calendar' | 'graph';
type FilterMode = 'personal' | 'standard' | 'all';

export default function WorkoutHistoryScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const mode = filterMode === 'all' ? undefined : (filterMode as 'personal' | 'standard');
  const { workouts, loading, error, refresh } = useWorkoutHistory({ mode, limit: 100 });

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleBackPress = () => {
    router.back();
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    try {
      await databaseService.deleteWorkout(workoutId);
      refresh(); // Refresh the workout list
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const filteredWorkouts = workouts; // TODO: Add search functionality later

  const getWorkoutsForDate = (date: string) => {
    return workouts.filter(workout => {
      const workoutDate = workout.date.split('T')[0]; // Get YYYY-MM-DD part
      return workoutDate === date;
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const renderViewModeToggle = () => (
    <View style={styles.viewModeContainer}>
      <Pressable
        style={[
          styles.viewModeButton,
          styles.viewModeButtonFirst,
          { borderColor },
          viewMode === 'list' && styles.viewModeButtonActive
        ]}
        onPress={() => setViewMode('list')}
      >
        <MaterialIcons 
          name="view-list" 
          size={18} 
          color={viewMode === 'list' ? '#FFFFFF' : textColor} 
        />
      </Pressable>
      <Pressable
        style={[
          styles.viewModeButton,
          styles.viewModeButtonMiddle,
          { borderColor },
          viewMode === 'calendar' && styles.viewModeButtonActive
        ]}
        onPress={() => setViewMode('calendar')}
      >
        <MaterialIcons 
          name="calendar-today" 
          size={18} 
          color={viewMode === 'calendar' ? '#FFFFFF' : textColor} 
        />
      </Pressable>
      <Pressable
        style={[
          styles.viewModeButton,
          styles.viewModeButtonLast,
          { borderColor },
          viewMode === 'graph' && styles.viewModeButtonActive
        ]}
        onPress={() => setViewMode('graph')}
      >
        <MaterialIcons 
          name="show-chart" 
          size={18} 
          color={viewMode === 'graph' ? '#FFFFFF' : textColor} 
        />
      </Pressable>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {(['all', 'personal', 'standard'] as FilterMode[]).map((mode) => (
        <Pressable
          key={mode}
          style={[
            styles.filterButton,
            { borderColor },
            filterMode === mode && styles.filterButtonActive
          ]}
          onPress={() => setFilterMode(mode)}
        >
          <ThemedText
            type="body"
            style={[
              styles.filterButtonText,
              filterMode === mode && styles.filterButtonTextActive
            ]}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        
        <ThemedText type="title" style={styles.headerTitle}>
          History
        </ThemedText>
        
        <View style={styles.headerActions}>
          {renderViewModeToggle()}
        </View>
      </View>

      {/* Filters */}
      {renderFilterButtons()}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODE_COLORS.ACCENT} />
          <ThemedText type="body" style={styles.loadingText}>
            Loading workout history...
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={MODE_COLORS.DANGER} />
          <ThemedText type="bodyLarge" style={styles.errorText}>
            {error}
          </ThemedText>
          <Pressable style={[styles.retryButton, { borderColor }]} onPress={refresh}>
            <ThemedText type="body" style={styles.retryButtonText}>
              Try Again
            </ThemedText>
          </Pressable>
        </View>
      ) : filteredWorkouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="fitness-center" size={64} color={borderColor} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No workouts found
          </ThemedText>
          <ThemedText type="body" style={styles.emptyDescription}>
            Start your first workout to see your history here
          </ThemedText>
        </View>
      ) : viewMode === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <WorkoutCalendar 
            workouts={filteredWorkouts}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          {selectedDate && (
            <View style={[styles.selectedDateDetails, { borderColor }]}>
              <ThemedText type="subtitle" style={styles.selectedDateTitle}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </ThemedText>
              <ScrollView 
                style={styles.dateWorkoutsList}
                contentContainerStyle={styles.dateWorkoutsContent}
                showsVerticalScrollIndicator={true}
              >
                {getWorkoutsForDate(selectedDate).map(workout => (
                  <WorkoutListItem 
                    key={workout.id} 
                    workout={workout}
                    showNotes={true}
                    onDelete={handleDeleteWorkout}
                    onPress={() => console.log('Selected workout:', workout.id)}
                  />
                ))}
                {getWorkoutsForDate(selectedDate).length === 0 && (
                  <ThemedText type="body" style={styles.noWorkoutsText}>
                    No workouts on this date
                  </ThemedText>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      ) : viewMode === 'graph' ? (
        <WorkoutGraph workouts={filteredWorkouts} />
      ) : (
        <ScrollView
          style={styles.workoutList}
          contentContainerStyle={styles.workoutListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredWorkouts.map(workout => (
            <WorkoutListItem 
              key={workout.id} 
              workout={workout}
              onDelete={handleDeleteWorkout}
              onPress={() => console.log('Selected workout:', workout.id)}
            />
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderRightWidth: 0,
  },
  viewModeButtonFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  viewModeButtonMiddle: {
    // No border radius for middle button
  },
  viewModeButtonLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 1,
  },
  viewModeButtonActive: {
    backgroundColor: MODE_COLORS.ACCENT,
    borderColor: MODE_COLORS.ACCENT,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: MODE_COLORS.ACCENT,
    borderColor: MODE_COLORS.ACCENT,
  },
  filterButtonText: {
    opacity: 0.7,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    opacity: 1,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
    color: MODE_COLORS.DANGER,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    marginTop: 16,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.6,
  },
  workoutList: {
    flex: 1,
  },
  workoutListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  calendarContainer: {
    flex: 1,
  },
  selectedDateDetails: {
    flex: 1,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 200,
    maxHeight: '50%',
  },
  selectedDateTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  dateWorkoutsList: {
    flex: 1,
  },
  dateWorkoutsContent: {
    paddingBottom: 16,
    gap: 12,
  },
  noWorkoutsText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
});