import { app, startApp } from './app';
import { CONSTANTS } from './config/consts';
import { logger } from './utils/logger';

startApp();

app.listen(CONSTANTS.SERVER.PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${CONSTANTS.SERVER.PORT}`);
});
