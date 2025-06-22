import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WorkoutSession } from '@/services/DatabaseService';
import { MODE_COLORS } from '@/constants/BeepTestConfig';

interface WorkoutCalendarProps {
  workouts: WorkoutSession[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  workouts: WorkoutSession[];
}

export function WorkoutCalendar({ workouts, onDateSelect, selectedDate }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // Group workouts by date
  const workoutsByDate = useMemo(() => {
    const grouped: Record<string, WorkoutSession[]> = {};
    workouts.forEach(workout => {
      const dateKey = workout.date.split('T')[0]; // Get YYYY-MM-DD part
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(workout);
    });
    return grouped;
  }, [workouts]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        workouts: workoutsByDate[dateStr] || []
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, workoutsByDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const renderWorkoutIndicators = (dayWorkouts: WorkoutSession[]) => {
    if (dayWorkouts.length === 0) return null;

    const hasPersonal = dayWorkouts.some(w => w.workout_mode === 'personal');
    const hasStandard = dayWorkouts.some(w => w.workout_mode === 'standard');

    return (
      <View style={styles.workoutIndicators}>
        {hasPersonal && (
          <View style={[styles.workoutDot, { backgroundColor: MODE_COLORS.PERSONAL }]} />
        )}
        {hasStandard && (
          <View style={[styles.workoutDot, { backgroundColor: MODE_COLORS.STANDARD }]} />
        )}
      </View>
    );
  };

  const renderCalendarDay = (calendarDay: CalendarDay) => {
    const isSelected = selectedDate === calendarDay.date;
    const hasWorkouts = calendarDay.workouts.length > 0;
    
    return (
      <Pressable
        key={calendarDay.date}
        style={[
          styles.dayContainer,
          { borderColor },
          isSelected && styles.selectedDay,
          !calendarDay.isCurrentMonth && styles.otherMonthDay
        ]}
        onPress={() => onDateSelect?.(calendarDay.date)}
      >
        <ThemedText
          type="body"
          style={[
            styles.dayText,
            !calendarDay.isCurrentMonth && styles.otherMonthText,
            isSelected && styles.selectedDayText,
            hasWorkouts && styles.workoutDayText
          ]}
        >
          {calendarDay.day}
        </ThemedText>
        {renderWorkoutIndicators(calendarDay.workouts)}
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Pressable 
          style={styles.navButton} 
          onPress={() => navigateMonth('prev')}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <MaterialIcons name="chevron-left" size={24} color={textColor} />
        </Pressable>
        
        <ThemedText type="subtitle" style={styles.monthTitle}>
          {formatMonthYear(currentDate)}
        </ThemedText>
        
        <Pressable 
          style={styles.navButton} 
          onPress={() => navigateMonth('next')}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <MaterialIcons name="chevron-right" size={24} color={textColor} />
        </Pressable>
      </View>

      {/* Days of week header */}
      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekDayHeader}>
            <ThemedText type="caption" style={styles.weekDayText}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map(renderCalendarDay)}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MODE_COLORS.PERSONAL }]} />
          <ThemedText type="caption" style={styles.legendText}>
            Personal
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MODE_COLORS.STANDARD }]} />
          <ThemedText type="caption" style={styles.legendText}>
            Standard
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontWeight: '500',
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%', // 1/7 of the width
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    marginVertical: 1,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: MODE_COLORS.ACCENT,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayText: {
    fontWeight: '400',
  },
  otherMonthText: {
    opacity: 0.4,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  workoutDayText: {
    fontWeight: '600',
  },
  workoutIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    opacity: 0.7,
  },
});