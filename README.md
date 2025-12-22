# Currency Exchange Rate Dashboard

A modern, responsive React-based dashboard for monitoring CNY (Chinese Yuan) exchange rates against USD, EUR, and GBP.

## Features

### 1. Live Rate Cards
- Real-time display of current exchange rates for CNY → USD, EUR, and GBP
- Auto-refresh polling every 30 seconds
- Visual indicators for rate changes (positive/negative)
- Last updated timestamps

### 2. Historical Chart
- Interactive line chart showing exchange rate trends
- Selectable currency pairs
- Multiple date range options (7, 30, 90, 180 days)
- Responsive chart that adapts to screen size

### 3. Rate History Table
- Paginated table displaying detailed rate records
- Sortable columns (timestamp, currency, rate)
- Filtering options:
  - Currency pair
  - Date range (from/to)
- Configurable page size (10, 25, 50, 100 records)
- Keyboard navigation support

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Chart library
- **Axios** - API client
- **CSS Modules** - Scoped styling

## Prerequisites

- Node.js 16+ and npm
- Backend API server running (default: http://localhost:8000)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the API endpoint if needed:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

## API Integration

The dashboard expects the following backend API endpoints:

### GET /api/rates/live
Returns current exchange rates for all currency pairs.

**Response:**
```json
[
  {
    "currency": "USD",
    "rate": 0.1385,
    "change": 0.25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/rates/historical
Returns historical rate data for a specific currency pair.

**Query Parameters:**
- `currency` (string): Target currency (USD, EUR, or GBP)
- `startDate` (string): Start date in ISO format
- `endDate` (string): End date in ISO format

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "rate": 0.1385
  }
]
```

### GET /api/rates/history
Returns paginated rate history with sorting and filtering.

**Query Parameters:**
- `page` (number): Page number
- `pageSize` (number): Records per page
- `sortField` (string): Field to sort by
- `sortDirection` (string): 'asc' or 'desc'
- `currency` (string, optional): Filter by currency
- `dateFrom` (string, optional): Filter from date
- `dateTo` (string, optional): Filter to date

**Response:**
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

## Accessibility

The dashboard follows WCAG 2.1 Level AA standards:

- Semantic HTML structure
- ARIA labels and landmarks
- Keyboard navigation support
- Color contrast ratios meet accessibility standards
- Screen reader compatible
- Reduced motion support

## Responsive Design

The dashboard is optimized for:
- **Desktop**: Full-featured layout with side-by-side components
- **Tablet**: Adjusted grid layouts for medium screens
- **Mobile**: Stacked components with simplified navigation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Project Structure

```
project/
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx
│   │   ├── LiveRateCards.tsx
│   │   ├── HistoricalChart.tsx
│   │   ├── HistoryTable.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorMessage.tsx
│   ├── services/          # API services
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── formatters.ts
│   ├── styles/            # CSS modules
│   │   ├── global.css
│   │   └── *.module.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## License

ISC
