'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  LineChart,
  Info,
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

const StatCard = ({
  title,
  value,
  icon,
  description,
  change,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  change?: string;
}) => (
  <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-colors duration-300 hover:shadow-2xl hover:shadow-primary/10">
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
        <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
          <TrendingUp className="h-4 w-4" />
          {change}
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
       <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          Welcome back, {user?.displayName || 'Thomas'}
          <span className="text-3xl">👋</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your financial overview for today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Portfolio Value"
          value="$1512.06"
          description="+$0.00 (0.00%)"
          change="+$0.00 (0.00%)"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Holdings"
          value="2"
          description="Active positions"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Top Mover"
          value="QQQ"
          description="+1.43%"
          change="+1.43%"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          title="Net Worth"
          value="$24,812"
          description="Up 3.2% this month"
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-primary">
              <LineChart className="h-5 w-5" />
            </span>
            Daily Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your portfolio is actively tracking market movements. Review your
            holdings regularly to stay informed.
          </p>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
            <Info className="h-4 w-4" />
            <span>Daily insight powered by AI</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Refreshes at midnight</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
