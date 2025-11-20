'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sword, Heart, MessageSquare, Brain, Gem, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Define the structure of the LifeStats document
interface LifeStats {
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
    label: 'Health & Vitality',
    icon: Heart,
    color: 'text-red-400',
    description: 'Your physical and mental well-being.',
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
    subStats: {
        leadership: 'Leadership',
        decisionMaking: 'Decision Making',
        resilience: 'Resilience',
    }
  },
  emotionalIntelligence: {
    label: 'Emotional Intelligence',
    icon: Brain,
    color: 'text-purple-400',
    description: 'Your self-awareness and empathy.',
    subStats: {
        selfAwareness: 'Self-Awareness',
        empathy: 'Empathy',
        regulation: 'Regulation',
    }
  },
};

type StatKey = keyof typeof statConfig;

const SubStatBar = ({ label, value }: { label: string; value: number }) => {
    const max = Math.max(100, value);
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    );
};

const StatCard = ({ statKey, statsData }: { statKey: StatKey, statsData: LifeStats['stats'] | null}) => {
    const config = statConfig[statKey];
    const value = statsData?.[statKey]?.total || 0;
    const max = Math.max(100, value);
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <Card className="glass">
             <Accordion type="single" collapsible>
                <AccordionItem value={statKey} className="border-b-0">
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                            <config.icon className={`h-6 w-6 ${config.color}`} />
                             <div className="flex-grow text-left">
                                <CardTitle className="text-lg">{config.label}</CardTitle>
                                <CardDescription>{config.description}</CardDescription>
                            </div>
                            <div className="flex flex-col items-end w-24">
                                <span className="text-2xl font-bold text-primary">{value}</span>
                                <Progress value={percentage} className="h-2 w-full mt-1" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
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

const CharacterPlaceholder = () => (
    <div className="sticky top-24 flex flex-col items-center justify-center h-full">
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-full flex items-center justify-center bg-primary/5 animate-pulse">
            <Sword className="w-24 h-24 text-primary/20" />
        </div>
        <h2 className="text-2xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Hyperion Self</h2>
        <p className="text-muted-foreground">Your character avatar will appear here.</p>
    </div>
);


export default function LifeStatsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const lifeStatsRef = useMemoFirebase(
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary">Life Stats</h1>
          <p className="text-muted-foreground mt-2">
            Level up your life. Track your progress toward your ultimate self.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Level {isLoading ? <Skeleton className="h-6 w-10 inline-block" /> : levelInfo.level}</CardTitle>
                        <CardDescription>XP: {isLoading ? <Skeleton className="h-4 w-24 inline-block" /> : `${levelInfo.currentXp.toLocaleString()} / ${levelInfo.xpToNextLevel.toLocaleString()}`}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={isLoading ? 0 : xpPercentage} />
                </CardContent>
            </Card>

            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="glass h-36">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-48" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                             <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                    </Card>
                ))
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

        {/* Right Column: Character */}
        <div className="lg:col-span-1">
            <CharacterPlaceholder />
        </div>
      </div>
    </div>
  );
}
