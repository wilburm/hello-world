# Rate API

A REST API for querying foreign exchange rates with real-time and historical data support.

## Features

- **Current Rates**: Get the latest exchange rates for CNY to USD, EUR, and GBP
- **Historical Rates**: Query historical exchange rate data for analysis and charting
- **Intelligent Caching**: Database caching with configurable TTL and optional live refresh
- **Error Handling**: Comprehensive error handling with meaningful error messages
- **Type Safety**: Full TypeScript support with strict typing
- **Testing**: Comprehensive unit test coverage with mocks for external API

## Prerequisites

- Node.js 16+ 
- npm or yarn
- ExchangeRate-API key (get it from https://www.exchangerate-api.com)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Foreign Exchange API
FX_API_PROVIDER=exchangerate-api
FX_API_KEY=your_api_key_here
FX_API_BASE_URL=https://v6.exchangerate-api.com/v6

# Database
DB_PATH=./data/rates.db

# Cache Configuration (in minutes)
CACHE_TTL_MINUTES=60
```

## Running the Server

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000` and watch for file changes.

### Production

```bash
npm run build
npm start
```

## API Endpoints

### 1. Get Current Exchange Rates

**Endpoint**: `GET /api/rates/current`

**Query Parameters**:
- `refresh` (optional): Set to `true` to force a live API refresh (default: `false`)

**Response**:
```json
{
  "baseCurrency": "CNY",
  "rates": {
    "USD": 0.14,
    "EUR": 0.13,
    "GBP": 0.11
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "database"
}
```

**Source Values**:
- `database`: Data retrieved from cached database
- `cache`: Data retrieved from in-memory cache (within TTL)
- `live`: Data freshly fetched from the external API

**Example Requests**:

```bash
# Get cached rates
curl http://localhost:3000/api/rates/current

# Force refresh from live API
curl http://localhost:3000/api/rates/current?refresh=true
```

### 2. Get Historical Exchange Rates

**Endpoint**: `GET /api/rates/history`

**Query Parameters**:
- `pair` (required): Target currency (USD, EUR, or GBP)
- `start` (optional): Start date in ISO format (YYYY-MM-DD). Default: 30 days ago
- `end` (optional): End date in ISO format (YYYY-MM-DD). Default: today

**Response**:
```json
{
  "baseCurrency": "CNY",
  "targetCurrency": "USD",
  "data": [
    {
      "date": "2024-01-01",
      "rate": 0.14
    },
    {
      "date": "2024-01-02",
      "rate": 0.142
    }
  ],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "count": 31
}
```

**Constraints**:
- Date range cannot exceed 365 days
- Only supports USD, EUR, and GBP as target currencies
- Historical data availability depends on your data seeding

**Example Requests**:

```bash
# Get last 30 days of USD/CNY history
curl http://localhost:3000/api/rates/history?pair=USD

# Get specific date range
curl http://localhost:3000/api/rates/history?pair=EUR&start=2024-01-01&end=2024-01-31

# Get GBP history for last 90 days
curl "http://localhost:3000/api/rates/history?pair=GBP&start=2023-10-16&end=2024-01-15"
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Bad Request | Missing required parameter or invalid input |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Route not found |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | External API timeout or network error |

**Example Error Response** (missing pair parameter):
```bash
curl http://localhost:3000/api/rates/history
```

```json
{
  "error": "Bad Request",
  "message": "Query parameter \"pair\" is required (e.g., \"USD\", \"EUR\", \"GBP\")",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Linting

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Project Structure

```
src/
├── config.ts                 # Configuration and constants
├── types.ts                  # TypeScript type definitions
├── database.ts               # SQLite database layer
├── fxApiClient.ts            # External FX API client
├── services/
│   └── ratesService.ts       # Business logic for rates
├── server/
│   ├── index.ts              # Express app initialization
│   ├── routes.ts             # API route handlers
│   └── middleware.ts         # Error handling and middleware
└── __tests__/                # Unit tests
    ├── fxApiClient.test.ts
    ├── ratesService.test.ts
    └── routes.test.ts
```

## Key Design Decisions

### Caching Strategy
- **In-Memory Cache**: Fast response for repeated requests within TTL
- **Database Cache**: Persistent storage for historical data and fallback
- **Live Refresh**: Optional real-time updates via query parameter

### Error Handling
- Graceful fallback to cached data when external API fails
- Specific error messages for different failure scenarios
- HTTP status codes follow REST conventions

### Architecture
- **Service Layer**: Business logic separated from route handlers
- **Type Safety**: Full TypeScript with strict mode enabled
- **Testability**: Dependencies injected and mockable for unit tests

## Database Schema

The SQLite database contains a single table:

```sql
CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  timestamp DATETIME NOT NULL,
  UNIQUE(base_currency, target_currency, date(timestamp))
);

CREATE INDEX idx_base_target_timestamp 
ON exchange_rates(base_currency, target_currency, timestamp);
```

## Performance

- **Response Times**: Cached requests return in < 10ms
- **Database Queries**: Indexed for fast lookups
- **API Calls**: Cached for up to 60 minutes (configurable)
- **Memory Usage**: Minimal with configurable cache expiry

## Troubleshooting

### "Invalid API key" Error
- Verify your FX_API_KEY in the `.env` file
- Ensure the key is correct from ExchangeRate-API

### "No historical data found" Error
- Historical data depends on what has been previously fetched
- Use the current rates endpoint first to populate data
- Or seed the database with historical data

### Timeout Errors
- Check your network connection
- Verify the FX API is accessible
- Consider increasing the timeout in `fxApiClient.ts`

## License

MIT

## Authors

Wilburm and contributors
