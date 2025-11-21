
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment, runTransaction } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { goalCategories, Goal, GoalCategory } from '@/app/life-stats/page';
import { useToast } from '@/hooks/use-toast';


const goalSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  category: z.string().min(1, 'Category is required.'),
  targetAmount: z.coerce.number().min(1, 'Target amount must be greater than 0.'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative.'),
  targetDate: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  goal?: Goal;
}

export function GoalDialog({ isOpen, setIsOpen, goal }: GoalDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      category: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: undefined,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: goal?.title || '',
        category: goal?.category || '',
        targetAmount: goal?.targetAmount || 0,
        currentAmount: goal?.currentAmount || 0,
        targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
      });
    }
  }, [goal, isOpen, form]);

  const onSubmit = (data: GoalFormData) => {
    if (!firestore || !user) return;

    const goalData = {
        ...data,
        targetDate: data.targetDate ? data.targetDate.toISOString() : undefined,
        category: data.category as GoalCategory,
    };

    if (goal?.id) {
      const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
      updateDocumentNonBlocking(goalDocRef, goalData);
    } else {
      const goalsCollection = collection(firestore, `users/${user.uid}/goals`);
      addDocumentNonBlocking(goalsCollection, { ...goalData, userId: user.uid });
    }
    setIsOpen(false);
    form.reset();
  };
  
  const handleMarkAsComplete = async () => {
    if (!firestore || !user || !goal?.id) return;
    
    const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
    const lifeStatsRef = doc(firestore, `users/${user.uid}/lifeStats`, user.uid);
    const xpGained = 100;

    try {
        await runTransaction(firestore, async (transaction) => {
            const lifeStatsDoc = await transaction.get(lifeStatsRef);

            if (!lifeStatsDoc.exists()) {
                toast({ variant: "destructive", title: "Life Stats not initialized!" });
                return;
            } else {
                // Atomically update XP and a relevant stat
                transaction.update(lifeStatsRef, { 
                    xp: increment(xpGained),
                    'stats.wealth.total': increment(20),
                    'stats.wealth.investing': increment(20)
                });
            }

            // Mark goal as complete
            transaction.update(goalDocRef, { currentAmount: goal.targetAmount });
        });

        toast({
            title: `Goal Complete! +${xpGained} XP`,
            description: `Congratulations on reaching your goal: "${goal.title}"`,
        });

    } catch (e) {
        console.error("Transaction failed: ", e);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not update your stats. Please try again.",
        });
    }

    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {goal
              ? "Update your financial goal's details."
              : 'Set a new financial target to work towards.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., House Down Payment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalCategories.map(({ name, icon: Icon }) => (
                        <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {name}
                            </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:items-center pt-4">
                {goal && (
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleMarkAsComplete}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Complete
                    </Button>
                )}
                <div className="flex justify-end gap-2 w-full sm:w-auto">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">{goal ? 'Save Changes' : 'Create Goal'}</Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    