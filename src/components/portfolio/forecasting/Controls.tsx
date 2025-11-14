'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Zap, Loader2 } from 'lucide-react';
import { RunFinancialSimulationInput } from '@/ai/flows/run-financial-simulation';

interface PredictiveControlsProps {
    onRunSimulation: (inputs: Omit<RunFinancialSimulationInput, 'initialValue'>) => void;
    isLoading: boolean;
}

export function PredictiveControls({ onRunSimulation, isLoading }: PredictiveControlsProps) {
  const [monthlyContribution, setMonthlyContribution] = React.useState(500);
  const [timeHorizon, setTimeHorizon] = React.useState(20);
  const [riskProfile, setRiskProfile] = React.useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const handleRun = () => {
    onRunSimulation({
        monthlyContribution,
        timeHorizon,
        riskProfile,
    });
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle>Forecasting Controls</CardTitle>
        <CardDescription>Adjust the inputs to simulate different futures.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="contribution">Monthly Contribution</Label>
            <span className="text-lg font-bold">${monthlyContribution}</span>
          </div>
          <Slider
            id="contribution"
            min={0}
            max={5000}
            step={100}
            value={[monthlyContribution]}
            onValueChange={(value) => setMonthlyContribution(value[0])}
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="horizon">Time Horizon (Years)</Label>
            <span className="text-lg font-bold">{timeHorizon} yrs</span>
          </div>
          <Slider
            id="horizon"
            min={1}
            max={50}
            step={1}
            value={[timeHorizon]}
            onValueChange={(value) => setTimeHorizon(value[0])}
          />
        </div>
        
         <div className="space-y-2">
            <Label htmlFor="risk-profile">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={(value: any) => setRiskProfile(value)}>
                <SelectTrigger id="risk-profile">
                    <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button className="w-full" size="lg" onClick={handleRun} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Run Simulation
        </Button>
      </CardContent>
    </Card>
  );
}
