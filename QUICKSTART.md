# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Run the Collector

### Option 1: Scheduled Collection with HTTP Server

Start the application with automatic scheduled collection every 5 minutes:

```bash
npm run dev
```

The application will:
- Start the scheduler (runs every 5 minutes by default)
- Start an HTTP server on port 3000
- Begin collecting exchange rates automatically

Access the endpoints:
- Health: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics
- Recent rates: http://localhost:3000/rates/recent?base=CNY&target=USD

### Option 2: One-Time Collection

Run a single collection and exit:

```bash
npm run collector
```

This is useful for:
- Testing the collector
- Manual data collection
- Running via external cron jobs

### Option 3: Production Build

```bash
npm run build
npm start
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to customize:

```bash
# Change collection interval (cron syntax)
COLLECTOR_INTERVAL="*/5 * * * *"  # Every 5 minutes (default)
COLLECTOR_INTERVAL="*/1 * * * *"  # Every minute
COLLECTOR_INTERVAL="0 */1 * * *"  # Every hour

# Change database
DATABASE_URL="file:./dev.db"                                    # SQLite (default)
DATABASE_URL="postgresql://user:pass@localhost:5432/rates"      # PostgreSQL

# Change API endpoint
EXCHANGE_API_URL="https://api.exchangerate-api.com/v4/latest/CNY"

# Adjust retry behavior
API_RETRY_ATTEMPTS=3      # Number of retry attempts
API_RETRY_DELAY_MS=1000   # Initial delay between retries

# Server configuration
PORT=3000                 # HTTP server port
LOG_LEVEL=info           # Logging level (debug, info, warn, error)
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Verify It's Working

1. Start the application:
   ```bash
   npm run dev
   ```

2. Check the logs - you should see:
   ```
   [info]: Starting CNY Exchange Rate Collector
   [info]: Database connected successfully
   [info]: Starting scheduler
   [info]: Scheduler started successfully
   [info]: Server started on port 3000
   ```

3. Trigger a manual collection:
   ```bash
   curl -X POST http://localhost:3000/collect/trigger
   ```

4. Check the metrics:
   ```bash
   curl http://localhost:3000/metrics | jq
   ```

5. View recent rates:
   ```bash
   curl "http://localhost:3000/rates/recent?base=CNY&target=USD&limit=5" | jq
   ```

## Troubleshooting

### Database connection errors

Ensure the database directory exists and is writable:
```bash
mkdir -p prisma
npm run prisma:migrate
```

### API connection errors

Check your internet connection and verify the API URL is correct:
```bash
curl https://api.exchangerate-api.com/v4/latest/CNY
```

### Port already in use

Change the port in `.env`:
```bash
PORT=3001
```

### Logs not appearing

Create the logs directory:
```bash
mkdir -p logs
```

Or adjust the log level in `.env`:
```bash
LOG_LEVEL=debug
```

## Stop the Application

Press `Ctrl+C` to gracefully stop the application. The shutdown process will:
1. Stop the scheduler
2. Close the HTTP server
3. Disconnect from the database
4. Exit cleanly

## Next Steps

- Read [README.md](README.md) for detailed documentation
- See [TESTING.md](TESTING.md) for testing guide
- Check [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture details
