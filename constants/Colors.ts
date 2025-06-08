/**
 * BeepRunner Color System - Muted, Modern Palette
 * Reduced saturation by 60-70% for subtle, contemporary design
 */

// Neutral grays for text and backgrounds
const NEUTRALS = {
  BLACK: '#1A1A1A',
  DARK_GRAY: '#4A4A4A', 
  MEDIUM_GRAY: '#8A8A8A',
  LIGHT_GRAY: '#E5E5E5',
  OFF_WHITE: '#F8F8F8',
  WHITE: '#FFFFFF',
};

// Muted mode colors - reduced saturation for modern look
const MODE_COLORS_MUTED = {
  PERSONAL: '#6B8FB5',      // Muted blue (was #007AFF)
  PERSONAL_LIGHT: '#A8C1E0', // Lighter variant
  PERSONAL_TINT: '#F0F4F8',   // 5% background tint
  
  STANDARD: '#7BA05B',        // Muted green (was #34C759) 
  STANDARD_LIGHT: '#A8C487',  // Lighter variant
  STANDARD_TINT: '#F4F7F0',   // 5% background tint
  
  ACCENT: '#E17B47',          // Muted orange (was #FF9500)
  DANGER: '#D14343',          // Muted red (was #FF3B30)
};

const tintColorLight = MODE_COLORS_MUTED.PERSONAL;
const tintColorDark = NEUTRALS.WHITE;

export const Colors = {
  light: {
    text: NEUTRALS.BLACK,
    background: NEUTRALS.WHITE,
    surface: NEUTRALS.OFF_WHITE,
    tint: tintColorLight,
    icon: NEUTRALS.MEDIUM_GRAY,
    tabIconDefault: NEUTRALS.MEDIUM_GRAY,
    tabIconSelected: tintColorLight,
    border: NEUTRALS.LIGHT_GRAY,
    textSecondary: NEUTRALS.DARK_GRAY,
  },
  dark: {
    text: NEUTRALS.OFF_WHITE,
    background: '#151718',
    surface: '#202326',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#404040',
    textSecondary: '#B8B8B8',
  },
};

// Export individual color constants for direct use
export { NEUTRALS, MODE_COLORS_MUTED };
