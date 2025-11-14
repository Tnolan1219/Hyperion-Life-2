'use server';
/**
 * @fileOverview An AI agent that runs a financial simulation based on user inputs.
 *
 * - runFinancialSimulation - A function that handles the financial simulation process.
 * - RunFinancialSimulationInput - The input type for the runFinancialSimulation function.
 * - RunFinancialSimulationOutput - The return type for the runFinancialSimulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const RunFinancialSimulationInputSchema = z.object({
  initialValue: z.number().describe('The starting value of the portfolio.'),
  monthlyContribution: z.number().describe('The amount contributed monthly.'),
  timeHorizon: z.number().describe('The number of years for the simulation.'),
  riskProfile: z
    .enum(['conservative', 'moderate', 'aggressive'])
    .describe('The risk profile for the investment.'),
});
export type RunFinancialSimulationInput = z.infer<typeof RunFinancialSimulationInputSchema>;

const ProjectionPointSchema = z.object({
    year: z.number(),
    projectedValue: z.number(),
    bestCase: z.number(),
    worstCase: z.number(),
});

export const RunFinancialSimulationOutputSchema = z.object({
  finalProjectedValue: z.number().describe('The final projected value of the portfolio.'),
  finalBestCase: z.number().describe('The final best case value of the portfolio.'),
  finalWorstCase: z.number().describe('The final worst case value of the portfolio.'),
  projections: z.array(ProjectionPointSchema).describe('The year-by-year projection data.'),
});
export type RunFinancialSimulationOutput = z.infer<typeof RunFinancialSimulationOutputSchema>;


// This is a simplified financial projection model.
// In a real-world application, this would be a more complex Monte Carlo simulation.
const runSimulation = (input: RunFinancialSimulationInput): RunFinancialSimulationOutput => {
    const { initialValue, monthlyContribution, timeHorizon, riskProfile } = input;

    const rates = {
        conservative: { expected: 0.04, best: 0.06, worst: 0.02 },
        moderate: { expected: 0.07, best: 0.10, worst: 0.03 },
        aggressive: { expected: 0.10, best: 0.15, worst: 0.01 },
    };

    const rate = rates[riskProfile];
    const annualContribution = monthlyContribution * 12;

    const projections: z.infer<typeof ProjectionPointSchema>[] = [];
    
    let currentValue = initialValue;
    let bestCaseValue = initialValue;
    let worstCaseValue = initialValue;

    for (let year = 1; year <= timeHorizon; year++) {
        currentValue = (currentValue + annualContribution) * (1 + rate.expected);
        bestCaseValue = (bestCaseValue + annualContribution) * (1 + rate.best);
        worstCaseValue = (worstCaseValue + annualContribution) * (1 + rate.worst);

        projections.push({
            year: year,
            projectedValue: parseFloat(currentValue.toFixed(2)),
            bestCase: parseFloat(bestCaseValue.toFixed(2)),
            worstCase: parseFloat(worstCaseValue.toFixed(2)),
        });
    }

    return {
        finalProjectedValue: parseFloat(currentValue.toFixed(2)),
        finalBestCase: parseFloat(bestCaseValue.toFixed(2)),
        finalWorstCase: parseFloat(worstCaseValue.toFixed(2)),
        projections,
    };
};


export const runFinancialSimulationFlow = ai.defineFlow(
  {
    name: 'runFinancialSimulationFlow',
    inputSchema: RunFinancialSimulationInputSchema,
    outputSchema: RunFinancialSimulationOutputSchema,
  },
  async (input) => {
    return runSimulation(input);
  }
);

export async function runFinancialSimulation(input: RunFinancialSimulationInput): Promise<RunFinancialSimulationOutput> {
    return runFinancialSimulationFlow(input);
}
