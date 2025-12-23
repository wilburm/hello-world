import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { currencyAPI } from '../services/api';

function RateChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // today
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch historical data
  const fetchHistoricalData = useCallback(async (currency = selectedCurrency) => {
    try {
      setError(null);
      
      if (currency === selectedCurrency) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const params = {
        base: 'CNY',
        target: currency,
        from: dateRange.from,
        to: dateRange.to,
        limit: 100,
      };

      const response = await currencyAPI.getHistoricalRates(params);

      if (response.success) {
        // Transform data for chart
        const chartData = response.data.series.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          fullDate: item.date,
          rate: parseFloat(item.rate.toFixed(4)),
          currency: item.currency,
        }));
        setData(chartData);
      } else {
        throw new Error(response.error || 'Failed to fetch historical data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCurrency, dateRange]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Currency options
  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)', flag: '🇺🇸' },
    { value: 'EUR', label: 'Euro (EUR)', flag: '🇪🇺' },
    { value: 'GBP', label: 'British Pound (GBP)', flag: '🇬🇧' },
  ];

  // Date range presets
  const datePresets = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: '1 Year', days: 365 },
  ];

  const handleDatePreset = (days) => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ from, to });
  };

  const handleManualRefresh = () => {
    fetchHistoricalData();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip" role="tooltip" aria-label={`Rate on ${data.fullDate}`}>
          <div className="tooltip-header">
            <strong>{label}</strong>
            <span className="tooltip-date">{data.fullDate}</span>
          </div>
          <div className="tooltip-content">
            <span className="tooltip-label">CNY → {data.currency}:</span>
            <span className="tooltip-value">{data.rate.toFixed(4)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="spinner" aria-label="Loading chart data" />
          <p>Loading historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Chart Controls */}
      <div className="chart-controls">
        <div className="chart-controls-row">
          {/* Currency Selection */}
          <div className="form-group">
            <label htmlFor="currency-select" className="form-label">
              Currency Pair
            </label>
            <select
              id="currency-select"
              className="form-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              aria-label="Select currency pair"
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="form-group">
            <label htmlFor="from-date" className="form-label">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              className="form-input"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              aria-label="From date"
            />
          </div>

          <div className="form-group">
            <label htmlFor="to-date" className="form-label">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              className="form-input"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              aria-label="To date"
            />
          </div>

          {/* Refresh Button */}
          <div className="form-group">
            <label className="form-label sr-only">Refresh Chart</label>
            <button
              className={`btn btn-outline btn-sm ${isRefreshing ? 'loading' : ''}`}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? 'Refreshing chart...' : 'Refresh chart data'}
            >
              <RefreshCw className={`icon-sm ${isRefreshing ? 'spinning' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Date Range Presets */}
        <div className="chart-presets">
          <span className="preset-label">Quick ranges:</span>
          <div className="preset-buttons">
            {datePresets.map((preset) => (
              <button
                key={preset.days}
                className="btn btn-sm btn-outline preset-btn"
                onClick={() => handleDatePreset(preset.days)}
                aria-label={`Show data for last ${preset.days} days`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Error:</strong> {error}
            <button 
              className="alert-dismiss" 
              onClick={() => setError(null)}
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3>
            <TrendingUp className="section-icon" aria-hidden="true" />
            CNY → {selectedCurrency} Historical Rates
          </h3>
          <div className="chart-info">
            <span className="date-range">
              {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
            </span>
            <span className="data-points">{data.length} data points</span>
          </div>
        </div>

        <div className="chart-area" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RateChart;