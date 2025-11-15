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
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
import { Asset } from '../portfolio/page';
import { Debt } from '../portfolio/page';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
};


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
  <Card className="glass hover:border-primary/50 hover:-translate-y-1">
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary py-1">{value}</div>
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

    return (
        <Card className="h-full flex flex-col glass hover:border-primary/50 hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Goal In Focus</CardTitle>
                <CardDescription>Your top priority goal right now.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="relative h-40 w-40">
                   <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="hsl(var(--primary) / 0.1)"
                            strokeWidth="12"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#goal-gradient)"
                            strokeWidth="12"
                            strokeDasharray={`${(progress / 100) * 339.29} 339.29`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-in-out"
                        />
                         <defs>
                            <linearGradient id="goal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{progress.toFixed(0)}%</span>
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

  const goalsCollection = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/goals`);
    }
    return null;
  }, [firestore, user]);

  const assetsCollection = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/assets`);
    }
    return null;
  }, [firestore, user]);

  const debtsCollection = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/debts`);
    }
    return null;
  }, [firestore, user]);

  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsCollection);
  const { data: assets, isLoading: assetsLoading } = useCollection<Asset>(assetsCollection);
  const { data: debts, isLoading: debtsLoading } = useCollection<Debt>(debtsCollection);

  const { netWorth, totalAssets, totalLiabilities, cashFlow } = useMemo(() => {
    const totalAssets = assets?.reduce((acc, asset) => {
        const price = asset.price || (asset.type === 'Stock' ? Math.random() * 500 : asset.type === 'Crypto' ? Math.random() * 70000 : 100);
        return acc + asset.balance * price;
    }, 0) || 0;
    const totalLiabilities = debts?.reduce((acc, debt) => acc + debt.balance, 0) || 0;
    const netWorth = totalAssets - totalLiabilities;
    // TODO: Calculate cash flow from income/expenses
    const cashFlow = 1250; 
    return { netWorth, totalAssets, totalLiabilities, cashFlow };
  }, [assets, debts]);


  const goalInFocus = useMemo(() => {
    if (!goals || goals.length === 0) return null;
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
          <h1 className="text-4xl font-bold flex items-center gap-3 text-primary">
            {greeting}, {user?.displayName || 'Guest'}
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
          value={formatCurrency(netWorth)}
          description="+3.2% this month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Assets"
          value={formatCurrency(totalAssets)}
          description="Mainly investments"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Liabilities"
          value={formatCurrency(totalLiabilities)}
          description="Student loans"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Cash Flow"
          value={`+${formatCurrency(cashFlow)}`}
          description="After expenses"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="col-span-1 lg:col-span-3 glass hover:border-primary/50 hover:-translate-y-1">
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
                 <Card className="h-full flex flex-col items-center justify-center text-center glass hover:border-primary/50 hover:-translate-y-1">
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
