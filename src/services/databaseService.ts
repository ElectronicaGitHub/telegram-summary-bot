import { createConnection, Connection, Repository } from 'typeorm';
import { User } from '../entities/User';
import { Channel } from '../entities/Channel';
import { Summary } from '../entities/Summary';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class DatabaseService {
  private connection: Connection | null = null;

  public async connect(): Promise<void> {
    try {
      this.connection = await createConnection({
        type: 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        entities: [User, Channel, Summary],
        synchronize: true,
        logging: false,
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
