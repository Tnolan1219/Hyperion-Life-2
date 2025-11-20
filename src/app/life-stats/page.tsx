
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, increment, runTransaction } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sword, Heart, MessageSquare, Brain, Gem, Zap, Info, Target, PlusCircle, Edit, Trash2, Home, Car, PiggyBank, Briefcase, GraduationCap, History, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AiAdvisorPanel } from '@/components/life-stats/AiAdvisorPanel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { differenceInDays } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

// Define the structure of the LifeStats document
interface LifeStats {
  id?: string;
  level: number;
  xp: number;
  stats: {
    health: { total: number; strength: number; endurance: number; nutrition: number; speed: number; physique: number; };
    social: { total: number; relationships: number; communication: number; influence: number; };
    power: { total: number; leadership: number; decisionMaking: number; resilience: number; };
    wealth: { total: number; careerSkills: number; networking: number; investing: number; };
    emotionalIntelligence: { total: number; selfAwareness: number; empathy: number; regulation: number; };
  };
  netWorth: number;
  avatar: {
      stage: string;
      appearance: {
          aura: string;
          outfit: string;
          animation: string;
      }
  }
}

export type Goal = {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: GoalCategory;
  targetDate?: string;
  userId?: string;
};

export type GoalCategory = 'Savings' | 'Investment' | 'Debt Reduction' | 'Major Purchase' | 'Retirement';

export const goalCategories: { name: GoalCategory, icon: React.ElementType, color: string }[] = [
    { name: 'Major Purchase', icon: Home, color: 'blue' },
    { name: 'Savings', icon: PiggyBank, color: 'green' },
    { name: 'Retirement', icon: Briefcase, color: 'purple' },
    { name: 'Debt Reduction', icon: Car, color: 'red' },
    { name: 'Investment', icon: GraduationCap, color: 'orange' },
];

const categoryStyles = goalCategories.reduce((acc, category) => {
    acc[category.name] = { icon: category.icon, color: category.color };
    return acc;
}, {} as Record<GoalCategory, { icon: React.ElementType; color: string }>);


const GoalCard = ({ goal, onEdit }: { goal: Goal; onEdit: (g: Goal) => void }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const { icon: Icon, color } = categoryStyles[goal.category] || { icon: PiggyBank, color: 'gray' };
  
  const daysLeft = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : null;

  const handleDelete = () => {
    if (firestore && user && goal.id) {
        const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
        // This is a non-blocking delete
        if(firestore && user && goal.id) {
            const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
            // Non-blocking delete, assumes you have this helper
            // deleteDocumentNonBlocking(goalDocRef);
        }
    }
  }

  return (
    <>
    <Card className="glass hover:border-primary/60 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", `bg-${color}-500/10 text-${color}-500`)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                <CardDescription className="mt-1">{goal.category}</CardDescription>
            </div>
          </div>
          {daysLeft !== null && daysLeft >= 0 && (
             <div className="text-sm text-muted-foreground text-right">
                <p className="font-semibold">{daysLeft}</p>
                <p className="text-xs">days left</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-2 text-xs text-muted-foreground flex justify-between">
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(goal.currentAmount)}
          </span>
          <span>
            {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(goal.targetAmount)}
          </span>
        </div>
        <Progress value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    </>
  );
};


// Define the configuration for each main stat
const statConfig = {
  health: {
    label: 'Health',
    icon: Heart,
    color: 'text-red-400',
    description: 'Your physical and mental well-being.',
    tooltip: 'Increased by logging workouts, healthy meals, and mindfulness sessions.',
    subStats: {
        strength: 'Strength',
        endurance: 'Endurance',
        nutrition: 'Nutrition',
        speed: 'Speed',
        physique: 'Physique',
    }
  },
  wealth: {
    label: 'Wealth',
    icon: Gem,
    color: 'text-green-400',
    description: 'Your financial strength and skills.',
    tooltip: 'Increased by completing financial goals, making investments, and improving career skills.',
    subStats: {
        careerSkills: 'Career Skills',
        networking: 'Networking',
        investing: 'Investing',
    }
  },
  social: {
    label: 'Social',
    icon: MessageSquare,
    color: 'text-blue-400',
    description: 'Your relationships and network.',
    tooltip: 'Increased by networking, and spending quality time with family & friends.',
    subStats: {
        relationships: 'Relationships',
        communication: 'Communication',
        influence: 'Influence',
    }
  },
  power: {
    label: 'Power',
    icon: Zap,
    color: 'text-yellow-400',
    description: 'Your influence and resilience.',
    tooltip: 'Increased by leading projects, making impactful decisions, and overcoming challenges.',
    subStats: {
        leadership: 'Leadership',
        decisionMaking: 'Decision Making',
        resilience: 'Resilience',
    }
  },
  emotionalIntelligence: {
    label: 'EI',
    icon: Brain,
    color: 'text-purple-400',
    description: 'Your self-awareness and empathy.',
    tooltip: 'Increased by journaling, practicing empathy, and mindfulness exercises.',
    subStats: {
        selfAwareness: 'Self-Awareness',
        empathy: 'Empathy',
        regulation: 'Regulation',
    }
  },
};

