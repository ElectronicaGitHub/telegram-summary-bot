import TelegramBot from 'node-telegram-bot-api';
import { CONSTANTS } from '../config/consts';
import { logger } from '../utils/logger';
import { botController } from '../controllers/botController';
import { mtprotoService } from './mtprotoService';
import input from 'input';
import * as fs from 'fs';
import * as path from 'path';

class TelegramService {
  private bot: TelegramBot | null = null;

  public async init(): Promise<void> {
    try {
      this.bot = new TelegramBot(CONSTANTS.TELEGRAM.BOT_TOKEN, { polling: true });
      this.setupCommandHandlers();
      this.setupCallbackQueryHandler();

      await this.initMTProto();

      logger.info('Telegram bot and MTProto client initialized');
    } catch (error) {
      logger.error('Error initializing Telegram services:', error);
      throw error;
    }
  }

  private async initMTProto(): Promise<void> {
    let sessionString = this.loadSessionString();

    if (!sessionString) {
      logger.info('No valid session string found. Starting authentication process.');
      sessionString = await this.authenticateMTProto();
    }

    try {
      await mtprotoService.init(sessionString);
      logger.info('MTProto client initialized successfully');
    } catch (error) {
      logger.error('Error initializing MTProto client. Starting new authentication process.');
      sessionString = await this.authenticateMTProto();
      await mtprotoService.init(sessionString);
    }
  }

  private async authenticateMTProto(): Promise<string> {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const sessionString = await mtprotoService.authenticate({
          phoneNumber: async () => await input.text('Please enter your phone number: '),
          password: async () => await input.password('Please enter your 2FA password (if enabled): '),
          phoneCode: async () => await input.text('Please enter the code you received: '),
          onError: (err) => {
            logger.error('Error during MTProto authentication:', err);
            throw err;
          },
        });

        this.saveSessionString(sessionString);
        logger.info('MTProto client authenticated successfully');
        return sessionString;
      } catch (error) {
        logger.error(`Authentication attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries < maxRetries) {
          logger.info(`Retrying authentication (attempt ${retries + 1})...`);
        }
      }
    }

    throw new Error('Failed to authenticate MTProto client after multiple attempts');
  }

  private loadSessionString(): string | null {
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/TELEGRAM_SESSION_STRING=(.*)/);
      return match ? match[1] : null;
    } catch (error) {
      logger.error('Error loading session string:', error);
      return null;
    }
  }

  private saveSessionString(sessionString: string): void {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      const newEnvContent = envContent.replace(
        /TELEGRAM_SESSION_STRING=.*/,
        `TELEGRAM_SESSION_STRING=${sessionString}`
      );
      
      if (envContent !== newEnvContent) {
        fs.writeFileSync(envPath, newEnvContent);
        logger.info('Updated .env file with new session string');
      } else {
        logger.info('Session string in .env file is already up to date');
      }
    } catch (error) {
      logger.error('Error updating .env file:', error);
    }
  }

  private setupCommandHandlers(): void {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    this.bot.onText(/\/start/, (msg) => {
      botController.handleStart(msg);
    });

    this.bot.onText(/\/manage_channels/, (msg) => {
      botController.handleManageChannels(msg);
    });

    this.bot.onText(/\/view_summaries/, (msg) => {
      botController.handleViewSummaries(msg);
    });

    this.bot.onText(/\/join_channel (.+)/, async (msg, match) => {
      if (match && match[1]) {
        const channelUsername = match[1];
        const success = await mtprotoService.joinChannel(channelUsername);
        if (success) {
          this.sendMessage(msg.chat.id, `Successfully joined channel: ${channelUsername}`);
        } else {
          this.sendMessage(msg.chat.id, `Failed to join channel: ${channelUsername}`);
        }
      }
    });

    this.bot.onText(/\/channel_info (.+)/, async (msg, match) => {
      if (match && match[1]) {
        const channelId = match[1];
        const channelInfo = await mtprotoService.getChannelInfo(channelId);
        if (channelInfo) {
          const infoMessage = `Channel Info:
Title: ${channelInfo.title}
Username: ${channelInfo.username || 'N/A'}
Participants: ${channelInfo.participantsCount || 'N/A'}
About: ${channelInfo.about || 'N/A'}`;
          this.sendMessage(msg.chat.id, infoMessage);
        } else {
          this.sendMessage(msg.chat.id, `Failed to fetch channel info for: ${channelId}`);
        }
      }
    });

    // New command to fetch messages from a channel
    this.bot.onText(/\/fetch_messages (.+)/, async (msg, match) => {
      if (match && match[1]) {
        const channelId = match[1];
        try {
          const messages = await this.getChannelMessages(channelId, 10); // Fetch last 10 messages
          if (messages.length > 0) {
            const messageText = messages.map(m => `[${new Date(m.date * 1000).toLocaleString()}] ${m.message}`).join('\n\n');
            await this.sendMessage(msg.chat.id, `Last 10 messages from channel ${channelId}:\n\n${messageText}`);
          } else {
            await this.sendMessage(msg.chat.id, `No messages found in channel ${channelId}`);
          }
        } catch (error) {
          logger.error(`Error fetching messages from channel ${channelId}:`, error);
          await this.sendMessage(msg.chat.id, `Error fetching messages from channel ${channelId}`);
        }
      }
    });
  }

  private setupCallbackQueryHandler(): void {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    this.bot.on('callback_query', (query) => {
      botController.handleCallbackQuery(query);
    });
  }

  public async sendMessage(chatId: number | string, text: string, options?: TelegramBot.SendMessageOptions): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  }

  public async editMessageText(text: string, options: TelegramBot.EditMessageTextOptions): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.editMessageText(text, options);
    } catch (error) {
      logger.error('Error editing message:', error);
    }
  }

  public async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.answerCallbackQuery(callbackQueryId, { text });
    } catch (error) {
      logger.error('Error answering callback query:', error);
    }
  }

  public async getChannelMessages(channelId: string, limit: number = 100): Promise<any[]> {
    return await mtprotoService.getChannelMessages(channelId, limit);
  }

  public createInlineKeyboard(buttons: TelegramBot.InlineKeyboardButton[][]): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: buttons,
    };
  }
}

export const telegramService = new TelegramService();
