'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export function PredictiveControls() {
  const [contribution, setContribution] = React.useState(500);
  const [horizon, setHorizon] = React.useState(20);
  const [inflation, setInflation] = React.useState(2.5);

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
            <span className="text-lg font-bold">${contribution}</span>
          </div>
          <Slider
            id="contribution"
            min={0}
            max={5000}
            step={100}
            value={[contribution]}
            onValueChange={(value) => setContribution(value[0])}
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="horizon">Time Horizon (Years)</Label>
            <span className="text-lg font-bold">{horizon} yrs</span>
          </div>
          <Slider
            id="horizon"
            min={1}
            max={50}
            step={1}
            value={[horizon]}
            onValueChange={(value) => setHorizon(value[0])}
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="inflation">Assumed Inflation</Label>
             <span className="text-lg font-bold">{inflation.toFixed(1)}%</span>
          </div>
          <Slider
            id="inflation"
            min={0}
            max={10}
            step={0.1}
            value={[inflation]}
            onValueChange={(value) => setInflation(value[0])}
          />
        </div>
        <div className="space-y-2">
            <Label htmlFor="rebalancing">Rebalancing Frequency</Label>
            <Select defaultValue="quarterly">
                <SelectTrigger id="rebalancing">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="risk-profile">Risk Profile</Label>
            <Select defaultValue="moderate">
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
        <Button className="w-full" size="lg">
            <Zap className="w-4 h-4 mr-2" />
            Run Simulation
        </Button>
      </CardContent>
    </Card>
  );
}
