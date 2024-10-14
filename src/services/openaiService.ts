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

  public async generateSummary(content: string, maxLength: number): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-4o', // Using gpt-4o for complex summarization tasks
        messages: [
          { role: 'system', content: `You are a helpful assistant that summarizes text. Please provide a summary of no more than ${maxLength} characters.` },
          { role: 'user', content: `Please summarize the following content:\n\n${content}` }
        ],
        max_tokens: Math.floor(maxLength / 4), // Approximate token count based on characters
      });

      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
        let summary = response.data.choices[0].message.content.trim();
        // Ensure the summary doesn't exceed the maxLength
        if (summary.length > maxLength) {
          summary = summary.substring(0, maxLength);
        }
        return summary;
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
