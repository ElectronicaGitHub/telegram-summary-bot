import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export const CONSTANTS = {
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    API_ID: process.env.TELEGRAM_API_ID || '',
    API_HASH: process.env.TELEGRAM_API_HASH || '',
    SESSION_STRING: process.env.TELEGRAM_SESSION_STRING || '',
  },
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || '',
  },
  DATABASE: {
    HOST: process.env.PGHOST || 'localhost',
    PORT: parseInt(process.env.PGPORT || '5432', 10),
    USERNAME: process.env.PGUSER || '',
    PASSWORD: process.env.PGPASSWORD || '',
    DATABASE: process.env.PGDATABASE || '',
  },
  SERVER: {
    PORT: parseInt(process.env.PORT || '3000', 10), // Changed default port to 3000
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_API_ID',
  'TELEGRAM_API_HASH',
  'OPENAI_API_KEY',
  'PGHOST',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.warn(`Missing environment variable: ${envVar}. Please check your .env file.`);
  }
}
