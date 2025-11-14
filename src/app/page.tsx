'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import Ticker from '@/components/dashboard/ticker';
import NetWorthChart from '@/components/dashboard/net-worth-chart';
import GoalsOverview from '@/components/dashboard/goals-overview';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import StatCard from '@/components/dashboard/stat-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Asset, Debt, Goal, Tip } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { firestore, user } = useFirebase();

  const assetsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'assets')) : null),
    [firestore, user]
  );
  const { data: assets, isLoading: assetsLoading } = useCollection<Asset>(assetsQuery);

  const debtsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'debts')) : null),
    [firestore, user]
  );
  const { data: debts, isLoading: debtsLoading } = useCollection<Debt>(debtsQuery);
  
  const goalsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'goals')) : null),
    [firestore, user]
  );
  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsQuery);

  const tipsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'tips') : null),
    [firestore]
  );
  const { data: tips } = useCollection<Tip>(tipsQuery);

  const tickerItems = tips?.map(tip => tip.body) ?? [
    'Quick Tip: Automate your savings to build wealth effortlessly.',
    'Market News: Tech stocks surge on positive economic data.',
    'AI Advice: Based on your risk tolerance, consider diversifying into ETFs.',
    'Resource: Check out our blog for tips on debt management.',
    'Quick Tip: Review your budget monthly to stay on track.',
    'Market News: Inflation shows signs of cooling, bond yields adjust.',
    'AI Advice: Your emergency fund is on track to meet your 6-month goal.',
  ];

  const totalAssets = assets?.reduce((sum, asset) => sum + asset.value, 0) ?? 0;
  const totalDebts = debts?.reduce((sum, debt) => sum + debt.balance, 0) ?? 0;
  const netWorth = totalAssets - totalDebts;

  const totalInvesting = assets?.filter(a => a.type === 'investment').reduce((sum, asset) => sum + asset.value, 0) ?? 0;
  
  const isLoading = assetsLoading || debtsLoading;

  return (
    <div className="flex flex-col gap-8">
      <Ticker items={tickerItems} />

      <main className="grid flex-1 items-start gap-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Net Worth"
              value={netWorth}
              trend="+2.1% from last month"
              icon={<TrendingUp className="h-6 w-6 text-foreground/80" />}
              isLoading={isLoading}
              isCurrency
            />
            <StatCard
              title="Assets"
              value={totalAssets}
              trend="+1.5% from last month"
              icon={<ArrowUpRight className="h-6 w-6 text-green-400" />}
              isLoading={isLoading}
              isCurrency
            />
            <StatCard
              title="Debts"
              value={totalDebts}
              trend="-0.5% from last month"
              icon={<ArrowDownRight className="h-6 w-6 text-red-400" />}
              isLoading={isLoading}
              isCurrency
            />
            <StatCard
              title="Investing"
              value={totalInvesting}
              trend="+4.2% from last month"
              icon={<DollarSign className="h-6 w-6 text-foreground/80" />}
              isLoading={isLoading}
              isCurrency
            />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Net Worth Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <NetWorthChart />
              </CardContent>
            </Card>
            <GoalsOverview goals={goals} isLoading={goalsLoading} />
          </div>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <Card className="flex flex-col bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Coaching Nudges
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-4 text-sm text-foreground/80">
                <p>
                  You've categorized 3 transactions this week. Great job
                  staying on top of your spending!
                </p>
                <Separator />
                <p>
                  Your "House Down Payment" goal is 75% complete. You're projected to
                  hit your target 2 months ahead of schedule!
                </p>
                <Separator />
                <p>
                  Consider increasing your 401(k) contribution by 1% to maximize your employer match.
                </p>
              </div>
              <Button variant="outline" className="mt-6 w-full" asChild>
                <Link href="/coaching">Start AI Coaching</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
