import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HistoricalDataPoint } from '../types';
import { apiService } from '../services/api';
import { getDateRange, formatDate } from '../utils/formatters';
import { Loading } from './Loading';
import { ErrorMessage } from './ErrorMessage';
import styles from '../styles/HistoricalChart.module.css';

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const DATE_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
];

export const HistoricalChart = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedRange, setSelectedRange] = useState(30);
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedRange);
      const historicalData = await apiService.getHistoricalRates(
        selectedCurrency,
        startDate,
        endDate
      );
      setData(historicalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedCurrency, selectedRange]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Loading historical data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage message={error} onRetry={fetchHistoricalData} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Historical Exchange Rate Trends</h3>
        <div className={styles.controls}>
          <label htmlFor="currency-select" className="visually-hidden">
            Select currency
          </label>
          <select
            id="currency-select"
            className={styles.select}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            aria-label="Select currency"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                CNY → {currency}
              </option>
            ))}
          </select>

          <label htmlFor="date-range-select" className="visually-hidden">
            Select date range
          </label>
          <select
            id="date-range-select"
            className={styles.select}
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            aria-label="Select date range"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDate(value)}
              stroke="#6b7280"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(4)}
              stroke="#6b7280"
            />
            <Tooltip
              labelFormatter={(value) => formatDate(value)}
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return [numValue.toFixed(4), 'Rate'];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name={`CNY → ${selectedCurrency}`}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
