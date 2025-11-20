
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, increment, runTransaction } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sword, Heart, MessageSquare, Brain, Gem, Zap, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AiAdvisorPanel } from '@/components/life-stats/AiAdvisorPanel';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';


// Define the structure of the LifeStats document
interface LifeStats {
  id?: string;
  level: number;
  xp: number;
  stats: {
    health: { total: number; strength: number; endurance: number; nutrition: number; };
    social: { total: number; relationships: number; communication: number; influence: number; };
    power: { total: number; leadership: number; decisionMaking: number; resilience: number; };
    wealth: { total: number; careerSkills: number; networking: number; investing: number; };
    emotionalIntelligence: { total: number; selfAwareness: number; empathy: number; regulation: number; };
  };
  netWorth: number;
}

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
                             {Object.entries(config.subStats).map(([subKey, subLabel]) => (
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

const CharacterAvatar = ({ level }: { level: number }) => {
    const auraOpacity = useMemo(() => Math.min(0.1 + (level - 1) * 0.05, 0.5), [level]);
    const coreOpacity = useMemo(() => Math.min(0.8 + (level - 1) * 0.02, 1.0), [level]);

    return (
        <div className="relative w-48 h-48 md:w-56 md:h-56">
            <div 
                className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"
                style={{ animationDuration: '4s' }}
            />
            <div 
                className={cn(
                    "absolute inset-2 rounded-full border-2 border-primary/30",
                    "animate-spin-slow"
                )}
                style={{ animationDuration: '20s' }}
            />
             <div 
                className={cn(
                    "absolute inset-4 rounded-full border-2 border-dashed border-primary/20",
                     "animate-spin-slow-reverse"
                )}
                style={{ animationDuration: '25s' }}
            />

            <div className="absolute inset-0 flex items-center justify-center animate-breathing">
                <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_10px_hsl(var(--primary))]">
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
                    
                    {/* Aura - scales with level */}
                    <circle cx="50" cy="50" r="35" fill="hsl(var(--primary))" filter="url(#glow)" style={{ opacity: auraOpacity, transition: 'opacity 1s ease-in-out' }} />
                    
                    {/* Body */}
                    <path d="M50 40 Q50 60 40 75 L60 75 Q50 60 50 40" fill="url(#avatarGradient)" style={{ opacity: coreOpacity, transition: 'opacity 1s ease-in-out' }} />
                    {/* Head */}
                    <circle cx="50" cy="30" r="12" fill="url(#avatarGradient)" style={{ opacity: coreOpacity, transition: 'opacity 1s ease-in-out' }} />
                </svg>
            </div>
            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-slow-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes breathing {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-spin-slow {
                    animation: spin-slow linear infinite;
                }
                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse linear infinite;
                }
                .animate-breathing {
                    animation: breathing 5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

const StatHexagon = ({ statsData }: { statsData: LifeStats['stats'] | null }) => {
    const data = useMemo(() => {
        if (!statsData) return [];
        return Object.keys(statConfig).map(key => ({
            subject: statConfig[key as StatKey].label,
            value: statsData[key as StatKey]?.total || 0,
            fullMark: 1000,
        }));
    }, [statsData]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <defs>
                    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.4}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} axisLine={false} />
                <Radar name="Stats" dataKey="value" stroke="hsl(var(--primary))" fill="url(#radarFill)" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default function LifeStatsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const lifeStatsRef = useMemo(
    () => (user ? doc(firestore, `users/${user.uid}/lifeStats`, user.uid) : null),
    [user, firestore]
  );

  const { data: lifeStats, isLoading } = useDoc<LifeStats>(lifeStatsRef);

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

  const xpPercentage = (levelInfo.currentXp / levelInfo.xpToNextLevel) * 100;
  
  const { toast } = useToast();

  const handleCompleteQuest = async (quest: { xp: number, stat: string, statIncrease: number, title: string }) => {
      if (!user || !firestore) return;

      const lifeStatsRef = doc(firestore, `users/${user.uid}/lifeStats`, user.uid);

      try {
          await runTransaction(firestore, async (transaction) => {
              const lifeStatsDoc = await transaction.get(lifeStatsRef);
              if (!lifeStatsDoc.exists()) {
                   // If doc doesn't exist, create it. This is a fallback.
                  const newStats = {
                      health: { total: 0, strength: 0, endurance: 0, nutrition: 0 },
                      wealth: { total: 0, careerSkills: 0, networking: 0, investing: 0 },
                      social: { total: 0, relationships: 0, communication: 0, influence: 0 },
                      power: { total: 0, leadership: 0, decisionMaking: 0, resilience: 0 },
                      emotionalIntelligence: { total: 0, selfAwareness: 0, empathy: 0, regulation: 0 },
                  };
                  const mainStat = quest.stat.split('.')[0] as StatKey;
                  const subStat = quest.stat.split('.')[1];
                  (newStats[mainStat] as any)[subStat] = quest.statIncrease;
                  newStats[mainStat].total = quest.statIncrease;
                  
                  transaction.set(lifeStatsRef, {
                      id: user.uid,
                      userId: user.uid,
                      level: 1,
                      xp: quest.xp,
                      stats: newStats,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary">Life Stats</h1>
        <p className="text-muted-foreground mt-2">
          Level up your life. Track your progress toward your ultimate self.
        </p>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="glass">
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                             {isLoading ? <Skeleton className="h-10 w-24 mb-2" /> : <p className="text-4xl font-bold text-primary">Level {levelInfo.level}</p>}
                            <div className="w-full">
                                {isLoading ? <Skeleton className="h-3 w-full mt-2" /> : <Progress value={xpPercentage} />}
                                <div className="text-xs text-muted-foreground mt-1.5 flex justify-between">
                                    <span>XP</span>
                                    {isLoading ? <div className="inline-block"><Skeleton className="h-4 w-24" /></div> : <span>{levelInfo.currentXp.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()}</span>}
                                </div>
                            </div>
                        </div>
                         <div className="text-center md:text-right">
                            <div className="text-sm font-medium text-muted-foreground">Net Worth</div>
                            {isLoading ? <Skeleton className="h-10 w-32 mt-1 mx-auto md:mr-0" /> : <div className="text-4xl font-bold text-amber-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(lifeStats?.netWorth || 0)}</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card className="glass">
                <CardHeader>
                    <CardTitle>Stat Distribution</CardTitle>
                    <CardDescription>A visual summary of your core attributes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : <StatHexagon statsData={lifeStats?.stats || null} />}
                </CardContent>
            </Card>
            
            <h2 className="text-2xl font-bold pt-4">Detailed Stats</h2>
             <Accordion type="single" collapsible className="w-full space-y-4">
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
            </Accordion>
        </div>

        {/* Right Column: Character & AI */}
        <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-8">
                <Card className="glass">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Hyperion Self</CardTitle>
                        <CardDescription>Your avatar evolves as you level up.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <CharacterAvatar level={levelInfo.level} />
                    </CardContent>
                </Card>
                <AiAdvisorPanel onCompleteQuest={handleCompleteQuest} />
            </div>
        </div>
      </div>
    </div>
  );
}

    