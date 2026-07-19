import { GoogleGenAI, Content } from '@google/genai';

/**
 * Initializes the Gemini client using the @google/genai SDK.
 * Validates that the necessary environment variable is present.
 */
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = getGeminiClient();
  }

  /**
   * Initializes a chat session and streams the response.
   * Supports System Instructions and Function Calling capabilities.
   * 
   * @param history The conversation history.
   * @param systemInstruction The system instruction to guide the AI's behavior.
   * @returns A stream of GenerateContentResponse.
   */
  async streamChat(history: Content[], systemInstruction?: string) {
    try {
      // Configuration for the model
      const config: any = {
        temperature: 0.7,
        // Uncomment and populate below for Function Calling (e.g., CRM lookup)
        // tools: [{ functionDeclarations: [ ... ] }]
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      // Using gemini-2.5-flash as the standard, fast model for chat
      const responseStream = await this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: history,
        config,
      });

      return responseStream;
    } catch (error) {
      console.error('[GeminiService] Error during streamChat:', error);
      throw error;
    }
  }
}

// Export a singleton instance of the service
export const geminiService = new GeminiService();
