import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const transactions = [
  {
    id: 'txn_1',
    description: 'Paycheck Deposit',
    date: '2024-07-15',
    amount: 2500,
    type: 'income',
    category: 'Salary',
  },
  {
    id: 'txn_2',
    description: 'Mortgage Payment',
    date: '2024-07-14',
    amount: -1800,
    type: 'expense',
    category: 'Housing',
  },
  {
    id: 'txn_3',
    description: 'Vanguard ETF Purchase',
    date: '2024-07-12',
    amount: -500,
    type: 'investment',
    category: 'Stocks',
  },
  {
    id: 'txn_4',
    description: 'Grocery Shopping',
    date: '2024-07-11',
    amount: -150.75,
    type: 'expense',
    category: 'Food',
  },
  {
    id: 'txn_5',
    description: 'Student Loan Payment',
    date: '2024-07-10',
    amount: -250,
    type: 'debt-payment',
    category: 'Loans',
  },
  {
    id: 'txn_6',
    description: 'Dividend from AAPL',
    date: '2024-07-09',
    amount: 55.43,
    type: 'income',
    category: 'Dividends',
  },
];

export function RecentTransactions() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.description}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                   <Badge variant="outline" className="font-normal">{tx.category}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{tx.date}</TableCell>
                <TableCell className={cn("text-right font-mono", tx.amount > 0 ? "text-green-400" : "text-red-400")}>
                    <div className="flex items-center justify-end gap-2">
                        <span>{tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {tx.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
