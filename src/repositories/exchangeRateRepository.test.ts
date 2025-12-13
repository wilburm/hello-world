import { ExchangeRateRepository, ExchangeRateData } from './exchangeRateRepository';
import { prisma } from '../utils/database';

jest.mock('../utils/database', () => ({
  prisma: {
    exchangeRate: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ExchangeRateRepository', () => {
  let repository: ExchangeRateRepository;

  beforeEach(() => {
    repository = new ExchangeRateRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new exchange rate', async () => {
      const data: ExchangeRateData = {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
      };

      const mockResult = {
        id: 1,
        ...data,
        createdAt: new Date(),
      };

      (prisma.exchangeRate.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.create(data);

      expect(result).toEqual(mockResult);
      expect(prisma.exchangeRate.create).toHaveBeenCalledWith({ data });
    });

    it('should return null on duplicate entry', async () => {
      const data: ExchangeRateData = {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
      };

      const duplicateError: any = new Error('Unique constraint failed');
      duplicateError.code = 'P2002';

      (prisma.exchangeRate.create as jest.Mock).mockRejectedValue(duplicateError);

      const result = await repository.create(data);

      expect(result).toBeNull();
    });

    it('should throw error for non-duplicate database errors', async () => {
      const data: ExchangeRateData = {
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
      };

      const dbError = new Error('Database connection error');

      (prisma.exchangeRate.create as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.create(data)).rejects.toThrow('Database connection error');
    });
  });

  describe('findByTimestamp', () => {
    it('should find exchange rate by timestamp', async () => {
      const mockResult = {
        id: 1,
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
        createdAt: new Date(),
      };

      (prisma.exchangeRate.findFirst as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.findByTimestamp('CNY', 'USD', new Date('2024-01-01'));

      expect(result).toEqual(mockResult);
    });
  });

  describe('findRecent', () => {
    it('should find recent exchange rates', async () => {
      const mockResults = [
        {
          id: 2,
          baseCurrency: 'CNY',
          targetCurrency: 'USD',
          rate: 0.14,
          timestamp: new Date('2024-01-02'),
          createdAt: new Date(),
        },
        {
          id: 1,
          baseCurrency: 'CNY',
          targetCurrency: 'USD',
          rate: 0.14,
          timestamp: new Date('2024-01-01'),
          createdAt: new Date(),
        },
      ];

      (prisma.exchangeRate.findMany as jest.Mock).mockResolvedValue(mockResults);

      const result = await repository.findRecent('CNY', 'USD', 10);

      expect(result).toEqual(mockResults);
      expect(prisma.exchangeRate.findMany).toHaveBeenCalledWith({
        where: {
          baseCurrency: 'CNY',
          targetCurrency: 'USD',
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
      });
    });
  });

  describe('getStats', () => {
    it('should return database statistics', async () => {
      const mockLatestRate = {
        id: 1,
        baseCurrency: 'CNY',
        targetCurrency: 'USD',
        rate: 0.14,
        timestamp: new Date('2024-01-01'),
        createdAt: new Date(),
      };

      (prisma.exchangeRate.count as jest.Mock).mockResolvedValue(100);
      (prisma.exchangeRate.findFirst as jest.Mock).mockResolvedValue(mockLatestRate);

      const result = await repository.getStats();

      expect(result).toEqual({
        totalCount: 100,
        latestRate: mockLatestRate,
      });
    });
  });
});
