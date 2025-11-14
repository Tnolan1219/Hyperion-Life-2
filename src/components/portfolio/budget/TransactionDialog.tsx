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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction } from '@/app/portfolio/page';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  category: z.string().min(1, 'Category is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  date: z.date({ required_error: 'A date is required.' }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  transaction?: Transaction;
  type: 'Income' | 'Expense';
  collectionName: 'income' | 'expenses';
}

export function TransactionDialog({
  isOpen,
  setIsOpen,
  transaction,
  type,
  collectionName,
}: TransactionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      category: transaction?.category || '',
      amount: transaction?.amount || 0,
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        description: transaction?.description || '',
        category: transaction?.category || '',
        amount: transaction?.amount || 0,
        date: transaction?.date ? new Date(transaction.date) : new Date(),
      });
    }
  }, [isOpen, transaction, form]);

  const onSubmit = (data: TransactionFormData) => {
    if (!firestore || !user) return;

    const transactionData: Omit<Transaction, 'id'> = {
      ...data,
      type,
      date: data.date.toISOString(),
    };

    if (transaction?.id) {
      const docRef = doc(firestore, `users/${user.uid}/${collectionName}`, transaction.id);
      updateDocumentNonBlocking(docRef, transactionData);
    } else {
      const collRef = collection(firestore, `users/${user.uid}/${collectionName}`);
      addDocumentNonBlocking(collRef, transactionData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle>{transaction ? `Edit ${type}` : `Add New ${type}`}</DialogTitle>
          <DialogDescription>
            {transaction ? 'Update your transaction details.' : `Log a new ${type.toLowerCase()} transaction.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder={type === 'Income' ? 'e.g., Monthly Salary' : 'e.g., Groceries'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="150.00" {...field} />
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
                    <FormControl>
                      <Input placeholder={type === 'Income' ? 'e.g., Salary' : 'e.g., Food'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
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
              <Button type="submit">{transaction ? 'Save Changes' : 'Add Transaction'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
