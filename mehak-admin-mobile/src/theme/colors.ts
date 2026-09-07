/**
 * Theme & Color Tokens for Mehak Admin Mobile App
 * Premium Modern Black/Dark Palette
 */

export const colors = {
  // Backgrounds
  background: '#080c14',       // Deep obsidian black main canvas
  card: '#111726',             // Slightly lighter dark charcoal card surface
  cardElevated: '#161e31',     // Hover/active/elevated card surface
  inputBg: '#0d1320',          // Subtle dark input background

  // Borders & Dividers
  border: '#1e293b',           // Subtle dark slate border
  borderFocus: '#38bdf8',      // Focused input border highlight
  borderCard: '#1e293b',       // Standard card border
  borderCardAccent: '#334155', // Slightly highlighted card border

  // Text
  textPrimary: '#ffffff',      // Pure white primary text
  textSecondary: '#94a3b8',    // Slate grey secondary text
  textMuted: '#64748b',        // Muted helper text
  textPlaceholder: '#475569',  // Input placeholder

  // Accents & Brand
  emerald: '#10b981',          // Mehak brand emerald
  emeraldDark: '#059669',      // Dark emerald button pressed
  emeraldSubtle: 'rgba(16, 185, 129, 0.12)', // Subtle badge background

  gold: '#f59e0b',             // Warm metallic gold/amber accent
  goldSubtle: 'rgba(245, 158, 11, 0.12)',

  blue: '#3b82f6',             // Secondary info accent
  blueSubtle: 'rgba(59, 130, 246, 0.12)',

  danger: '#ef4444',           // Destructive / delete / error
  dangerLight: '#f87171',
  dangerSubtle: 'rgba(239, 68, 68, 0.12)',

  // Tab Bar
  tabBarBg: '#090d16',
  tabBarBorder: '#161f30',
  tabBarActive: '#10b981',
  tabBarInactive: '#64748b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
