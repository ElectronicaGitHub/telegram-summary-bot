import { Message } from 'node-telegram-bot-api';
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
        await telegramService.sendMessage(chatId, 'Welcome! Please provide channels to parse in id/channel format.');
      } else {
        await telegramService.sendMessage(chatId, 'Welcome back! What would you like to do?');
      }
    } catch (error) {
      logger.error('Error handling start command:', error);
      await telegramService.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
  }

  public async handleAddChannel(msg: Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !match) {
      logger.error('User ID or match not found in message');
      return;
    }

    const [, channelId, channelName] = match;

    try {
      const user = await databaseService.getUserRepository().findOne({ where: { telegramId: userId.toString() } });

      if (!user) {
        await telegramService.sendMessage(chatId, 'Please start the bot first with /start command.');
        return;
      }

      const channel = new Channel();
      channel.channelId = channelId;
      channel.channelName = channelName;
      channel.user = user;

      await databaseService.getChannelRepository().save(channel);
      await telegramService.sendMessage(chatId, `Channel ${channelName} (${channelId}) added successfully.`);
    } catch (error) {
      logger.error('Error adding channel:', error);
      await telegramService.sendMessage(chatId, 'An error occurred while adding the channel. Please try again.');
    }
  }

  public async handleListChannels(msg: Message): Promise<void> {
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

      if (!user || user.channels.length === 0) {
        await telegramService.sendMessage(chatId, 'You have no channels added yet.');
        return;
      }

      const channelList = user.channels.map(channel => `${channel.channelName} (${channel.channelId})`).join('\n');
      await telegramService.sendMessage(chatId, `Your channels:\n${channelList}`);
    } catch (error) {
      logger.error('Error listing channels:', error);
      await telegramService.sendMessage(chatId, 'An error occurred while listing channels. Please try again.');
    }
  }

  public async handleRemoveChannel(msg: Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !match) {
      logger.error('User ID or match not found in message');
      return;
    }

    const [, channelId] = match;

    try {
      const user = await databaseService.getUserRepository().findOne({
        where: { telegramId: userId.toString() },
        relations: ['channels'],
      });

      if (!user) {
        await telegramService.sendMessage(chatId, 'Please start the bot first with /start command.');
        return;
      }

      const channelToRemove = user.channels.find(channel => channel.channelId === channelId);

      if (!channelToRemove) {
        await telegramService.sendMessage(chatId, `Channel with ID ${channelId} not found.`);
        return;
      }

      await databaseService.getChannelRepository().remove(channelToRemove);
      await telegramService.sendMessage(chatId, `Channel ${channelToRemove.channelName} (${channelId}) removed successfully.`);
    } catch (error) {
      logger.error('Error removing channel:', error);
      await telegramService.sendMessage(chatId, 'An error occurred while removing the channel. Please try again.');
    }
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
