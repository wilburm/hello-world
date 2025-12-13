# Exchange rates schema (Prisma + SQLite)

This repo introduces a lightweight database layer using **Prisma ORM** with **SQLite** for development (and a schema that’s straightforward to swap to Postgres later).

## Setup

```bash
npm install
cp .env.example .env
```

By default `.env.example` uses SQLite:

```env
DATABASE_URL="file:./dev.db"
```

## Run migrations

Create/apply migrations in development:

```bash
npm run migrate:dev
```

Apply existing migrations (e.g. CI / production-like environments):

```bash
npm run migrate:deploy
```

## Prisma schema

To swap to Postgres later, change `datasource db { provider = "sqlite" }` to `postgresql` in `prisma/schema.prisma` and update `DATABASE_URL` accordingly.

The `exchange_rates` table stores:

- `timestamp`: when the rate was observed
- `baseCurrency`: base currency (expected `CNY`)
- `counterCurrency`: counter currency (e.g. `USD`, `EUR`, `GBP`)
- `rate`: numeric rate value
- `source`: data source identifier
- `metadata`: optional JSON metadata

## Repository helpers

See `src/repositories/exchangeRatesRepository.ts` for utilities to:

- Create/read/update/delete rates
- Query the latest rate for a currency pair
- Query a historical time series by currency pair and time range

## Tests

```bash
npm test
```

Tests run Prisma migrations against a temporary SQLite database and validate CRUD and query helpers.
