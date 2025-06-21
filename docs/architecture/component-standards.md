# Component Standards

## Component Template

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ExampleComponentProps {
  title: string;
  mode: 'personal' | 'standard';
  onPress?: () => void;
}

export function ExampleComponent({ title, mode, onPress }: ExampleComponentProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
  },
});
```

## Naming Conventions

- **Components**: PascalCase (e.g., `CountdownDisplay`, `TimerControls`)
- **Files**: PascalCase matching component name (e.g., `CountdownDisplay.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useTimer`, `useCalibration`)
- **Services**: PascalCase with "Service" suffix (e.g., `DatabaseService`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `STANDARD_LEVELS`, `MODE_COLORS`)
- **Interfaces**: PascalCase with descriptive naming (e.g., `LevelConfig`, `CalibrationData`)
- **Props interfaces**: ComponentName + "Props" (e.g., `CountdownDisplayProps`)
