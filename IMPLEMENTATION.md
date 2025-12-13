# Implementation Summary

## Overview

This project implements a scheduled data collector that fetches CNY→USD/EUR/GBP exchange rates from a third-party API and persists them to a database. The implementation uses node-cron for scheduling, Prisma for database access, and includes comprehensive logging, retry logic, health metrics, and tests.

## Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Scheduler**: node-cron (cron-based job scheduling)
- **Database**: Prisma ORM with SQLite (configurable to PostgreSQL)
- **HTTP Server**: Express.js
- **Logging**: Winston
- **Testing**: Jest with ts-jest
- **API Client**: Axios

### Project Structure

```
src/
├── config/
│   └── index.ts                    # Environment configuration
├── repositories/
│   ├── exchangeRateRepository.ts   # Database access layer
│   └── exchangeRateRepository.test.ts
├── services/
│   ├── exchangeApiService.ts       # API client with retry logic
│   ├── exchangeApiService.test.ts
│   ├── collectorService.ts         # Collection orchestration
│   ├── collectorService.test.ts
│   ├── schedulerService.ts         # Cron scheduling
│   └── schedulerService.test.ts
├── utils/
│   ├── database.ts                 # Prisma client setup
│   └── logger.ts                   # Winston logger configuration
├── index.ts                        # Main application entry
├── collector.ts                    # One-time collection script
└── server.ts                       # HTTP server setup
```

## Key Features

### 1. Scheduled Collection

The application uses **node-cron** to schedule periodic collection of exchange rates. The interval is configurable via environment variables using standard cron syntax.

**Default**: Every 5 minutes (`*/5 * * * *`)

**Implementation**: `src/services/schedulerService.ts`

### 2. API Integration with Retry Logic

**Service**: `ExchangeApiService`

Features:
- Fetches exchange rates from configurable API endpoint
- Exponential backoff retry strategy
- Configurable retry attempts and delay
- Extracts target currencies (USD, EUR, GBP) from response
- Comprehensive error logging

**Default Configuration**:
- Retry attempts: 3
- Initial delay: 1000ms
- Backoff: Exponential (2^attempt)

### 3. Database Persistence

**ORM**: Prisma with SQLite (default) or PostgreSQL

**Schema**:
```prisma
model ExchangeRate {
  id             Int      @id @default(autoincrement())
  baseCurrency   String
  targetCurrency String
  rate           Float
  timestamp      DateTime @default(now())
  createdAt      DateTime @default(now())

  @@unique([baseCurrency, targetCurrency, timestamp])
}
```

**Duplicate Prevention**:
- Unique constraint on `[baseCurrency, targetCurrency, timestamp]`
- Repository catches Prisma error code P2002 and returns `null`
- No exceptions thrown for duplicates
- Warning logged when duplicate detected

### 4. Logging

**Logger**: Winston with multiple transports

**Outputs**:
- Console (with colors)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

**Log Levels**: debug, info, warn, error

**Configurable**: via `LOG_LEVEL` environment variable

### 5. Health Metrics Endpoint

**HTTP Server**: Express.js on port 3000 (configurable)

**Endpoints**:

1. **Health Check**: `GET /health`
   - Returns service health status

2. **Metrics**: `GET /metrics`
   - Collector statistics (runs, success/failure counts, last run status)
   - Scheduler status (running, interval)
   - Database statistics (total count, latest rate)

3. **Recent Rates**: `GET /rates/recent?base=CNY&target=USD&limit=10`
   - Query recent exchange rates
   - Configurable base/target currency and limit

4. **Manual Trigger**: `POST /collect/trigger`
   - Manually trigger a collection run

### 6. Configuration

All configuration is managed through environment variables:

```bash
DATABASE_URL="file:./dev.db"              # Database connection
COLLECTOR_INTERVAL="*/5 * * * *"          # Cron expression
EXCHANGE_API_URL="https://..."            # API endpoint
API_RETRY_ATTEMPTS=3                       # Retry attempts
API_RETRY_DELAY_MS=1000                    # Initial retry delay
PORT=3000                                  # HTTP server port
NODE_ENV=development                       # Environment
LOG_LEVEL=info                             # Logging level
```

### 7. Testing

**Framework**: Jest with ts-jest

