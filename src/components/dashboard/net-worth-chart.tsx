'use client';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';

const chartData = [
  { month: 'January', netWorth: 4000, assets: 6400, debts: 2400 },
  { month: 'February', netWorth: 3000, assets: 7300, debts: 4300 },
  { month: 'March', netWorth: 2000, assets: 8200, debts: 6200 },
  { month: 'April', netWorth: 2780, assets: 9080, debts: 6300 },
  { month: 'May', netWorth: 1890, assets: 9800, debts: 7910 },
  { month: 'June', netWorth: 2390, assets: 11800, debts: 9410 },
  { month: 'July', netWorth: 3490, assets: 12100, debts: 8610 },
];

const chartConfig = {
  netWorth: {
    label: 'Net Worth',
    color: 'hsl(var(--chart-1))',
  },
  assets: {
    label: 'Assets',
    color: 'hsl(var(--chart-2))',
  },
  debts: {
    label: 'Debts',
    color: 'hsl(var(--destructive))',
  },
};

export default function NetWorthChart() {
    const theme = typeof window !== 'undefined' ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light') : 'dark';
    const colors = useMemo(() => ({
        grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        text: theme === 'dark' ? '#E6E8EA' : '#0A0C12',
    }), [theme]);


  return (
    <div className="h-80 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: colors.text, fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: colors.text, fontSize: 12 }}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<ChartTooltipContent
                formatter={(value, name) => {
                    if (name === 'netWorth' || name === 'assets' || name === 'debts') {
                        return `$${(value as number).toLocaleString()}`;
                    }
                    return value;
                }}
                indicator='dot'
                labelClassName='font-bold text-foreground'
                className='bg-card/80 backdrop-blur-sm border-border shadow-lg'
              />}
            />
            <Area
              dataKey="netWorth"
              type="natural"
              fill="url(#colorNetWorth)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: 'hsl(var(--background))',
                stroke: 'hsl(var(--chart-1))',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--background))',
                stroke: 'hsl(var(--chart-1))',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
