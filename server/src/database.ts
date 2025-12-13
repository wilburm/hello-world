import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { ExchangeRate } from './types';
import { config } from './config';

class Database {
  private db: sqlite3.Database | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbPath = config.database.path;
      const dbDir = path.dirname(dbPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        this.db!.run(
          `
          CREATE TABLE IF NOT EXISTS exchange_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            base_currency TEXT NOT NULL,
            target_currency TEXT NOT NULL,
            rate REAL NOT NULL,
            timestamp DATETIME NOT NULL,
            UNIQUE(base_currency, target_currency, date(timestamp))
          )
        `,
          (err) => {
            if (err) reject(err);
          }
        );

        this.db!.run(
          `
          CREATE INDEX IF NOT EXISTS idx_base_target_timestamp 
          ON exchange_rates(base_currency, target_currency, timestamp)
        `,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
  }

  async insertRate(rate: ExchangeRate): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `
        INSERT OR REPLACE INTO exchange_rates 
        (base_currency, target_currency, rate, timestamp) 
        VALUES (?, ?, ?, ?)
      `,
        [rate.baseCurrency, rate.targetCurrency, rate.rate, rate.timestamp.toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async insertRates(rates: ExchangeRate[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        const stmt = this.db!.prepare(
          `
          INSERT OR REPLACE INTO exchange_rates 
          (base_currency, target_currency, rate, timestamp) 
          VALUES (?, ?, ?, ?)
        `
        );

        rates.forEach((rate) => {
          stmt.run(
            [rate.baseCurrency, rate.targetCurrency, rate.rate, rate.timestamp.toISOString()],
            (err) => {
              if (err) reject(err);
            }
          );
        });

        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async getLatestRate(
    baseCurrency: string,
    targetCurrency: string
  ): Promise<ExchangeRate | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      interface RateRow {
        id: number;
        baseCurrency: string;
        targetCurrency: string;
        rate: number;
        timestamp: string;
      }

      this.db.get(
        `
        SELECT id, base_currency as baseCurrency, target_currency as targetCurrency, 
               rate, timestamp 
        FROM exchange_rates 
        WHERE base_currency = ? AND target_currency = ?
        ORDER BY timestamp DESC 
        LIMIT 1
      `,
        [baseCurrency, targetCurrency],
        (err, row: RateRow | undefined) => {
          if (err) reject(err);
          else if (row) {
            resolve({
              id: row.id,
              baseCurrency: row.baseCurrency,
              targetCurrency: row.targetCurrency,
              rate: row.rate,
              timestamp: new Date(row.timestamp),
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getLatestRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      interface RateRow {
        id: number;
        baseCurrency: string;
        targetCurrency: string;
        rate: number;
        timestamp: string;
      }

      const placeholders = targetCurrencies.map(() => '?').join(',');
      const query = `
        SELECT id, base_currency as baseCurrency, target_currency as targetCurrency, 
               rate, timestamp 
        FROM exchange_rates 
        WHERE base_currency = ? AND target_currency IN (${placeholders})
        AND timestamp = (
          SELECT MAX(timestamp) 
          FROM exchange_rates er2 
          WHERE er2.base_currency = exchange_rates.base_currency 
          AND er2.target_currency = exchange_rates.target_currency
        )
      `;

      this.db.all(query, [baseCurrency, ...targetCurrencies], (err, rows: RateRow[] | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            (rows || []).map((row) => ({
              id: row.id,
              baseCurrency: row.baseCurrency,
              targetCurrency: row.targetCurrency,
              rate: row.rate,
              timestamp: new Date(row.timestamp),
            }))
          );
        }
      });
    });
  }

  async getHistoricalRates(
    baseCurrency: string,
    targetCurrency: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExchangeRate[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      interface RateRow {
        id: number;
        baseCurrency: string;
        targetCurrency: string;
        rate: number;
        timestamp: string;
      }

      this.db.all(
        `
        SELECT id, base_currency as baseCurrency, target_currency as targetCurrency, 
               rate, timestamp 
        FROM exchange_rates 
        WHERE base_currency = ? AND target_currency = ?
        AND timestamp BETWEEN ? AND ?
        ORDER BY timestamp ASC
      `,
        [baseCurrency, targetCurrency, startDate.toISOString(), endDate.toISOString()],
        (err, rows: RateRow[] | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              (rows || []).map((row) => ({
                id: row.id,
                baseCurrency: row.baseCurrency,
                targetCurrency: row.targetCurrency,
                rate: row.rate,
                timestamp: new Date(row.timestamp),
              }))
            );
          }
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export const database = new Database();
