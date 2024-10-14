import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  database: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    username: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || '',
  },
  server: {
    port: parseInt(process.env.PORT || '8000', 10),
  },
};
