import express from 'express';
import cron from 'node-cron';
import { databaseService } from './services/databaseService';
import { summaryController } from './controllers/summaryController';
import { logger } from './utils/logger';

export const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export const startApp = async () => {
  try {
    await databaseService.connect();

    // Schedule summary generation every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running scheduled summary generation');
      await summaryController.generateSummaries();
    });

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};
