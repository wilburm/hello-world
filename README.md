# Full Stack Monorepo - Exchange Rate Dashboard

A modern full-stack web application with a React dashboard frontend and Node.js/Express backend for exchange rate tracking, organized as a monorepo with shared scripts and configuration.

## Project Structure

```
├── server/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── index.ts     # Express server entry point
│   │   ├── routes.ts    # API routes
│   │   ├── middleware.ts # Error handling
│   │   ├── services/    # Business logic
│   │   ├── config.ts    # Configuration
│   │   ├── database.ts  # SQLite setup
│   │   ├── fxApiClient.ts # External API client
│   │   ├── types.ts     # TypeScript types
│   │   └── __tests__/   # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
├── client/              # Vite + React + TypeScript dashboard
│   ├── src/
│   │   ├── main.tsx     # React entry point
│   │   ├── App.tsx      # Root App component
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client
│   │   ├── theme/       # Theming system
│   │   ├── index.css    # Global styles
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
├── package.json         # Root workspace configuration
├── .prettierrc.json     # Code formatting rules
└── README.md            # This file
```

## Features

### Frontend (React Dashboard)
- **Live Rate Cards**: Real-time exchange rate display with auto-refresh every 30 seconds
- **Interactive Chart**: Line chart showing trends per currency pair with selectable time ranges
- **History Table**: Paginated table of historical exchange rates
- **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark/Light Theme**: Shared theming with accessibility support
- **Loading/Error States**: Graceful handling of async operations

### Backend (Express API)
- **Current Rates Endpoint**: Get latest exchange rates with optional live refresh
- **Historical Rates API**: Query historical data with date ranges
- **Intelligent Caching**: Database caching with configurable TTL
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Type Safety**: Full TypeScript support

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (for workspace support)
- ExchangeRate-API key (get it from https://www.exchangerate-api.com)

## Getting Started

### 1. Install Dependencies

Install all dependencies for both server and client workspaces:

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment files and customize as needed:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Edit `server/.env` with your ExchangeRate-API key:
```env
PORT=3000
NODE_ENV=development
FX_API_KEY=your_api_key_here
FX_API_BASE_URL=https://v6.exchangerate-api.com/v6
DB_PATH=./data/rates.db
CACHE_TTL_MINUTES=60
```

### 3. Development

Run both server and client in development mode with hot reload:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173 (Vite with hot module replacement)
- **Backend**: http://localhost:3000 (Express with auto-reload)

Or run individually in separate terminals:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 4. Build

Build both applications for production:

```bash
npm run build
```

Artifacts will be generated in:
- `server/dist/` - Compiled server code
- `client/dist/` - Optimized client bundle

### 5. Testing

Run tests across all workspaces:

```bash
npm run test
```

### 6. Linting

Check code quality with ESLint:

```bash
npm run lint
```

### 7. Formatting

Format code with Prettier:

```bash
npm run format
```

## Individual Workspace Commands

You can also run commands in a specific workspace:

```bash
# Server only
cd server
npm run dev
npm run build
npm run test
npm run lint

# Client only
cd client
npm run dev
npm run build
npm run test
npm run lint
```

## Technology Stack

### Frontend (client/)
- **React** 18.2 - UI library
- **Vite** 5.0 - Lightning-fast build tool
- **TypeScript** 5.2 - Type safety
- **Recharts** - Charting library
- **Axios** - HTTP client
- **ESLint** - Code quality
- **Prettier** - Code formatting

### Backend (server/)
- **Node.js** - JavaScript runtime
- **Express** 4.18 - Web framework
- **TypeScript** 5.3 - Type safety
- **SQLite** 5.1 - Database
- **Axios** - HTTP client
- **ESLint** - Code quality

## API Endpoints

### Current Rates
```
GET /api/rates/current
Query: ?refresh=true (optional)
```

Response:
```json
{
  "baseCurrency": "CNY",
  "rates": {
    "USD": 0.14,
    "EUR": 0.13,
    "GBP": 0.11
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Historical Rates
```
GET /api/rates/history?pair=USD&start=2024-01-01&end=2024-01-31
```

Response:
```json
{
  "baseCurrency": "CNY",
  "targetCurrency": "USD",
  "data": [
    { "date": "2024-01-01", "rate": 0.14 },
    { "date": "2024-01-02", "rate": 0.142 }
  ],
  "count": 31
}
```

## Development Workflow

1. **Start Development Servers**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit backend code in `server/src/`
   - Edit frontend code in `client/src/`
   - Changes auto-reload in dev mode

3. **Format and Lint**
   ```bash
   npm run format
   npm run lint
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Troubleshooting

### Port Already in Use
- **Frontend**: Edit `client/vite.config.ts` to change the port
- **Backend**: Edit `PORT` in `server/.env`

### Dependencies Not Installing
```bash
rm -rf node_modules server/node_modules client/node_modules
npm install
```

### Type Checking Errors
```bash
npm install
npx tsc --noEmit
```

## License

ISC

## Author

Full Stack Team
