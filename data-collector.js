#!/usr/bin/env node

/**
 * Data Collector Script
 * Collects currency rates and stores them in the database
 * Can be run manually or scheduled via cron
 */

import axios from 'axios';
import { setTimeout } from 'timers/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'sqlite3';
const { Database } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  TARGET_CURRENCIES: ['USD', 'EUR', 'GBP'],
  DB_PATH: join(__dirname, 'server', 'currency.db'),
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  REQUEST_TIMEOUT: 10000
};

// Initialize database connection
const db = new Database(CONFIG.DB_PATH);

// Utility functions
const sleep = (ms) => setTimeout(ms);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS currency_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_currency TEXT NOT NULL,
          target_currency TEXT NOT NULL,
          rate REAL NOT NULL,
          source TEXT DEFAULT 'scheduled',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_currencies_timestamp 
        ON currency_rates(base_currency, target_currency, timestamp)
      `);
      
      resolve();
    });
  });
}

function updateLastCollectionTimestamp() {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO metadata (key, value, updated_at)
      VALUES ('last_collection', ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [new Date().toISOString()], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

function generateMockRates() {
  console.log('Generating mock rates for data collection...');
  
  const baseRates = {
    USD: 0.1485,
    EUR: 0.1362,
    GBP: 0.1189
  };
  
  const rates = {};
  
  for (const currency of CONFIG.TARGET_CURRENCIES) {
    const baseRate = baseRates[currency];
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    rates[currency] = parseFloat((baseRate + variation).toFixed(6));
  }
  
  return {
    success: true,
    rates,
    source: 'scheduled',
    timestamp: new Date().toISOString()
  };
}

function insertRatesToDatabase(baseCurrency, rates, source) {
  return new Promise((resolve, reject) => {
    const insertPromises = Object.entries(rates).map(([targetCurrency, rate]) => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO currency_rates (base_currency, target_currency, rate, source)
          VALUES (?, ?, ?, ?)
        `;
        
        db.run(query, [baseCurrency, targetCurrency, rate, source], function(err) {
          if (err) {
            console.error(`Failed to insert rate for ${targetCurrency}:`, err.message);
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              baseCurrency,
              targetCurrency,
              rate,
              source
            });
          }
        });
      });
    });
    
    Promise.allSettled(insertPromises)
      .then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        resolve({
          successful,
          failed,
          total: results.length,
          records: results.filter(r => r.status === 'fulfilled').map(r => r.value)
        });
      })
      .catch(reject);
  });
}

async function collectData() {
  console.log('Starting currency data collection...');
  
  try {
    await initializeDatabase();
    
    // Generate mock rates (in production, this would fetch from real APIs)
    const result = generateMockRates();
    
    if (!result.success) {
      throw new Error('Failed to generate rates');
    }
    
    // Insert rates into database
    console.log('Inserting rates into database...');
    const insertResult = await insertRatesToDatabase('CNY', result.rates, result.source);
    
    // Update last collection timestamp
    await updateLastCollectionTimestamp();
    
    console.log(`Collection completed successfully!`);
    console.log(`- Source: ${result.source}`);
    console.log(`- Rates collected: ${insertResult.successful}/${insertResult.total}`);
    console.log(`- Timestamp: ${result.timestamp}`);
    
    return {
      success: true,
      source: result.source,
      timestamp: result.timestamp,
      collected: insertResult.successful,
      failed: insertResult.failed,
      total: insertResult.total,
      rates: result.rates
    };
    
  } catch (error) {
    console.error('Data collection failed:', error);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function collectDataWithRetry(maxRetries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Collection attempt ${attempt}/${maxRetries}`);
      
      const result = await collectData();
      
      if (result.success) {
        return result;
      }
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${result.error}`);
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY}ms...`);
      await sleep(CONFIG.RETRY_DELAY);
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      await sleep(CONFIG.RETRY_DELAY);
    }
  }
}

async function cleanupOldData(daysToKeep = 90) {
  console.log(`Cleaning up data older than ${daysToKeep} days...`);
  
  return new Promise((resolve, reject) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const query = `
      DELETE FROM currency_rates 
      WHERE timestamp < ?
    `;
    
    db.run(query, [cutoffDate.toISOString()], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Deleted ${this.changes} old records`);
        resolve(this.changes);
      }
    });
  });
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  console.log('Currency Data Collector');
  console.log('=======================');
  
  switch (command) {
    case 'collect':
      collectDataWithRetry()
        .then(result => {
          console.log('\nFinal result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('\nFatal error:', error);
          process.exit(1);
        });
      break;
      
    case 'cleanup':
      const days = parseInt(process.argv[3]) || 90;
      initializeDatabase()
        .then(() => cleanupOldData(days))
        .then(deleted => {
          console.log(`\nCleanup completed. Deleted ${deleted} records.`);
          process.exit(0);
        })
        .catch(error => {
          console.error('\nCleanup error:', error);
          process.exit(1);
        });
      break;
      
    case 'health':
      initializeDatabase()
        .then(() => {
          const query = `
            SELECT COUNT(*) as count, 
                   MAX(timestamp) as last_record
            FROM currency_rates
          `;
          
          db.get(query, (err, row) => {
            if (err) {
              console.error('Health check failed:', err);
              process.exit(1);
            } else {
              console.log('Health check passed:');
              console.log(`- Total records: ${row.count}`);
              console.log(`- Last record: ${row.last_record || 'None'}`);
              process.exit(0);
            }
          });
        })
        .catch(error => {
          console.error('Health check failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
Usage: node data-collector.js <command>

Commands:
  collect    - Collect currency rates once
  cleanup    - Clean up old data (usage: cleanup [days])
  health     - Check system health
  
Examples:
  node data-collector.js collect
  node data-collector.js cleanup 90
  node data-collector.js health
      `);
      process.exit(0);
  }
}

export {
  collectData,
  collectDataWithRetry,
  cleanupOldData,
  generateMockRates
};