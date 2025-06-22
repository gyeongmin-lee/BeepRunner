/**
 * Component tests for WorkoutGraph
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { WorkoutGraph } from '@/components/history/WorkoutGraph';
import { WorkoutSession } from '@/services/DatabaseService';

// Mock the theme color hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

const mockWorkouts: WorkoutSession[] = [
  {
    id: 1,
    date: '2024-01-15T10:30:00Z',
    workout_mode: 'personal',
    max_level: 5,
    total_reps: 32,
    duration_minutes: 12,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    date: '2024-01-16T09:00:00Z',
    workout_mode: 'standard',
    max_level: 4,
    total_reps: 24,
    duration_minutes: 10,
    created_at: '2024-01-16T09:00:00Z',
  },
  {
    id: 3,
    date: '2024-01-17T16:00:00Z',
    workout_mode: 'personal',
    max_level: 6,
    total_reps: 40,
    duration_minutes: 15,
    created_at: '2024-01-17T16:00:00Z',
  },
];

describe('WorkoutGraph', () => {
  describe('rendering', () => {
    it('should render progress chart with workout data', () => {
      const { getByText } = render(
        <WorkoutGraph workouts={mockWorkouts} />
      );

      expect(getByText('Level Progress')).toBeTruthy();
      expect(getByText('Last 3 workouts')).toBeTruthy();
    });

    it('should display statistics correctly', () => {
      const { getByText } = render(
        <WorkoutGraph workouts={mockWorkouts} />
      );

      // Check stat labels
      expect(getByText('Best Level')).toBeTruthy();
      expect(getByText('Total Workouts')).toBeTruthy();
      expect(getByText('Avg Level')).toBeTruthy();
    });

    it('should display legend for workout modes', () => {
      const { getByText } = render(
        <WorkoutGraph workouts={mockWorkouts} />
      );

      expect(getByText('Personal')).toBeTruthy();
      expect(getByText('Standard')).toBeTruthy();
    });

    it('should handle empty workout list', () => {
      const { getByText } = render(
        <WorkoutGraph workouts={[]} />
      );

      expect(getByText('No Data Available')).toBeTruthy();
      expect(getByText('Complete some workouts to see your progress chart')).toBeTruthy();
    });
  });

  describe('data processing', () => {
    it('should render without crashing with single workout', () => {
      const singleWorkout = [mockWorkouts[0]];
      const { getByText } = render(
        <WorkoutGraph workouts={singleWorkout} />
      );

      expect(getByText('Level Progress')).toBeTruthy();
      expect(getByText('Last 1 workouts')).toBeTruthy();
    });

    it('should handle large workout datasets', () => {
      // Create 25 workouts (more than the 20 limit)
      const manyWorkouts = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        date: `2024-01-${i + 1}`.padStart(10, '0') + 'T10:00:00Z',
        workout_mode: (i % 2 === 0 ? 'personal' : 'standard') as 'personal' | 'standard',
        max_level: (i % 9) + 1,
        total_reps: i + 10,
        duration_minutes: (i % 60) + 5,
        created_at: `2024-01-${i + 1}`.padStart(10, '0') + 'T10:00:00Z',
      }));

      const { getByText } = render(
        <WorkoutGraph workouts={manyWorkouts} />
      );

      // Should show "Last 20 workouts" because it limits to 20
      expect(getByText('Last 20 workouts')).toBeTruthy();
      // Component should render without errors
      expect(getByText('Level Progress')).toBeTruthy();
    });
  });

  describe('chart display', () => {
    it('should render chart components without errors', () => {
      const { getByText } = render(
        <WorkoutGraph workouts={mockWorkouts} />
      );

      // Just verify the component renders the main elements
      expect(getByText('Level Progress')).toBeTruthy();
      expect(getByText('Personal')).toBeTruthy();
      expect(getByText('Standard')).toBeTruthy();
    });
  });
});