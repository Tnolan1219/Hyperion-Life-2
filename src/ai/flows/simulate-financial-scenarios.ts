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
  projectedOutcome: z.string().describe('The projected financial outcome of the scenario.'),
  aiCommentary: z.string().describe('AI-powered commentary on the potential impact of the decisions.'),
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
  prompt: `You are a financial advisor who simulates financial scenarios and provides commentary.

You will use the following information to simulate the financial scenario and provide AI-powered commentary on the potential impact of the decisions.

Scenario Description: {{{scenarioDescription}}}
User Profile: {{{userProfile}}}

Provide a projected financial outcome and AI commentary.
Projected Outcome:
AI Commentary: `,
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
