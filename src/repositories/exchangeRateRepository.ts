import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

export interface ExchangeRateData {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
}

export class ExchangeRateRepository {
  async create(data: ExchangeRateData) {
    try {
      const exchangeRate = await prisma.exchangeRate.create({
        data,
      });
      logger.info('Exchange rate created', {
        id: exchangeRate.id,
        baseCurrency: data.baseCurrency,
        targetCurrency: data.targetCurrency,
        rate: data.rate,
      });
      return exchangeRate;
    } catch (error: any) {
      if (error.code === 'P2002') {
        logger.warn('Duplicate exchange rate entry detected, skipping', {
          baseCurrency: data.baseCurrency,
          targetCurrency: data.targetCurrency,
          timestamp: data.timestamp,
        });
        return null;
      }
      logger.error('Failed to create exchange rate', { error, data });
      throw error;
    }
  }

  async findByTimestamp(baseCurrency: string, targetCurrency: string, timestamp: Date) {
    return await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency,
        targetCurrency,
        timestamp,
      },
    });
  }

  async findRecent(baseCurrency: string, targetCurrency: string, limit: number = 10) {
    return await prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        targetCurrency,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  async getStats() {
    const totalCount = await prisma.exchangeRate.count();
    const latestRate = await prisma.exchangeRate.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    });
    
    return {
      totalCount,
      latestRate,
    };
  }
}
