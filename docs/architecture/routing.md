# Routing

## Route Configuration

Expo Router provides file-based routing with automatic screen generation:

```typescript
// app/_layout.tsx - Root layout
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'BeepRunner' }} />
          <Stack.Screen name="personal-timer" options={{ title: 'Personal Training' }} />
          <Stack.Screen name="standard-timer" options={{ title: 'Standard Test' }} />
        </Stack>
      </AudioProvider>
    </ThemeProvider>
  );
}

// Navigation patterns
import { router } from 'expo-router';

// Programmatic navigation
router.push('/personal-timer');
router.replace('/standard-timer'); 
router.back();

// Navigation with parameters
router.push({
  pathname: '/workout-summary',
  params: { workoutId: '123', mode: 'personal' }
});
```
