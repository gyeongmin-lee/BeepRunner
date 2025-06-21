# Testing Requirements

## Component Test Template

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CountdownDisplay } from '@/components/timer/CountdownDisplay';

describe('CountdownDisplay', () => {
  const defaultProps = {
    timeRemaining: 5.5,
    currentRep: 3,
    totalReps: 15,
    maxReps: 7,
    mode: 'personal' as const,
  };

  it('should render countdown time correctly', () => {
    const { getByText } = render(<CountdownDisplay {...defaultProps} />);
    
    expect(getByText('5.50')).toBeTruthy();
  });

  it('should display rep progress', () => {
    const { getByText } = render(<CountdownDisplay {...defaultProps} />);
    
    expect(getByText('Rep 3 of 7')).toBeTruthy();
    expect(getByText('Total: 15')).toBeTruthy();
  });

  it('should apply mode-specific styling', () => {
    const { getByTestId } = render(
      <CountdownDisplay {...defaultProps} mode="standard" />
    );
    
    const container = getByTestId('countdown-container');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.any(String), // Theme-specific color
    });
  });
});
```

## Testing Best Practices

1. **Unit Tests**: Test individual components and utilities in isolation
2. **Integration Tests**: Test component interactions and data flow
3. **Hook Tests**: Test custom hooks with `renderHook` from React Native Testing Library
4. **Database Tests**: Use in-memory SQLite for testing database operations
5. **Timer Tests**: Use Jest fake timers for deterministic time-based testing
6. **Coverage Goals**: Maintain 80% overall, 90% business logic, 95% critical paths
7. **Mock Strategy**: Mock external dependencies (audio, database) while testing real logic
