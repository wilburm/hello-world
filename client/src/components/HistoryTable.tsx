import React, { useState, useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface HistoryTableProps {
  data: Array<{ date: string; rate: number }>;
  currency: string;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function HistoryTable({ data, currency, isLoading = false }: HistoryTableProps): React.ReactElement {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

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
        <p>Loading table data...</p>
      </div>
    );
  }

  if (data.length === 0) {
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
        <p>No historical data available</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border}` }}>
        <h3
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: 600,
          }}
        >
          Historical Rates - CNY to {currency}
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: theme.typography.fontSize.sm,
          }}
          role="table"
          aria-label={`Historical exchange rates for ${currency}`}
        >
          <thead>
            <tr style={{ backgroundColor: theme.colors.background, borderBottom: `2px solid ${theme.colors.border}` }}>
              <th
                style={{
                  padding: theme.spacing.md,
                  textAlign: 'left',
                  color: theme.colors.text,
                  fontWeight: 600,
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: theme.spacing.md,
                  textAlign: 'right',
                  color: theme.colors.text,
                  fontWeight: 600,
                }}
              >
                Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={`${row.date}-${idx}`}
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                  backgroundColor: idx % 2 === 0 ? theme.colors.background : theme.colors.surface,
                }}
              >
                <td
                  style={{
                    padding: theme.spacing.md,
                    color: theme.colors.text,
                  }}
                >
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td
                  style={{
                    padding: theme.spacing.md,
                    textAlign: 'right',
                    color: theme.colors.primary,
                    fontWeight: 500,
                  }}
                >
                  {row.rate.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            padding: theme.spacing.lg,
            display: 'flex',
            justifyContent: 'center',
            gap: theme.spacing.md,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
          role="navigation"
          aria-label="Pagination"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: currentPage === 1 ? theme.colors.border : theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            aria-label="Previous page"
          >
            Previous
          </button>

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
            }}
            aria-current="page"
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: currentPage === totalPages ? theme.colors.border : theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
            }}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
