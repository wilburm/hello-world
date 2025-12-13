-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "counterCurrency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "exchange_rates_baseCurrency_counterCurrency_timestamp_idx" ON "exchange_rates"("baseCurrency", "counterCurrency", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_timestamp_baseCurrency_counterCurrency_source_key" ON "exchange_rates"("timestamp", "baseCurrency", "counterCurrency", "source");