**Coverage**:
- ExchangeApiService: API fetching, retry logic, rate extraction
- CollectorService: Collection orchestration, stats tracking, error handling
- SchedulerService: Cron scheduling, start/stop operations
- ExchangeRateRepository: CRUD operations, duplicate handling

**Test Stats**: 23 tests, 4 test suites, all passing

**Mocking**:
- API responses mocked with axios
- Database operations mocked with Prisma client
- Cron scheduler mocked with node-cron

## Usage

### Installation

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Running the Application

**Scheduled Collection (with HTTP server)**:
```bash
npm run dev        # Development mode
npm run build      # Production build
npm start          # Production mode
```

**One-Time Collection**:
```bash
npm run collector
```

This command runs a single collection cycle and exits, useful for:
- Testing the collector
- Manual data collection
- Cron jobs outside the application

### Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
```

## Implementation Details

### Collection Flow

1. **Scheduler triggers collection** (or manual trigger via API)
2. **CollectorService.collect()** orchestrates the process:
   - Calls ExchangeApiService to fetch rates
   - Extracts target currencies (USD, EUR, GBP)
   - Uses ExchangeRateRepository to persist each rate
   - Updates statistics (runs, success/failure counts)
   - Logs all operations
3. **ExchangeApiService.fetchExchangeRates()**:
   - Makes HTTP request to API
   - Implements retry with exponential backoff
   - Logs each attempt and result
4. **ExchangeRateRepository.create()**:
   - Attempts to insert rate into database
   - Catches duplicate constraint errors (P2002)
   - Returns null for duplicates, throws for other errors
5. **Statistics tracked**:
   - Last run time and status
   - Total runs, successful runs, failed runs
   - Last error message
   - Total rates collected

### Error Handling

- **API Failures**: Retry with exponential backoff, log each attempt
- **Database Errors**: Duplicate detection, graceful handling
- **Validation**: Cron expression validation before starting scheduler
- **Graceful Shutdown**: SIGTERM/SIGINT handlers for clean shutdown

### Graceful Shutdown

The application handles shutdown signals (SIGTERM/SIGINT) gracefully:
1. Stop the scheduler
2. Close HTTP server
3. Disconnect from database
4. Exit with status 0

## Acceptance Criteria

✅ **Background job can be started with a command**
   - `npm start` or `npm run dev` starts scheduled collector
   - `npm run collector` runs one-time collection

✅ **Pulls CNY→USD/EUR/GBP rates from third-party API**
   - Uses exchangerate-api.com (configurable)
   - Fetches all rates, extracts USD/EUR/GBP

✅ **Configurable interval**
   - `COLLECTOR_INTERVAL` environment variable
   - Cron syntax (default: every 5 minutes)

✅ **Persists via Prisma repository**
   - ExchangeRateRepository with Prisma
   - SQLite (default) or PostgreSQL

✅ **Avoids duplicate inserts**
   - Unique constraint on [baseCurrency, targetCurrency, timestamp]
   - Repository handles duplicates gracefully

✅ **Includes logging**
   - Winston with console + file transports
   - All operations logged with appropriate levels

✅ **Retry/backoff rules**
   - Exponential backoff with configurable attempts
   - Retry delay increases: 1s, 2s, 4s, ...

✅ **Health metrics endpoint**
   - `/health`: Health check
   - `/metrics`: Comprehensive metrics
   - `/rates/recent`: Recent rates query
   - `/collect/trigger`: Manual trigger

✅ **Configuration through env vars**
   - All settings configurable
   - `.env.example` provided

✅ **Successfully writes entries to DB**
   - Verified with manual testing
   - Database queries show persisted rates

✅ **Includes tests for collector logic**
   - 23 passing tests
   - Mocked API responses
   - Comprehensive coverage

## Future Enhancements

Possible improvements for production use:

1. **Bull Queue**: Replace node-cron with Bull for more robust job management
2. **Rate Limiting**: Add rate limiting for API calls
3. **Monitoring**: Integration with monitoring services (Datadog, New Relic)
4. **Alerts**: Email/Slack notifications for failures
5. **Data Retention**: Automatic cleanup of old records
6. **Multiple Sources**: Fetch rates from multiple APIs for redundancy
7. **Authentication**: Add API authentication for HTTP endpoints
8. **Prometheus Metrics**: Export metrics in Prometheus format
9. **Docker**: Containerization for easier deployment
10. **CI/CD**: GitHub Actions for automated testing and deployment
