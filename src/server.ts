import express from 'express';
import { config } from './config';
import { logger } from './utils/logger';
import { CollectorService } from './services/collectorService';
import { SchedulerService } from './services/schedulerService';
import { ExchangeRateRepository } from './repositories/exchangeRateRepository';

export function createServer(
  collectorService: CollectorService,
  schedulerService: SchedulerService,
  repository: ExchangeRateRepository
) {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', async (req, res) => {
    try {
      const collectorStats = collectorService.getStats();
      const schedulerStatus = schedulerService.getStatus();
      const dbStats = await repository.getStats();

      res.json({
        collector: collectorStats,
        scheduler: schedulerStatus,
        database: dbStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch metrics', { error: error.message });
      res.status(500).json({
        error: 'Failed to fetch metrics',
        message: error.message,
      });
    }
  });

  app.get('/rates/recent', async (req, res) => {
    try {
      const baseCurrency = (req.query.base as string) || 'CNY';
      const targetCurrency = (req.query.target as string) || 'USD';
      const limit = parseInt(req.query.limit as string) || 10;

      const rates = await repository.findRecent(baseCurrency, targetCurrency, limit);

      res.json({
        baseCurrency,
        targetCurrency,
        count: rates.length,
        rates,
      });
    } catch (error: any) {
      logger.error('Failed to fetch recent rates', { error: error.message });
      res.status(500).json({
        error: 'Failed to fetch recent rates',
        message: error.message,
      });
    }
  });

  app.post('/collect/trigger', async (req, res) => {
    try {
      logger.info('Manual collection triggered via API');
      await collectorService.collect();
      res.json({
        success: true,
        message: 'Collection completed successfully',
      });
    } catch (error: any) {
      logger.error('Manual collection failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Collection failed',
        message: error.message,
      });
    }
  });

  return app;
}

export function startServer(
  collectorService: CollectorService,
  schedulerService: SchedulerService,
  repository: ExchangeRateRepository
) {
  const app = createServer(collectorService, schedulerService, repository);
  const port = config.server.port;

  const server = app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  });

  return server;
}
