import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, THEMES, ThemeConfig } from '../types/theme';
import { parseThemeCode } from '../utils/themeCodeParser';

interface ThemeContextType {
  currentTheme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  availableThemes: ThemeConfig[];
  customThemes: ThemeConfig[];
  toggleTheme: () => void;
  addThemeByCode: (codeOrSnippet: string) => { success: boolean; theme?: ThemeConfig; error?: string };
  removeTheme: (themeId: ThemeId) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'tia_active_theme';
const CUSTOM_THEMES_STORAGE_KEY = 'tia_custom_themes';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load custom themes from storage
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Available themes combines base themes + custom user themes
  const availableThemes = [...THEMES, ...customThemes];

  // Active theme state
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (saved) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'stella';
  });

  const themeConfig = availableThemes.find(t => t.id === currentTheme) || THEMES[0];

  const setTheme = (theme: ThemeId) => {
    setCurrentThemeState(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex].id);
  };

  // Facility to add theme using theme code / CSS variables / JSON
  const addThemeByCode = (codeOrSnippet: string): { success: boolean; theme?: ThemeConfig; error?: string } => {
    const result = parseThemeCode(codeOrSnippet);
    if (!result.success || !result.theme) {
      return { success: false, error: result.error || 'Failed to parse theme code.' };
    }

    const newTheme = result.theme;

    // Check if a theme with same ID or code already exists in custom themes
    const existingIndex = customThemes.findIndex(t => t.id === newTheme.id || (t.code && t.code === newTheme.code));

    let updatedCustom: ThemeConfig[];
    if (existingIndex >= 0) {
      // Update existing
      updatedCustom = [...customThemes];
      updatedCustom[existingIndex] = newTheme;
    } else {
      updatedCustom = [...customThemes, newTheme];
    }

    setCustomThemes(updatedCustom);
    try {
      localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updatedCustom));
    } catch {
      // ignore
    }

    // Immediately activate the newly added theme
    setTheme(newTheme.id);

    return { success: true, theme: newTheme };
  };

  // Facility to remove a custom theme
  const removeTheme = (themeId: ThemeId): boolean => {
    // Only custom themes or non-default can be removed
    const isCustom = customThemes.some(t => t.id === themeId);
    if (!isCustom) {
      return false;
    }

    const updated = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updated);
    try {
      localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // If active theme was deleted, fallback to 'stella'
    if (currentTheme === themeId) {
      setTheme('stella');
    }

    return true;
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);

    // Toggle dark / light class on root
    if (themeConfig.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Apply custom colors if defined
    if (themeConfig.colors) {
      const c = themeConfig.colors;
      root.style.setProperty('--app-bg', c.bg);
      root.style.setProperty('--app-card', c.card);
      root.style.setProperty('--app-surface', c.surface || c.card);
      root.style.setProperty('--app-elevated', c.elevated);
      root.style.setProperty('--app-elevated-hover', c.elevatedHover);
      root.style.setProperty('--app-border', c.border);
      root.style.setProperty('--app-border-subtle', c.borderSubtle || c.border);
      root.style.setProperty('--app-text', c.text);
      root.style.setProperty('--app-text-strong', c.textStrong);
      root.style.setProperty('--app-text-muted', c.textMuted);
      root.style.setProperty('--app-text-subtle', c.textSubtle);
      root.style.setProperty('--app-accent', c.accent);
      root.style.setProperty('--app-accent-text', c.accentText || (themeConfig.isDark ? '#000000' : '#FFFFFF'));
      root.style.setProperty('--app-ring', c.ring || c.accent);
      if (c.radius) root.style.setProperty('--app-radius', c.radius);
      if (c.fontFamily) root.style.setProperty('--font-theme', c.fontFamily);
    } else {
      // Built-in theme: remove custom inline overrides so pure stylesheet takes over
      root.style.removeProperty('--app-bg');
      root.style.removeProperty('--app-card');
      root.style.removeProperty('--app-surface');
      root.style.removeProperty('--app-elevated');
      root.style.removeProperty('--app-elevated-hover');
      root.style.removeProperty('--app-border');
      root.style.removeProperty('--app-border-subtle');
      root.style.removeProperty('--app-text');
      root.style.removeProperty('--app-text-strong');
      root.style.removeProperty('--app-text-muted');
      root.style.removeProperty('--app-text-subtle');
      root.style.removeProperty('--app-accent');
      root.style.removeProperty('--app-accent-text');
      root.style.removeProperty('--app-ring');
      root.style.removeProperty('--app-radius');
      root.style.removeProperty('--font-theme');
    }
  }, [currentTheme, themeConfig]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme,
        availableThemes,
        customThemes,
        toggleTheme,
        addThemeByCode,
        removeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
