import { ExchangeApiService } from './exchangeApiService';
import { ExchangeRateRepository } from '../repositories/exchangeRateRepository';
import { logger } from '../utils/logger';

export interface CollectorStats {
  lastRunTime: Date | null;
  lastRunStatus: 'success' | 'error' | 'pending';
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastError: string | null;
  ratesCollected: number;
}

export class CollectorService {
  private stats: CollectorStats = {
    lastRunTime: null,
    lastRunStatus: 'pending',
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    lastError: null,
    ratesCollected: 0,
  };

  constructor(
    private apiService: ExchangeApiService,
    private repository: ExchangeRateRepository
  ) {}

  async collect(): Promise<void> {
    const startTime = new Date();
    this.stats.totalRuns++;
    this.stats.lastRunTime = startTime;

    logger.info('Starting exchange rate collection');

    try {
      const response = await this.apiService.fetchExchangeRates();
      const targetRates = this.apiService.extractTargetRates(response);

      if (targetRates.length === 0) {
        throw new Error('No target rates found in API response');
      }

      const timestamp = new Date();
      let savedCount = 0;

      for (const { currency, rate } of targetRates) {
        const result = await this.repository.create({
          baseCurrency: response.base,
          targetCurrency: currency,
          rate,
          timestamp,
        });

        if (result) {
          savedCount++;
        }
      }

      this.stats.successfulRuns++;
      this.stats.lastRunStatus = 'success';
      this.stats.lastError = null;
      this.stats.ratesCollected += savedCount;

      const duration = Date.now() - startTime.getTime();
      logger.info('Exchange rate collection completed successfully', {
        duration: `${duration}ms`,
        ratesSaved: savedCount,
        totalRates: targetRates.length,
      });
    } catch (error: any) {
      this.stats.failedRuns++;
      this.stats.lastRunStatus = 'error';
      this.stats.lastError = error.message;

      logger.error('Exchange rate collection failed', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  getStats(): CollectorStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      lastRunTime: null,
      lastRunStatus: 'pending',
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
      ratesCollected: 0,
    };
    logger.info('Collector stats reset');
  }
}
