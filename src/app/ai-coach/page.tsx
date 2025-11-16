
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { Lightbulb, User, Bot, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { synthesizeUserPersona } from '@/ai/flows/synthesize-user-persona';
import { generatePersonalizedFinancialAdvice } from '@/ai/flows/generate-personalized-financial-advice';
import { simulateFinancialScenario } from '@/ai/flows/simulate-financial-scenarios';

import type { Asset, Debt } from '@/app/portfolio/page';
import type { Goal } from '@/app/goals/page';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);


export default function AICoachPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // State for AI features
  const [persona, setPersona] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [nudges, setNudges] = useState<string[]>([]);
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioResult, setScenarioResult] = useState<{ projectedOutcome: string; aiCommentary: string } | null>(null);

  // Loading states
  const [isPersonaLoading, setIsPersonaLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);

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


  const handleGeneratePersona = async () => {
    if (!user || !goals || !assets || !debts || !firestore) return;
    setIsPersonaLoading(true);
    setPersona(null);

    const input = {
      profile: {
        name: user.displayName || 'User',
        age: 30, // Placeholder
        location: 'United States', // Placeholder
        income: 100000, // Placeholder
        careerStage: 'Mid-Career', // Placeholder
      },
      preferences: {
        riskTolerance: 'moderate',
        darkMode: true,
        reducedMotion: false,
        notificationOptIn: true,
      },
      goals: goals.map(g => ({
        goalType: g.category,
        targetAmount: g.targetAmount,
        targetDate: g.targetDate || '',
        progressAmount: g.currentAmount,
      })),
      assetsSummary: financialSummary.assetsSummary,
      debtsSummary: financialSummary.debtsSummary,
    };

    try {
      const result = await synthesizeUserPersona(input);
      setPersona(result.aiPersonaSummary);
      // Save persona to user document
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { persona: result.aiPersonaSummary });
    } catch (e) {
      console.error(e);
      setPersona("Sorry, I couldn't generate your persona right now.");
    } finally {
      setIsPersonaLoading(false);
    }
  };

  const handleGenerateAdvice = async () => {
    if (!user || !goals || !assets || !debts) return;
    setIsAdviceLoading(true);
    setAdvice(null);
    setNudges([]);

    const input = {
      userId: user.uid,
      profile: {
        name: user.displayName || 'User',
        age: 30,
        location: 'United States',
        income: 100000,
        careerStage: 'Mid-Career',
      },
      goals: goals.map(g => ({
        goalType: g.category,
        targetAmount: g.targetAmount,
        targetDate: g.targetDate || '',
        progressAmount: g.currentAmount,
      })),
      assetsSummary: financialSummary.assetsSummary,
      debtsSummary: financialSummary.debtsSummary,
      riskTolerance: 'moderate',
    };

    try {
      const result = await generatePersonalizedFinancialAdvice(input);
      setAdvice(result.advice);
      setNudges(result.nudges);
    } catch (e) {
      console.error(e);
      setAdvice("Sorry, I couldn't generate advice right now.");
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const handleSimulateScenario = async () => {
    if (!scenarioInput.trim() || !user || !goals || !assets || !debts) return;
    setIsScenarioLoading(true);
    setScenarioResult(null);

    const userProfileSummary = `Goals: ${goals.length}, Assets: ${financialSummary.assetsSummary}, Debts: ${financialSummary.debtsSummary}`;
    const input = {
      scenarioDescription: scenarioInput,
      userProfile: userProfileSummary,
    };

    try {
      const result = await simulateFinancialScenario(input);
      setScenarioResult(result);
    } catch (e) {
      console.error(e);
      setScenarioResult({
        projectedOutcome: 'Error',
        aiCommentary: "Sorry, I couldn't run the simulation right now.",
      });
    } finally {
      setIsScenarioLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary">AI Coach</h1>
        <p className="text-muted-foreground mt-2">
          Your personal AI for financial wisdom and strategic planning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Persona & Advice Column */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="text-primary" />Your AI Persona</CardTitle>
              <CardDescription>A summary of your financial identity, as seen by your AI coach.</CardDescription>
            </CardHeader>
            <CardContent>
              {isPersonaLoading && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
              {persona && <p className="text-muted-foreground">{persona}</p>}
              {!persona && !isPersonaLoading && <p className="text-muted-foreground">Click the button to generate your financial persona.</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGeneratePersona} disabled={isPersonaLoading || dataIsLoading}>
                {isPersonaLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {persona ? 'Regenerate Persona' : 'Generate Persona'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" />Personalized Advice</CardTitle>
              <CardDescription>Actionable recommendations based on your complete financial picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdviceLoading && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
              {advice && (
                <>
                  <p className="font-semibold">Main Advice:</p>
                  <p className="text-muted-foreground">{advice}</p>
                </>
              )}
              {nudges.length > 0 && (
                <>
                  <p className="font-semibold pt-4">Coaching Nudges:</p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {nudges.map((nudge, i) => <li key={i}>{nudge}</li>)}
                  </ul>
                </>
              )}
              {!advice && !isAdviceLoading && <p className="text-muted-foreground">Click the button to generate personalized advice.</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateAdvice} disabled={isAdviceLoading || dataIsLoading}>
                {isAdviceLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Get Fresh Advice
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Scenario Simulator Column */}
        <div className="space-y-8">
            <Card className="sticky top-24">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" />Financial Scenario Simulator</CardTitle>
                <CardDescription>Ask "what if?" to see the potential impact of your decisions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="scenario" className="font-semibold">Describe a scenario:</Label>
                        <Textarea
                            id="scenario"
                            placeholder="e.g., What if I start a side business that makes an extra $1000/month? Or, what is the impact of paying off my student loan 5 years early?"
                            value={scenarioInput}
                            onChange={(e) => setScenarioInput(e.target.value)}
                            className="mt-2 min-h-[100px]"
                        />
                    </div>
                    {isScenarioLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /><span>Simulating...</span></div>}
                    {scenarioResult && (
                        <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                            <div>
                                <p className="font-semibold text-foreground">Projected Outcome:</p>
                                <p className="text-muted-foreground">{scenarioResult.projectedOutcome}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">AI Commentary:</p>
                                <p className="text-muted-foreground">{scenarioResult.aiCommentary}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                <Button onClick={handleSimulateScenario} disabled={isScenarioLoading || dataIsLoading || !scenarioInput.trim()} className="w-full">
                    {isScenarioLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Simulate Scenario
                </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

    