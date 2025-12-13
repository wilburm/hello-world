import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme, getTheme } from './theme';

interface ThemeContextType {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-dark');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const theme = getTheme(isDark);

  const toggleTheme = (): void => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem('theme-dark', JSON.stringify(newValue));
      return newValue;
    });
  };

  return <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
