import axios, { AxiosInstance } from 'axios';
import { config } from './config';
import { FXApiResponse, ExchangeRate } from './types';

export class FXApiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private initialized: boolean = false;

  constructor() {
    this.apiKey = config.fxApi.apiKey;
    this.baseUrl = config.fxApi.baseUrl;
    this.client = axios.create({
      timeout: 10000,
    });
  }

  private checkInitialization(): void {
    if (!this.initialized) {
      if (!this.apiKey) {
        throw new Error('FX_API_KEY environment variable is not set');
      }
      this.initialized = true;
    }
  }

  async getCurrentRate(baseCurrency: string): Promise<ExchangeRate> {
    this.checkInitialization();
    try {
      const url = `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`;
      const response = await this.client.get<FXApiResponse>(url);

      if (!response.data || response.data.conversion_rate === undefined) {
        throw new Error('Invalid API response format');
      }

      return {
        baseCurrency: response.data.base_code,
        targetCurrency: response.data.target_code,
        rate: response.data.conversion_rate,
        timestamp: new Date(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]> {
    this.checkInitialization();
    try {
      const url = `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`;
      interface ApiRatesResponse {
        base_code: string;
        conversion_rates: Record<string, number>;
      }
      const response = await this.client.get<ApiRatesResponse>(url);

      if (!response.data || !response.data.conversion_rates) {
        throw new Error('Invalid API response format');
      }

      const rates: ExchangeRate[] = [];
      for (const targetCurrency of targetCurrencies) {
        const rate = response.data.conversion_rates[targetCurrency];
        if (rate !== undefined) {
          rates.push({
            baseCurrency: response.data.base_code,
            targetCurrency,
            rate,
            timestamp: new Date(),
          });
        }
      }

      return rates;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return new Error('Invalid API key');
      }
      if (error.response?.status === 404) {
        return new Error('Currency not found');
      }
      if (error.code === 'ECONNABORTED') {
        return new Error('API request timeout');
      }
      if (error.message === 'Network Error') {
        return new Error('Network error - unable to reach API');
      }
      return new Error(`API error: ${error.response?.statusText || error.message}`);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown error occurred');
  }
}

export const fxApiClient = new FXApiClient();
