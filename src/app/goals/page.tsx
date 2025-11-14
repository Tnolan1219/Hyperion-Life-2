'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Target, Edit, Trash2 } from 'lucide-react';

const exampleGoals = [
  {
    id: 1,
    title: 'Emergency Fund',
    target: 15000,
    current: 12500,
    category: 'Savings',
  },
  {
    id: 2,
    title: 'House Down Payment',
    target: 50000,
    current: 11250,
    category: 'Investing',
  },
  {
    id: 3,
    title: 'Pay Off Student Loan',
    target: 22000,
    current: 18000,
    category: 'Debt',
  },
];

const GoalCard = ({
  goal,
}: {
  goal: {
    id: number;
    title: string;
    target: number;
    current: number;
    category: string;
  };
}) => {
  const progress = (goal.current / goal.target) * 100;
  return (
    <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{goal.title}</CardTitle>
            <CardDescription className="mt-1">{goal.category}</CardDescription>
          </div>
          <Target className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(goal.current)}
          </span>{' '}
          /
          {' '}{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(goal.target)}
        </div>
        <Progress value={progress} className="h-3" />
        <p className="mt-2 text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your financial ambitions.
          </p>
        </div>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exampleGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
         <Card className="min-h-[280px] flex flex-col items-center justify-center bg-card/40 border-border/40 border-dashed hover:border-primary/80 transition-colors hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            <PlusCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Create a New Goal</h3>
            <p className="text-sm text-muted-foreground mt-1">Start your next financial journey.</p>
        </Card>
      </div>
    </div>
  );
}
