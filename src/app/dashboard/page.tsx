'use client';

import React, { useMemo } from 'react';
import {
  BrainCircuit,
  DollarSign,
  Goal,
  Landmark,
  User,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie } from 'recharts';
import { Auth } from 'firebase/auth';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/landing/header';

type Asset = {
  type: string;
  value: number;
};
type Debt = {
  type: string;
  balance: number;
};
type GoalType = {
  goalType: string;
  targetAmount: number;
  progressAmount: number;
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
  description?: string;
}) => (
  <Card className="glass">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-text-muted">{description}</p>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useUser();
  const firestore = useFirestore();

  const assetsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, 'users', user.uid, 'assets'))
        : null,
    [user?.uid, firestore]
  );
  const { data: assets } = useCollection<Asset>(assetsQuery);

  const debtsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, 'users', user.uid, 'debts'))
        : null,
    [user?.uid, firestore]
  );
  const { data: debts } = useCollection<Debt>(debtsQuery);

  const goalsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, 'users', user.uid, 'goals'))
        : null,
    [user?.uid, firestore]
  );
  const { data: goals } = useCollection<GoalType>(goalsQuery);

  const totalAssets = useMemo(
    () => assets?.reduce((sum, asset) => sum + asset.value, 0) || 0,
    [assets]
  );
  const totalDebts = useMemo(
    () => debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0,
    [debts]
  );
  const netWorth = totalAssets - totalDebts;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const assetAllocation = useMemo(() => {
    const allocation: { [key: string]: number } = {};
    assets?.forEach(asset => {
      if (allocation[asset.type]) {
        allocation[asset.type] += asset.value;
      } else {
        allocation[asset.type] = asset.value;
      }
    });
    return Object.entries(allocation).map(([name, value]) => ({ name, value }));
  }, [assets]);
  
  const debtToAssetsData = [
    { name: 'Assets', value: totalAssets },
    { name: 'Debts', value: totalDebts },
  ];

  return (
    <div className="pt-24 pb-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.displayName || 'Investor'}
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Net Worth"
            value={formatCurrency(netWorth)}
            description="Total assets minus total debts"
            icon={<User className="h-4 w-4 text-text-muted" />}
          />
          <StatCard
            title="Total Assets"
            value={formatCurrency(totalAssets)}
            description={`${assets?.length || 0} assets tracked`}
            icon={<Landmark className="h-4 w-4 text-text-muted" />}
          />
          <StatCard
            title="Total Debts"
            value={formatCurrency(totalDebts)}
            description={`${debts?.length || 0} debts tracked`}
            icon={<DollarSign className="h-4 w-4 text-text-muted" />}
          />
          <StatCard
            title="Goals"
            value={`${goals?.length || 0} Active`}
            description="On track to meet your targets"
            icon={<Goal className="h-4 w-4 text-text-muted" />}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <Card className="glass md:col-span-2">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>
                How your assets are distributed across different classes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={assetAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="hsl(var(--primary-neon))" label />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle>Debt vs. Assets</CardTitle>
              <CardDescription>Your current financial leverage.</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={debtToAssetsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Bar dataKey="value" fill="hsl(var(--primary-neon))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
         <Card className="glass mt-8">
            <CardHeader>
              <CardTitle>AI Financial Coach</CardTitle>
              <CardDescription>
                Your personalized financial guide.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-[200px]">
                <BrainCircuit className="w-12 h-12 text-primary-neon mb-4" />
                <p className="text-text-muted mb-4">Ready to optimize your finances? Start a session with your AI coach.</p>
                <Button>Start Coaching Session</Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

const SignInPrompt = ({ auth }: { auth: Auth | null }) => {
  const handleAnonymousSignIn = async () => {
    if (auth) {
      try {
        initiateAnonymousSignIn(auth);
      } catch (error) {
        console.error('Anonymous sign-in failed', error);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Base 44</CardTitle>
          <CardDescription>
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleAnonymousSignIn} className="w-full btn-primary-gradient text-background font-bold">
            Sign In As Guest
          </Button>
          <p className="text-xs text-text-muted text-center">
            By signing in, you agree to our Terms of Service. For this demo, we'll
            sign you in anonymously.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    </div>
  );
}
