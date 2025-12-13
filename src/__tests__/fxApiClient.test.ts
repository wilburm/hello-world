import axios from 'axios';
import { FXApiClient } from '../fxApiClient';

jest.mock('axios');
jest.mock('../config', () => ({
  config: {
    fxApi: {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.example.com',
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FXApiClient', () => {
  let client: FXApiClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    client = new FXApiClient();
  });

  describe('constructor', () => {
    it('should initialize client successfully', () => {
      expect(client).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 10000,
      });
    });
  });

  describe('getCurrentRate', () => {
    it('should fetch current rate successfully', async () => {
      const mockResponse = {
        data: {
          base_code: 'CNY',
          target_code: 'USD',
          conversion_rate: 0.14,
        },
      };

      (client['client'].get as jest.Mock).mockResolvedValue(mockResponse);

      const rate = await client.getCurrentRate('CNY');

      expect(rate.baseCurrency).toBe('CNY');
      expect(rate.targetCurrency).toBe('USD');
      expect(rate.rate).toBe(0.14);
      expect(rate.timestamp).toBeInstanceOf(Date);
    });

    it('should handle API error with 401 status', async () => {
      const error = new Error('Request failed with status code 401') as Error & {
        response?: { status: number; statusText: string };
        isAxiosError?: boolean;
      };
      error.response = { status: 401, statusText: 'Unauthorized' };
      error.isAxiosError = true;
      (client['client'].get as jest.Mock).mockRejectedValue(error);

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(client.getCurrentRate('CNY')).rejects.toThrow('Invalid API key');
    });

    it('should handle invalid API response', async () => {
      (client['client'].get as jest.Mock).mockResolvedValue({ data: {} });

      await expect(client.getCurrentRate('CNY')).rejects.toThrow('Invalid API response format');
    });
  });

  describe('getCurrentRates', () => {
    it('should fetch multiple rates successfully', async () => {
      const mockResponse = {
        data: {
          base_code: 'CNY',
          conversion_rates: {
            USD: 0.14,
            EUR: 0.13,
            GBP: 0.11,
          },
        },
      };

      (client['client'].get as jest.Mock).mockResolvedValue(mockResponse);

      const rates = await client.getCurrentRates('CNY', ['USD', 'EUR', 'GBP']);

      expect(rates).toHaveLength(3);
      expect(rates[0]).toEqual({
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: expect.any(Date),
      });
    });

    it('should handle network timeout', async () => {
      const error = new Error('timeout of 10000ms exceeded') as Error & {
        code?: string;
        isAxiosError?: boolean;
      };
      error.code = 'ECONNABORTED';
      error.isAxiosError = true;
      (client['client'].get as jest.Mock).mockRejectedValue(error);

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(client.getCurrentRates('CNY', ['USD'])).rejects.toThrow('API request timeout');
    });
  });
});
