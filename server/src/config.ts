import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  fxApi: {
    provider: process.env.FX_API_PROVIDER || 'exchangerate-api',
    apiKey: process.env.FX_API_KEY || '',
    baseUrl: process.env.FX_API_BASE_URL || 'https://v6.exchangerate-api.com/v6',
  },
  database: {
    path: process.env.DB_PATH || './data/rates.db',
  },
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || '60', 10),
  },
};

export const BASE_CURRENCY = 'CNY';
export const TARGET_CURRENCIES = ['USD', 'EUR', 'GBP'];
export const DEFAULT_HISTORY_DAYS = 30;
