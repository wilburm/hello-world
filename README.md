# Currency Dashboard

A comprehensive React-based dashboard for monitoring CNY exchange rates with real-time updates, historical charts, and detailed data tables.

## Features

### 🏦 Live Exchange Rates
- Real-time CNY to USD/EUR/GBP rate cards
- Auto-refresh every 30 seconds
- Visual change indicators with trend arrows
- Loading and error states with retry functionality

### 📈 Historical Charts
- Interactive line charts using Recharts
- Selectable date ranges (7 days, 30 days, 90 days, 1 year)
- Multiple currency pairs (CNY→USD, CNY→EUR, CNY→GBP)
- Responsive design with hover tooltips

### 📋 Data History Table
- Paginated records with configurable page sizes
- Advanced filtering by date range and currency
- Sortable columns (date, currency, rate, source)
- Real-time data updates

### ♿ Accessibility (WCAG 2.1)
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators

### 📱 Responsive Design
- Desktop, tablet, and mobile optimized
- Flexible grid layouts
- Touch-friendly controls
- Consistent styling across devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Recharts** - Chart library for historical data
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple scripts

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Start the development servers:**
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run client       # Start frontend only
npm run server       # Start backend only

# Building
npm run build        # Build frontend for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Architecture

### Backend API Structure

```
/api/
├── /rates/current       # Get current exchange rates
├── /rates/history       # Get historical rates for charts
├── /rates/history-table # Get paginated rate history
├── /rates               # Insert new rate data
├── /currencies          # Get available currencies
└── /collect-data        # Trigger data collection
```

### Frontend Component Structure

```
src/
├── components/
│   ├── LiveRateCard.jsx     # Individual rate display cards
│   ├── RateChart.jsx        # Historical chart component
│   └── HistoryTable.jsx     # Paginated data table
├── services/
│   └── api.js              # API client and endpoints
├── App.jsx                 # Main application component
├── App.css                 # App-specific styles
├── index.css               # Global styles and utilities
└── main.jsx                # Application entry point
```

## API Endpoints

### GET `/api/rates/current`
Get current exchange rates for CNY base currency.

**Response:**
```json
{
  "success": true,
  "data": {
    "base": "CNY",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "rates": [
      {
        "currency": "USD",
        "rate": 0.1485,
        "change": 0.002
      }
    ]
  }
}
```

### GET `/api/rates/history`
Get historical rates for charting.

**Query Parameters:**
- `base` - Base currency (default: CNY)
- `target` - Target currency (default: USD)
- `from` - Start date (YYYY-MM-DD)
- `to` - End date (YYYY-MM-DD)
- `limit` - Maximum records (default: 100)

### GET `/api/rates/history-table`
Get paginated historical rate records.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `sortBy` - Sort column (default: timestamp)
- `sortOrder` - Sort direction (ASC/DESC)
- `baseCurrency` - Filter by base currency
- `targetCurrency` - Filter by target currency
- `fromDate` - Filter from date
- `toDate` - Filter to date

### POST `/api/collect-data`
Trigger currency data collection (simulates scheduled tasks).

## Data Collection

### Automated Collection
The system includes a data collector that can run on schedule:

```bash
# Manual collection
node data-collector.js collect

# Batch collection for multiple currencies
node data-collector.js batch CNY,EUR,USD

# Cleanup old data (keep last 90 days)
node data-collector.js cleanup 90

# Health check
node data-collector.js health
```

### Cron Schedule Example
Add to crontab for automated data collection every 30 minutes:

```bash
*/30 * * * * cd /path/to/project && node data-collector.js collect >> collection.log 2>&1
```

## Database Schema

### currency_rates Table
```sql
CREATE TABLE currency_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'api'
);
```

### Indexes
- `idx_currencies_timestamp` - Optimizes currency and time-based queries

## Configuration

### Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api
API_PORT=5000
API_TIMEOUT=10000

# Database
DATABASE_PATH=./server/currency.db

# Rate Settings
BASE_CURRENCY=CNY
REFRESH_INTERVAL=30000
CHART_DEFAULT_RANGE=30

# Development
NODE_ENV=development
```

## Accessibility Features

### WCAG 2.1 Compliance
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels, roles, and semantic HTML
- **Color Contrast**: Meets AA standards for text and background colors
- **Focus Management**: Visible focus indicators and logical tab order
- **Touch Targets**: Minimum 44px for mobile interactions
- **Motion**: Respects prefers-reduced-motion settings

### Testing Accessibility
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react

# Run accessibility audit
npx axe-cli http://localhost:3000
```

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 641px - 1024px  
- **Desktop**: > 1024px

## Performance Optimizations

- **Code Splitting**: Lazy loading for chart components
- **Caching**: API response caching with appropriate headers
- **Pagination**: Efficient data loading for large datasets
- **Bundle Optimization**: Vite's built-in optimizations
- **Image Optimization**: Responsive images with proper sizing

## Error Handling

### Frontend
- Network error boundaries
- Loading states for all async operations
- User-friendly error messages
- Retry mechanisms for failed requests

### Backend
- Request validation
- Error logging
- Graceful degradation
- Health check endpoints

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y

# Generate coverage report
npm run test:coverage
```

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "server"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure proper database path
- Set up SSL certificates
- Configure CORS for production domains

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Ensure accessibility compliance
4. Update documentation
5. Run linting and formatting

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the project issue tracker.