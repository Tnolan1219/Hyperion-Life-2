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
} from '@/components/ui/chart'

interface Asset {
    sector?: string;
    value: number;
}

interface SectorDiversificationChartProps {
    assets: Asset[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);


export function SectorDiversificationChart({ assets }: SectorDiversificationChartProps) {
    const chartData = React.useMemo(() => {
        const sectorMap: { [key: string]: number } = {};
        assets.forEach(asset => {
            const sector = asset.sector || 'Uncategorized';
            if (sectorMap[sector]) {
                sectorMap[sector] += asset.value;
            } else {
                sectorMap[sector] = asset.value;
            }
        });
        return Object.entries(sectorMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [assets]);
    
    const chartConfig = {
      value: {
        label: 'Value',
        color: 'hsl(var(--primary))',
      },
    }

  return (
    <Card className="h-full bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Sector Diversification</CardTitle>
        <CardDescription>Value distribution across sectors</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
              width={100}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(value) => chartConfig.value.label}
                formatter={(value) => formatCurrency(value as number)}
              />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
