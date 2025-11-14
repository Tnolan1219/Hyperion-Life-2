'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Transaction } from '@/app/portfolio/page';
import { format } from 'date-fns';
import { TransactionDialog } from './TransactionDialog';
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

interface IncomeExpenseTableProps {
  title: 'Income' | 'Expenses';
  data: Transaction[];
  collectionName: 'income' | 'expenses';
}

export function IncomeExpenseTable({ title, data, collectionName }: IncomeExpenseTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (firestore && user) {
      const docRef = doc(firestore, `users/${user.uid}/${collectionName}`, id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {title === 'Income' ? 'Income' : 'Expense'}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className={`text-right font-medium ${title === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item.id!)} className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            No {title.toLowerCase()} recorded yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <TransactionDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        transaction={selectedTransaction}
        type={title === 'Income' ? 'Income' : 'Expense'}
        collectionName={collectionName}
      />
    </>
  );
}
