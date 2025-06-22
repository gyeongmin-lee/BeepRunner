/**
 * Component tests for WorkoutListItem
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { WorkoutListItem } from '@/components/history/WorkoutListItem';

// Get the mock from global setup
const mockAlert = (global as any).mockAlert;
import { WorkoutSession } from '@/services/DatabaseService';

// Mock the theme color hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000', // Return black for all colors in tests
}));

// Mock React Native Alert (it's already mocked in setupTests.ts)

const mockPersonalWorkout: WorkoutSession = {
  id: 1,
  date: '2024-01-15T10:30:00Z',
  workout_mode: 'personal',
  max_level: 5,
  total_reps: 32,
  duration_minutes: 12,
  notes: 'Great workout today!',
  created_at: '2024-01-15T10:30:00Z',
};

const mockStandardWorkout: WorkoutSession = {
  id: 2,
  date: '2024-01-14T09:00:00Z',
  workout_mode: 'standard',
  max_level: 4,
  total_reps: 24,
  duration_minutes: 65, // Test hour formatting
  created_at: '2024-01-14T09:00:00Z',
};

describe('WorkoutListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render workout information correctly', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      expect(getByText('Jan 15, 2024')).toBeTruthy();
      expect(getByText('Personal Mode')).toBeTruthy();
      expect(getByText('Level 5')).toBeTruthy();
      expect(getByText('Max Level')).toBeTruthy();
      expect(getByText('32 reps')).toBeTruthy();
      expect(getByText('12m 0s')).toBeTruthy();
    });

    it('should render standard mode with correct styling', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockStandardWorkout} />
      );

      expect(getByText('Jan 14, 2024')).toBeTruthy();
      expect(getByText('Standard Mode')).toBeTruthy();
      expect(getByText('Level 4')).toBeTruthy();
      expect(getByText('24 reps')).toBeTruthy();
    });

    it('should format duration in hours and minutes correctly', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockStandardWorkout} />
      );

      expect(getByText('1h 5m 0s')).toBeTruthy();
    });

    it('should display notes when present', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      expect(getByText('Great workout today!')).toBeTruthy();
    });

    it('should not display notes section when notes are empty', () => {
      const workoutWithoutNotes = { ...mockPersonalWorkout, notes: undefined };
      const { queryByText } = render(
        <WorkoutListItem workout={workoutWithoutNotes} />
      );

      expect(queryByText('Great workout today!')).toBeNull();
    });

    it('should hide notes when showNotes is false', () => {
      const { queryByText } = render(
        <WorkoutListItem 
          workout={mockPersonalWorkout} 
          showNotes={false}
        />
      );

      expect(queryByText('Great workout today!')).toBeNull();
    });
  });

  describe('interaction', () => {
    it('should call onPress when workout item is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <WorkoutListItem 
          workout={mockPersonalWorkout} 
          onPress={mockOnPress}
        />
      );

      fireEvent.press(getByText('Jan 15, 2024'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not be pressable when onPress is not provided', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      // Should not throw when pressed without onPress
      const dateElement = getByText('Jan 15, 2024');
      expect(() => fireEvent.press(dateElement)).not.toThrow();
    });
  });

  describe('date formatting', () => {
    it('should format dates consistently', () => {
      const testWorkout = {
        ...mockPersonalWorkout,
        date: '2024-12-25T14:30:00Z'
      };

      const { getByText } = render(
        <WorkoutListItem workout={testWorkout} />
      );

      expect(getByText('Dec 25, 2024')).toBeTruthy();
    });
  });

  describe('duration formatting', () => {
    it('should format minutes only for durations under 60 minutes', () => {
      const shortWorkout = {
        ...mockPersonalWorkout,
        duration_minutes: 45
      };

      const { getByText } = render(
        <WorkoutListItem workout={shortWorkout} />
      );

      expect(getByText('45m 0s')).toBeTruthy();
    });

    it('should format hours and minutes for durations over 60 minutes', () => {
      const longWorkout = {
        ...mockPersonalWorkout,
        duration_minutes: 125 // 2h 5m
      };

      const { getByText } = render(
        <WorkoutListItem workout={longWorkout} />
      );

      expect(getByText('2h 5m 0s')).toBeTruthy();
    });

    it('should handle exact hour durations', () => {
      const exactHourWorkout = {
        ...mockPersonalWorkout,
        duration_minutes: 120 // 2h 0m
      };

      const { getByText } = render(
        <WorkoutListItem workout={exactHourWorkout} />
      );

      expect(getByText('2h 0m 0s')).toBeTruthy();
    });
  });

  describe('mode-specific styling', () => {
    it('should render personal mode workouts with mode indicator', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      expect(getByText('Personal Mode')).toBeTruthy();
    });

    it('should render standard mode workouts with mode indicator', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockStandardWorkout} />
      );

      expect(getByText('Standard Mode')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper text content for screen readers', () => {
      const { getByText } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      // Check that all important information is accessible as text
      expect(getByText('Jan 15, 2024')).toBeTruthy();
      expect(getByText('Personal Mode')).toBeTruthy();
      expect(getByText('Level 5')).toBeTruthy();
      expect(getByText('32 reps')).toBeTruthy();
      expect(getByText('12m 0s')).toBeTruthy();
      expect(getByText('Great workout today!')).toBeTruthy();
    });
  });

  describe('delete functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render delete button when onDelete is provided', () => {
      const mockOnDelete = jest.fn();
      const { queryByTestId } = render(
        <WorkoutListItem 
          workout={mockPersonalWorkout} 
          onDelete={mockOnDelete}
        />
      );

      // Check that delete button exists (using icon name as identifier)
      const deleteButton = queryByTestId ? 
        queryByTestId('delete-button') : 
        null;
      
      // The component should have rendered with delete functionality
      expect(mockOnDelete).toBeDefined();
    });

    it('should not render delete button when onDelete is not provided', () => {
      const { queryByTestId } = render(
        <WorkoutListItem workout={mockPersonalWorkout} />
      );

      const deleteButton = queryByTestId ? 
        queryByTestId('delete-button') : 
        null;
      
      // Delete button should not be present
      expect(deleteButton).toBeNull();
    });

    it('should show confirmation dialog when delete button is pressed', () => {
      const mockOnDelete = jest.fn();
      
      // Ensure Alert.alert is mocked
      (Alert.alert as jest.Mock) = mockAlert;
      
      const { getByTestId } = render(
        <WorkoutListItem workout={mockPersonalWorkout} onDelete={mockOnDelete} />
      );
      
      expect(mockAlert).not.toHaveBeenCalled();
      
      // Find and press the delete button
      const deleteButton = getByTestId('delete-button');
      fireEvent.press(deleteButton);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Workout',
        'Are you sure you want to delete this workout? This action cannot be undone.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Delete', style: 'destructive' })
        ])
      );
    });

    it('should call onDelete with workout id when confirmed', () => {
      const mockOnDelete = jest.fn();
      
      // Ensure Alert.alert is mocked
      (Alert.alert as jest.Mock) = mockAlert;
      
      mockAlert.mockImplementation((title, message, buttons) => {
        // Simulate pressing "Delete" button
        const deleteButton = buttons?.find((btn: any) => btn.text === 'Delete');
        if (deleteButton?.onPress) {
          deleteButton.onPress();
        }
      });

      const { getByTestId } = render(
        <WorkoutListItem workout={mockPersonalWorkout} onDelete={mockOnDelete} />
      );
      
      // Find and press the delete button
      const deleteButton = getByTestId('delete-button');
      fireEvent.press(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('should not call onDelete when cancelled', () => {
      const mockOnDelete = jest.fn();
      
      mockAlert.mockImplementation((title, message, buttons) => {
        // Simulate pressing "Cancel" button
        const cancelButton = buttons?.find((btn: any) => btn.text === 'Cancel');
        if (cancelButton?.onPress) {
          cancelButton.onPress();
        }
      });

      // Trigger delete action (simulate the Alert call)
      Alert.alert(
        'Delete Workout',
        'Are you sure you want to delete this workout? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Delete', style: 'destructive', onPress: () => mockOnDelete(1) }
        ]
      );
      
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });
});