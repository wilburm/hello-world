import { LiveRateCards } from './LiveRateCards';
import { HistoricalChart } from './HistoricalChart';
import { HistoryTable } from './HistoryTable';
import styles from '../styles/Dashboard.module.css';

export const Dashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Currency Exchange Rate Dashboard</h1>
        <p className={styles.subtitle}>
          Real-time CNY exchange rates and historical trends
        </p>
      </header>

      <section className={styles.section} aria-labelledby="live-rates-heading">
        <h2 id="live-rates-heading" className={styles.sectionTitle}>
          Live Exchange Rates
        </h2>
        <LiveRateCards />
      </section>

      <section className={styles.section} aria-labelledby="chart-heading">
        <h2 id="chart-heading" className={styles.sectionTitle}>
          Historical Trends
        </h2>
        <HistoricalChart />
      </section>

      <section className={styles.section} aria-labelledby="history-heading">
        <h2 id="history-heading" className={styles.sectionTitle}>
          Rate History
        </h2>
        <HistoryTable />
      </section>
    </div>
  );
};
