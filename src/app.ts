import express from 'express';
import cron from 'node-cron';
import { databaseService } from './services/databaseService';
import { summaryController } from './controllers/summaryController';
import { logger } from './utils/logger';
import { CONSTANTS } from './config/consts';

export const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Telegram Channel Summarizer API is running' });
});

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

    const port = CONSTANTS.SERVER.PORT;
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server is running on port ${port}`);
    });

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};
