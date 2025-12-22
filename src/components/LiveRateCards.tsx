import { useEffect, useState } from 'react';
import { LiveRate } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatPercentage, formatDateTime } from '../utils/formatters';
import { Loading } from './Loading';
import { ErrorMessage } from './ErrorMessage';
import styles from '../styles/LiveRateCards.module.css';

const REFRESH_INTERVAL = 30000;

export const LiveRateCards = () => {
  const [rates, setRates] = useState<LiveRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setError(null);
      const data = await apiService.getLiveRates();
      setRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch live rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loading message="Loading live rates..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRates} />;
  }

  return (
    <div className={styles.grid}>
      {rates.map((rate) => (
        <article
          key={rate.currency}
          className={styles.card}
          aria-labelledby={`currency-${rate.currency}`}
        >
          <div className={styles.cardHeader}>
            <h3 id={`currency-${rate.currency}`} className={styles.currency}>
              CNY → {rate.currency}
            </h3>
            <span
              className={`${styles.badge} ${
                rate.change >= 0 ? styles.badgePositive : styles.badgeNegative
              }`}
              aria-label={`Change: ${formatPercentage(rate.change)}`}
            >
              {formatPercentage(rate.change)}
            </span>
          </div>
          <div className={styles.rate} aria-label={`Current rate: ${formatCurrency(rate.rate)}`}>
            {formatCurrency(rate.rate)}
          </div>
          <time className={styles.timestamp} dateTime={rate.timestamp}>
            Updated: {formatDateTime(rate.timestamp)}
          </time>
        </article>
      ))}
    </div>
  );
};
