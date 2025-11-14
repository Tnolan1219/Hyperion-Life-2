'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useMemoFirebase, useCollection, useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Asset } from '@/lib/types';
import { AssetsTable } from './_components/assets-table';

export default function AssetsPage() {
  const { firestore, user } = useFirebase();

  const assetsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'assets') : null),
    [firestore, user]
  );
  const { data: assets, isLoading } = useCollection<Asset>(assetsQuery);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Assets</h1>
          <p className="text-muted-foreground">
            A comprehensive overview of your financial assets.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Asset
        </Button>
      </div>

      <AssetsTable data={assets || []} isLoading={isLoading} />
    </div>
  );
}
