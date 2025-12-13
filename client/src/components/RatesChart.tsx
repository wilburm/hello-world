import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTheme } from '../theme/ThemeContext';
import { ChartDataPoint } from '../types';

interface RatesChartProps {
  data: ChartDataPoint[];
  title: string;
  currency: string;
  isLoading?: boolean;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>): React.ReactElement | null {
  const { theme } = useTheme();
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          padding: theme.spacing.sm,
          color: theme.colors.text,
        }}
      >
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
          {payload[0].payload.date}
        </p>
        <p style={{ margin: 0, color: theme.colors.primary }}>
          Rate: {(payload[0].value as number).toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
}

export function RatesChart({ data, title, currency, isLoading = false }: RatesChartProps): React.ReactElement {
  const { theme, isDark } = useTheme();

  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      rate: parseFloat(point.rate.toFixed(4)),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.lg,
          textAlign: 'center',
          color: theme.colors.textSecondary,
        }}
      >
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.lg,
          textAlign: 'center',
          color: theme.colors.textSecondary,
        }}
      >
        <p>No data available for the selected range</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: theme.spacing.lg,
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
        {title} - CNY to {currency}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.border}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={theme.colors.textSecondary}
            style={{ fontSize: theme.typography.fontSize.xs }}
            tick={{ fill: theme.colors.textSecondary }}
          />
          <YAxis
            stroke={theme.colors.textSecondary}
            style={{ fontSize: theme.typography.fontSize.xs }}
            tick={{ fill: theme.colors.textSecondary }}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: theme.colors.text }}
            formatter={() => `Exchange Rate (${currency})`}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={theme.colors.primary}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
