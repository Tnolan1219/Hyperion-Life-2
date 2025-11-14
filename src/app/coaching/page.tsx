'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { simulateFinancialScenario } from '@/ai/flows/simulate-financial-scenarios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User as UserIcon } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoachingPage() {
  const [scenario, setScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ projectedOutcome: string; aiCommentary: string } | null>(null);
  const { user } = useFirebase();

  const handleSimulate = async () => {
    setIsLoading(true);
    setResult(null);

    const res = await simulateFinancialScenario({
      scenarioDescription: scenario,
      userProfile: JSON.stringify({
        displayName: user?.displayName,
        email: user?.email,
      }),
    });
    setResult(res);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Financial Coach</h1>
        <p className="text-muted-foreground mt-2">
          Explore financial scenarios and get AI-powered advice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe a financial scenario, e.g., 'What if I invest $500 monthly in an S&P 500 index fund for 10 years?' or 'How would buying a $300,000 house impact my savings?'"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSimulate} disabled={isLoading || !scenario}>
            {isLoading ? 'Simulating...' : 'Simulate Scenario'}
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <UserIcon className="h-6 w-6 text-primary" />
              <CardTitle>Your Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground">{scenario}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>AI Simulation Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Projected Outcome</h3>
                <p className="text-foreground/80">{result.projectedOutcome}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Commentary</h3>
                <p className="text-foreground/80">{result.aiCommentary}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
