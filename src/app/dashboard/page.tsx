'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  PlusCircle,
  BarChart,
  PieChart,
  LineChart,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Progress } from '@/components/ui/progress';

const StatCard = ({
  title,
  value,
  icon,
  description,
  change,
  changeColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  change?: string;
  changeColor?: string;
}) => (
  <Card className="glass hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {change && (
        <p
          className={`text-xs flex items-center gap-1 mt-1 ${
            changeColor || 'text-muted-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          {change}
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const ChartPlaceholder = ({ title, icon, description }: { title: string, icon: React.ReactNode, description: string }) => (
    <Card className="col-span-1 lg:col-span-2 min-h-[300px] flex flex-col items-center justify-center glass border-dashed">
        <div className="text-center p-8">
            <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
                {React.cloneElement(icon as React.ReactElement, { className: "h-10 w-10 text-primary" })}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    </Card>
);


export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            Welcome back, {user?.displayName || 'Thomas'}
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial command center.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Link Account
            </Button>
            <Button>
                View Goals
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Worth"
          value="$24,812"
          description="Up 3.2% this month"
          change="+ $776"
          changeColor="text-green-400"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Assets"
          value="$38,120"
          description="Mainly in investments"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Liabilities"
          value="$13,308"
          description="Primarily student loans"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly Cash Flow"
          value="+$1,250"
          description="After all expenses"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 lg:col-span-2 glass">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="text-primary"/>Net Worth Over Time</CardTitle>
                <CardDescription>Your wealth trajectory for the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                 <p className="text-muted-foreground">Chart data coming soon...</p>
            </CardContent>
        </Card>
        <ChartPlaceholder title="Asset Allocation" icon={<PieChart />} description="A breakdown of your assets by class (stocks, crypto, real estate, etc)." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 glass">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="text-primary"/>Goal In Focus</CardTitle>
                <CardDescription>Your top priority right now.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-[300px]">
                <div 
                  className="relative h-32 w-32"
                  style={{
                    // @ts-ignore
                    "--progress": '65%',
                    "--stroke-width": '8px',
                    "--bg-color": "hsl(var(--secondary))",
                    "--fg-color": "hsl(var(--primary))",
                  }}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted"
                      strokeWidth="var(--stroke-width)"
                      stroke="var(--bg-color)"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="var(--stroke-width)"
                      strokeDasharray="264"
                      strokeDashoffset="calc(264 - (264 * 65) / 100))"
                      strokeLinecap="round"
                      stroke="var(--fg-color)"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-bold">65%</span>
                  </div>
                </div>
                <h3 className="mt-4 font-semibold text-lg">House Down Payment</h3>
                <p className="text-sm text-muted-foreground">$16,250 / $25,000</p>
            </CardContent>
        </Card>
         <Card className="col-span-1 lg:col-span-3 glass">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                 <p className="text-muted-foreground">Transaction data coming soon...</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
