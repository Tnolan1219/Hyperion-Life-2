'use client';

import React, { useMemo } from 'react';
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
import { PlusCircle, Edit, Trash2, Home, Car, PiggyBank, Briefcase, GraduationCap, Target } from 'lucide-react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';
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

const GoalInFocus = ({ goal, onEdit }: { goal: Goal, onEdit: (g: Goal) => void }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const firestore = useFirestore();
    const { user } = useUser();
    
    const handleDelete = () => {
        if (firestore && user && goal.id) {
            const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
            deleteDocumentNonBlocking(goalDocRef);
        }
    }

    return (
        <Card className="h-full flex flex-col glass hover:border-primary/50 hover:-translate-y-1 col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Goal In Focus</CardTitle>
                <CardDescription>Your top priority goal right now.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="relative h-48 w-48">
                   <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="hsl(var(--primary) / 0.1)"
                            strokeWidth="12"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#goal-gradient)"
                            strokeWidth="12"
                            strokeDasharray={`${(progress / 100) * 339.29} 339.29`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-in-out"
                        />
                         <defs>
                            <linearGradient id="goal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{progress.toFixed(0)}%</span>
                    </div>
                </div>
                <h3 className="text-2xl font-bold mt-4">{goal.title}</h3>
                <p className="text-muted-foreground text-md mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.currentAmount)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.targetAmount)}
                </p>
            </CardContent>
             <CardFooter className="flex justify-center gap-2">
                <Button className="w-40">Contribute</Button>
                <Button variant="outline" onClick={() => onEdit(goal)}>Edit Goal</Button>
            </CardFooter>
        </Card>
    );
};


const GoalCard = ({ goal, onEdit }: { goal: Goal; onEdit: (g: Goal) => void }) => {
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
                <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                <CardDescription className="mt-1">{goal.category}</CardDescription>
            </div>
          </div>
          {daysLeft !== null && daysLeft >= 0 && (
             <div className="text-sm text-muted-foreground text-right">
                <p className="font-semibold">{daysLeft}</p>
                <p className="text-xs">days left</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-2 text-xs text-muted-foreground flex justify-between">
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(goal.currentAmount)}
          </span>
          <span>
            {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(goal.targetAmount)}
          </span>
        </div>
        <Progress value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
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
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | undefined>(undefined);
  const { user } = useUser();
  const firestore = useFirestore();

  const goalsCollection = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/goals`);
    }
    return null;
  }, [firestore, user]);

  const { data: goals, isLoading } = useCollection<Goal>(goalsCollection);
  
  const handleEdit = (goal: Goal) => {
      setSelectedGoal(goal);
      setIsDialogOpen(true);
  }
  
  const handleAdd = () => {
      setSelectedGoal(undefined);
      setIsDialogOpen(true);
  }

  const { goalInFocus, otherGoals } = useMemo(() => {
    if (!goals || goals.length === 0) return { goalInFocus: null, otherGoals: [] };

    const sortedGoals = [...goals].sort((a, b) => {
        if (a.targetDate && b.targetDate) return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        const progressA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const progressB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return progressA - progressB;
    });

    return {
        goalInFocus: sortedGoals[0],
        otherGoals: sortedGoals.slice(1)
    };
  }, [goals]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your financial ambitions.
          </p>
        </div>
        <Button size="lg" onClick={handleAdd}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Goal
        </Button>
      </div>
      
      {isLoading && <LoadingSkeleton />}

      {!isLoading && goals && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goalInFocus ? (
                    <GoalInFocus goal={goalInFocus} onEdit={handleEdit} />
                ) : (
                    <Card onClick={handleAdd} className="md:col-span-3 min-h-[400px] flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-border/60 hover:border-primary/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer hover:bg-muted/30">
                        <Target className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Set Your First Goal</h3>
                        <p className="text-md text-muted-foreground mt-1">What's your next big financial objective?</p>
                    </Card>
                )}

                <div className="space-y-6 md:col-span-1">
                    {otherGoals.slice(0, 3).map(goal => (
                        <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                    ))}
                    {otherGoals.length > 3 && (
                        <Button variant="outline" className="w-full">View All Goals</Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {otherGoals.slice(3).map(goal => (
                   <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                ))}
            </div>
        </>
      )}
      
      <GoalDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} goal={selectedGoal} />

    </div>
  );
}
