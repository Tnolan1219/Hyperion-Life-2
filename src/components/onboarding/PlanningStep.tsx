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
import { Map, ListChecks, Bot, BarChart, Trophy, Orbit, Budget } from 'lucide-react';
import { cn } from '@/lib/utils';

const planningOptions = [
  { id: 'visual_flowcharts', label: 'Visual flowcharts', icon: Map },
  { id: 'monthly_checklists', label: 'Monthly checklists', icon: ListChecks },
  { id: 'ai_coaching', label: 'AI-guided coaching', icon: Bot },
  { id: 'data_dashboards', label: 'Data dashboards & charts', icon: BarChart },
  { id: 'milestone_tracking', label: 'Milestone tracking', icon: Trophy },
  { id: 'scenario_simulations', label: 'Scenario simulations', icon: Orbit },
  { id: 'budgeting_tools', label: 'Budgeting tools', icon: Budget },
];

export function PlanningStep() {
  const { planningPreferences, setPlanningPreferences, nextStep, prevStep } = useOnboardingStore();

  const togglePreference = (preferenceId: string) => {
    setPlanningPreferences(
      planningPreferences.includes(preferenceId)
        ? planningPreferences.filter(p => p !== preferenceId)
        : [...planningPreferences, preferenceId]
    );
  };

  return (
    <Card className="w-full glass">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Planning & Tracking Preferences</CardTitle>
        <CardDescription>
          How do you like to plan and track your progress?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {planningOptions.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              onClick={() => togglePreference(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer h-32",
                planningPreferences.includes(id) ? "bg-primary/20 border-primary" : "bg-muted/30 border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn("h-8 w-8", planningPreferences.includes(id) ? "text-primary" : "text-muted-foreground")} />
              <span className="font-medium text-sm text-center">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep} disabled={planningPreferences.length === 0}>Next</Button>
      </CardFooter>
    </Card>
  );
}
