'use client';

import React from 'react';
import {
  Clock,
  BarChart3,
  Zap,
  Target,
  Info,
  TrendingUp,
  LineChart,
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
import { useRouter } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Chatbot } from '@/components/chatbot';

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
  <Card className="bg-card border-border/60">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {title}
      </CardTitle>
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

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            Welcome back, {user?.displayName || 'Thomas'}
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your portfolio overview
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Portfolio Value"
            value="$1512.06"
            description="+$0.00 (0.00%)"
            change="+$0.00 (0.00%)"
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Holdings"
            value="2"
            description="Active positions"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            title="Top Mover"
            value="QQQ"
            description="+1.43%"
            change="+1.43%"
            icon={<Zap className="h-5 w-5" />}
          />
          <StatCard
            title="Experience"
            value="Intermediate"
            description="Investment level"
            icon={<Target className="h-5 w-5" />}
          />
        </div>

        <Card className="bg-card border-border/60 mt-8">
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
              <span>Daily insight</span>
              <span className="text-muted-foreground/50">•</span>
              <span>Refreshes at midnight</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Dashboard />
      </main>
      <Chatbot />
    </div>
  );
}
