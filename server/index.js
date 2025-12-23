import express from 'express';
import cors from 'cors';
import pkg from 'sqlite3';
const { Database } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'currency.db');
const db = new Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS currency_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      rate REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      source TEXT DEFAULT 'manual'
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_currencies_timestamp 
    ON currency_rates(base_currency, target_currency, timestamp)
  `);
});

// Mock data for demonstration
const mockRates = {
  CNY: {
    USD: 0.1485,
    EUR: 0.1362,
    GBP: 0.1189
  }
};

// API Routes

// Get current rates
app.get('/api/rates/current', (req, res) => {
  try {
    const { base = 'CNY' } = req.query;
    const rates = mockRates[base] || {};
    
    res.json({
      success: true,
      data: {
        base,
        timestamp: new Date().toISOString(),
        rates: Object.entries(rates).map(([currency, rate]) => ({
          currency,
          rate,
          change: (Math.random() - 0.5) * 0.01 // Random change for demo
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current rates'
    });
  }
});

// Get historical rates for chart
app.get('/api/rates/history', (req, res) => {
  try {
    const { 
      base = 'CNY', 
      target = 'USD', 
      from, 
      to,
      limit = 100 
    } = req.query;

    // Generate mock historical data
    const now = new Date();
    const days = Math.min(parseInt(limit) || 100, 1000);
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const baseRate = mockRates[base]?.[target] || 0.1485;
      const variation = (Math.random() - 0.5) * 0.02;
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: baseRate + variation,
        currency: target
      });
    }

    res.json({
      success: true,
      data: {
        base,
        target,
        from: from || data[0]?.date,
        to: to || data[data.length - 1]?.date,
        series: data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical rates'
    });
  }
});

// Get paginated history records
app.get('/api/rates/history-table', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'DESC',
      baseCurrency,
      targetCurrency,
      fromDate,
      toDate
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM currency_rates WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM currency_rates WHERE 1=1';
    const params = [];

    if (baseCurrency) {
      query += ' AND base_currency = ?';
      countQuery += ' AND base_currency = ?';
      params.push(baseCurrency);
    }

    if (targetCurrency) {
      query += ' AND target_currency = ?';
      countQuery += ' AND target_currency = ?';
      params.push(targetCurrency);
    }

    if (fromDate) {
      query += ' AND timestamp >= ?';
      countQuery += ' AND timestamp >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND timestamp <= ?';
      countQuery += ' AND timestamp <= ?';
      params.push(toDate);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    // Execute queries
    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch count'
        });
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch history records'
          });
        }

        res.json({
          success: true,
          data: {
            records: rows.map(row => ({
              id: row.id,
              baseCurrency: row.base_currency,
              targetCurrency: row.target_currency,
              rate: row.rate,
              timestamp: row.timestamp,
              source: row.source
            })),
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: countResult.total,
              totalPages: Math.ceil(countResult.total / parseInt(limit))
            }
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history table data'
    });
  }
});

// Insert new rate data (for data collector)
app.post('/api/rates', (req, res) => {
  try {
    const { baseCurrency, targetCurrency, rate, source = 'api' } = req.body;

    if (!baseCurrency || !targetCurrency || !rate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const query = `
      INSERT INTO currency_rates (base_currency, target_currency, rate, source)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [baseCurrency, targetCurrency, rate, source], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to insert rate data'
        });
      }

      res.json({
        success: true,
        data: {
          id: this.lastID,
          baseCurrency,
          targetCurrency,
          rate,
          source
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to insert rate data'
    });
  }
});

// Get available currencies
app.get('/api/currencies', (req, res) => {
  res.json({
    success: true,
    data: {
      base: ['CNY'],
      target: ['USD', 'EUR', 'GBP']
    }
  });
});

// Data collector endpoint (scheduled task simulation)
app.post('/api/collect-data', (req, res) => {
  try {
    const { baseCurrency = 'CNY' } = req.body;
    const rates = mockRates[baseCurrency];

    if (!rates) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported base currency'
      });
    }

    const insertPromises = Object.entries(rates).map(([targetCurrency, rate]) => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO currency_rates (base_currency, target_currency, rate, source)
          VALUES (?, ?, ?, ?)
        `;
        
        db.run(query, [baseCurrency, targetCurrency, rate + (Math.random() - 0.5) * 0.01, 'scheduled'], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => {
        res.json({
          success: true,
          message: 'Data collection completed',
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          error: 'Failed to collect data'
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Data collection failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});