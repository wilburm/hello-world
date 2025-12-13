export interface ExchangeRate {
  id?: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
}

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

export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

export interface FXApiResponse {
  base_code: string;
  target_code: string;
  conversion_rate: number;
}
