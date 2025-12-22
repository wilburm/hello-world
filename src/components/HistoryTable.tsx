import { useEffect, useState } from 'react';
import { ExchangeRate, PaginationParams, SortParams, FilterParams } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Loading } from './Loading';
import { ErrorMessage } from './ErrorMessage';
import styles from '../styles/HistoryTable.module.css';

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const HistoryTable = () => {
  const [data, setData] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 25,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sort, setSort] = useState<SortParams>({
    field: 'timestamp',
    direction: 'desc',
  });

  const [filters, setFilters] = useState<FilterParams>({
    currency: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const activeFilters = {
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      };

      const response = await apiService.getRateHistory(
        pagination,
        sort,
        activeFilters
      );

      setData(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rate history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, sort, filters]);

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 1, pageSize: newPageSize });
  };

  const renderSortIcon = (field: string) => {
    if (sort.field !== field) return '⇅';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Loading rate history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, total);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="currency-filter" className={styles.label}>
            Currency
          </label>
          <select
            id="currency-filter"
            className={styles.select}
            value={filters.currency || ''}
            onChange={(e) => handleFilterChange('currency', e.target.value)}
          >
            <option value="">All Currencies</option>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                CNY → {currency}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="date-from-filter" className={styles.label}>
            From Date
          </label>
          <input
            id="date-from-filter"
            type="date"
            className={styles.input}
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="date-to-filter" className={styles.label}>
            To Date
          </label>
          <input
            id="date-to-filter"
            type="date"
            className={styles.input}
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="page-size-select" className={styles.label}>
            Per Page
          </label>
          <select
            id="page-size-select"
            className={styles.select}
            value={pagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <button
                  onClick={() => handleSort('timestamp')}
                  aria-label="Sort by timestamp"
                >
                  Timestamp <span className={styles.sortIcon}>{renderSortIcon('timestamp')}</span>
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('targetCurrency')}
                  aria-label="Sort by currency"
                >
                  Currency Pair <span className={styles.sortIcon}>{renderSortIcon('targetCurrency')}</span>
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('rate')}
                  aria-label="Sort by rate"
                >
                  Exchange Rate <span className={styles.sortIcon}>{renderSortIcon('rate')}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                  No records found
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id}>
                  <td>{formatDateTime(record.timestamp)}</td>
                  <td>
                    {record.baseCurrency} → {record.targetCurrency}
                  </td>
                  <td>{formatCurrency(record.rate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startRecord} to {endRecord} of {total} records
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.button}
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              aria-label="First page"
            >
              First
            </button>
            <button
              className={styles.button}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                className={`${styles.button} ${
                  pageNum === pagination.page ? styles.active : ''
                }`}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === pagination.page ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}

            <button
              className={styles.button}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
            <button
              className={styles.button}
              onClick={() => handlePageChange(totalPages)}
              disabled={pagination.page === totalPages}
              aria-label="Last page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
