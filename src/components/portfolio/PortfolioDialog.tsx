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
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

const assetSchema = z.object({
  type: z.enum(['Stock', 'ETF', 'Crypto', 'Bond', 'Real Estate', 'Cash']),
  ticker: z.string().min(1, 'Ticker is required.').toUpperCase(),
  name: z.string().min(1, 'Asset name is required.'),
  balance: z.coerce.number().min(0, 'Balance must be a positive number.'),
  averageCost: z.coerce.number().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
  peRatio: z.coerce.number().optional(),
  dividendYield: z.coerce.number().optional(),
  beta: z.coerce.number().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export type Asset = {
  id?: string;
  type: 'Stock' | 'ETF' | 'Crypto' | 'Bond' | 'Real Estate' | 'Cash';
  ticker: string;
  name: string;
  balance: number;
  averageCost?: number;
  sector?: string;
  notes?: string;
  userId?: string;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
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
      averageCost: asset?.averageCost || 0,
      sector: asset?.sector || '',
      notes: asset?.notes || '',
      peRatio: asset?.peRatio || 0,
      dividendYield: asset?.dividendYield || 0,
      beta: asset?.beta || 0,
    },
  });

  React.useEffect(() => {
    form.reset({
      type: asset?.type || 'Stock',
      ticker: asset?.ticker || '',
      name: asset?.name || '',
      balance: asset?.balance || 0,
      averageCost: asset?.averageCost || 0,
      sector: asset?.sector || '',
      notes: asset?.notes || '',
      peRatio: asset?.peRatio || 0,
      dividendYield: asset?.dividendYield || 0,
      beta: asset?.beta || 0,
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
      <DialogContent className="sm:max-w-xl glass">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Update your asset's details."
              : 'Add a new holding to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="ETF">ETF</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Bond">Bond</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
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
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
                <FormField
                control={form.control}
                name="averageCost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Average Cost per Unit</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 150.75" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
             <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Healthcare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
               <FormField
                control={form.control}
                name="peRatio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>P/E Ratio</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dividendYield"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dividend Yield (%)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="beta"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Beta</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>


             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Long-term hold, bought on dip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
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
