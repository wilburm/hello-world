import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let prisma: typeof import('../src/db/prisma')['prisma'];
let repo: typeof import('../src/repositories/exchangeRatesRepository');
let tempDir: string;

beforeAll(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'exchange-rates-'));
  const dbPath = path.join(tempDir, 'test.db');

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = `file:${dbPath}`;

  execSync('npx prisma migrate deploy', {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit'
  });

  ({ prisma } = await import('../src/db/prisma'));
  repo = await import('../src/repositories/exchangeRatesRepository');
});

afterAll(async () => {
  await prisma.$disconnect();
  await fs.rm(tempDir, { recursive: true, force: true });
});

beforeEach(async () => {
  await prisma.exchangeRate.deleteMany();
});

describe('exchangeRatesRepository', () => {
  it('creates, reads, updates, and deletes an exchange rate', async () => {
    const created = await repo.createExchangeRate({
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'USD',
      rate: 0.14,
      source: 'unit-test',
      metadata: { provider: 'test' }
    });

    const fetched = await repo.getExchangeRateById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.rate).toBeCloseTo(0.14, 10);

    const updated = await repo.updateExchangeRateById(created.id, { rate: 0.141 });
    expect(updated.rate).toBeCloseTo(0.141, 10);

    await repo.deleteExchangeRateById(created.id);
    const afterDelete = await repo.getExchangeRateById(created.id);
    expect(afterDelete).toBeNull();
  });

  it('returns the latest rate for a currency pair', async () => {
    await repo.createExchangeRate({
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'EUR',
      rate: 0.13,
      source: 'unit-test'
    });

    await repo.createExchangeRate({
      timestamp: new Date('2025-01-02T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'EUR',
      rate: 0.131,
      source: 'unit-test'
    });

    const latest = await repo.getLatestExchangeRate({
      baseCurrency: 'CNY',
      counterCurrency: 'EUR'
    });

    expect(latest).not.toBeNull();
    expect(latest?.rate).toBeCloseTo(0.131, 10);
  });

  it('lists a historical series filtered by time range', async () => {
    await repo.createExchangeRate({
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'GBP',
      rate: 0.11,
      source: 'unit-test'
    });

    await repo.createExchangeRate({
      timestamp: new Date('2025-01-02T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'GBP',
      rate: 0.111,
      source: 'unit-test'
    });

    await repo.createExchangeRate({
      timestamp: new Date('2025-01-03T00:00:00.000Z'),
      baseCurrency: 'CNY',
      counterCurrency: 'GBP',
      rate: 0.112,
      source: 'unit-test'
    });

    const series = await repo.listExchangeRateSeries({
      baseCurrency: 'CNY',
      counterCurrency: 'GBP',
      from: new Date('2025-01-02T00:00:00.000Z'),
      to: new Date('2025-01-03T00:00:00.000Z')
    });

    expect(series).toHaveLength(2);
    expect(series[0]?.rate).toBeCloseTo(0.111, 10);
    expect(series[1]?.rate).toBeCloseTo(0.112, 10);
    expect(series[0]?.timestamp.toISOString()).toBe('2025-01-02T00:00:00.000Z');
    expect(series[1]?.timestamp.toISOString()).toBe('2025-01-03T00:00:00.000Z');
  });
});
