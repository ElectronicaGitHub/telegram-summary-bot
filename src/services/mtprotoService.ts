import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logger } from '../utils/logger';
import { CONSTANTS } from '../config/consts';

interface AuthInputs {
  phoneNumber: () => Promise<string>;
  password: () => Promise<string>;
  phoneCode: () => Promise<string>;
  onError: (err: Error) => void;
}

class MTProtoService {
  private client: TelegramClient | null = null;
  private stringSession: StringSession;

  constructor() {
    this.stringSession = new StringSession('');
  }

  public async init(sessionString: string): Promise<void> {
    try {
      const apiId = parseInt(CONSTANTS.TELEGRAM.API_ID, 10);
      const apiHash = CONSTANTS.TELEGRAM.API_HASH;

      this.stringSession = new StringSession(sessionString);
      this.client = new TelegramClient(this.stringSession, apiId, apiHash, {
        connectionRetries: 5,
        retryDelay: 1000,
      });

      await this.client.connect();
      logger.info('MTProto client initialized successfully');
    } catch (error) {
      logger.error('Error initializing MTProto client:', error);
      throw error;
    }
  }

  public async authenticate(authInputs: AuthInputs): Promise<string> {
    try {
      const apiId = parseInt(CONSTANTS.TELEGRAM.API_ID, 10);
      const apiHash = CONSTANTS.TELEGRAM.API_HASH;

      this.stringSession = new StringSession('');
      this.client = new TelegramClient(this.stringSession, apiId, apiHash, {
        connectionRetries: 5,
        retryDelay: 1000,
      });

      await this.client.start({
        phoneNumber: authInputs.phoneNumber,
        password: authInputs.password,
        phoneCode: authInputs.phoneCode,
        onError: authInputs.onError,
      });

      const sessionString = this.client.session.save() as unknown as string;
      logger.info('Authentication successful');
      return sessionString;
    } catch (error) {
      logger.error('Error during authentication:', error);
      throw error;
    }
  }

  public async getChannelMessages(channelId: string, limit: number = 100): Promise<any[]> {
    if (!this.client) {
      throw new Error('MTProto client not initialized');
    }

    try {
      logger.info(`Fetching messages for channel: ${channelId}`);
      const entity = await this.client.getInputEntity(channelId);
      const messages = await this.client.getMessages(entity, { limit });

      logger.info(`Successfully fetched ${messages.length} messages from channel: ${channelId}`);

      return messages.map(msg => ({
        id: msg.id,
        date: msg.date,
        message: msg.message,
        fromId: msg.fromId ? msg.fromId.toString() : undefined,
        replyToMsgId: msg.replyTo ? msg.replyTo.replyToMsgId : undefined,
        media: msg.media ? this.parseMedia(msg.media) : undefined,
        entities: msg.entities ? this.parseEntities(msg.entities) : undefined,
      }));
    } catch (error) {
      logger.error(`Error fetching channel messages for ${channelId}:`, error);
      return [];
    }
  }

  private parseMedia(media: any): any {
    if (media instanceof Api.MessageMediaPhoto) {
      return { type: 'photo', id: media.photo?.id.toString() };
    } else if (media instanceof Api.MessageMediaDocument) {
      return { type: 'document', id: media.document?.id.toString() };
    }
    return { type: 'unknown' };
  }

  private parseEntities(entities: any[]): any[] {
    return entities.map(entity => {
      if (entity instanceof Api.MessageEntityTextUrl) {
        return { type: 'text_link', offset: entity.offset, length: entity.length, url: entity.url };
      } else if (entity instanceof Api.MessageEntityMention) {
        return { type: 'mention', offset: entity.offset, length: entity.length };
      }
      return { type: 'unknown', offset: entity.offset, length: entity.length };
    });
  }

  public async joinChannel(channelUsername: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('MTProto client not initialized');
    }

    try {
      await this.client.invoke(new Api.channels.JoinChannel({
        channel: channelUsername,
      }));
      logger.info(`Successfully joined channel: ${channelUsername}`);
      return true;
    } catch (error) {
      logger.error(`Error joining channel ${channelUsername}:`, error);
      return false;
    }
  }

  public async getChannelInfo(channelId: string): Promise<any> {
    if (!this.client) {
      throw new Error('MTProto client not initialized');
    }

    try {
      const entity = await this.client.getEntity(channelId);
      return {
        id: entity.id.toString(),
        title: (entity as any).title,
        username: (entity as any).username,
        participantsCount: (entity as any).participantsCount,
        about: (entity as any).about,
      };
    } catch (error) {
      logger.error(`Error fetching channel info for ${channelId}:`, error);
      return null;
    }
  }
}

export const mtprotoService = new MTProtoService();
