
'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Lightbulb, Target, Repeat, Star, History } from 'lucide-react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment, runTransaction } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const QuestCard = ({ type, title, description, onComplete }: { type: 'Daily' | 'Weekly' | 'Milestone', title: string, description: string, onComplete: () => Promise<void> }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const icons = {
        Daily: { icon: Repeat, color: 'text-green-400' },
        Weekly: { icon: Star, color: 'text-yellow-400' },
        Milestone: { icon: Target, color: 'text-purple-400' },
    }
    const { icon: Icon, color } = icons[type];
    
    const handleComplete = async () => {
        setIsCompleting(true);
        await onComplete();
        // A short delay to let the user see the loading state
        setTimeout(() => setIsCompleting(false), 500);
    }

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
                <Button variant="ghost" size="sm" disabled={isCompleting}>Dismiss</Button>
                <Button size="sm" onClick={handleComplete} disabled={isCompleting}>
                    {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Quest'}
                </Button>
            </div>
        </div>
    )
}

const exampleQuests = [
    { type: 'Daily', title: 'Mindful Moment', description: 'Complete a 5-minute journaling session to boost your Self-Awareness.', xp: 10, stat: 'emotionalIntelligence.selfAwareness', statIncrease: 5 },
    { type: 'Weekly', title: 'Network Expansion', description: 'Connect with one new professional in your field to increase your Networking stat.', xp: 50, stat: 'wealth.networking', statIncrease: 15 },
    { type: 'Milestone', title: 'Emergency Fund Level 1', description: 'Save your first $1,000 for your emergency fund to unlock a major Wealth achievement.', xp: 200, stat: 'wealth.investing', statIncrease: 30 },
]


export function AiAdvisorPanel() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteQuest = async (quest: typeof exampleQuests[0]) => {
      if (!user || !firestore) return;

      const lifeStatsRef = doc(firestore, `users/${user.uid}/lifeStats`, user.uid);

      try {
          await runTransaction(firestore, async (transaction) => {
              const lifeStatsDoc = await transaction.get(lifeStatsRef);
              if (!lifeStatsDoc.exists()) {
                   // If doc doesn't exist, create it. This is a fallback.
                  transaction.set(lifeStatsRef, {
                      userId: user.uid,
                      level: 1,
                      xp: quest.xp,
                      stats: {
                          health: { total: 0, strength: 0, endurance: 0, nutrition: 0 },
                          wealth: { total: 0, careerSkills: 0, networking: 0, investing: 0 },
                          social: { total: 0, relationships: 0, communication: 0, influence: 0 },
                          power: { total: 0, leadership: 0, decisionMaking: 0, resilience: 0 },
                          emotionalIntelligence: { total: 0, selfAwareness: 0, empathy: 0, regulation: 0 },
                      },
                      netWorth: 0
                  });
              } else {
                  // Atomically update XP and the specific stat
                  const mainStat = quest.stat.split('.')[0];
                  transaction.update(lifeStatsRef, {
                      xp: increment(quest.xp),
                      [`stats.${quest.stat}`]: increment(quest.statIncrease),
                      [`stats.${mainStat}.total`]: increment(quest.statIncrease)
                  });
              }
          });
          
          toast({
              title: `Quest Complete! +${quest.xp} XP`,
              description: `You've made progress on: "${quest.title}"`,
          });

      } catch (e) {
          console.error("Quest completion transaction failed:", e);
          toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Could not save your progress. Please try again.",
          });
      }
  };

  return (
    <Card className="glass mt-8">
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
                    <TabsTrigger value="suggestions" className="w-full">Active Quests</TabsTrigger>
                    <TabsTrigger value="history" className="w-full">History</TabsTrigger>
                </TabsList>
                <TabsContent value="suggestions" className="p-4 min-h-[300px]">
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                            {exampleQuests.map(quest => <QuestCard key={quest.title} {...quest} onComplete={() => handleCompleteQuest(quest)} />)}
                        </div>
                    </ScrollArea>
                </TabsContent>
                 <TabsContent value="history" className="p-4 min-h-[300px]">
                    <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                        <History className="h-10 w-10 mb-4 text-primary/70" />
                        <p className="font-semibold">No history yet.</p>
                        <p className="text-sm">Your completed or dismissed quests will appear here.</p>
                    </div>
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
