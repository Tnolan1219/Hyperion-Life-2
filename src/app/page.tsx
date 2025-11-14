
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BrainCircuit,
  DollarSign,
  Goal,
  Landmark,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Auth } from 'firebase/auth';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useFirestore } from '@/firebase';
import { Logo } from '@/components/icons/logo';

type Asset = {
  type: string;
  value: number;
};
type Debt = {
  type: string;
  balance: number;
};
type Goal = {
  goalType: string;
  targetAmount: number;
  progressAmount: number;
};

const Header = () => {
  const { user } = useUser();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-elevated/80 border-b border-outline backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="text-primary h-6 w-6" />
          <span className="text-xl font-bold">Base 44</span>
        </div>
        {user && (
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm">
              <Landmark className="mr-2 h-4 w-4" /> Assets
            </Button>
            <Button variant="ghost" size="sm">
              <DollarSign className="mr-2 h-4 w-4" /> Debts
            </Button>
            <Button variant="ghost" size="sm">
              <Goal className="mr-2 h-4 w-4" /> Goals
            </Button>
            <Button variant="ghost" size="sm">
              <BrainCircuit className="mr-2 h-4 w-4" /> Coaching
            </Button>
          </nav>
        )}
        {user && auth ? (
          <Button variant="ghost" onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
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
  <Card>
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
  const { data: goals } = useCollection<Goal>(goalsQuery);

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
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>
                How your assets are distributed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetAllocation} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>AI Financial Coach</CardTitle>
              <CardDescription>
                Your personalized financial guide.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-[300px]">
                <BrainCircuit className="w-16 h-16 text-primary mb-4" />
                <p className="text-text-muted mb-4">Ready to optimize your finances? Start a session with your AI coach.</p>
                <Button>Start Coaching Session</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SignIn = ({ auth }: { auth: Auth | null }) => {
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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Base 44</CardTitle>
          <CardDescription>
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleAnonymousSignIn} className="w-full">
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

export default function AppPage() {
  const { user, isLoading } = useUser();
  const auth = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="overflow-x-hidden">
        {user ? <Dashboard /> : <SignIn auth={auth} />}
      </main>
    </div>
  );
}
