// Theme configuration and utilities
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    gradient: string;
    headerGradient: string;
  };
}

export const themes: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      // Darker app background
      background: 'linear-gradient(to bottom right, #0b1220, #0f172a, #111827)',
      surface: '#0b1220',
      text: '#e5e7eb',
      gradient: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      // Darker header gradient
      headerGradient: 'linear-gradient(to right, #1e3a8a, #4c1d95, #312e81)'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: 'linear-gradient(to bottom right, #052e2b, #064e3b, #0c4a44)',
      surface: '#041f1d',
      text: '#e5e7eb',
      gradient: 'linear-gradient(to right, #10b981, #059669)',
      headerGradient: 'linear-gradient(to right, #064e3b, #065f46, #0f766e)'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#38bdf8',
      background: 'linear-gradient(to bottom right, #031b2e, #0b2942, #0f3a5a)',
      surface: '#081826',
      text: '#e5e7eb',
      gradient: 'linear-gradient(to right, #0ea5e9, #06b6d4)',
      headerGradient: 'linear-gradient(to right, #0b2942, #0e7490, #065f73)'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fb7185',
      background: 'linear-gradient(to bottom right, #2a0a0a, #3b0a2a, #3a0f1f)',
      surface: '#1a0a0a',
      text: '#fde68a',
      gradient: 'linear-gradient(to right, #f97316, #ec4899)',
      headerGradient: 'linear-gradient(to right, #7c2d12, #831843, #9f1239)'
    }
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#a855f7',
      background: 'linear-gradient(to bottom right, #0b1020, #1e1b4b, #312e81)',
      surface: '#0b1020',
      text: '#e5e7eb',
      gradient: 'linear-gradient(to right, #8b5cf6, #6366f1)',
      headerGradient: 'linear-gradient(to right, #1e1b4b, #312e81, #3730a3)'
    }
  }
};

export const getTheme = (themeId: string): ThemeConfig => {
  return themes[themeId] || themes.default;
};

export const applyTheme = (themeId: string) => {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-gradient', theme.colors.gradient);
  root.style.setProperty('--theme-header-gradient', theme.colors.headerGradient);
  root.style.setProperty('--theme-background', theme.colors.background);
  
  // Apply data attribute for CSS selectors
  root.setAttribute('data-theme', themeId);
  
  return theme;
};

export const getThemeGradient = (themeId: string): string => {
  const theme = getTheme(themeId);
  return theme.colors.gradient;
};

export const getThemeBackground = (themeId: string): string => {
  const theme = getTheme(themeId);
  return theme.colors.background;
};

export const getHeaderGradient = (themeId: string): string => {
  const theme = getTheme(themeId);
  return theme.colors.headerGradient;
};