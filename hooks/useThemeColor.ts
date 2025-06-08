/**
 * Always returns light theme colors (dark theme disabled)
 * Keeps darkColor prop for backward compatibility but ignores it
 */

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Always use light theme - ignore dark prop and system color scheme
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.light[colorName];
  }
}