type StatKey = keyof typeof statConfig;

const SubStatBar = ({ label, value }: { label: string; value: number }) => {
    const max = 1000;
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value} / {max}</span>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    );
};

const StatCard = ({ statKey, statsData }: { statKey: StatKey, statsData: LifeStats['stats'] | null}) => {
    const config = statConfig[statKey];
    const value = statsData?.[statKey]?.total || 0;
    const max = 1000;
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <Card className="glass">
             <Accordion type="single" collapsible>
                <AccordionItem value={statKey} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                            <config.icon className={cn("h-6 w-6", config.color)} />
                             <div className="flex-grow text-left">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{config.label}</CardTitle>
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground/80 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{config.tooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            <div className="flex flex-col items-end w-28">
                                <span className="text-2xl font-bold text-primary">{value}</span>
                                <Progress value={percentage} className="h-2 w-full mt-1" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 pt-4 border-t border-border/50">
                             {statsData && Object.entries(config.subStats).map(([subKey, subLabel]) => (
                                <SubStatBar 
                                    key={subKey}
                                    label={subLabel}
                                    value={(statsData?.[statKey] as any)?.[subKey] || 0}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}

const CharacterAvatar = ({ level, avatarData }: { level: number, avatarData: LifeStats['avatar'] | null }) => {
    const auraOpacity = useMemo(() => Math.min(0.1 + (level - 1) * 0.05, 0.5), [level]);
    const coreOpacity = useMemo(() => Math.min(0.8 + (level - 1) * 0.02, 1.0), [level]);
    const stage = avatarData?.stage || "Initiate";

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
             <div className="text-center mb-4">
                <p className="text-3xl font-bold text-primary">Level {level}</p>
                <p className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{stage}</p>
            </div>
            <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div 
                    className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"
                    style={{ animationDuration: '4s', animationDelay: `${-level}s` }}
                />
                <div 
                    className={cn(
                        "absolute inset-2 rounded-full border-2 border-primary/30",
                        avatarData?.appearance.animation === 'slow-rotation' ? "animate-spin-slow" : ""
                    )}
                    style={{ animationDuration: '20s' }}
                />
                <div 
                    className={cn(
                        "absolute inset-4 rounded-full border-2 border-dashed border-primary/20",
                        avatarData?.appearance.animation === 'slow-rotation' ? "animate-spin-slow-reverse" : ""
                    )}
                    style={{ animationDuration: '25s' }}
                />

                <div className="absolute inset-0 flex items-center justify-center animate-breathing">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-48 md:h-48 drop-shadow-[0_0_15px_hsl(var(--primary))]">
                        <defs>
                            <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--secondary))" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        <circle cx="50" cy="50" r="35" fill={`url(#${avatarData?.appearance.aura || 'glow'})`} style={{ opacity: auraOpacity, transition: 'opacity 1s ease-in-out' }} />
                        
                        <path d="M50 40 Q50 60 40 75 L60 75 Q50 60 50 40" fill="url(#avatarGradient)" style={{ opacity: coreOpacity, transition: 'opacity 1s ease-in-out' }} />
                        <circle cx="50" cy="30" r="12" fill="url(#avatarGradient)" style={{ opacity: coreOpacity, transition: 'opacity 1s ease-in-out' }} />
                    </svg>
                </div>
            </div>
             <style jsx>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes breathing { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .animate-spin-slow { animation: spin-slow linear infinite; }
                .animate-spin-slow-reverse { animation: spin-slow-reverse linear infinite; }
                .animate-breathing { animation: breathing 5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

// Placeholder components for new features
const BalanceMeter = ({ statsData }: { statsData: LifeStats['stats'] | null }) => {
    const chartData = useMemo(() => {
        if (!statsData) return [];
        return Object.entries(statConfig).map(([key, config]) => ({
            subject: config.label,
            value: statsData[key as StatKey]?.total || 0,
            fullMark: 1000,
        }));
    }, [statsData]);

    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle>Balance Meter</CardTitle>
                <CardDescription>A visual representation of your life balance.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={{}} className="h-64 w-full">
                        <RadarChart data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 1000]} />
                            <Radar name="Stats" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                        </RadarChart>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground">Not enough data to display balance.</p>
                )}
            </CardContent>
        </Card>
    )
};
const MilestoneBadges = () => (
     <Card className="glass">
        <CardHeader>
            <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Display of earned milestone badges coming soon.</p>
        </CardContent>
    </Card>
)
const ProgressTimeline = () => (
     <Card className="glass mt-8 col-span-3">
        <CardHeader>
            <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">A visual timeline of major milestones achieved is coming soon.</p>
        </CardContent>
    </Card>
)
const QuickActions = ({ onAddGoal }: { onAddGoal: () => void }) => (
     <div className="mt-8 col-span-3 flex justify-center gap-4">
        <Button onClick={onAddGoal}>Add Goal</Button>
        <Button variant="outline">Check Systems</Button>
        <Button variant="outline">View Milestones</Button>
    </div>
)


