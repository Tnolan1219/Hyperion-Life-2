'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sword, Heart, MessageSquare, Brain, Gem, Zap } from 'lucide-react';

// Define the structure of the LifeStats document
interface LifeStats {
  level: number;
  xp: number;
  stats: {
    health: number;
    social: number;
    power: number;
    wealth: number;
    emotionalIntelligence: number;
  };
  netWorth: number;
}

// Define the configuration for each main stat
const statConfig = {
  health: {
    label: 'Health & Vitality',
    icon: Heart,
    color: 'bg-red-500',
    description: 'Your physical and mental well-being.',
  },
  social: {
    label: 'Social',
    icon: MessageSquare,
    color: 'bg-blue-500',
    description: 'Your relationships and network.',
  },
  power: {
    label: 'Power',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Your influence and resilience.',
  },
  wealth: {
    label: 'Wealth',
    icon: Gem,
    color: 'bg-green-500',
    description: 'Your financial strength and skills.',
  },
  emotionalIntelligence: {
    label: 'Emotional Intelligence',
    icon: Brain,
    color: 'bg-purple-500',
    description: 'Your self-awareness and empathy.',
  },
};

type StatKey = keyof typeof statConfig;

const StatBar = ({ label, value, max, icon: Icon, color, description }: {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
  color: string;
  description: string;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <Card className="glass hover:border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {label}
          </CardTitle>
          <span className="font-bold text-primary">{value}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-3 [&>div]:bg-primary" />
      </CardContent>
    </Card>
  );
};


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
                    <Card key={i} className="glass">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-3 w-full" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                Object.keys(statConfig).map((key) => {
                    const statKey = key as StatKey;
                    const config = statConfig[statKey];
                    const value = lifeStats?.stats?.[statKey] || 0;
                    // For now, max is just a placeholder
                    const max = Math.max(100, value); 
                    return (
                        <StatBar
                            key={statKey}
                            label={config.label}
                            value={value}
                            max={max}
                            icon={config.icon}
                            color={config.color}
                            description={config.description}
                        />
                    );
                })
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