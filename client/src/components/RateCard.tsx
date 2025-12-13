import React from 'react';
import { useTheme } from '../theme/ThemeContext';

interface RateCardProps {
  currency: string;
  rate: number;
  timestamp: string;
  isLoading?: boolean;
}

export function RateCard({ currency, rate, timestamp, isLoading = false }: RateCardProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: theme.spacing.lg,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: isLoading ? 'wait' : 'default',
        opacity: isLoading ? 0.7 : 1,
      }}
      role="article"
      aria-label={`${currency} exchange rate card`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3
            style={{
              margin: '0 0 0.5rem 0',
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: 600,
            }}
          >
            CNY to {currency}
          </h3>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            {new Date(timestamp).toLocaleString()}
          </p>
        </div>
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: 700,
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
            role="status"
            aria-live="polite"
          >
            {isLoading ? '...' : rate.toFixed(4)}
          </div>
          <span
            style={{
              fontSize: theme.typography.fontSize.xs,
              backgroundColor: theme.colors.primary,
              color: 'white',
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
