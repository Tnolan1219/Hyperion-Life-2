import {z} from 'genkit';

/**
 * @fileOverview Shared types for the chatbot flow.
 */

export const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message to the chatbot."),
  history: z
    .array(z.any())
    .optional()
    .describe('The previous conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.string().describe("The chatbot's response.");
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
