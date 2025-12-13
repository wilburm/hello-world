import { database } from '../database';
import { fxApiClient } from '../fxApiClient';
import { CurrentRatesResponse, HistoricalRatesResponse } from '../types';
import { BASE_CURRENCY, TARGET_CURRENCIES, DEFAULT_HISTORY_DAYS, config } from '../config';

interface CacheEntry {
  data: CurrentRatesResponse;
  timestamp: number;
}

class RatesService {
  private cache: Map<string, CacheEntry> = new Map();

  async getCurrentRates(refresh: boolean = false): Promise<CurrentRatesResponse> {
    const cacheKey = `current_${BASE_CURRENCY}`;

    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          source: 'cache',
        };
      }
    }

    try {
      let rates = await database.getLatestRates(BASE_CURRENCY, TARGET_CURRENCIES);
      let source: 'cache' | 'live' | 'database' = 'database';

      const cacheAge = rates.length > 0 ? this.getCacheAgeMinutes(rates[0].timestamp) : Infinity;

      if (rates.length === 0 || cacheAge > config.cache.ttlMinutes || refresh) {
        try {
          const liveRates = await fxApiClient.getCurrentRates(BASE_CURRENCY, TARGET_CURRENCIES);
          await database.insertRates(liveRates);
          rates = liveRates;
          source = 'live';
        } catch (error) {
          if (rates.length === 0) {
            throw error;
          }
        }
      }

      const response: CurrentRatesResponse = {
        baseCurrency: BASE_CURRENCY,
        rates: {},
        timestamp: rates[0]?.timestamp.toISOString() || new Date().toISOString(),
        source,
      };

      for (const rate of rates) {
        response.rates[rate.targetCurrency] = rate.rate;
      }

      this.setInCache(cacheKey, response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getHistoricalRates(
    targetCurrency: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalRatesResponse> {
    this.validateCurrency(targetCurrency);

    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate
      ? new Date(startDate)
      : new Date(endDateObj.getTime() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000);

    this.validateDateRange(startDateObj, endDateObj);

    const rates = await database.getHistoricalRates(
      BASE_CURRENCY,
      targetCurrency,
      startDateObj,
      endDateObj
    );

    if (rates.length === 0) {
      throw new Error(`No historical data found for ${BASE_CURRENCY}/${targetCurrency}`);
    }

    const response: HistoricalRatesResponse = {
      baseCurrency: BASE_CURRENCY,
      targetCurrency,
      data: rates.map((rate) => ({
        date: rate.timestamp.toISOString().split('T')[0],
        rate: rate.rate,
      })),
      startDate: startDateObj.toISOString().split('T')[0],
      endDate: endDateObj.toISOString().split('T')[0],
      count: rates.length,
    };

    return response;
  }

  private validateCurrency(currency: string): void {
    if (!TARGET_CURRENCIES.includes(currency)) {
      throw new Error(
        `Invalid currency. Supported currencies: ${TARGET_CURRENCIES.join(', ')}`
      );
    }
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    const maxDaysBack = 365;
    const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDifference > maxDaysBack) {
      throw new Error(`Date range cannot exceed ${maxDaysBack} days`);
    }
  }

  private getCacheAgeMinutes(timestamp: Date): number {
    return (Date.now() - timestamp.getTime()) / (1000 * 60);
  }

  private getFromCache(key: string): CurrentRatesResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ageMinutes = (Date.now() - entry.timestamp) / (1000 * 60);
    if (ageMinutes > config.cache.ttlMinutes) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setInCache(key: string, data: CurrentRatesResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const ratesService = new RatesService();
