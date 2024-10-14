import dotenv from 'dotenv';

dotenv.config();

export const CONSTANTS = {
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
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
    PORT: parseInt(process.env.PORT || '8000', 10),
  },
};
