import request from 'supertest';
import express, { Express } from 'express';
import routes from '../server/routes';
import { ratesService } from '../services/ratesService';
import { errorHandler, notFoundHandler } from '../server/middleware';

jest.mock('../services/ratesService');

const mockedRatesService = ratesService as jest.Mocked<typeof ratesService>;

let app: Express;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  jest.clearAllMocks();
});

describe('API Routes', () => {
  describe('GET /api/rates/current', () => {
    it('should return current rates', async () => {
      mockedRatesService.getCurrentRates.mockResolvedValue({
        baseCurrency: 'CNY',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
        },
        timestamp: '2024-01-01T00:00:00.000Z',
        source: 'database',
      });

      const response = await request(app).get('/api/rates/current');

      expect(response.status).toBe(200);
      expect(response.body.baseCurrency).toBe('CNY');
      expect(response.body.rates.USD).toBe(0.14);
      expect(response.body.source).toBe('database');
    });

    it('should support refresh query parameter', async () => {
      mockedRatesService.getCurrentRates.mockResolvedValue({
        baseCurrency: 'CNY',
        rates: {
          USD: 0.14,
          EUR: 0.13,
          GBP: 0.11,
        },
        timestamp: '2024-01-01T00:00:00.000Z',
        source: 'live',
      });

      const response = await request(app).get('/api/rates/current?refresh=true');

      expect(response.status).toBe(200);
      expect(mockedRatesService.getCurrentRates).toHaveBeenCalledWith(true);
    });

    it('should handle service errors', async () => {
      mockedRatesService.getCurrentRates.mockRejectedValue(new Error('API Error'));

      const response = await request(app).get('/api/rates/current');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.message).toBe('API Error');
    });
  });

  describe('GET /api/rates/history', () => {
    it('should return historical rates', async () => {
      mockedRatesService.getHistoricalRates.mockResolvedValue({
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        data: [
          { date: '2024-01-01', rate: 0.14 },
          { date: '2024-01-02', rate: 0.142 },
        ],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        count: 2,
      });

      const response = await request(app).get('/api/rates/history?pair=USD');

      expect(response.status).toBe(200);
      expect(response.body.targetCurrency).toBe('USD');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should require pair query parameter', async () => {
      const response = await request(app).get('/api/rates/history');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toContain('pair');
    });

    it('should support custom date range', async () => {
      mockedRatesService.getHistoricalRates.mockResolvedValue({
        baseCurrency: 'CNY',
        targetCurrency: 'EUR',
        data: [],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        count: 0,
      });

      const response = await request(app)
        .get('/api/rates/history?pair=EUR&start=2024-01-01&end=2024-01-31');

      expect(response.status).toBe(200);
      expect(mockedRatesService.getHistoricalRates).toHaveBeenCalledWith(
        'EUR',
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('should handle service errors', async () => {
      mockedRatesService.getHistoricalRates.mockRejectedValue(
        new Error('Invalid currency')
      );

      const response = await request(app).get('/api/rates/history?pair=INVALID');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    it('should handle timeout errors with 503', async () => {
      mockedRatesService.getCurrentRates.mockRejectedValue(new Error('API request timeout'));

      const response = await request(app).get('/api/rates/current');

      expect(response.status).toBe(503);
      expect(response.body.error).toBe('Service Unavailable');
    });
  });
});
