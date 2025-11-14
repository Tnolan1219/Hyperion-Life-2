'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Utensils, Home, Car, ShoppingCart, HeartPulse } from "lucide-react";

const budgetData = [
    { category: 'Food & Dining', spent: 450, total: 800, icon: Utensils, color: 'text-orange-400', progressColor: 'bg-orange-400' },
    { category: 'Housing', spent: 1200, total: 1200, icon: Home, color: 'text-blue-400', progressColor: 'bg-blue-400' },
    { category: 'Transportation', spent: 250, total: 400, icon: Car, color: 'text-purple-400', progressColor: 'bg-purple-400' },
    { category: 'Shopping', spent: 150, total: 300, icon: ShoppingCart, color: 'text-pink-400', progressColor: 'bg-pink-400' },
    { category: 'Health', spent: 100, total: 300, icon: HeartPulse, color: 'text-red-400', progressColor: 'bg-red-400' },
];

export function BudgetTracker() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Monthly Budget</CardTitle>
                <CardDescription>Your spending breakdown for this month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {budgetData.map(item => (
                    <div key={item.category}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10", item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{item.category}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">${item.spent}</span> / ${item.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Progress value={(item.spent / item.total) * 100} className="h-2 [&>div]:bg-primary" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
