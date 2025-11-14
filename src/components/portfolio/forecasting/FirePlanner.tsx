'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FireProjectionChart } from './FireProjectionChart';

const formatCurrency = (value: number, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

interface FireInputs {
  currentPortfolio: number;
  monthlyInvestment: number;
  annualReturn: number;
  inflation: number;
  withdrawalRate: number;
  annualSpend: number;
}

interface FireResult {
  fiNumber: number;
  yearsToFi: number;
  withdrawalAtFi: number;
  projectionData: { year: number; value: number }[];
}

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
    <Card className="text-center">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
    </Card>
);

export function FirePlanner({ currentPortfolioValue, annualExpenses }: { currentPortfolioValue: number, annualExpenses: number }) {
  const [inputs, setInputs] = useState<FireInputs>({
    currentPortfolio: currentPortfolioValue,
    monthlyInvestment: 1200,
    annualReturn: 7,
    inflation: 2.5,
    withdrawalRate: 4,
    annualSpend: 100000,
  });
  
  const [useBudgetExpenses, setUseBudgetExpenses] = useState(false);
  const [result, setResult] = useState<FireResult | null>(null);

  useEffect(() => {
    setInputs(prev => ({ ...prev, currentPortfolio: currentPortfolioValue }));
  }, [currentPortfolioValue]);

  useEffect(() => {
    if (useBudgetExpenses && annualExpenses > 0) {
      setInputs(prev => ({ ...prev, annualSpend: annualExpenses }));
    }
  }, [useBudgetExpenses, annualExpenses]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const fiNumber = useMemo(() => {
    if (inputs.withdrawalRate <= 0) return Infinity;
    return inputs.annualSpend / (inputs.withdrawalRate / 100);
  }, [inputs.annualSpend, inputs.withdrawalRate]);


  const runProjection = () => {
    const realReturn = (1 + inputs.annualReturn / 100) / (1 + inputs.inflation / 100) - 1;
    let portfolioValue = inputs.currentPortfolio;
    let years = 0;
    const maxYears = 100;
    const projectionData = [{ year: 0, value: portfolioValue }];
    
    while (portfolioValue < fiNumber && years < maxYears) {
        years++;
        portfolioValue = portfolioValue * (1 + realReturn) + (inputs.monthlyInvestment * 12);
        projectionData.push({ year: years, value: portfolioValue });
    }

    setResult({
        fiNumber: fiNumber,
        yearsToFi: years >= maxYears ? Infinity : years,
        withdrawalAtFi: fiNumber * (inputs.withdrawalRate / 100),
        projectionData,
    });
  };
  
  return (
    <div className="space-y-8">
        <Card className="glass">
            <CardHeader>
                <CardTitle>FIRE Planner</CardTitle>
                <CardDescription>
                Calculate your path to Financial Independence and Early Retirement.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="currentPortfolio">Current Portfolio ($)</Label>
                        <Input id="currentPortfolio" name="currentPortfolio" value={inputs.currentPortfolio} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">How much you have invested now.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="monthlyInvestment">Monthly Investment ($)</Label>
                        <Input id="monthlyInvestment" name="monthlyInvestment" value={inputs.monthlyInvestment} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">How much you plan to invest each month.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
                        <Input id="annualReturn" name="annualReturn" value={inputs.annualReturn} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">Average yearly growth rate (after inflation).</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inflation">Inflation Assumption (%)</Label>
                        <Input id="inflation" name="inflation" value={inputs.inflation} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">How much you expect prices to rise per year.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="withdrawalRate">Withdrawal Rate (%/yr)</Label>
                        <Input id="withdrawalRate" name="withdrawalRate" value={inputs.withdrawalRate} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">Percent of portfolio withdrawn yearly in retirement.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="annualSpend">Annual Spend in Retirement ($)</Label>
                        <Input id="annualSpend" name="annualSpend" value={inputs.annualSpend} onChange={handleInputChange} disabled={useBudgetExpenses} />
                         <p className="text-xs text-muted-foreground">How much you plan to spend per year after retiring.</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="use-budget" checked={useBudgetExpenses} onCheckedChange={(checked) => setUseBudgetExpenses(Boolean(checked))} />
                        <Label htmlFor="use-budget" className="text-sm font-normal">Use my budget's annual expenses</Label>
                    </div>
                    <Button onClick={runProjection}>Run Projection</Button>
                </div>
            </CardContent>
        </Card>
        
        {result && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Years to FI (est.)" value={isFinite(result.yearsToFi) ? result.yearsToFi.toFixed(1) : ' > 100'} description="How long until you reach financial independence." />
                    <StatCard title="FI Number" value={formatCurrency(result.fiNumber)} description="Portfolio needed to retire safely." />
                    <StatCard title="Withdrawal @ FI / yr" value={formatCurrency(result.withdrawalAtFi)} description="Annual withdrawal at FI (using your rate)." />
                    <StatCard title="Ending Portfolio" value={formatCurrency(result.projectionData[result.projectionData.length-1].value)} description={`Projected value in ${isFinite(result.yearsToFi) ? result.yearsToFi.toFixed(0) : '100'} years.`} />
                </div>
                <FireProjectionChart projectionData={result.projectionData} fiNumber={result.fiNumber} />
            </div>
        )}
    </div>
  );
}
