import React, { useState, useCallback, useMemo } from 'react';
import { useAsync } from '../hooks/useAsync';
import { usePoll } from '../hooks/usePoll';
import { apiClient } from '../services/apiClient';
import { useTheme } from '../theme/ThemeContext';
import { CurrentRatesResponse, HistoricalRatesResponse, Currency } from '../types';
import { RateCard } from '../components/RateCard';
import { RatesChart } from '../components/RatesChart';
import { HistoryTable } from '../components/HistoryTable';
import { ChartControls } from '../components/ChartControls';
import { Header } from '../components/Header';

const POLL_INTERVAL_MS = 30000;

export function Dashboard(): React.ReactElement {
  const { theme } = useTheme();

  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency>('USD');
  const [startDate, setStartDate] = React.useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [shouldPoll, setShouldPoll] = useState(true);

  const fetchCurrentRates = useCallback(() => apiClient.getCurrentRates(false), []);
  const fetchHistoricalRates = useCallback(
    () => apiClient.getHistoricalRates(selectedCurrency, startDate, endDate),
    [selectedCurrency, startDate, endDate]
  );

  const {
    data: currentRates,
    loading: currentRatesLoading,
    error: currentRatesError,
    execute: executeCurrentRates,
  } = useAsync<CurrentRatesResponse>(fetchCurrentRates, true);

  const {
    data: historicalRates,
    loading: historicalRatesLoading,
    error: historicalRatesError,
    execute: executeHistoricalRates,
  } = useAsync<HistoricalRatesResponse>(fetchHistoricalRates, true);

  usePoll(executeCurrentRates, POLL_INTERVAL_MS, shouldPoll);

  React.useEffect(() => {
    executeHistoricalRates();
  }, [selectedCurrency, startDate, endDate, executeHistoricalRates]);

  const handleRefresh = useCallback(async () => {
    setShouldPoll(false);
    try {
      await apiClient.getCurrentRates(true);
      await executeCurrentRates();
    } finally {
      setShouldPoll(true);
    }
  }, [executeCurrentRates]);

  const handleCurrencyChange = (currency: Currency): void => {
    setSelectedCurrency(currency);
  };

  const handleDateChange = (type: 'start' | 'end', date: string): void => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const historicalData = useMemo(() => {
    return historicalRates?.data ?? [];
  }, [historicalRates]);

  const chartTitle = useMemo(() => {
    if (!startDate || !endDate) return 'Historical Trends';
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `Historical Trends (${start} - ${end})`;
  }, [startDate, endDate]);

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
      }}
    >
      <Header title="Exchange Rate Dashboard" onRefresh={handleRefresh} isRefreshing={currentRatesLoading} />

      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: theme.spacing.xl,
        }}
      >
        {currentRatesError && (
          <div
            style={{
              backgroundColor: theme.colors.error,
              color: 'white',
              padding: theme.spacing.lg,
              borderRadius: '8px',
              marginBottom: theme.spacing.lg,
            }}
            role="alert"
          >
            <strong>Error:</strong> {currentRatesError.message}
          </div>
        )}

        <section style={{ marginBottom: theme.spacing.xl }}>
          <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: 600, marginBottom: theme.spacing.lg }}>
            Live Exchange Rates
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: theme.spacing.lg,
            }}
          >
            {currentRates &&
              Object.entries(currentRates.rates).map(([currency, rate]) => (
                <RateCard
                  key={currency}
                  currency={currency}
                  rate={rate}
                  timestamp={currentRates.timestamp}
                  isLoading={currentRatesLoading}
                />
              ))}
          </div>
          <p
            style={{
              marginTop: theme.spacing.lg,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textSecondary,
            }}
          >
            Auto-refreshes every 30 seconds. Source: {currentRates?.source || 'unknown'}
          </p>
        </section>

        <section style={{ marginBottom: theme.spacing.xl }}>
          <h2 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: 600, marginBottom: theme.spacing.lg }}>
            Historical Analysis
          </h2>

          <ChartControls
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            startDate={startDate}
            onStartDateChange={(date) => handleDateChange('start', date)}
            endDate={endDate}
            onEndDateChange={(date) => handleDateChange('end', date)}
            isLoading={historicalRatesLoading}
          />

          {historicalRatesError && (
            <div
              style={{
                backgroundColor: theme.colors.error,
                color: 'white',
                padding: theme.spacing.lg,
                borderRadius: '8px',
                marginBottom: theme.spacing.lg,
              }}
              role="alert"
            >
              <strong>Error loading chart:</strong> {historicalRatesError.message}
            </div>
          )}

          <RatesChart
            data={historicalData}
            title={chartTitle}
            currency={selectedCurrency}
            isLoading={historicalRatesLoading}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
            <HistoryTable
              data={historicalData}
              currency={selectedCurrency}
              isLoading={historicalRatesLoading}
            />
          </div>
        </section>

        <footer
          style={{
            marginTop: theme.spacing.xl,
            paddingTop: theme.spacing.xl,
            borderTop: `1px solid ${theme.colors.border}`,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            textAlign: 'center',
          }}
        >
          <p>
            © 2024 Exchange Rate Dashboard. Data is cached and automatically refreshed. For live rates, use the Refresh button.
          </p>
        </footer>
      </main>
    </div>
  );
}
