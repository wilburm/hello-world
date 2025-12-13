import { CollectorService } from './collectorService';
import { ExchangeApiService } from './exchangeApiService';
import { ExchangeRateRepository } from '../repositories/exchangeRateRepository';

jest.mock('./exchangeApiService');
jest.mock('../repositories/exchangeRateRepository');

describe('CollectorService', () => {
  let collectorService: CollectorService;
  let mockApiService: jest.Mocked<ExchangeApiService>;
  let mockRepository: jest.Mocked<ExchangeRateRepository>;

  beforeEach(() => {
    mockApiService = new ExchangeApiService() as jest.Mocked<ExchangeApiService>;
    mockRepository = new ExchangeRateRepository() as jest.Mocked<ExchangeRateRepository>;
    collectorService = new CollectorService(mockApiService, mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('collect', () => {
    it('should successfully collect and persist exchange rates', async () => {
      const mockResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
        },
      };

      const mockTargetRates = [
        { currency: 'USD', rate: 0.14 },
        { currency: 'EUR', rate: 0.13 },
        { currency: 'GBP', rate: 0.11 },
      ];

      mockApiService.fetchExchangeRates.mockResolvedValue(mockResponse);
      mockApiService.extractTargetRates.mockReturnValue(mockTargetRates);
      mockRepository.create.mockResolvedValue({ id: 1 } as any);

      await collectorService.collect();

      expect(mockApiService.fetchExchangeRates).toHaveBeenCalledTimes(1);
      expect(mockApiService.extractTargetRates).toHaveBeenCalledWith(mockResponse);
      expect(mockRepository.create).toHaveBeenCalledTimes(3);

      const stats = collectorService.getStats();
      expect(stats.totalRuns).toBe(1);
      expect(stats.successfulRuns).toBe(1);
      expect(stats.failedRuns).toBe(0);
      expect(stats.lastRunStatus).toBe('success');
      expect(stats.ratesCollected).toBe(3);
    });

    it('should handle API errors', async () => {
      mockApiService.fetchExchangeRates.mockRejectedValue(new Error('API Error'));

      await expect(collectorService.collect()).rejects.toThrow('API Error');

      const stats = collectorService.getStats();
      expect(stats.totalRuns).toBe(1);
      expect(stats.successfulRuns).toBe(0);
      expect(stats.failedRuns).toBe(1);
      expect(stats.lastRunStatus).toBe('error');
      expect(stats.lastError).toBe('API Error');
    });

    it('should handle duplicate entries gracefully', async () => {
      const mockResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          EUR: 0.13,
        },
      };

      const mockTargetRates = [
        { currency: 'USD', rate: 0.14 },
        { currency: 'EUR', rate: 0.13 },
      ];

      mockApiService.fetchExchangeRates.mockResolvedValue(mockResponse);
      mockApiService.extractTargetRates.mockReturnValue(mockTargetRates);
      mockRepository.create
        .mockResolvedValueOnce({ id: 1 } as any)
        .mockResolvedValueOnce(null);

      await collectorService.collect();

      const stats = collectorService.getStats();
      expect(stats.successfulRuns).toBe(1);
      expect(stats.ratesCollected).toBe(1);
    });

    it('should throw error when no target rates are found', async () => {
      const mockResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {},
      };

      mockApiService.fetchExchangeRates.mockResolvedValue(mockResponse);
      mockApiService.extractTargetRates.mockReturnValue([]);

      await expect(collectorService.collect()).rejects.toThrow(
        'No target rates found in API response'
      );

      const stats = collectorService.getStats();
      expect(stats.failedRuns).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return current stats', () => {
      const stats = collectorService.getStats();
      
      expect(stats).toHaveProperty('lastRunTime');
      expect(stats).toHaveProperty('lastRunStatus');
      expect(stats).toHaveProperty('totalRuns');
      expect(stats).toHaveProperty('successfulRuns');
      expect(stats).toHaveProperty('failedRuns');
      expect(stats).toHaveProperty('lastError');
      expect(stats).toHaveProperty('ratesCollected');
    });
  });

  describe('resetStats', () => {
    it('should reset all stats to initial values', async () => {
      const mockResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: { USD: 0.14 },
      };

      mockApiService.fetchExchangeRates.mockResolvedValue(mockResponse);
      mockApiService.extractTargetRates.mockReturnValue([{ currency: 'USD', rate: 0.14 }]);
      mockRepository.create.mockResolvedValue({ id: 1 } as any);

      await collectorService.collect();
      
      let stats = collectorService.getStats();
      expect(stats.totalRuns).toBe(1);

      collectorService.resetStats();
      
      stats = collectorService.getStats();
      expect(stats.totalRuns).toBe(0);
      expect(stats.successfulRuns).toBe(0);
      expect(stats.failedRuns).toBe(0);
      expect(stats.ratesCollected).toBe(0);
      expect(stats.lastRunStatus).toBe('pending');
    });
  });
});
