import { app, startApp } from './app';
import { CONSTANTS } from './config/consts';
import { logger } from './utils/logger';
import { telegramService } from './services/telegramService';

async function main() {
  try {
    await startApp();
    
    app.listen(CONSTANTS.SERVER.PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${CONSTANTS.SERVER.PORT}`);
    });

    // Initialize the Telegram bot
    telegramService.init();
    logger.info('Telegram bot initialized');
  } catch (error) {
    logger.error('Error starting the application:', error);
    process.exit(1);
  }
}

main();
