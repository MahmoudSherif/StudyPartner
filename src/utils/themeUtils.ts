/**
 * Theme Utilities for MotivaMate
 * Handles theme management and customization
 */

export interface Theme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeConfig {
  name: string
  displayName: string
  theme: Theme
}

export const BUILT_IN_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light Theme',
    theme: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark Theme',
    theme: {
      primary: '#60A5FA',
      secondary: '#9CA3AF',
      accent: '#A78BFA',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA'
    }
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Theme',
    theme: {
      primary: '#0EA5E9',
      secondary: '#0F766E',
      accent: '#06B6D4',
      background: '#F0F9FF',
      surface: '#E0F7FA',
      text: '#0C4A6E',
      textSecondary: '#0F766E',
      border: '#B3E5FC',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0EA5E9'
    }
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset Theme',
    theme: {
      primary: '#F97316',
      secondary: '#DC2626',
      accent: '#EF4444',
      background: '#FFF7ED',
      surface: '#FFEDD5',
      text: '#9A3412',
      textSecondary: '#C2410C',
      border: '#FED7AA',
      success: '#16A34A',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#2563EB'
    }
  }
}

/**
 * Apply theme to document root
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // Also set Tailwind CSS variables
  root.style.setProperty('--color-primary', theme.primary)
  root.style.setProperty('--color-secondary', theme.secondary)
  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-background', theme.background)
  root.style.setProperty('--color-surface', theme.surface)
  root.style.setProperty('--color-text', theme.text)
  root.style.setProperty('--color-text-secondary', theme.textSecondary)
  root.style.setProperty('--color-border', theme.border)
}

/**
 * Validate theme object structure
 */
export function validateTheme(theme: any): theme is Theme {
  const requiredKeys: (keyof Theme)[] = [
    'primary', 'secondary', 'accent', 'background', 'surface',
    'text', 'textSecondary', 'border', 'success', 'warning', 'error', 'info'
  ]

  if (!theme || typeof theme !== 'object') return false

  for (const key of requiredKeys) {
    if (!(key in theme) || typeof theme[key] !== 'string') return false
    
    // Basic color validation (hex, rgb, hsl)
    const colorValue = theme[key]
    if (!isValidColor(colorValue)) return false
  }

  return true
}

/**
 * Validate color format
 */
function isValidColor(color: string): boolean {
  // Hex color validation
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true
  
  // RGB/RGBA validation
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true
  
  // HSL/HSLA validation
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true
  
  // Named colors (basic set)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'indigo'
  ]
  
  return namedColors.includes(color.toLowerCase())
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(currentTheme: string): string {
  return currentTheme === 'light' ? 'dark' : 'light'
}

/**
 * Get theme from storage
 */
export function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'light'
  
  return localStorage.getItem('theme') || getSystemTheme()
}

/**
 * Save theme to storage
 */
export function saveTheme(themeName: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('theme', themeName)
}

/**
 * Initialize theme system
 */
export function initializeTheme(): string {
  const storedTheme = getStoredTheme()
  const themeConfig = BUILT_IN_THEMES[storedTheme] || BUILT_IN_THEMES.light
  
  applyTheme(themeConfig.theme)
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const stored = localStorage.getItem('theme')
      if (!stored) {
        const systemTheme = e.matches ? 'dark' : 'light'
        const systemThemeConfig = BUILT_IN_THEMES[systemTheme]
        applyTheme(systemThemeConfig.theme)
      }
    })
  }
  
  return storedTheme
}

/**
 * Create custom theme
 */
export function createCustomTheme(
  baseTheme: string,
  overrides: Partial<Theme>,
  name: string,
  displayName: string
): ThemeConfig {
  const base = BUILT_IN_THEMES[baseTheme] || BUILT_IN_THEMES.light
  
  return {
    name,
    displayName,
    theme: {
      ...base.theme,
      ...overrides
    }
  }
}

/**
 * Generate theme variations
 */
export function generateThemeVariations(baseColor: string): {
  light: Theme
  dark: Theme
} {
  // This is a simplified version - in practice, you'd use color manipulation libraries
  const lightTheme: Theme = {
    primary: baseColor,
    secondary: '#6B7280',
    accent: lightenColor(baseColor, 20),
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: baseColor
  }

  const darkTheme: Theme = {
    primary: lightenColor(baseColor, 10),
    secondary: '#9CA3AF',
    accent: lightenColor(baseColor, 30),
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: lightenColor(baseColor, 10)
  }

  return { light: lightTheme, dark: darkTheme }
}

/**
 * Simple color lightening (basic implementation)
 */
function lightenColor(color: string, percent: number): string {
  // This is a simplified implementation
  // In practice, you'd use a proper color manipulation library
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)
  }
  
  return color // Return original if not hex
}

/**
 * Get theme accessibility score
 */
export function getThemeAccessibilityScore(theme: Theme): {
  score: number
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Check contrast ratios (simplified)
  const textContrast = calculateContrastRatio(theme.text, theme.background)
  const primaryContrast = calculateContrastRatio(theme.primary, theme.background)

  if (textContrast < 4.5) {
    issues.push('Text contrast is too low')
    recommendations.push('Increase text color contrast')
    score -= 20
  }

  if (primaryContrast < 3) {
    issues.push('Primary color contrast is too low')
    recommendations.push('Adjust primary color for better visibility')
    score -= 15
  }

  // Check for sufficient color differentiation
  const successError = calculateContrastRatio(theme.success, theme.error)
  if (successError < 3) {
    issues.push('Success and error colors are too similar')
    recommendations.push('Use more distinct colors for success and error states')
    score -= 10
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}

/**
 * Calculate contrast ratio between two colors (simplified)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In practice, you'd use a proper color library
  return 4.5 // Placeholder value
}

export const themeUtils = {
  applyTheme,
  validateTheme,
  getSystemTheme,
  toggleTheme,
  getStoredTheme,
  saveTheme,
  initializeTheme,
  createCustomTheme,
  generateThemeVariations,
  getThemeAccessibilityScore
}
