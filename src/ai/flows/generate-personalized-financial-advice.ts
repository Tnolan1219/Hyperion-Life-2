'use server';

/**
 * @fileOverview A Genkit flow for generating personalized financial advice and coaching nudges.
 *
 * - generatePersonalizedFinancialAdvice - A function that generates personalized financial advice.
 * - GeneratePersonalizedFinancialAdviceInput - The input type for the generatePersonalizedFinancialAdvice function.
 * - GeneratePersonalizedFinancialAdviceOutput - The return type for the generatePersonalizedFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedFinancialAdviceInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  profile: z.object({
    name: z.string().describe('The name of the user.'),
    age: z.number().describe('The age of the user.'),
    location: z.string().describe('The location of the user.'),
    income: z.number().describe('The income of the user.'),
    careerStage: z.string().describe('The career stage of the user.'),
  }).describe('The profile of the user.'),
  goals: z.array(z.object({
    goalType: z.string().describe('The type of the goal.'),
    targetAmount: z.number().describe('The target amount for the goal.'),
    targetDate: z.string().describe('The target date for the goal.'),
    progressAmount: z.number().describe('The current progress towards the goal.'),
  })).describe('The goals of the user.'),
  assetsSummary: z.string().describe('A summary of the user\'s assets.'),
  debtsSummary: z.string().describe('A summary of the user\'s debts.'),
  riskTolerance: z.string().describe('The risk tolerance of the user.'),
});

export type GeneratePersonalizedFinancialAdviceInput = z.infer<
  typeof GeneratePersonalizedFinancialAdviceInputSchema
>;

const GeneratePersonalizedFinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('The personalized financial advice in a friendly, bulleted format.'),
  nudges: z.array(z.string()).describe('A list of encouraging, bulleted coaching nudges.'),
});

export type GeneratePersonalizedFinancialAdviceOutput = z.infer<
  typeof GeneratePersonalizedFinancialAdviceOutputSchema
>;

export async function generatePersonalizedFinancialAdvice(
  input: GeneratePersonalizedFinancialAdviceInput
): Promise<GeneratePersonalizedFinancialAdviceOutput> {
  return generatePersonalizedFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedFinancialAdvicePrompt',
  input: {schema: GeneratePersonalizedFinancialAdviceInputSchema},
  output: {schema: GeneratePersonalizedFinancialAdviceOutputSchema},
  prompt: `You are an expert financial advisor with a friendly and encouraging tone. Your goal is to provide personalized financial advice and coaching nudges based on the user's profile.

  User Profile:
  Name: {{{profile.name}}}
  Age: {{{profile.age}}}
  Location: {{{profile.location}}}
  Income: {{{profile.income}}}
  Career Stage: {{{profile.careerStage}}}

  Goals:
  {{#each goals}}
  - Goal: {{{goalType}}}, Target: {{{targetAmount}}}, Target Date: {{{targetDate}}}, Progress: {{{progressAmount}}}
  {{/each}}

  Assets Summary: {{{assetsSummary}}}
  Debts Summary: {{{debtsSummary}}}
  Risk Tolerance: {{{riskTolerance}}}

  Based on this complete picture, provide clear, concise, and actionable advice.
  - For the 'advice' field: Write a short, encouraging introductory sentence. Then, provide the main advice as a series of 2-3 short bullet points.
  - For the 'nudges' field: Provide a list of 2 short, encouraging, and actionable coaching nudges as bullet points.
  `,
});

const generatePersonalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedFinancialAdviceFlow',
    inputSchema: GeneratePersonalizedFinancialAdviceInputSchema,
    outputSchema: GeneratePersonalizedFinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    