import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  collector: {
    interval: process.env.COLLECTOR_INTERVAL || '*/5 * * * *',
    apiUrl: process.env.EXCHANGE_API_URL || 'https://api.exchangerate-api.com/v4/latest/CNY',
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
    retryDelayMs: parseInt(process.env.API_RETRY_DELAY_MS || '1000', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
