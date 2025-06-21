# Styling Guidelines

## Styling Approach

BeepRunner uses **React Native StyleSheet** with a custom theme system:

```typescript
// Theme-aware styling pattern
import { StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MODE_COLORS } from '@/constants/BeepTestConfig';

export function ThemedComponent({ mode }: { mode: 'personal' | 'standard' }) {
  const backgroundColor = useThemeColor({}, 'background');
  const modeColor = MODE_COLORS[mode.toUpperCase()];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: modeColor }]}>
        Timer Display
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    minHeight: 44, // Accessibility minimum touch target
  },
  title: {
    fontSize: 32,
    fontWeight: '500', // Modern medium weight
    textAlign: 'center',
  },
});
```

## Global Theme Variables

```typescript
// constants/Colors.ts - Theme system
export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    surface: '#1E1E1E',
    border: '#333333',
  },
};

// Mode-specific colors (consistent across themes)
export const MODE_COLORS_MUTED = {
  PERSONAL: '#6B8FB5',        // Muted blue
  PERSONAL_LIGHT: '#A8C1E0',  // Light blue
  PERSONAL_TINT: '#F0F4F8',   // Blue tint
  STANDARD: '#7BA05B',        // Muted green
  STANDARD_LIGHT: '#A8C487',  // Light green
  STANDARD_TINT: '#F4F7F0',   // Green tint
  ACCENT: '#E17B47',          // Muted orange
  DANGER: '#D14343',          // Muted red
};
```
