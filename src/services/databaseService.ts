import { createConnection, Connection, Repository } from 'typeorm';
import { User } from '../entities/User';
import { Channel } from '../entities/Channel';
import { Summary } from '../entities/Summary';
import { CONSTANTS } from '../config/consts';
import { logger } from '../utils/logger';

class DatabaseService {
  private connection: Connection | null = null;

  public async connect(): Promise<void> {
    try {
      this.connection = await createConnection({
        type: 'postgres',
        host: CONSTANTS.DATABASE.HOST,
        port: CONSTANTS.DATABASE.PORT,
        username: CONSTANTS.DATABASE.USERNAME,
        password: CONSTANTS.DATABASE.PASSWORD,
        database: CONSTANTS.DATABASE.DATABASE,
        entities: [User, Channel, Summary],
        synchronize: true,
        logging: false,
        ssl: {
          rejectUnauthorized: false
        }
      });
      logger.info('Connected to database');
    } catch (error) {
      logger.error('Error connecting to database:', error);
      throw error;
    }
  }

  public getUserRepository(): Repository<User> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection.getRepository(User);
  }

  public getChannelRepository(): Repository<Channel> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection.getRepository(Channel);
  }

  public getSummaryRepository(): Repository<Summary> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection.getRepository(Summary);
  }
}

export const databaseService = new DatabaseService();
