import styles from '../styles/ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className={styles.container} role="alert" aria-live="assertive">
      <div className={styles.title}>
        <span className={styles.icon} aria-hidden="true">⚠️</span>
        <span>Error</span>
      </div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.button} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};
