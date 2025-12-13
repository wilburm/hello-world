import { ratesService } from '../services/ratesService';
import { database } from '../database';
import { fxApiClient } from '../fxApiClient';
import { ExchangeRate } from '../types';

jest.mock('../database');
jest.mock('../fxApiClient');

const mockedDatabase = database as jest.Mocked<typeof database>;
const mockedFxApiClient = fxApiClient as jest.Mocked<typeof fxApiClient>;

describe('RatesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ratesService.clearCache();
  });

  describe('getCurrentRates', () => {
    const mockRates: ExchangeRate[] = [
      {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date(),
      },
      {
        baseCurrency: 'CNY',
        targetCurrency: 'EUR',
        rate: 0.13,
        timestamp: new Date(),
      },
      {
        baseCurrency: 'CNY',
        targetCurrency: 'GBP',
        rate: 0.11,
        timestamp: new Date(),
      },
    ];

    it('should return rates from database when cached', async () => {
      mockedDatabase.getLatestRates.mockResolvedValue(mockRates);

      const result = await ratesService.getCurrentRates(false);

      expect(result.baseCurrency).toBe('CNY');
      expect(result.rates.USD).toBe(0.14);
      expect(result.rates.EUR).toBe(0.13);
      expect(result.rates.GBP).toBe(0.11);
      expect(result.source).toBe('database');
    });

    it('should fetch from live API when cache is expired', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const oldRates = mockRates.map((r) => ({ ...r, timestamp: oldDate }));

      mockedDatabase.getLatestRates.mockResolvedValue(oldRates);
      mockedFxApiClient.getCurrentRates.mockResolvedValue(mockRates);

      const result = await ratesService.getCurrentRates(false);

      expect(result.source).toBe('live');
      expect(mockedDatabase.insertRates).toHaveBeenCalledWith(mockRates);
    });

    it('should force refresh when refresh flag is true', async () => {
      mockedDatabase.getLatestRates.mockResolvedValue(mockRates);
      mockedFxApiClient.getCurrentRates.mockResolvedValue(mockRates);

      const result = await ratesService.getCurrentRates(true);

      expect(result.source).toBe('live');
      expect(mockedFxApiClient.getCurrentRates).toHaveBeenCalled();
    });

    it('should use cached data when API fails', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const oldRates = mockRates.map((r) => ({ ...r, timestamp: oldDate }));

      mockedDatabase.getLatestRates.mockResolvedValue(oldRates);
      mockedFxApiClient.getCurrentRates.mockRejectedValue(new Error('API Error'));

      const result = await ratesService.getCurrentRates(false);

      expect(result.source).toBe('database');
      expect(result.rates.USD).toBe(0.14);
    });

    it('should throw error if no data available', async () => {
      mockedDatabase.getLatestRates.mockResolvedValue([]);
      mockedFxApiClient.getCurrentRates.mockRejectedValue(new Error('API Error'));

      await expect(ratesService.getCurrentRates(false)).rejects.toThrow('API Error');
    });

    it('should cache results in memory', async () => {
      mockedDatabase.getLatestRates.mockResolvedValue(mockRates);

      ratesService.clearCache();
      const result1 = await ratesService.getCurrentRates(false);
      const result2 = await ratesService.getCurrentRates(false);

      expect(mockedDatabase.getLatestRates).toHaveBeenCalledTimes(1);
      expect(result1.source).toBe('database');
      expect(result2.source).toBe('cache');
    });
  });

  describe('getHistoricalRates', () => {
    const mockHistoricalRates: ExchangeRate[] = [
      {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
      },
      {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.142,
        timestamp: new Date('2024-01-02'),
      },
    ];

    it('should return historical rates for a currency', async () => {
      mockedDatabase.getHistoricalRates.mockResolvedValue(mockHistoricalRates);

      const result = await ratesService.getHistoricalRates('USD');

      expect(result.baseCurrency).toBe('CNY');
      expect(result.targetCurrency).toBe('USD');
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('should validate currency code', async () => {
      await expect(ratesService.getHistoricalRates('INVALID')).rejects.toThrow(
        'Invalid currency'
      );
    });

    it('should validate date range', async () => {
      await expect(
        ratesService.getHistoricalRates('USD', '2024-12-31', '2024-01-01')
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should limit date range to 365 days', async () => {
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2024-01-01');

      await expect(
        ratesService.getHistoricalRates('USD', startDate.toISOString(), endDate.toISOString())
      ).rejects.toThrow('Date range cannot exceed 365 days');
    });

    it('should use default date range of 30 days', async () => {
      mockedDatabase.getHistoricalRates.mockResolvedValue(mockHistoricalRates);

      await ratesService.getHistoricalRates('USD');

      expect(mockedDatabase.getHistoricalRates).toHaveBeenCalled();
      const callArgs = mockedDatabase.getHistoricalRates.mock.calls[0];
      const startDate = callArgs[2];
      const endDate = callArgs[3];

      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeLessThanOrEqual(30);
    });

    it('should throw error when no historical data found', async () => {
      mockedDatabase.getHistoricalRates.mockResolvedValue([]);

      await expect(ratesService.getHistoricalRates('USD')).rejects.toThrow(
        'No historical data found'
      );
    });
  });
});
