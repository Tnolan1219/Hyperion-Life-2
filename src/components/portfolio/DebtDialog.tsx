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
import { Debt } from '@/app/portfolio/page';

const debtSchema = z.object({
  type: z.enum(['Loan', 'Credit Card', 'Mortgage', 'Student Loan', 'Other']),
  name: z.string().min(1, 'Debt name is required.'),
  lender: z.string().min(1, 'Lender is required.'),
  balance: z.coerce.number().min(0, 'Balance must be a positive number.'),
  apr: z.coerce.number().min(0, 'APR must be a positive number.'),
  minimumPayment: z.coerce.number().min(0, 'Minimum payment must be a positive number.'),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  debt?: Debt;
}

export function DebtDialog({ isOpen, setIsOpen, debt }: DebtDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      type: debt?.type || 'Credit Card',
      name: debt?.name || '',
      lender: debt?.lender || '',
      balance: debt?.balance || 0,
      apr: debt?.apr || 0,
      minimumPayment: debt?.minimumPayment || 0,
    },
  });

  React.useEffect(() => {
    form.reset({
      type: debt?.type || 'Credit Card',
      name: debt?.name || '',
      lender: debt?.lender || '',
      balance: debt?.balance || 0,
      apr: debt?.apr || 0,
      minimumPayment: debt?.minimumPayment || 0,
    });
  }, [debt, form]);

  const onSubmit = (data: DebtFormData) => {
    if (!firestore || !user) return;

    if (debt?.id) {
      const debtDocRef = doc(firestore, `users/${user.uid}/debts`, debt.id);
      updateDocumentNonBlocking(debtDocRef, data);
    } else {
      const debtsCollection = collection(firestore, `users/${user.uid}/debts`);
      addDocumentNonBlocking(debtsCollection, { ...data, userId: user.uid });
    }
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl glass">
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
          <DialogDescription>
            {debt
              ? "Update your debt's details."
              : 'Add a new liability to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debt Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a debt type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Student Loan">Student Loan</SelectItem>
                      <SelectItem value="Mortgage">Mortgage</SelectItem>
                      <SelectItem value="Loan">Loan (Personal, Auto)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debt Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chase Sapphire Card, Federal Student Loan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chase Bank, Dept. of Education" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="apr"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>APR (%)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 21.99" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="minimumPayment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Minimum Payment</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 150" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{debt ? 'Save Changes' : 'Add Debt'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
