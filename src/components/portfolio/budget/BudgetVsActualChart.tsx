'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Transaction } from '@/app/portfolio/page';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

interface BudgetVsActualChartProps {
    expenses: Transaction[];
    budget: { [key: string]: number };
}

export function BudgetVsActualChart({ expenses, budget }: BudgetVsActualChartProps) {
  const chartData = React.useMemo(() => {
    const actualSpending = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {} as { [key: string]: number });
    
    return Object.keys(budget).map(category => ({
        category,
        budget: budget[category],
        actual: actualSpending[category] || 0,
    }));
  }, [expenses, budget]);

  const chartConfig = {
    budget: {
      label: 'Budget',
      color: 'hsl(var(--secondary) / 0.5)',
    },
    actual: {
      label: 'Actual',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget vs. Actual</CardTitle>
        <CardDescription>Your spending compared to your budget</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
             <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="budget"
              fill="var(--color-budget)"
              radius={8}
            />
             <Bar
              dataKey="actual"
              fill="var(--color-actual)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
