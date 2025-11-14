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
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { Skeleton } from '@/components/ui/skeleton';

export type Goal = {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  userId?: string;
};


const GoalCard = ({ goal }: { goal: Goal }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  
  const handleDelete = () => {
    if (firestore && user && goal.id) {
        const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
        deleteDocumentNonBlocking(goalDocRef);
    }
  }

  return (
    <>
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
            }).format(goal.currentAmount)}
          </span>{' '}
          /
          {' '}{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(goal.targetAmount)}
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
             <Card key={i} className="bg-card/60 border-border/60">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
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
          <Card onClick={() => setIsDialogOpen(true)} className="min-h-[280px] flex flex-col items-center justify-center bg-card/40 border-border/40 border-dashed hover:border-primary/80 transition-colors hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer">
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
