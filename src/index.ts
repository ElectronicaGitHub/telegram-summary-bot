import { app, startApp } from './app';
import { CONSTANTS } from './config/consts';
import { logger } from './utils/logger';
import { telegramService } from './services/telegramService';

async function main() {
  try {
    if (!CONSTANTS.TELEGRAM.SESSION_STRING) {
      logger.warn('TELEGRAM_SESSION_STRING is not set. The MTProto client may need to be authenticated.');
    }

    await startApp();
    
    // Remove this line as it's already handled in startApp()
    // app.listen(CONSTANTS.SERVER.PORT, '0.0.0.0', () => {
    //   logger.info(`Server is running on port ${CONSTANTS.SERVER.PORT}`);
    // });

    // Initialize the Telegram bot and MTProto client
    await telegramService.init();
    logger.info('Telegram services initialized successfully');
  } catch (error) {
    logger.error('Error starting the application:', error);
    process.exit(1);
  }
}

main();
