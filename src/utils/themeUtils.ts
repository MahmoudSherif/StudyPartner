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
      background: 'linear-gradient(to bottom right, #f9fafb, #dbeafe, #e0e7ff)',
      surface: '#ffffff',
      text: '#1f2937',
      gradient: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      headerGradient: 'linear-gradient(to right, #2563eb, #7c3aed, #4f46e5)'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: 'linear-gradient(to bottom right, #f0fdf4, #d1fae5, #a7f3d0)',
      surface: '#ffffff',
      text: '#1f2937',
      gradient: 'linear-gradient(to right, #10b981, #059669)',
      headerGradient: 'linear-gradient(to right, #059669, #047857, #14b8a6)'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#38bdf8',
      background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #cffafe)',
      surface: '#ffffff',
      text: '#1f2937',
      gradient: 'linear-gradient(to right, #0ea5e9, #06b6d4)',
      headerGradient: 'linear-gradient(to right, #0284c7, #0891b2, #0e7490)'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fb7185',
      background: 'linear-gradient(to bottom right, #fff7ed, #fce7f3, #ffe4e6)',
      surface: '#ffffff',
      text: '#1f2937',
      gradient: 'linear-gradient(to right, #f97316, #ec4899)',
      headerGradient: 'linear-gradient(to right, #ea580c, #db2777, #f43f5e)'
    }
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#a855f7',
      background: 'linear-gradient(to bottom right, #faf5ff, #ede9fe, #e9d5ff)',
      surface: '#ffffff',
      text: '#1f2937',
      gradient: 'linear-gradient(to right, #8b5cf6, #6366f1)',
      headerGradient: 'linear-gradient(to right, #7c3aed, #4f46e5, #6d28d9)'
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