export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ea580c',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f97316',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
};

export const getTheme = (isDark: boolean): Theme => (isDark ? darkTheme : lightTheme);
