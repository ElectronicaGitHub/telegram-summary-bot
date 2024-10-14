import TelegramBot from 'node-telegram-bot-api';
import { CONSTANTS } from '../config/consts';
import { logger } from '../utils/logger';

class TelegramService {
  private bot: TelegramBot | null = null;

  public init(): void {
    this.bot = new TelegramBot(CONSTANTS.TELEGRAM.BOT_TOKEN, { polling: true });
    this.setupCommandHandlers();
    logger.info('Telegram bot initialized');
  }

  private setupCommandHandlers(): void {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    this.bot.onText(/\/start/, (msg) => {
      const botController = require('../controllers/botController').botController;
      botController.handleStart(msg);
    });

    this.bot.onText(/\/add_channel (.+) (.+)/, (msg, match) => {
      const botController = require('../controllers/botController').botController;
      botController.handleAddChannel(msg, match);
    });

    this.bot.onText(/\/list_channels/, (msg) => {
      const botController = require('../controllers/botController').botController;
      botController.handleListChannels(msg);
    });

    this.bot.onText(/\/remove_channel (.+)/, (msg, match) => {
      const botController = require('../controllers/botController').botController;
      botController.handleRemoveChannel(msg, match);
    });

    this.bot.onText(/\/view_summaries/, (msg) => {
      const botController = require('../controllers/botController').botController;
      botController.handleViewSummaries(msg);
    });

    this.bot.onText(/\/update_channel_settings (.+) (\d+) (hourly|daily|weekly) (true|false) (true|false)/, (msg, match) => {
      const botController = require('../controllers/botController').botController;
      botController.handleUpdateChannelSettings(msg, match);
    });
  }

  public async sendMessage(chatId: number | string, text: string): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.sendMessage(chatId, text);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  }

  public async getChannelMessages(channelId: string): Promise<TelegramBot.Message[]> {
    try {
      return [{ text: 'This is a sample message from the channel.' } as TelegramBot.Message];
    } catch (error) {
      logger.error('Error fetching channel messages:', error);
      return [];
    }
  }
}

export const telegramService = new TelegramService();