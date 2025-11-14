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

const assetSchema = z.object({
  type: z.enum(['Stock', 'Crypto']),
  ticker: z.string().min(1, 'Ticker is required.').toUpperCase(),
  name: z.string().min(1, 'Asset name is required.'),
  balance: z.coerce.number().min(0.000001, 'Balance must be greater than 0.'),
});

type AssetFormData = z.infer<typeof assetSchema>;

export type Asset = {
  id?: string;
  type: 'Stock' | 'Crypto';
  ticker: string;
  name: string;
  balance: number;
  userId?: string;
};

interface PortfolioDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  asset?: Asset;
}

export function PortfolioDialog({ isOpen, setIsOpen, asset }: PortfolioDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: asset?.type || 'Stock',
      ticker: asset?.ticker || '',
      name: asset?.name || '',
      balance: asset?.balance || 0,
    },
  });

  React.useEffect(() => {
    form.reset({
      type: asset?.type || 'Stock',
      ticker: asset?.ticker || '',
      name: asset?.name || '',
      balance: asset?.balance || 0,
    });
  }, [asset, form]);

  const onSubmit = (data: AssetFormData) => {
    if (!firestore || !user) return;

    if (asset?.id) {
      const assetDocRef = doc(firestore, `users/${user.uid}/assets`, asset.id);
      updateDocumentNonBlocking(assetDocRef, data);
    } else {
      const assetsCollection = collection(firestore, `users/${user.uid}/assets`);
      addDocumentNonBlocking(assetsCollection, { ...data, userId: user.uid });
    }
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Update your asset's details."
              : 'Add a new stock or crypto holding to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Stock">Stock</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL, BTC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple Inc., Bitcoin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance / Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 10.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{asset ? 'Save Changes' : 'Add Asset'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    