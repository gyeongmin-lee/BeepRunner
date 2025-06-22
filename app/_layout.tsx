import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {
  font42dotSans_300Light,
  font42dotSans_400Regular,
  font42dotSans_500Medium,
  font42dotSans_600SemiBold,
  font42dotSans_700Bold,
  font42dotSans_800ExtraBold,
} from '@expo-google-fonts/42dot-sans';

import { AudioProvider } from '@/components/AudioProvider';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    font42dotSans_300Light,
    font42dotSans_400Regular,
    font42dotSans_500Medium,
    font42dotSans_600SemiBold,
    font42dotSans_700Bold,
    font42dotSans_800ExtraBold,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AudioProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="standard-timer" options={{ headerShown: false }} />
          <Stack.Screen name="personal-timer" options={{ headerShown: false }} />
          <Stack.Screen name="workout-history" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AudioProvider>
  );
}
