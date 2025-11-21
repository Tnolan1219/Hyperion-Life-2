
'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Lightbulb, Target, Repeat, Star, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export type Quest = {
  type: 'Daily' | 'Weekly' | 'Milestone';
  title: string;
  description: string;
  xp: number;
  stat: string;
  statIncrease: number;
}

const QuestCard = ({ quest, onComplete, isCompleted }: { quest: Quest, onComplete: () => void, isCompleted: boolean }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const icons = {
        Daily: { icon: Repeat, color: 'text-green-400' },
        Weekly: { icon: Star, color: 'text-yellow-400' },
        Milestone: { icon: Target, color: 'text-purple-400' },
    }
    const { icon: Icon, color } = icons[quest.type];
    
    const handleComplete = async () => {
        setIsCompleting(true);
        onComplete();
        // A short delay to let the user see the loading state
        setTimeout(() => setIsCompleting(false), 1000);
    }

    return (
        <div className="bg-muted/50 p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", color)} />
                <div className="flex-grow">
                    <p className="font-semibold">{quest.title}</p>
                    <p className="text-xs text-muted-foreground">{quest.type} Quest</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-primary">+{quest.xp} XP</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
            <div className="flex justify-end gap-2">
                 <Button variant="outline" size="sm" onClick={handleComplete} disabled={isCompleting || isCompleted}>
                    {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompleted ? 'Completed' : 'Complete Quest'}
                </Button>
            </div>
        </div>
    )
}

const initialQuests: Quest[] = [
    { type: 'Daily', title: 'Mindful Moment', description: 'Complete a 5-minute journaling session to boost your Self-Awareness.', xp: 10, stat: 'emotionalIntelligence.selfAwareness', statIncrease: 5 },
    { type: 'Weekly', title: 'Network Expansion', description: 'Connect with one new professional in your field to increase your Networking stat.', xp: 50, stat: 'wealth.networking', statIncrease: 15 },
    { type: 'Milestone', title: 'Emergency Fund Level 1', description: 'Save your first $1,000 for your emergency fund to unlock a major Wealth achievement.', xp: 200, stat: 'wealth.investing', statIncrease: 30 },
];


export function AiAdvisorPanel({ onCompleteQuest }: { onCompleteQuest: (quest: Quest) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuests, setActiveQuests] = useState<Quest[]>(initialQuests);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  
  const handleComplete = (questToComplete: Quest) => {
    onCompleteQuest(questToComplete);
    setCompletedQuests(prev => [...prev, questToComplete]);
    setActiveQuests(prev => prev.filter(q => q.title !== questToComplete.title));
  }

  return (
    <Card className="glass">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                AI Advisor
            </CardTitle>
            <CardDescription>Personalized quests and suggestions to help you level up.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
             <Tabs defaultValue="suggestions">
                <TabsList className="w-full">
                    <TabsTrigger value="suggestions" className="w-full">Active Quests ({activeQuests.length})</TabsTrigger>
                    <TabsTrigger value="history" className="w-full">Completed ({completedQuests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="suggestions" className="p-4 min-h-[300px]">
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                            {activeQuests.length > 0 ? (
                                activeQuests.map(quest => (
                                    <QuestCard 
                                        key={quest.title} 
                                        quest={quest} 
                                        onComplete={() => handleComplete(quest)}
                                        isCompleted={false}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground h-[280px] flex flex-col justify-center items-center">
                                    <History className="h-10 w-10 mb-4 text-primary/70" />
                                    <p className="font-semibold">All quests complete!</p>
                                    <p className="text-sm">Click "Get New Quests" to generate more.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
                 <TabsContent value="history" className="p-4 min-h-[300px]">
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                             {completedQuests.length > 0 ? (
                                completedQuests.map(quest => (
                                    <QuestCard 
                                        key={quest.title} 
                                        quest={quest} 
                                        onComplete={() => {}}
                                        isCompleted={true}
                                    />
                                ))
                             ) : (
                                <div className="text-center text-muted-foreground h-[280px] flex flex-col justify-center items-center">
                                    <History className="h-10 w-10 mb-4 text-primary/70" />
                                    <p className="font-semibold">No history yet.</p>
                                    <p className="text-sm">Your completed quests will appear here.</p>
                                </div>
                             )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50">
            <Button onClick={() => {}} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Get New Quests
            </Button>
        </CardFooter>
    </Card>
  )
}

    