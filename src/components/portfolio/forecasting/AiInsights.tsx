'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb, ArrowRight, Send } from 'lucide-react';
import { RunFinancialSimulationOutput } from '@/ai/flows/run-financial-simulation';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);


export function AiInsights({ simulationResult }: { simulationResult: RunFinancialSimulationOutput | null }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Analysis and recommendations based on the simulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {simulationResult ? (
            <>
            <div>
                <p className="font-semibold text-foreground">Projected Outcome:</p>
                <p className="text-muted-foreground">Based on your inputs, you are on track to reach <span className="font-bold text-green-400">{formatCurrency(simulationResult.finalProjectedValue)}</span>, with a potential range between <span className="font-bold text-red-400">{formatCurrency(simulationResult.finalWorstCase)}</span> and <span className="font-bold text-green-400">{formatCurrency(simulationResult.finalBestCase)}</span>.</p>
            </div>

            <div className="space-y-2">
                <p className="font-semibold text-foreground">Recommendations:</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>Your portfolio's risk profile is well-aligned with your 'Moderate' setting.</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>Increasing your monthly contribution by just $200 could accelerate your timeline by 2.5 years.</span>
                </div>
            </div>
            </>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                Run a simulation to see AI-powered insights here.
            </div>
        )}

        <div>
            <p className="font-semibold text-foreground mb-2">Ask a follow-up question:</p>
            <div className="flex w-full items-center space-x-2">
                <Input placeholder="e.g., What if I retire 5 years earlier?" />
                <Button size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
