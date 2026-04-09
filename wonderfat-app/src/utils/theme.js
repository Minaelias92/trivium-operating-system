// WonderFat Brand Theme
// Inspired by natural, clean, grass-fed tallow products
// Earth tones with premium green accents

export const COLORS = {
  // Primary brand colors
  primary: '#1B4332',        // Deep forest green
  primaryLight: '#2D6A4F',   // Medium green
  primarySoft: '#40916C',    // Soft green
  accent: '#D4A574',         // Warm honey/tallow gold
  accentLight: '#E8C99B',    // Light honey

  // Score colors (Yuka-style health ratings)
  excellent: '#2D6A4F',      // Dark green - 75-100
  good: '#52B788',           // Light green - 50-74
  mediocre: '#F4A261',       // Orange - 25-49
  poor: '#E63946',           // Red - 0-24

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FAF8F5',       // Warm off-white
  cream: '#F5F0EB',          // Cream background
  lightGray: '#E8E2DC',
  gray: '#9C9490',
  darkGray: '#5C5552',
  charcoal: '#2C2825',
  black: '#1A1715',

  // Functional
  background: '#FAF8F5',
  card: '#FFFFFF',
  border: '#E8E2DC',
  textPrimary: '#1A1715',
  textSecondary: '#5C5552',
  textMuted: '#9C9490',
  overlay: 'rgba(26, 23, 21, 0.5)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function getScoreColor(score) {
  if (score >= 75) return COLORS.excellent;
  if (score >= 50) return COLORS.good;
  if (score >= 25) return COLORS.mediocre;
  return COLORS.poor;
}

export function getScoreLabel(score) {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Mediocre';
  return 'Poor';
}

export function getScoreEmoji(score) {
  if (score >= 75) return '🌿';
  if (score >= 50) return '👍';
  if (score >= 25) return '⚠️';
  return '🚫';
}
