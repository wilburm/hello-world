import { Router, Request, Response, NextFunction } from 'express';
import { ratesService } from '../services/ratesService';

const router = Router();

router.get('/api/rates/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh = req.query.refresh === 'true';
    const rates = await ratesService.getCurrentRates(refresh);
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/api/rates/history',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pair = req.query.pair as string;
      const startDate = req.query.start as string | undefined;
      const endDate = req.query.end as string | undefined;

      if (!pair) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Query parameter "pair" is required (e.g., "USD", "EUR", "GBP")',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const rates = await ratesService.getHistoricalRates(pair, startDate, endDate);
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
