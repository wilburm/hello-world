import type { ExchangeRate, Prisma } from '@prisma/client';

import { prisma } from '../db/prisma';

export type ExchangeRateCreateInput = Omit<
  Prisma.ExchangeRateCreateInput,
  'createdAt'
>;

export async function createExchangeRate(
  data: ExchangeRateCreateInput
): Promise<ExchangeRate> {
  return prisma.exchangeRate.create({ data });
}

export async function getExchangeRateById(id: number): Promise<ExchangeRate | null> {
  return prisma.exchangeRate.findUnique({ where: { id } });
}

export async function updateExchangeRateById(
  id: number,
  data: Prisma.ExchangeRateUpdateInput
): Promise<ExchangeRate> {
  return prisma.exchangeRate.update({ where: { id }, data });
}

export async function deleteExchangeRateById(id: number): Promise<ExchangeRate> {
  return prisma.exchangeRate.delete({ where: { id } });
}

export async function getLatestExchangeRate(params: {
  baseCurrency: string;
  counterCurrency: string;
  source?: string;
}): Promise<ExchangeRate | null> {
  const { baseCurrency, counterCurrency, source } = params;

  return prisma.exchangeRate.findFirst({
    where: {
      baseCurrency,
      counterCurrency,
      ...(source ? { source } : {})
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
}

export async function listExchangeRateSeries(params: {
  baseCurrency: string;
  counterCurrency: string;
  source?: string;
  from?: Date;
  to?: Date;
}): Promise<ExchangeRate[]> {
  const { baseCurrency, counterCurrency, source, from, to } = params;

  return prisma.exchangeRate.findMany({
    where: {
      baseCurrency,
      counterCurrency,
      ...(source ? { source } : {}),
      ...(from || to
        ? {
            timestamp: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {})
            }
          }
        : {})
    },
    orderBy: {
      timestamp: 'asc'
    }
  });
}
