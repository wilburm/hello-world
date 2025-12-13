import { connectDatabase, disconnectDatabase } from './utils/database';
import { logger } from './utils/logger';
import { ExchangeApiService } from './services/exchangeApiService';
import { ExchangeRateRepository } from './repositories/exchangeRateRepository';
import { CollectorService } from './services/collectorService';
import { SchedulerService } from './services/schedulerService';
import { startServer } from './server';

async function main() {
  logger.info('Starting CNY Exchange Rate Collector');

  try {
    await connectDatabase();

    const apiService = new ExchangeApiService();
    const repository = new ExchangeRateRepository();
    const collectorService = new CollectorService(apiService, repository);
    const schedulerService = new SchedulerService(collectorService);

    schedulerService.start();

    const server = startServer(collectorService, schedulerService, repository);

    const gracefulShutdown = async () => {
      logger.info('Received shutdown signal, closing gracefully...');
      
      schedulerService.stop();
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      await disconnectDatabase();
      
      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error: any) {
    logger.error('Failed to start application', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();
