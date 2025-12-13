import React from 'react';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, onRefresh, isRefreshing = false }: HeaderProps): React.ReactElement {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: `${theme.spacing.sm} 0 0 0`,
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Real-time exchange rate dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: 500,
                opacity: isRefreshing ? 0.7 : 1,
              }}
              aria-label="Refresh rates"
              title="Manually refresh exchange rates from live API"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}

          <button
            onClick={toggleTheme}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
