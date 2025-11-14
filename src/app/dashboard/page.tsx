'use client';

import React, { useState, useEffect } from 'react';
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
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useCollection, useFirestore } from '@/firebase';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell,
} from 'recharts';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { Goal } from '../goals/page';
import { Progress } from '@/components/ui/progress';

const StatCard = ({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <Card>
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const chartData = [
  { month: 'Jan', value: 18600 },
  { month: 'Feb', value: 30500 },
  { month: 'Mar', value: 23700 },
  { month: 'Apr', value: 19800 },
  { month: 'May', value: 25100 },
  { month: 'Jun', value: 34900 },
  { month: 'Jul', value: 32000 },
  { month: 'Aug', value: 38000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg">
        <p className="label text-sm text-muted-foreground">{`${label}`}</p>
        <p className="intro font-bold text-base text-primary">{`$${new Intl.NumberFormat().format(
          payload[0].value
        )}`}</p>
      </div>
    );
  }

  return null;
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

const GoalInFocus = ({ goal }: { goal: Goal }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Goal In Focus</CardTitle>
                <CardDescription>Your top priority goal right now.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 140 140">
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="hsl(var(--secondary))"
                            strokeWidth="12"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 70 70)"
                            className="transition-all duration-1000 ease-in-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{progress.toFixed(0)}%</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold mt-4">{goal.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.currentAmount)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.targetAmount)}
                </p>
            </CardContent>
             <div className="p-6 pt-0">
                <Button className="w-full">Contribute</Button>
            </div>
        </Card>
    );
};


export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const goalsCollection = useMemo(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/goals`);
    }
    return null;
  }, [firestore, user]);

  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsCollection);

  const goalInFocus = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    // Simple logic: return the goal with the nearest target date, or the first one.
    return [...goals].sort((a, b) => {
        if (a.targetDate && b.targetDate) return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        return 0;
    })[0];
  }, [goals])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            {greeting}, {user?.displayName || 'Thomas'}
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial command center for today.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Worth"
          value="$24,812"
          description="+3.2% this month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Assets"
          value="$38,120"
          description="Mainly investments"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Liabilities"
          value="$13,308"
          description="Student loans"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Cash Flow"
          value="+$1,250"
          description="After expenses"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Net Worth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border) / 0.5)"
                  vertical={false}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="col-span-1 lg:col-span-2">
            {goalInFocus ? (
                <GoalInFocus goal={goalInFocus} />
            ) : (
                 <Card className="h-full flex flex-col items-center justify-center text-center">
                     <CardHeader>
                        <div className="flex items-center justify-center h-16 w-16 bg-primary/10 rounded-full mx-auto mb-4">
                            <Target className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Set a Financial Goal</CardTitle>
                        <CardDescription>Start tracking your progress towards your financial ambitions.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Button>Create a Goal</Button>
                     </CardContent>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}
