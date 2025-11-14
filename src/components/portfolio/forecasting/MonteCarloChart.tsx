'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sigma } from 'lucide-react';

export function MonteCarloChart() {
  return (
    <Card className="min-h-[300px] flex flex-col items-center justify-center bg-card/40 border-border/40 border-dashed">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
          <Sigma className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Monte Carlo Simulation</CardTitle>
        <CardDescription className="text-muted-foreground">
          Range of potential outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-w-md text-center text-sm text-muted-foreground">
            A fan chart will display the distribution of thousands of simulation runs, showing the probability of different final portfolio values.
        </p>
      </CardContent>
    </Card>
  );
}
