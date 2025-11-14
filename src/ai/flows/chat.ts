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
      prompt: `You are a friendly and helpful financial assistant chatbot for Base 44.
        Your goal is to provide helpful and accurate information about personal finance, investing, and wealth management.
        Keep your responses concise and easy to understand.

        User message: ${prompt}`,
    });

    return response.text;
  }
);
