import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Currency, SUPPORTED_CURRENCIES } from '../types';

interface ChartControlsProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  isLoading?: boolean;
}

export function ChartControls({
  selectedCurrency,
  onCurrencyChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isLoading = false,
}: ChartControlsProps): React.ReactElement {
  const { theme } = useTheme();

  const inputStyle = {
    padding: theme.spacing.sm,
    borderRadius: '4px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}
    >
      <h3
        style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: 600,
        }}
      >
        Chart Options
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.lg,
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            htmlFor="currency-select"
          >
            Currency Pair
          </label>
          <select
            id="currency-select"
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            disabled={isLoading}
            style={{
              ...inputStyle,
              width: '100%',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
            aria-label="Select currency pair"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                CNY → {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            htmlFor="start-date"
          >
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={isLoading}
            style={{
              ...inputStyle,
              width: '100%',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
            aria-label="Select start date"
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            htmlFor="end-date"
          >
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={isLoading}
            style={{
              ...inputStyle,
              width: '100%',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
            aria-label="Select end date"
          />
        </div>
      </div>
    </div>
  );
}
