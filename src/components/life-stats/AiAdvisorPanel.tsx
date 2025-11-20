
'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { generatePersonalizedFinancialAdvice } from '@/ai/flows/generate-personalized-financial-advice';
import type { Asset, Debt } from '@/app/portfolio/page';
import type { Goal } from '@/app/goals/page';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);


export function AiAdvisorPanel() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [nudges, setNudges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Data fetching
  const assetsCollection = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/assets`) : null, [user, firestore]);
  const debtsCollection = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/debts`) : null, [user, firestore]);
  const goalsCollection = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/goals`) : null, [user, firestore]);

  const { data: assets, isLoading: assetsLoading } = useCollection<Asset>(assetsCollection);
  const { data: debts, isLoading: debtsLoading } = useCollection<Debt>(debtsCollection);
  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsCollection);

  const dataIsLoading = assetsLoading || debtsLoading || goalsLoading;

  const financialSummary = useMemo(() => {
    if (dataIsLoading || !assets || !debts) {
      return { assetsSummary: 'Loading...', debtsSummary: 'Loading...' };
    }
    const totalAssets = assets.reduce((acc, asset) => acc + asset.balance * (asset.price || 1), 0);
    const totalDebts = debts.reduce((acc, debt) => acc + debt.balance, 0);
    return {
      assetsSummary: `Total assets of ${formatCurrency(totalAssets)} across ${assets.length} holdings.`,
      debtsSummary: `Total debts of ${formatCurrency(totalDebts)} across ${debts.length} liabilities.`,
    };
  }, [assets, debts, dataIsLoading]);


  const handleGenerateAdvice = async () => {
    if (!user || !goals || !assets || !debts) return;
    setIsLoading(true);
    setNudges([]);

    const input = {
      userId: user.uid,
      profile: { name: user.displayName || 'User', age: 30, location: 'United States', income: 100000, careerStage: 'Mid-Career' },
      goals: goals.map(g => ({ goalType: g.category, targetAmount: g.targetAmount, targetDate: g.targetDate || '', progressAmount: g.currentAmount })),
      assetsSummary: financialSummary.assetsSummary,
      debtsSummary: financialSummary.debtsSummary,
      riskTolerance: 'moderate',
    };

    try {
      const result = await generatePersonalizedFinancialAdvice(input);
      setNudges(result.nudges);
    } catch (e) {
      console.error(e);
      setNudges(["Sorry, I couldn't generate advice right now."]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="glass mt-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                AI Advisor
            </CardTitle>
            <CardDescription>Personalized suggestions to help you level up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[150px]">
            {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
            
            {!isLoading && nudges.length === 0 && (
                <div className="text-center text-muted-foreground pt-4">
                    <p>Click the button to get personalized coaching nudges based on your profile.</p>
                </div>
            )}
            
            {!isLoading && nudges.length > 0 && (
                 <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                    {nudges.map((nudge, i) => <li key={i}>{nudge}</li>)}
                </ul>
            )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleGenerateAdvice} disabled={isLoading || dataIsLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Get Advice
            </Button>
        </CardFooter>
    </Card>
  )
}
