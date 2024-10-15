import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { CONSTANTS } from '../config/consts';
import { logger } from '../utils/logger';
import { botController } from '../controllers/botController';

class TelegramService {
  private bot: TelegramBot | null = null;

  public init(): void {
    this.bot = new TelegramBot(CONSTANTS.TELEGRAM.BOT_TOKEN, { polling: true });
    this.setupCommandHandlers();
    this.setupCallbackQueryHandler();
    logger.info('Telegram bot initialized');
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

  public async getChannelMessages(channelId: string, limit: number = 100): Promise<TelegramBot.Message[]> {
    try {
      const apiUrl = `https://api.telegram.org/bot${CONSTANTS.TELEGRAM.BOT_TOKEN}/getChatHistory`;
      const response = await axios.post(apiUrl, {
        chat_id: channelId,
        limit: limit
      });

      if (response.data && response.data.ok && response.data.result) {
        return response.data.result;
      } else {
        logger.error('Error fetching channel messages:', response.data);
        return [];
      }
    } catch (error) {
      logger.error('Error fetching channel messages:', error);
      return [];
    }
  }

  public createInlineKeyboard(buttons: TelegramBot.InlineKeyboardButton[][]): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: buttons,
    };
  }
}

export const telegramService = new TelegramService();
