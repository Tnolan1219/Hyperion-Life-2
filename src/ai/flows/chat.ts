'use server';
/**
 * @fileOverview A simple chatbot flow for financial advice.
 * - chat - A function that handles the chatbot conversation.
 */

import {ai} from '@/ai/genkit';
import {ChatInput, ChatInputSchema, ChatOutputSchema} from './chat.types';

export async function chat(input: ChatInput): Promise<string> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({prompt, history}) => {
    const llm = ai.model('googleai/gemini-2.5-flash');

    const response = await ai.generate({
      model: llm,
      history,
      prompt: `You are a friendly, encouraging financial assistant chatbot for Net Worth Max.
        Your goal is to provide helpful and accurate information about personal finance, investing, and wealth management.
        Always respond in a supportive tone. Use markdown bullet points (and sub-bullets if necessary) to keep your answers clear and concise.

        User message: ${prompt}`,
    });

    return response.text;
  }
);
