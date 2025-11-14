'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Transaction } from '@/app/portfolio/page';

interface CategorySpendingChartProps {
    expenses: Transaction[];
}

const generateHslColor = (str: string, s: number, l: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export function CategorySpendingChart({ expenses }: CategorySpendingChartProps) {
  const chartData = React.useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
        if (categoryMap[expense.category]) {
            categoryMap[expense.category] += expense.amount;
        } else {
            categoryMap[expense.category] = expense.amount;
        }
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
        fill: generateHslColor(name, 70, 50),
    }));
  }, [expenses]);
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [chartData])

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  if (chartData.length === 0) {
    return (
        <Card className="flex flex-col h-full bg-card/60 border-border/60">
             <CardHeader className="items-center pb-0">
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Your expense breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No expenses logged yet.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-card/60 border-border/60">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Your expense breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              >
               {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
            </Pie>
             <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
