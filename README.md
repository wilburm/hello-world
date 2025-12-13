# CNY Exchange Rate Collector

A background job service that collects CNY→USD/EUR/GBP exchange rates from a third-party API at configurable intervals and persists them to a database.

## Features

- **Scheduled Collection**: Automatically fetches exchange rates at configurable intervals using node-cron
- **Retry Logic**: Implements exponential backoff for API failures
- **Duplicate Prevention**: Uses unique constraints to avoid duplicate entries
- **Comprehensive Logging**: Winston-based logging with multiple transports
- **Health Metrics**: HTTP endpoints for monitoring collector status and database stats
- **Configurable**: All settings managed through environment variables
- **Well-Tested**: Comprehensive test suite with mocked API responses

## Prerequisites

- Node.js 18+ and npm
- SQLite (default) or PostgreSQL

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

### Environment Variables

- `DATABASE_URL`: Database connection string (default: SQLite file:./dev.db)
- `COLLECTOR_INTERVAL`: Cron expression for collection interval (default: `*/5 * * * *` - every 5 minutes)
- `EXCHANGE_API_URL`: API endpoint for exchange rates (default: exchangerate-api.com)
- `API_RETRY_ATTEMPTS`: Number of retry attempts on API failure (default: 3)
- `API_RETRY_DELAY_MS`: Initial delay between retries in milliseconds (default: 1000)
- `PORT`: HTTP server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)

## Database Setup

Initialize the database schema:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Usage

### Start the Scheduled Collector

Start the application with the scheduler and HTTP server:

```bash
npm run build
npm start
```

Or in development mode:

```bash
npm run dev
```

### Run One-Time Collection

Execute a single collection without starting the scheduler:

```bash
npm run collector
```

Or in development mode:

```bash
npx ts-node src/collector.ts
```

## API Endpoints

The service exposes the following HTTP endpoints:

### Health Check

```bash
GET /health
```

Returns the health status of the application.

### Metrics

```bash
GET /metrics
```

Returns comprehensive metrics including:
- Collector statistics (runs, success/failure counts, last run status)
- Scheduler status
- Database statistics

### Recent Rates

```bash
GET /rates/recent?base=CNY&target=USD&limit=10
```

Query parameters:
- `base`: Base currency (default: CNY)
- `target`: Target currency (default: USD)
- `limit`: Number of records to return (default: 10)

### Manual Trigger

```bash
POST /collect/trigger
```

Manually trigger a collection run.

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Architecture

### Project Structure

```
src/
├── config/           # Configuration management
├── repositories/     # Database access layer (Prisma)
├── services/         # Business logic
│   ├── exchangeApiService.ts    # API client with retry logic
│   ├── collectorService.ts      # Collection orchestration
│   └── schedulerService.ts      # Cron scheduler
├── utils/            # Utilities (logging, database)
├── server.ts         # HTTP server setup
├── index.ts          # Main application entry
└── collector.ts      # One-time collection script
```

### Key Components

1. **ExchangeApiService**: Handles API communication with retry/backoff logic
2. **CollectorService**: Orchestrates the collection process and maintains statistics
3. **SchedulerService**: Manages cron-based scheduling
4. **ExchangeRateRepository**: Database operations with duplicate handling
5. **HTTP Server**: Provides health checks and metrics endpoints

### Database Schema

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

## Logging

Logs are written to:
- Console (with colors)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Error Handling

The service implements comprehensive error handling:
- **API Failures**: Exponential backoff retry strategy
- **Database Errors**: Duplicate detection and graceful handling
- **Graceful Shutdown**: SIGTERM/SIGINT handlers for clean shutdown

## Development

Build the TypeScript code:

```bash
npm run build
```

View the database with Prisma Studio:

```bash
npm run prisma:studio
```

## License

ISC
