import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { telegramService } from '../services/telegramService';
import { databaseService } from '../services/databaseService';
import { User } from '../entities/User';
import { Channel } from '../entities/Channel';
import { logger } from '../utils/logger';

export class BotController {
  private static instance: BotController;

  private constructor() {}

  public static getInstance(): BotController {
    if (!BotController.instance) {
      BotController.instance = new BotController();
    }
    return BotController.instance;
  }

  public async handleStart(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) {
      logger.error('User ID not found in message');
      return;
    }

    try {
      let user = await databaseService.getUserRepository().findOne({ where: { telegramId: userId.toString() } });

      if (!user) {
        user = new User();
        user.telegramId = userId.toString();
        user.chatId = chatId.toString();
        await databaseService.getUserRepository().save(user);
        await telegramService.sendMessage(chatId, 'Welcome! Use /manage_channels to start managing your channels.');
      } else {
        await telegramService.sendMessage(chatId, 'Welcome back! Use /manage_channels to manage your channels.');
      }
    } catch (error) {
      logger.error('Error handling start command:', error);
      await telegramService.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
  }

  public async handleManageChannels(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) {
      logger.error('User ID not found in message');
      return;
    }

    try {
      const user = await databaseService.getUserRepository().findOne({
        where: { telegramId: userId.toString() },
        relations: ['channels'],
      });

      if (!user) {
        await telegramService.sendMessage(chatId, 'Please start the bot first with /start command.');
        return;
      }

      const keyboard = telegramService.createInlineKeyboard([
        [{ text: 'Add Channel', callback_data: 'add_channel' }],
        [{ text: 'List Channels', callback_data: 'list_channels' }],
        [{ text: 'Remove Channel', callback_data: 'remove_channel' }],
        [{ text: 'Update Channel Settings', callback_data: 'update_channel_settings' }],
      ]);

      await telegramService.sendMessage(chatId, 'Channel Management Options:', { reply_markup: keyboard });
    } catch (error) {
      logger.error('Error handling manage channels command:', error);
      await telegramService.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
  }

  public async handleCallbackQuery(query: CallbackQuery): Promise<void> {
    if (!query.message || !query.from.id) {
      logger.error('Invalid callback query');
      return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id;

    try {
      const user = await databaseService.getUserRepository().findOne({
        where: { telegramId: userId.toString() },
        relations: ['channels'],
      });

      if (!user) {
        await telegramService.answerCallbackQuery(query.id, 'Please start the bot first with /start command.');
        return;
      }

      switch (query.data) {
        case 'add_channel':
          await this.handleAddChannel(chatId, user);
          break;
        case 'list_channels':
          await this.handleListChannels(chatId, user);
          break;
        case 'remove_channel':
          await this.handleRemoveChannel(chatId, user);
          break;
        case 'update_channel_settings':
          await this.handleUpdateChannelSettings(chatId, user);
          break;
        default:
          await telegramService.answerCallbackQuery(query.id, 'Invalid option');
      }
    } catch (error) {
      logger.error('Error handling callback query:', error);
      await telegramService.answerCallbackQuery(query.id, 'An error occurred. Please try again.');
    }
  }

  private async handleAddChannel(chatId: number, user: User): Promise<void> {
    await telegramService.sendMessage(chatId, 'Please send the channel ID and name in the format: /add_channel channelId channelName');
  }

  private async handleListChannels(chatId: number, user: User): Promise<void> {
    if (user.channels.length === 0) {
      await telegramService.sendMessage(chatId, 'You have no channels added yet.');
      return;
    }

    const channelList = user.channels.map(channel => `${channel.channelName} (${channel.channelId})`).join('\n');
    await telegramService.sendMessage(chatId, `Your channels:\n${channelList}`);
  }

  private async handleRemoveChannel(chatId: number, user: User): Promise<void> {
    if (user.channels.length === 0) {
      await telegramService.sendMessage(chatId, 'You have no channels to remove.');
      return;
    }

    const keyboard = telegramService.createInlineKeyboard(
      user.channels.map(channel => [{
        text: `${channel.channelName} (${channel.channelId})`,
        callback_data: `remove_channel:${channel.id}`
      }])
    );

    await telegramService.sendMessage(chatId, 'Select a channel to remove:', { reply_markup: keyboard });
  }

  private async handleUpdateChannelSettings(chatId: number, user: User): Promise<void> {
    if (user.channels.length === 0) {
      await telegramService.sendMessage(chatId, 'You have no channels to update.');
      return;
    }

    const keyboard = telegramService.createInlineKeyboard(
      user.channels.map(channel => [{
        text: `${channel.channelName} (${channel.channelId})`,
        callback_data: `update_settings:${channel.id}`
      }])
    );

    await telegramService.sendMessage(chatId, 'Select a channel to update settings:', { reply_markup: keyboard });
  }

  public async handleViewSummaries(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) {
      logger.error('User ID not found in message');
      return;
    }

    try {
      const user = await databaseService.getUserRepository().findOne({
        where: { telegramId: userId.toString() },
        relations: ['summaries'],
      });

      if (!user || user.summaries.length === 0) {
        await telegramService.sendMessage(chatId, 'You have no summaries yet.');
        return;
      }

      const summariesList = user.summaries.map(summary => 
        `Channel: ${summary.channelName}\nDate: ${summary.createdAt.toLocaleDateString()}\nSummary: ${summary.content}`
      ).join('\n\n');

      await telegramService.sendMessage(chatId, `Your latest summaries:\n\n${summariesList}`);
    } catch (error) {
      logger.error('Error viewing summaries:', error);
      await telegramService.sendMessage(chatId, 'An error occurred while retrieving summaries. Please try again.');
    }
  }
}

export const botController = BotController.getInstance();
