import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, Globe } from 'lucide-react';
import LiveRateCard from './components/LiveRateCard';
import RateChart from './components/RateChart';
import HistoryTable from './components/HistoryTable';
import { currencyAPI } from './services/api';
import './App.css';

function App() {
  const [currentRates, setCurrentRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch current rates
  const fetchCurrentRates = async () => {
    try {
      if (!lastUpdated) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await currencyAPI.getCurrentRates('CNY');
      
      if (response.success) {
        setCurrentRates(response.data.rates);
        setLastUpdated(new Date(response.data.timestamp));
      } else {
        throw new Error(response.error || 'Failed to fetch rates');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching current rates:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCurrentRates();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentRates();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchCurrentRates();
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading currency dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !currentRates.length) {
    return (
      <div className="app">
        <div className="container">
          <div className="error-container">
            <div className="status-indicator status-error">
              <span>⚠️</span>
              Failed to load dashboard
            </div>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchCurrentRates}
              aria-label="Retry loading dashboard"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-title">
              <Globe className="header-icon" aria-hidden="true" />
              <h1>Currency Dashboard</h1>
              <span className="subtitle">CNY Exchange Rates</span>
            </div>
            
            <div className="header-controls">
              {lastUpdated && (
                <div className="last-updated">
                  <Clock className="icon-sm" aria-hidden="true" />
                  <span>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              <button
                className={`btn btn-outline btn-sm ${isRefreshing ? 'loading' : ''}`}
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                aria-label={isRefreshing ? 'Refreshing rates...' : 'Refresh rates manually'}
              >
                <RefreshCw className={`icon-sm ${isRefreshing ? 'spinning' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="main-content">
        <div className="container">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-warning" role="alert">
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

          {/* Live Rate Cards Section */}
          <section aria-labelledby="live-rates-heading">
            <div className="section-header">
              <h2 id="live-rates-heading">
                <TrendingUp className="section-icon" aria-hidden="true" />
                Live Exchange Rates
              </h2>
              <p className="section-description">
                Real-time CNY exchange rates with automatic updates every 30 seconds
              </p>
            </div>
            
            <div className="grid grid-3 rate-cards-grid">
              {currentRates.map((rateData) => (
                <LiveRateCard
                  key={rateData.currency}
                  currency={rateData.currency}
                  rate={rateData.rate}
                  change={rateData.change}
                  isLoading={isRefreshing}
                />
              ))}
            </div>
          </section>

          {/* Historical Chart Section */}
          <section aria-labelledby="chart-heading" className="chart-section">
            <div className="section-header">
              <h2 id="chart-heading">Historical Trends</h2>
              <p className="section-description">
                Analyze exchange rate trends over time with interactive charts
              </p>
            </div>
            
            <div className="card">
              <div className="card-body">
                <RateChart />
              </div>
            </div>
          </section>

          {/* History Table Section */}
          <section aria-labelledby="history-heading" className="history-section">
            <div className="section-header">
              <h2 id="history-heading">Rate History</h2>
              <p className="section-description">
                Browse historical rate data with advanced filtering and sorting options
              </p>
            </div>
            
            <div className="card">
              <div className="card-body">
                <HistoryTable />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2024 Currency Dashboard. Data updates every 30 seconds.</p>
            <div className="footer-links">
              <span>Built with React & Node.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;