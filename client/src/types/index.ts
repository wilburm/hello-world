export interface CurrentRatesResponse {
  baseCurrency: string;
  rates: {
    [key: string]: number;
  };
  timestamp: string;
  source: 'cache' | 'live' | 'database';
}

export interface HistoricalRatesResponse {
  baseCurrency: string;
  targetCurrency: string;
  data: Array<{
    date: string;
    rate: number;
  }>;
  startDate: string;
  endDate: string;
  count: number;
}

export interface ChartDataPoint {
  date: string;
  rate: number;
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export const SUPPORTED_CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP'];
