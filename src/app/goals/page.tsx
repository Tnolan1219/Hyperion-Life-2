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
import { PlusCircle, Edit, Trash2, Home, Car, PiggyBank, Briefcase, GraduationCap } from 'lucide-react';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';


export type Goal = {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: GoalCategory;
  targetDate?: string;
  userId?: string;
};

export type GoalCategory = 'Savings' | 'Investment' | 'Debt Reduction' | 'Major Purchase' | 'Retirement';

export const goalCategories: { name: GoalCategory, icon: React.ElementType, color: string }[] = [
    { name: 'Major Purchase', icon: Home, color: 'blue' },
    { name: 'Savings', icon: PiggyBank, color: 'green' },
    { name: 'Retirement', icon: Briefcase, color: 'purple' },
    { name: 'Debt Reduction', icon: Car, color: 'red' },
    { name: 'Investment', icon: GraduationCap, color: 'orange' },
];

const categoryStyles = goalCategories.reduce((acc, category) => {
    acc[category.name] = { icon: category.icon, color: category.color };
    return acc;
}, {} as Record<GoalCategory, { icon: React.ElementType; color: string }>);


const GoalCard = ({ goal }: { goal: Goal }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const { icon: Icon, color } = categoryStyles[goal.category] || { icon: PiggyBank, color: 'gray' };
  
  const daysLeft = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : null;

  const handleDelete = () => {
    if (firestore && user && goal.id) {
        const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
        deleteDocumentNonBlocking(goalDocRef);
    }
  }

  return (
    <>
    <Card className="glass hover:border-primary/60 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", `bg-${color}-500/10 text-${color}-500`)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="text-xl font-bold">{goal.title}</CardTitle>
                <CardDescription className="mt-1">{goal.category}</CardDescription>
            </div>
          </div>
          {daysLeft !== null && (
             <div className="text-sm text-muted-foreground text-right">
                <p className="font-semibold">{daysLeft}</p>
                <p className="text-xs">days left</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-2 text-sm text-muted-foreground flex justify-between">
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(goal.currentAmount)}
          </span>
          <span className="font-semibold">
            {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(goal.targetAmount)}
          </span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="mt-2 text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    <GoalDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} goal={goal} />
    </>
  );
};

const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
             <Card key={i} className="glass">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between mb-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function GoalsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const goalsCollection = useMemo(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/goals`);
    }
    return null;
  }, [firestore, user]);

  const { data: goals, isLoading } = useCollection<Goal>(goalsCollection);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your financial ambitions.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Goal
        </Button>
      </div>
      
      {isLoading && <LoadingSkeleton />}

      {!isLoading && goals && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          <Card onClick={() => setIsDialogOpen(true)} className="min-h-[280px] flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-border/60 hover:border-primary/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer hover:bg-muted/30">
              <PlusCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Create a New Goal</h3>
              <p className="text-sm text-muted-foreground mt-1">Start your next financial journey.</p>
          </Card>
        </div>
      )}
      
      <GoalDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />

    </div>
  );
}
