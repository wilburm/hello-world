import cron from 'node-cron';
import { SchedulerService } from './schedulerService';
import { CollectorService } from './collectorService';

jest.mock('node-cron');
jest.mock('./collectorService');

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockCollectorService: jest.Mocked<CollectorService>;
  let mockTask: any;

  beforeEach(() => {
    mockCollectorService = new CollectorService({} as any, {} as any) as jest.Mocked<CollectorService>;
    schedulerService = new SchedulerService(mockCollectorService);

    mockTask = {
      stop: jest.fn(),
    };

    (cron.validate as jest.Mock).mockReturnValue(true);
    (cron.schedule as jest.Mock).mockReturnValue(mockTask);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start the scheduler with valid cron expression', () => {
      schedulerService.start();

      expect(cron.validate).toHaveBeenCalled();
      expect(cron.schedule).toHaveBeenCalled();

      const status = schedulerService.getStatus();
      expect(status.isRunning).toBe(true);
    });

    it('should throw error with invalid cron expression', () => {
      (cron.validate as jest.Mock).mockReturnValue(false);

      expect(() => schedulerService.start()).toThrow('Invalid cron expression');
    });

    it('should not start if already running', () => {
      schedulerService.start();
      schedulerService.start();

      expect(cron.schedule).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should stop the scheduler', () => {
      schedulerService.start();
      schedulerService.stop();

      expect(mockTask.stop).toHaveBeenCalled();

      const status = schedulerService.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('should handle stop when not running', () => {
      expect(() => schedulerService.stop()).not.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return correct status', () => {
      const status = schedulerService.getStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('interval');
      expect(status.isRunning).toBe(false);
    });
  });
});
