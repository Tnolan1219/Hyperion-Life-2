'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/app/portfolio/page";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export function BudgetSummary({ income, expenses }: { income: Transaction[], expenses: Transaction[] }) {
    const { totalIncome, totalExpenses, netCashFlow } = useMemo(() => {
        const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const netCashFlow = totalIncome - totalExpenses;
        return { totalIncome, totalExpenses, netCashFlow };
    }, [income, expenses]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netCashFlow)}</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
        </div>
    )
}
