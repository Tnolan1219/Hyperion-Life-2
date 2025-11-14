'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

const chartData = [
  { month: 'Jan', income: 1860, expenses: 800 },
  { month: 'Feb', income: 3050, expenses: 2000 },
  { month: 'Mar', income: 2370, expenses: 1200 },
  { month: 'Apr', income: 2980, expenses: 1900 },
  { month: 'May', income: 2510, expenses: 1300 },
  { month: 'Jun', income: 3490, expenses: 2100 },
]

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--secondary))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--primary))',
  },
}

export function CashFlowChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>Income vs. Expenses - Last 6 Months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
             <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={8}
              stackId="a"
            />
             <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[8, 8, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
