import { Configuration, OpenAIApi } from 'openai';
import { CONSTANTS } from '../config/consts';
import { logger } from '../utils/logger';

class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: CONSTANTS.OPENAI.API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  public async generateSummary(content: string): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-4o', // Using gpt-4o for complex summarization tasks
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
          { role: 'user', content: `Please summarize the following content:\n\n${content}` }
        ],
        max_tokens: 150,
      });

      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('No summary generated');
      }
    } catch (error) {
      logger.error('Error generating summary:', error);
      return 'Unable to generate summary at this time.';
    }
  }
}

export const openaiService = new OpenAIService();