export default function LifeStatsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);

  const lifeStatsRef = useMemo(
    () => (user ? doc(firestore, `users/${user.uid}/lifeStats`, user.uid) : null),
    [user, firestore]
  );
  
  const goalsCollection = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, `users/${user.uid}/goals`);
    }
    return null;
  }, [firestore, user]);

  const { data: lifeStats, isLoading: lifeStatsLoading } = useDoc<LifeStats>(lifeStatsRef);
  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsCollection);
  
  const isLoading = lifeStatsLoading || goalsLoading;

  const levelInfo = useMemo(() => {
    if (!lifeStats) return { level: 1, currentXp: 0, xpToNextLevel: 1000 };
    const level = lifeStats.level || 1;
    const xpToNextLevel = Math.floor(1000 * Math.pow(1.2, level - 1));
    return {
        level,
        currentXp: lifeStats.xp || 0,
        xpToNextLevel
    }
  }, [lifeStats]);
  
  const { toast } = useToast();

  const handleCompleteQuest = async (quest: { xp: number, stat: string, statIncrease: number, title: string }) => {
      if (!user || !firestore) return;

      const lifeStatsRef = doc(firestore, `users/${user.uid}/lifeStats`, user.uid);

      try {
          await runTransaction(firestore, async (transaction) => {
              const lifeStatsDoc = await transaction.get(lifeStatsRef);
              if (!lifeStatsDoc.exists()) {
                  // This part should ideally be handled during onboarding
                  toast({ variant: "destructive", title: "Life Stats not initialized!" });
              } else {
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

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsGoalDialogOpen(true);
  };
  
  const handleAddGoal = () => {
    setSelectedGoal(undefined);
    setIsGoalDialogOpen(true);
  };
  
  const goalInFocus = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    // Find the goal with the highest progress percentage that isn't complete
    return [...goals]
        .filter(g => g.currentAmount < g.targetAmount)
        .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];
  }, [goals])


  return (
    <>
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold text-primary">Hyperion Self – Life Plan</h1>
            <p className="text-muted-foreground mt-2">
                Your gamified character sheet for life.
            </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5 text-sm font-semibold text-amber-400 shadow-[0_0_15px_rgba(252,163,17,0.2)] hover:shadow-[0_0_20px_rgba(252,163,17,0.4)] transition-shadow">
            <Gem className="h-5 w-5" />
             {isLoading ? <Skeleton className="h-5 w-20" /> : <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(lifeStats?.netWorth || 0)}</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Stats */}
        <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold text-center lg:text-left">Core Attributes</h2>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[76px] w-full" />)
            ) : (
                Object.keys(statConfig).map((key) => (
                    <StatCard 
                        key={key} 
                        statKey={key as StatKey}
                        statsData={lifeStats?.stats || null}
                    />
                ))
            )}
        </div>

        {/* Center Panel: Avatar */}
        <div className="lg:col-span-4 flex items-center justify-center">
            <CharacterAvatar level={levelInfo.level} avatarData={lifeStats?.avatar || null} />
        </div>

        {/* Right Panel: Advisor */}
        <div className="lg:col-span-4 space-y-8">
            <AiAdvisorPanel onCompleteQuest={handleCompleteQuest} />
            <BalanceMeter statsData={lifeStats?.stats || null} />
            <MilestoneBadges />
        </div>

        {/* Bottom Section */}
        <div className="lg:col-span-12">
            <ProgressTimeline />
            <QuickActions onAddGoal={handleAddGoal} />
        </div>

         {/* Goals Section */}
        <div className="lg:col-span-12 mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Financial Quests (Goals)</h2>
                <Button onClick={handleAddGoal}><PlusCircle className="mr-2 h-4 w-4" /> Add Goal</Button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {goals && goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} />
                ))}
             </div>
             {goals && goals.length === 0 && (
                <Card className="col-span-full flex flex-col items-center justify-center text-center py-12 glass">
                     <CardHeader>
                        <div className="flex items-center justify-center h-16 w-16 bg-primary/10 rounded-full mx-auto mb-4">
                            <Target className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Set a Financial Goal</CardTitle>
                        <CardDescription>Start tracking your progress towards your financial ambitions.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Button onClick={handleAddGoal}>Create a Goal</Button>
                     </CardContent>
                 </Card>
             )}
        </div>

      </div>
    </div>
    <GoalDialog isOpen={isGoalDialogOpen} setIsOpen={setIsGoalDialogOpen} goal={selectedGoal} />
    </>
  );
}
