import axios from 'axios';
import { ExchangeApiService, ExchangeRateResponse } from './exchangeApiService';
import { config } from '../config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeApiService', () => {
  let service: ExchangeApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExchangeApiService();
  });

  describe('fetchExchangeRates', () => {
    it('should fetch exchange rates successfully', async () => {
      const mockResponse: ExchangeRateResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
      } as any);

      service = new ExchangeApiService();
      const result = await service.fetchExchangeRates();

      expect(result).toEqual(mockResponse);
      expect(result.base).toBe('CNY');
      expect(result.rates.USD).toBe(0.14);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockResponse: ExchangeRateResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
        },
      };

      const mockGet = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockResponse });

      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      service = new ExchangeApiService();
      const result = await service.fetchExchangeRates();

      expect(result).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should throw error after all retries fail', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Network error'));

      mockedAxios.create.mockReturnValue({
        get: mockGet,
      } as any);

      service = new ExchangeApiService();

      await expect(service.fetchExchangeRates()).rejects.toThrow(
        /Failed to fetch exchange rates after \d+ attempts/
      );

      expect(mockGet).toHaveBeenCalledTimes(config.collector.retryAttempts);
    });
  });

  describe('extractTargetRates', () => {
    it('should extract target currencies correctly', () => {
      const response: ExchangeRateResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
          JPY: 20.5,
        },
      };

      const result = service.extractTargetRates(response);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { currency: 'USD', rate: 0.14 },
        { currency: 'EUR', rate: 0.13 },
        { currency: 'GBP', rate: 0.11 },
      ]);
    });

    it('should handle missing target currencies', () => {
      const response: ExchangeRateResponse = {
        base: 'CNY',
        date: '2024-01-01',
        rates: {
          USD: 0.14,
          JPY: 20.5,
        },
      };

      const result = service.extractTargetRates(response);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        { currency: 'USD', rate: 0.14 },
      ]);
    });
  });
});
