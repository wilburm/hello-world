import express from 'express';
import { database } from './database';
import { config } from './config';
import routes from './server/routes';
import { errorHandler, notFoundHandler } from './server/middleware';

const app = express();

app.use(express.json());
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await database.initialize();
    console.log('Database initialized successfully');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start().catch(console.error);

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

export default app;
