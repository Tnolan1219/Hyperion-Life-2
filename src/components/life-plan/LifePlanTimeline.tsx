'use client';

import React, { useMemo } from 'react';
import { Node } from 'reactflow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, GraduationCap, PiggyBank, Heart, Flag, Zap, Calendar, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const nodeIcons = {
  career: { icon: Briefcase, color: 'text-orange-400' },
  education: { icon: GraduationCap, color: 'text-blue-400' },
  financial: { icon: PiggyBank, color: 'text-green-400' },
  lifeEvent: { icon: Heart, color: 'text-pink-400' },
  goal: { icon: Flag, color: 'text-purple-400' },
  other: { icon: Zap, color: 'text-teal-400' },
};

const formatCurrency = (value: number) => {
    if (!value) return null;
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue;
    if (absValue >= 1000000) {
        formattedValue = (absValue / 1000000).toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        formattedValue = (absValue / 1000).toFixed(1) + 'K';
    } else {
        formattedValue = absValue.toLocaleString();
    }
    return `${isNegative ? '-' : ''}$${formattedValue}`;
}

interface LifePlanTimelineProps {
  nodes: Node[];
  onNodeSelect: (nodeId: string) => void;
}

export function LifePlanTimeline({ nodes, onNodeSelect }: LifePlanTimelineProps) {
  const groupedByYear = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const year = node.data.year || 'Undated';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(node);
      return acc;
    }, {} as Record<string, Node[]>);
  }, [nodes]);

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    if (a === 'Undated') return 1;
    if (b === 'Undated') return -1;
    return parseInt(a) - parseInt(b);
  });
  
  if (nodes.length === 0) {
      return null;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Calendar className="text-primary" />
            Life Plan Timeline
        </CardTitle>
        <CardDescription>A chronological view of your life plan events and milestones.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={sortedYears} className="w-full">
          {sortedYears.map(year => (
            <AccordionItem value={year.toString()} key={year}>
              <AccordionTrigger className="text-lg font-bold text-primary/80">{year}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4 border-l-2 border-primary/20 ml-2">
                    {groupedByYear[year].map((node) => {
                        const { icon: Icon, color } = nodeIcons[node.type as keyof typeof nodeIcons] || nodeIcons.other;
                        const formattedAmount = formatCurrency(node.data.amount);
                        return (
                            <div key={node.id} className="relative pl-8 group">
                                <div className={cn("absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-background border-2", `border-primary/50`)}></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                         <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{node.data.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-muted-foreground capitalize">{node.type}</p>
                                                {node.data.linkedContact && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="h-3 w-3" />
                                                        <span>{node.data.linkedContact.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {formattedAmount && (
                                             <div className={cn("font-semibold", node.data.amount > 0 ? "text-green-400" : "text-red-400")}>
                                                {formattedAmount}
                                                {node.data.frequency === 'yearly' && <span className="text-xs text-muted-foreground ml-1">/yr</span>}
                                            </div>
                                        )}
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onNodeSelect(node.id)}>
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Focus
                                        </Button>
                                    </div>
                                </div>
                                {node.data.notes && <p className="text-sm text-muted-foreground mt-1 pl-11">{node.data.notes}</p>}
                            </div>
                        )
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}