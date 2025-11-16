'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding-store';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal } from '@/app/goals/page';

const quickGoalTemplates: (Omit<Goal, 'id' | 'userId'>)[] = [
  { title: 'Save $1,000 Emergency Fund', targetAmount: 1000, currentAmount: 0, category: 'Savings' },
  { title: 'Pay off Credit Card Debt', targetAmount: 5000, currentAmount: 0, category: 'Debt Reduction' },
  { title: 'Invest $100/month', targetAmount: 1200, currentAmount: 0, category: 'Investment' },
  { title: 'Buy a Home in 3 Years', targetAmount: 50000, currentAmount: 0, category: 'Major Purchase', targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString() },
  { title: 'Reach $100K Net Worth', targetAmount: 100000, currentAmount: 0, category: 'Investment' },
  { title: 'Start a Side Hustle', targetAmount: 1000, currentAmount: 0, category: 'Investment' },
];

export function InitialGoalsStep() {
  const { initialGoals, setInitialGoals, nextStep, prevStep } = useOnboardingStore();

  const toggleGoal = (goal: Omit<Goal, 'id' | 'userId'>) => {
    const isSelected = initialGoals.some(g => g.title === goal.title);
    setInitialGoals(
      isSelected
        ? initialGoals.filter(g => g.title !== goal.title)
        : [...initialGoals, goal]
    );
  };

  return (
    <Card className="w-full glass">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Set Some Starting Goals (Optional)</CardTitle>
        <CardDescription>
          Kickstart your journey by adding a few common financial goals. You can always change these later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickGoalTemplates.map(goal => {
            const isSelected = initialGoals.some(g => g.title === goal.title);
            return (
              <div
                key={goal.title}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
                   isSelected ? "bg-primary/20 border-primary" : "bg-muted/30 border-border hover:border-primary/50"
                )}
              >
                <PlusCircle className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                <div>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">{goal.category} - Target: ${goal.targetAmount.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>{initialGoals.length > 0 ? `Next` : 'Skip and Finish'}</Button>
      </CardFooter>
    </Card>
  );
}
