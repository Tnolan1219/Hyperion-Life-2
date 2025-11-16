'use server';
/**
 * @fileOverview An AI agent that simulates financial scenarios and provides commentary.
 *
 * - simulateFinancialScenario - A function that handles the financial scenario simulation process.
 * - SimulateFinancialScenarioInput - The input type for the simulateFinancialScenario function.
 * - SimulateFinancialScenarioOutput - The return type for the simulateFinancialScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateFinancialScenarioInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('A detailed description of the financial scenario to simulate.'),
  userProfile: z.string().describe('A summary of the user profile, including goals, risk tolerance, assets, and debts.'),
});
export type SimulateFinancialScenarioInput = z.infer<typeof SimulateFinancialScenarioInputSchema>;

const SimulateFinancialScenarioOutputSchema = z.object({
  projectedOutcome: z.string().describe('The projected financial outcome of the scenario, written as a short, encouraging paragraph.'),
  aiCommentary: z.string().describe('AI-powered commentary on the potential impact of the decisions, formatted as a bulleted list.'),
});
export type SimulateFinancialScenarioOutput = z.infer<typeof SimulateFinancialScenarioOutputSchema>;

export async function simulateFinancialScenario(
  input: SimulateFinancialScenarioInput
): Promise<SimulateFinancialScenarioOutput> {
  return simulateFinancialScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateFinancialScenarioPrompt',
  input: {schema: SimulateFinancialScenarioInputSchema},
  output: {schema: SimulateFinancialScenarioOutputSchema},
  prompt: `You are an expert financial advisor who is friendly, encouraging, and simulates financial scenarios.

You will use the following information to simulate the scenario and provide commentary.

Scenario Description: {{{scenarioDescription}}}
User Profile: {{{userProfile}}}

Instructions:
- For 'projectedOutcome': Write a short, encouraging paragraph summarizing the most likely financial outcome of this scenario.
- For 'aiCommentary': Provide your analysis and commentary on the potential impacts and considerations. Format this as a concise, easy-to-read bulleted list.
`,
});

const simulateFinancialScenarioFlow = ai.defineFlow(
  {
    name: 'simulateFinancialScenarioFlow',
    inputSchema: SimulateFinancialScenarioInputSchema,
    outputSchema: SimulateFinancialScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    