
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
import { useUser, useFirestore } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  category: z.string().min(1, 'Category is required.'),
  targetAmount: z.coerce.number().min(1, 'Target amount must be greater than 0.'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative.'),
});

type GoalFormData = z.infer<typeof goalSchema>;

export type Goal = {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  userId?: string;
};

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
    },
  });

  React.useEffect(() => {
    form.reset({
        title: goal?.title || '',
        category: goal?.category || '',
        targetAmount: goal?.targetAmount || 0,
        currentAmount: goal?.currentAmount || 0,
    });
  }, [goal, form])

  const onSubmit = (data: GoalFormData) => {
    if (!firestore || !user) return;

    if (goal?.id) {
      // Update existing goal
      const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
      updateDocumentNonBlocking(goalDocRef, data);
    } else {
      // Create new goal
      const goalsCollection = collection(firestore, `users/${user.uid}/goals`);
      addDocumentNonBlocking(goalsCollection, { ...data, userId: user.uid });
    }
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Debt Reduction">
                        Debt Reduction
                      </SelectItem>
                      <SelectItem value="Major Purchase">
                        Major Purchase
                      </SelectItem>
                      <SelectItem value="Retirement">Retirement</SelectItem>
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
