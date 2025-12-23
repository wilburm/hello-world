import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { currencyAPI } from '../services/api';

function HistoryTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'timestamp',
    sortOrder: 'DESC',
  });
  const [filters, setFilters] = useState({
    baseCurrency: '',
    targetCurrency: '',
    fromDate: '',
    toDate: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch table data
  const fetchTableData = useCallback(async () => {
    try {
      setError(null);
      setIsRefreshing(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        ...filters,
      };

      const response = await currencyAPI.getHistoryTable(params);

      if (response.success) {
        setData(response.data.records);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch history data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching history table:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [pagination.page, pagination.limit, sortConfig, filters]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Handle sorting
  const handleSort = (column) => {
    const newSortOrder = 
      sortConfig.sortBy === column && sortConfig.sortOrder === 'ASC' 
        ? 'DESC' 
        : 'ASC';
    
    setSortConfig({
      sortBy: column,
      sortOrder: newSortOrder,
    });
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1, // Reset to first page
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      baseCurrency: '',
      targetCurrency: '',
      fromDate: '',
      toDate: '',
    });
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatRate = (rate) => {
    return parseFloat(rate).toFixed(4);
  };

  const getSortIcon = (column) => {
    if (sortConfig.sortBy !== column) {
      return <ChevronUp className="icon-xs opacity-50" aria-hidden="true" />;
    }
    return sortConfig.sortOrder === 'ASC' ? (
      <ChevronUp className="icon-xs" aria-hidden="true" />
    ) : (
      <ChevronDown className="icon-xs" aria-hidden="true" />
    );
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.page;
    const total = pagination.totalPages;
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 3; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  };

  // Loading state
  if (loading && !data.length) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="spinner" aria-label="Loading table data" />
          <p>Loading history data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-table-container">
      {/* Table Controls */}
      <div className="table-controls">
        <div className="controls-row">
          {/* Search and Filters */}
          <div className="filters-section">
            <h3 className="controls-title">
              <Filter className="icon-sm" aria-hidden="true" />
              Filters
            </h3>
            
            <div className="filters-grid">
              <div className="form-group">
                <label htmlFor="base-currency" className="form-label">
                  Base Currency
                </label>
                <select
                  id="base-currency"
                  className="form-select"
                  value={filters.baseCurrency}
                  onChange={(e) => handleFilterChange('baseCurrency', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="CNY">CNY (Chinese Yuan)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="target-currency" className="form-label">
                  Target Currency
                </label>
                <select
                  id="target-currency"
                  className="form-select"
                  value={filters.targetCurrency}
                  onChange={(e) => handleFilterChange('targetCurrency', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="from-date" className="form-label">
                  From Date
                </label>
                <input
                  id="from-date"
                  type="date"
                  className="form-input"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
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
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={clearFilters}
                disabled={Object.values(filters).every(v => !v)}
              >
                <Search className="icon-sm" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table Actions */}
          <div className="actions-section">
            <div className="form-group">
              <label htmlFor="page-limit" className="form-label">
                Records per page
              </label>
              <select
                id="page-limit"
                className="form-select"
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              className={`btn btn-outline btn-sm ${isRefreshing ? 'loading' : ''}`}
              onClick={fetchTableData}
              disabled={isRefreshing}
              aria-label={isRefreshing ? 'Refreshing data...' : 'Refresh table data'}
            >
              <RefreshCw className={`icon-sm ${isRefreshing ? 'spinning' : ''}`} />
              Refresh
            </button>
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

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <h3>Rate History Records</h3>
          <div className="table-info">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="table" role="table">
            <thead>
              <tr>
                <th scope="col">
                  <button
                    className="sort-header"
                    onClick={() => handleSort('timestamp')}
                    aria-label="Sort by timestamp"
                    aria-sort={
                      sortConfig.sortBy === 'timestamp' 
                        ? sortConfig.sortOrder.toLowerCase() 
                        : 'none'
                    }
                  >
                    <Calendar className="icon-sm" aria-hidden="true" />
                    Date & Time
                    {getSortIcon('timestamp')}
                  </button>
                </th>
                <th scope="col">
                  <button
                    className="sort-header"
                    onClick={() => handleSort('base_currency')}
                    aria-label="Sort by base currency"
                    aria-sort={
                      sortConfig.sortBy === 'base_currency' 
                        ? sortConfig.sortOrder.toLowerCase() 
                        : 'none'
                    }
                  >
                    Base Currency
                    {getSortIcon('base_currency')}
                  </button>
                </th>
                <th scope="col">
                  <button
                    className="sort-header"
                    onClick={() => handleSort('target_currency')}
                    aria-label="Sort by target currency"
                    aria-sort={
                      sortConfig.sortBy === 'target_currency' 
                        ? sortConfig.sortOrder.toLowerCase() 
                        : 'none'
                    }
                  >
                    Target Currency
                    {getSortIcon('target_currency')}
                  </button>
                </th>
                <th scope="col">
                  <button
                    className="sort-header"
                    onClick={() => handleSort('rate')}
                    aria-label="Sort by rate"
                    aria-sort={
                      sortConfig.sortBy === 'rate' 
                        ? sortConfig.sortOrder.toLowerCase() 
                        : 'none'
                    }
                  >
                    Exchange Rate
                    {getSortIcon('rate')}
                  </button>
                </th>
                <th scope="col">
                  <button
                    className="sort-header"
                    onClick={() => handleSort('source')}
                    aria-label="Sort by source"
                    aria-sort={
                      sortConfig.sortBy === 'source' 
                        ? sortConfig.sortOrder.toLowerCase() 
                        : 'none'
                    }
                  >
                    Source
                    {getSortIcon('source')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty">
                    <div className="empty-state">
                      <Search className="icon-lg" aria-hidden="true" />
                      <p>No records found</p>
                      <p className="empty-description">
                        {Object.values(filters).some(v => v) 
                          ? 'Try adjusting your filters to see more results'
                          : 'No rate data available yet'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <time dateTime={record.timestamp}>
                        {formatDateTime(record.timestamp)}
                      </time>
                    </td>
                    <td>
                      <span className="currency-badge">
                        {record.baseCurrency}
                      </span>
                    </td>
                    <td>
                      <span className="currency-badge currency-target">
                        {record.targetCurrency}
                      </span>
                    </td>
                    <td>
                      <span className="rate-value-cell">
                        {formatRate(record.rate)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-indicator status-${
                        record.source === 'scheduled' ? 'success' : 'loading'
                      }`}>
                        {record.source}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                aria-label="Go to first page"
              >
                «
              </button>
              
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                aria-label="Go to previous page"
              >
                ‹
              </button>

              {generatePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="pagination-ellipsis">…</span>
                  ) : (
                    <button
                      className={`pagination-btn ${
                        page === pagination.page ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === pagination.page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                aria-label="Go to next page"
              >
                ›
              </button>
              
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                aria-label="Go to last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryTable;