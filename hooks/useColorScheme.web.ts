/**
 * Always return 'light' to disable dark theme support on web
 * Simplified version that no longer detects system color scheme
 */
export function useColorScheme() {
  return 'light' as const;
}
