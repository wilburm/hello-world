import cron from 'node-cron';
import { CollectorService } from './collectorService';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor(private collectorService: CollectorService) {}

  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    const interval = config.collector.interval;

    if (!cron.validate(interval)) {
      throw new Error(`Invalid cron expression: ${interval}`);
    }

    logger.info('Starting scheduler', { interval });

    this.task = cron.schedule(interval, async () => {
      try {
        await this.collectorService.collect();
      } catch (error: any) {
        logger.error('Scheduled collection failed', { error: error.message });
      }
    });

    this.isRunning = true;
    logger.info('Scheduler started successfully');
  }

  stop(): void {
    if (!this.isRunning || !this.task) {
      logger.warn('Scheduler is not running');
      return;
    }

    this.task.stop();
    this.isRunning = false;
    logger.info('Scheduler stopped');
  }

  getStatus(): { isRunning: boolean; interval: string } {
    return {
      isRunning: this.isRunning,
      interval: config.collector.interval,
    };
  }
}
