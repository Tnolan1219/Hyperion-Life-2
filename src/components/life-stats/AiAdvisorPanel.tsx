
'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Lightbulb, Target, Repeat, Star, History, ThumbsUp } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { generatePersonalizedFinancialAdvice } from '@/ai/flows/generate-personalized-financial-advice';
import type { Asset, Debt } from '@/app/portfolio/page';
import type { Goal } from '@/app/goals/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);

const QuestCard = ({ type, title, description }: { type: 'Daily' | 'Weekly' | 'Milestone', title: string, description: string }) => {
    const icons = {
        Daily: { icon: Repeat, color: 'text-green-400' },
        Weekly: { icon: Star, color: 'text-yellow-400' },
        Milestone: { icon: Target, color: 'text-purple-400' },
    }
    const { icon: Icon, color } = icons[type];
    
    return (
        <div className="bg-muted/50 p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", color)} />
                <div className="flex-grow">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{type} Quest</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">Dismiss</Button>
                <Button size="sm">Begin Quest</Button>
            </div>
        </div>
    )
}

const exampleQuests = [
    { type: 'Daily', title: 'Mindful Moment', description: 'Complete a 5-minute journaling session to boost your Self-Awareness.'},
    { type: 'Weekly', title: 'Network Expansion', description: 'Connect with one new professional in your field to increase your Networking stat.'},
    { type: 'Milestone', title: 'Emergency Fund Level 1', description: 'Save your first $1,000 for your emergency fund to unlock a major Wealth achievement.'},
]


export function AiAdvisorPanel() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="glass mt-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                AI Advisor
            </CardTitle>
            <CardDescription>Personalized suggestions to help you level up.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
             <Tabs defaultValue="suggestions">
                <TabsList className="w-full">
                    <TabsTrigger value="suggestions" className="w-full">Suggestions</TabsTrigger>
                    <TabsTrigger value="history" className="w-full">History</TabsTrigger>
                </TabsList>
                <TabsContent value="suggestions" className="p-4 min-h-[300px]">
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                            {exampleQuests.map(quest => <QuestCard key={quest.title} {...quest} />)}
                        </div>
                    </ScrollArea>
                </TabsContent>
                 <TabsContent value="history" className="p-4 min-h-[300px]">
                    <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                        <History className="h-10 w-10 mb-4 text-primary/70" />
                        <p className="font-semibold">No history yet.</p>
                        <p className="text-sm">Your completed or dismissed suggestions will appear here.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50">
            <Button onClick={() => {}} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Get New Suggestions
            </Button>
        </CardFooter>
    </Card>
  )
}
