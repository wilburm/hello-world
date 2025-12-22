# Development Guide

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create environment configuration:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Backend API Requirements

The dashboard requires a backend API with the following endpoints:

### 1. Live Rates Endpoint
```
GET /api/rates/live
```

Returns current exchange rates:
```json
[
  {
    "currency": "USD",
    "rate": 0.1385,
    "change": 0.25,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "currency": "EUR",
    "rate": 0.1271,
    "change": -0.15,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "currency": "GBP",
    "rate": 0.1098,
    "change": 0.08,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Historical Rates Endpoint
```
GET /api/rates/historical?currency=USD&startDate=2024-01-01&endDate=2024-01-15
```

Returns historical data points:
```json
[
  {
    "date": "2024-01-01",
    "rate": 0.1380
  },
  {
    "date": "2024-01-02",
    "rate": 0.1382
  }
]
```

### 3. Rate History Endpoint (Paginated)
```
GET /api/rates/history?page=1&pageSize=25&sortField=timestamp&sortDirection=desc
```

Returns paginated rate records:
```json
{
  "data": [
    {
      "id": "1",
      "baseCurrency": "CNY",
      "targetCurrency": "USD",
      "rate": 0.1385,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 25,
  "totalPages": 4
}
```

## Development Without Backend

If you want to test the UI without a backend, you can modify `src/services/api.ts` to return mock data instead of making real API calls.

Example mock implementation:
```typescript
async getLiveRates(): Promise<LiveRate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      currency: 'USD',
      rate: 0.1385 + (Math.random() - 0.5) * 0.001,
      change: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString(),
    },
    // ... more mock data
  ];
}
```

## Common Development Tasks

### Type Checking
```bash
npm run typecheck
```

### Building for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors when connecting to the backend API, ensure your backend server allows requests from `http://localhost:3000` or configure a proxy in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Connection Refused
If you see "Connection refused" errors, verify:
1. Backend server is running
2. `VITE_API_BASE_URL` in `.env` is correct
3. Network allows connections between frontend and backend

## Code Style

- Use TypeScript strict mode
- Follow existing component patterns
- Add ARIA labels for accessibility
- Include loading and error states
- Use CSS Modules for styling
- Keep components focused and single-responsibility
