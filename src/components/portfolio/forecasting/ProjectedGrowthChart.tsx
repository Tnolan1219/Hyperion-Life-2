'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from 'lucide-react';

export function ProjectedGrowthChart() {
  return (
    <Card className="min-h-[300px] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
          <AreaChart className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Projected Portfolio Growth</CardTitle>
        <CardDescription className="text-muted-foreground">
          Simulation results will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-w-md text-center text-sm text-muted-foreground">
            This chart will show the expected, optimistic, and pessimistic growth trajectories of your portfolio based on your inputs.
        </p>
      </CardContent>
    </Card>
  );
}
