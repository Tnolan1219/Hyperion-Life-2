'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
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
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

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
      <div className="text-muted-foreground">
        {icon}
      </div>
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
        <p className="intro font-bold text-base text-primary">{`$${new Intl.NumberFormat().format(payload[0].value)}`}</p>
      </div>
    );
  }

  return null;
};


export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            Good Morning, {user?.displayName || 'Thomas'}
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial command center.
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
                <CardTitle className="flex items-center gap-2">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                     <RechartsAreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="absolute top-4 right-4">See all</Button>
            </CardHeader>
            <CardContent className="h-[350px] space-y-4">
                 <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-4"><Wallet /></div>
                    <div className="flex-grow">
                        <p className="font-semibold">Dribbble</p>
                        <p className="text-sm text-muted-foreground">Today, 15:10</p>
                    </div>
                    <p className="font-bold">-$142.00</p>
                 </div>
                 <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-4"><TrendingUp /></div>
                    <div className="flex-grow">
                        <p className="font-semibold">Trent Bolt</p>
                        <p className="text-sm text-muted-foreground">Yesterday, 09:45</p>
                    </div>
                    <p className="font-bold text-green-400">+$74.00</p>
                 </div>
                 <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-4"><Wallet /></div>
                    <div className="flex-grow">
                        <p className="font-semibold">Apple Services</p>
                        <p className="text-sm text-muted-foreground">Yesterday, 05:10</p>
                    </div>
                    <p className="font-bold">-$12.00</p>
                 </div>
                 <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-4"><Wallet /></div>
                    <div className="flex-grow">
                        <p className="font-semibold">Ryne LTD</p>
                        <p className="text-sm text-muted-foreground">2 Aug, 09:11</p>
                    </div>
                    <p className="font-bold">-$18.00</p>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
