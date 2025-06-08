/**
 * Typography System for BeepRunner
 * Built with Asta Sans (42dot Sans) font family
 */

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: string;
}

// Font family constants - mapped to 42dot Sans (Asta Sans) variants
export const FONT_FAMILIES = {
  LIGHT: 'font42dotSans_300Light',
  REGULAR: 'font42dotSans_400Regular', 
  MEDIUM: 'font42dotSans_500Medium',
  SEMIBOLD: 'font42dotSans_600SemiBold',
  BOLD: 'font42dotSans_700Bold',
  EXTRABOLD: 'font42dotSans_800ExtraBold',
} as const;

// Typography scale - modern, tighter spacing
export const TYPOGRAPHY = {
  // Timer display - for countdown numbers
  DISPLAY: {
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    fontSize: 56, // Large for timer readability
    lineHeight: 60,
  } as TypographyStyle,

  // Large timer text - for level numbers  
  TIMER_LARGE: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 32,
    lineHeight: 36,
  } as TypographyStyle,

  // Reduced header size as requested
  TITLE: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 20,
    lineHeight: 24,
  } as TypographyStyle,

  // Level indicators, secondary headers
  HEADLINE: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 18,
    lineHeight: 22,
  } as TypographyStyle,

  // Subtitles for cards
  SUBTITLE: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 16,
    lineHeight: 20,
  } as TypographyStyle,

  // Primary body text
  BODY_LARGE: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 16,
    lineHeight: 20,
  } as TypographyStyle,

  // Secondary content
  BODY: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 14,
    lineHeight: 18,
  } as TypographyStyle,

  // Helper text, metadata
  CAPTION: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 12,
    lineHeight: 16,
  } as TypographyStyle,

  // Button text
  BUTTON: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 16,
    lineHeight: 20,
  } as TypographyStyle,

  // Small button text
  BUTTON_SMALL: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 14,
    lineHeight: 18,
  } as TypographyStyle,
} as const;

// Weight variants for dynamic styling
export const FONT_WEIGHTS = {
  LIGHT: '300',
  REGULAR: '400', 
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
  EXTRABOLD: '800',
} as const;

// Common text styles with semantic names
export const TEXT_STYLES = {
  screenHeader: TYPOGRAPHY.TITLE,
  cardTitle: TYPOGRAPHY.SUBTITLE,
  timerDisplay: TYPOGRAPHY.DISPLAY,
  levelNumber: TYPOGRAPHY.TIMER_LARGE,
  repInfo: TYPOGRAPHY.HEADLINE,
  bodyText: TYPOGRAPHY.BODY_LARGE,
  helperText: TYPOGRAPHY.BODY,
  metadata: TYPOGRAPHY.CAPTION,
  buttonPrimary: TYPOGRAPHY.BUTTON,
  buttonSecondary: TYPOGRAPHY.BUTTON_SMALL,
} as const;