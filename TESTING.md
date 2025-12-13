# Testing Guide

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Integration Tests

#### Test One-Time Collection

Run the collector once:
```bash
npm run collector
```

Expected output:
- Logs showing connection to database
- Fetching exchange rates from API
- Creating exchange rate entries for USD, EUR, and GBP
- Collection completed successfully

#### Test Scheduled Collection with Server

1. Start the server (in one terminal):
```bash
npm run dev
```

2. Check health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

3. Check metrics endpoint:
```bash
curl http://localhost:3000/metrics
```

Expected response includes:
- Collector statistics (runs, success/failure counts)
- Scheduler status (running, interval)
- Database statistics (total count, latest rate)

4. Manually trigger collection:
```bash
curl -X POST http://localhost:3000/collect/trigger
```

Expected response:
```json
{
  "success": true,
  "message": "Collection completed successfully"
}
```

5. Query recent rates:
```bash
curl "http://localhost:3000/rates/recent?base=CNY&target=USD&limit=5"
```

Expected response:
```json
{
  "baseCurrency": "CNY",
  "targetCurrency": "USD",
  "count": 5,
  "rates": [...]
}
```

### Test Duplicate Prevention

The unique constraint ensures no duplicate entries for the same base currency, target currency, and timestamp combination.

To verify:
1. Note the current timestamp of a rate in the database
2. Try to insert the same rate with the same timestamp
3. The repository should return `null` and log a warning about duplicate entry
4. No error should be thrown

### Test Retry Logic

The API service implements exponential backoff with configurable retry attempts.

To test manually:
1. Set an invalid API URL in `.env`:
   ```
   EXCHANGE_API_URL="https://invalid-api.example.com"
   ```
2. Run the collector:
   ```bash
   npm run collector
   ```
3. Observe retry attempts in logs with increasing delays
4. After all retries fail, an error should be logged

### Test Configuration

All configuration is managed through environment variables. Test different configurations:

#### Change Collection Interval

Edit `.env`:
```
COLLECTOR_INTERVAL="*/1 * * * *"  # Every minute
```

Restart the server and verify it runs every minute.

#### Change Retry Configuration

Edit `.env`:
```
API_RETRY_ATTEMPTS=5
API_RETRY_DELAY_MS=2000
```

Test with an invalid API to see more retries with longer delays.

## Test Coverage

Current test coverage:

- **ExchangeApiService**: API fetching, retry logic, rate extraction
- **CollectorService**: Collection orchestration, stats tracking, error handling
- **SchedulerService**: Cron scheduling, start/stop operations
- **ExchangeRateRepository**: CRUD operations, duplicate handling

Run with coverage:
```bash
npm test -- --coverage
```

## Manual Verification Checklist

- [ ] Application starts successfully
- [ ] Database connection established
- [ ] Scheduler starts with correct interval
- [ ] HTTP server listens on configured port
- [ ] Health endpoint returns 200 OK
- [ ] Metrics endpoint shows correct statistics
- [ ] Manual trigger endpoint works
- [ ] Rates are fetched from API
- [ ] Rates are saved to database
- [ ] Duplicate entries are prevented
- [ ] Retry logic works on API failures
- [ ] Graceful shutdown on SIGTERM/SIGINT
- [ ] Logs are written to console and files
