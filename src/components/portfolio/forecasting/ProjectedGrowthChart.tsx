'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RunFinancialSimulationOutput } from '@/ai/flows/run-financial-simulation';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);


export function ProjectedGrowthChart({ simulationResult }: { simulationResult: RunFinancialSimulationOutput | null }) {
  if (!simulationResult) {
    return (
        <Card className="min-h-[400px] flex flex-col items-center justify-center bg-card/40 border-border/40 border-dashed">
        <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
            <AreaChart className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Projected Portfolio Growth</CardTitle>
            <CardDescription className="text-muted-foreground">
            Run a simulation to see your projections.
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


  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle>Projected Portfolio Growth</CardTitle>
        <CardDescription>
          Based on your simulation inputs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={simulationResult.projections}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background) / 0.8)',
                        borderColor: 'hsl(var(--border) / 0.5)',
                        backdropFilter: 'blur(4px)',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="worstCase" stroke="hsl(var(--destructive) / 0.4)" fillOpacity={0} strokeDasharray="5 5" name="Worst Case" />
                <Area type="monotone" dataKey="bestCase" stroke="hsl(var(--secondary) / 0.6)" fillOpacity={0} strokeDasharray="5 5" name="Best Case" />
                <Area type="monotone" dataKey="projectedValue" stroke="hsl(var(--primary))" fill="url(#colorProjected)" strokeWidth={2} name="Projected" />
            </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
