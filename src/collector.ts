import { connectDatabase, disconnectDatabase } from './utils/database';
import { logger } from './utils/logger';
import { ExchangeApiService } from './services/exchangeApiService';
import { ExchangeRateRepository } from './repositories/exchangeRateRepository';
import { CollectorService } from './services/collectorService';

async function runCollector() {
  logger.info('Running one-time collection');

  try {
    await connectDatabase();

    const apiService = new ExchangeApiService();
    const repository = new ExchangeRateRepository();
    const collectorService = new CollectorService(apiService, repository);

    await collectorService.collect();

    logger.info('Collection completed successfully');
    logger.info('Stats:', collectorService.getStats());

    await disconnectDatabase();
    process.exit(0);
  } catch (error: any) {
    logger.error('Collection failed', { error: error.message, stack: error.stack });
    await disconnectDatabase();
    process.exit(1);
  }
}

runCollector();
