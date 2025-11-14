'use server';
/**
 * @fileOverview A simple chatbot flow for financial advice.
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s message to the chatbot.'),
  history: z
    .array(z.any())
    .optional()
    .describe('The previous conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.string().describe('The chatbot\'s response.');
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
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
