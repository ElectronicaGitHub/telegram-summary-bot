import { app, startApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

startApp();

app.listen(config.server.port, '0.0.0.0', () => {
  logger.info(`Server is running on port ${config.server.port}`);
});
