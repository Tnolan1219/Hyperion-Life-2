'use server';
/**
 * @fileOverview Synthesizes a user persona based on user identity, goals, and preferences.
 *
 * - synthesizeUserPersona - A function that synthesizes a user persona.
 * - SynthesizeUserPersonaInput - The input type for the synthesizeUserPersona function.
 * - SynthesizeUserPersonaOutput - The return type for the synthesizeUserPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeUserPersonaInputSchema = z.object({
  profile: z
    .object({
      name: z.string().describe('The user\'s name.'),
      age: z.number().describe('The user\'s age.'),
      location: z.string().describe('The user\'s location.'),
      income: z.number().describe('The user\'s income.'),
      careerStage: z.string().describe('The user\'s career stage.'),
    })
    .describe('The user profile information.'),
  preferences: z
    .object({
      riskTolerance: z
        .string()
        .describe('The user\'s risk tolerance (e.g., low, medium, high).'),
      darkMode: z.boolean().describe('Whether the user prefers dark mode.'),
      reducedMotion: z.boolean().describe('Whether the user prefers reduced motion.'),
      notificationOptIn: z
        .boolean()
        .describe('Whether the user has opted in for notifications.'),
    })
    .describe('The user preferences.'),
  goals: z
    .array(
      z.object({
        goalType: z.string().describe('The type of goal (e.g., emergency fund).'),
        targetAmount: z.number().describe('The target amount for the goal.'),
        targetDate: z.string().describe('The target date for the goal.'),
        progressAmount: z.number().describe('The current progress towards the goal.'),
      })
    )
    .describe('The user financial goals.'),
  assetsSummary: z.string().describe('A summary of the user\'s assets.'),
  debtsSummary: z.string().describe('A summary of the user\'s debts.'),
});

export type SynthesizeUserPersonaInput = z.infer<
  typeof SynthesizeUserPersonaInputSchema
>;

const SynthesizeUserPersonaOutputSchema = z.object({
  aiPersonaSummary: z
    .string()
    .describe('A detailed AI-generated summary of the user persona.'),
});

export type SynthesizeUserPersonaOutput = z.infer<
  typeof SynthesizeUserPersonaOutputSchema
>;

export async function synthesizeUserPersona(
  input: SynthesizeUserPersonaInput
): Promise<SynthesizeUserPersonaOutput> {
  return synthesizeUserPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizeUserPersonaPrompt',
  input: {schema: SynthesizeUserPersonaInputSchema},
  output: {schema: SynthesizeUserPersonaOutputSchema},
  prompt: `You are an AI financial coach. Your task is to synthesize a user persona
based on the provided user profile, preferences, goals, assets, and debts.

Profile: {{{profile}}}
Preferences: {{{preferences}}}
Goals: {{#each goals}}- Type: {{{goalType}}}, Target: {{{targetAmount}}}, Date: {{{targetDate}}}, Progress: {{{progressAmount}}}\n{{/each}}
Assets Summary: {{{assetsSummary}}}
Debts Summary: {{{debtsSummary}}}

Based on this information, create a detailed summary of the user persona that
will help personalize the AI coaching experience. Focus on key characteristics,
financial habits, and potential challenges and opportunities.
`,
});

const synthesizeUserPersonaFlow = ai.defineFlow(
  {
    name: 'synthesizeUserPersonaFlow',
    inputSchema: SynthesizeUserPersonaInputSchema,
    outputSchema: SynthesizeUserPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
