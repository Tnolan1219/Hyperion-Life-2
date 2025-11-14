
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { goalCategories, Goal, GoalCategory } from '@/app/goals/page';

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

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || '',
      category: goal?.category || '',
      targetAmount: goal?.targetAmount || 0,
      currentAmount: goal?.currentAmount || 0,
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
    },
  });

  React.useEffect(() => {
    form.reset({
        title: goal?.title || '',
        category: goal?.category || '',
        targetAmount: goal?.targetAmount || 0,
        currentAmount: goal?.currentAmount || 0,
        targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
    });
  }, [goal, form])

  const onSubmit = (data: GoalFormData) => {
    if (!firestore || !user) return;

    const goalData = {
        ...data,
        targetDate: data.targetDate ? data.targetDate.toISOString() : null,
    };

    if (goal?.id) {
      // Update existing goal
      const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
      updateDocumentNonBlocking(goalDocRef, goalData);
    } else {
      // Create new goal
      const goalsCollection = collection(firestore, `users/${user.uid}/goals`);
      addDocumentNonBlocking(goalsCollection, { ...goalData, userId: user.uid });
    }
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{goal ? 'Save Changes' : 'Create Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
