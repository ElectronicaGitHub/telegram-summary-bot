import { databaseService } from '../services/databaseService';
import { openaiService } from '../services/openaiService';
import { telegramService } from '../services/telegramService';
import { Summary } from '../entities/Summary';
import { logger } from '../utils/logger';

export class SummaryController {
  private static instance: SummaryController;

  private constructor() {}

  public static getInstance(): SummaryController {
    if (!SummaryController.instance) {
      SummaryController.instance = new SummaryController();
    }
    return SummaryController.instance;
  }

  public async generateSummaries(): Promise<void> {
    try {
      const channels = await databaseService.getChannelRepository().find({ relations: ['user'] });

      for (const channel of channels) {
        const messages = await telegramService.getChannelMessages(channel.channelId);
        
        if (messages.length > 0) {
          const content = messages.map(msg => msg.text).join('\n');
          const summary = await openaiService.generateSummary(content);

          const newSummary = new Summary();
          newSummary.channelName = channel.channelName;
          newSummary.content = summary;
          newSummary.user = channel.user;

          await databaseService.getSummaryRepository().save(newSummary);

          await telegramService.sendMessage(
            channel.user.chatId,
            `New summary for ${channel.channelName}:\n\n${summary}`
          );
        }
      }
    } catch (error) {
      logger.error('Error generating summaries:', error);
    }
  }
}

export const summaryController = SummaryController.getInstance();
