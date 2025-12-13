import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ExchangeRateResponse {
  base: string;
  date: string;
  time_last_updated?: number;
  rates: {
    [currency: string]: number;
  };
}

export class ExchangeApiService {
  private axiosInstance: AxiosInstance;
  private readonly targetCurrencies = ['USD', 'EUR', 'GBP'];

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || config.collector.apiUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  async fetchExchangeRates(): Promise<ExchangeRateResponse> {
    const { retryAttempts, retryDelayMs } = config.collector;
    let lastError: any;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        logger.info(`Fetching exchange rates (attempt ${attempt}/${retryAttempts})`);
        const response = await this.axiosInstance.get<ExchangeRateResponse>('');
        
        logger.info('Exchange rates fetched successfully', {
          base: response.data.base,
          currencies: Object.keys(response.data.rates).length,
        });

        return response.data;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Failed to fetch exchange rates (attempt ${attempt}/${retryAttempts})`, {
          error: error.message,
          status: error.response?.status,
        });

        if (attempt < retryAttempts) {
          const delay = retryDelayMs * Math.pow(2, attempt - 1);
          logger.info(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    logger.error('All retry attempts failed', { error: lastError.message });
    throw new Error(`Failed to fetch exchange rates after ${retryAttempts} attempts: ${lastError.message}`);
  }

  extractTargetRates(response: ExchangeRateResponse): Array<{ currency: string; rate: number }> {
    const rates: Array<{ currency: string; rate: number }> = [];

    for (const currency of this.targetCurrencies) {
      if (response.rates[currency]) {
        rates.push({
          currency,
          rate: response.rates[currency],
        });
      } else {
        logger.warn(`Target currency ${currency} not found in API response`);
      }
    }

    return rates;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
