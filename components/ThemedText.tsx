import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { TYPOGRAPHY, FONT_FAMILIES } from '@/constants/Typography';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'display' | 'timerLarge' | 'title' | 'headline' | 'subtitle' | 'body' | 'bodyLarge' | 'caption' | 'button' | 'buttonSmall' | 'link';
  variant?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor, // Keep prop for backward compatibility but ignore it
  type = 'body',
  variant,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Get base typography style
  const getTypeStyle = () => {
    switch (type) {
      case 'display': return TYPOGRAPHY.DISPLAY;
      case 'timerLarge': return TYPOGRAPHY.TIMER_LARGE;
      case 'title': return TYPOGRAPHY.TITLE;
      case 'headline': return TYPOGRAPHY.HEADLINE;
      case 'subtitle': return TYPOGRAPHY.SUBTITLE;
      case 'bodyLarge': return TYPOGRAPHY.BODY_LARGE;
      case 'body': return TYPOGRAPHY.BODY;
      case 'caption': return TYPOGRAPHY.CAPTION;
      case 'button': return TYPOGRAPHY.BUTTON;
      case 'buttonSmall': return TYPOGRAPHY.BUTTON_SMALL;
      case 'link': return { ...TYPOGRAPHY.BODY, color: '#6B8FB5' };
      default: return TYPOGRAPHY.BODY;
    }
  };

  // Override font family if variant is specified
  const getFontFamily = () => {
    if (variant) {
      switch (variant) {
        case 'light': return FONT_FAMILIES.LIGHT;
        case 'regular': return FONT_FAMILIES.REGULAR;
        case 'medium': return FONT_FAMILIES.MEDIUM;
        case 'semibold': return FONT_FAMILIES.SEMIBOLD;
        case 'bold': return FONT_FAMILIES.BOLD;
        case 'extrabold': return FONT_FAMILIES.EXTRABOLD;
        default: return getTypeStyle().fontFamily;
      }
    }
    return getTypeStyle().fontFamily;
  };

  const typeStyle = getTypeStyle();
  const fontFamily = getFontFamily();

  return (
    <Text
      style={[
        {
          color,
          fontFamily,
          fontSize: typeStyle.fontSize,
          lineHeight: typeStyle.lineHeight,
        },
        style,
      ]}
      {...rest}
    />
  );
}

