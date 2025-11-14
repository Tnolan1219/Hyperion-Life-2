'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useMemoFirebase, useCollection, useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Debt } from '@/lib/types';
import { DebtsTable } from './_components/debts-table';

export default function DebtsPage() {
  const { firestore, user } = useFirebase();

  const debtsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'debts') : null),
    [firestore, user]
  );
  const { data: debts, isLoading } = useCollection<Debt>(debtsQuery);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Debts</h1>
          <p className="text-muted-foreground">
            A complete list of your liabilities.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Debt
        </Button>
      </div>

      <DebtsTable data={debts || []} isLoading={isLoading} />
    </div>
  );
}
