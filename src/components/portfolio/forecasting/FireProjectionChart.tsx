'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

interface FireProjectionChartProps {
    projectionData: { year: number; value: number }[];
    fiNumber: number;
}

export function FireProjectionChart({ projectionData, fiNumber }: FireProjectionChartProps) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Portfolio Growth to FI</CardTitle>
        <CardDescription>Your projected portfolio value over time until you reach your FI number.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background) / 0.8)',
                borderColor: 'hsl(var(--border) / 0.5)',
                backdropFilter: 'blur(4px)',
              }}
              labelFormatter={(label) => `Year: ${label}`}
              formatter={(value: number) => [formatCurrency(value, 2), 'Portfolio Value']}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorGrowth)" strokeWidth={2} name="Projected Value" />
            <ReferenceLine y={fiNumber} label={{ value: `FI: ${formatCurrency(fiNumber)}`, position: 'insideTopRight', fill: 'hsl(var(--secondary))' }} stroke="hsl(var(--secondary))" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
