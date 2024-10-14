import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class TelegramService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.setupCommandHandlers();
  }

  private setupCommandHandlers(): void {
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
  }

  public async sendMessage(chatId: number | string, text: string): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  }

  public async getChannelMessages(channelId: string): Promise<TelegramBot.Message[]> {
    try {
      // This is a placeholder. In a real implementation, you would use the Telegram API
      // to fetch messages from the channel. This requires additional setup and permissions.
      // For demonstration purposes, we're returning a mock message.
      return [{ text: 'This is a sample message from the channel.' } as TelegramBot.Message];
    } catch (error) {
      logger.error('Error fetching channel messages:', error);
      return [];
    }
  }
}

export const telegramService = new TelegramService();
