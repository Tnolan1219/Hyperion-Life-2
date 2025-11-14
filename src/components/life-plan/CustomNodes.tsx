'use client';
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, GraduationCap, PiggyBank, Heart, Flag } from 'lucide-react';

const nodeStyles = {
  base: "shadow-lg rounded-lg border-2 !w-48",
  glowingBorder: "border-primary/60",
  shadow: "shadow-primary/20",
};

const iconMap = {
    career: Briefcase,
    education: GraduationCap,
    financial: PiggyBank,
    lifeEvent: Heart,
    goal: Flag
}

const colorMap = {
    career: 'orange',
    education: 'blue',
    financial: 'green',
    lifeEvent: 'pink',
    goal: 'purple'
}

type CustomNodeProps = {
  data: {
    emoji: string;
    title: string;
  };
  type: 'career' | 'education' | 'financial' | 'lifeEvent' | 'goal';
};

const CustomNode = ({ data, type }: CustomNodeProps) => {
  const color = colorMap[type];
  const Icon = iconMap[type];
  const borderColorClass = `border-${color}-400/50`;
  const textColorClass = `text-${color}-400`;
  const shadowColorClass = `hover:shadow-${color}-400/20`;

  return (
    <Card className={cn("!w-48 shadow-lg rounded-lg border-2 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10", shadowColorClass, borderColorClass)}>
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", textColorClass)}>
            <Icon className="h-5 w-5"/>
          </div>
          <CardTitle className="text-sm font-semibold">{data.title}</CardTitle>
        </div>
      </CardHeader>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </Card>
  );
};

export const LifeEventNode = (props: any) => <CustomNode {...props} type="lifeEvent" />;
export const FinancialMilestoneNode = (props: any) => <CustomNode {...props} type="financial" />;
export const EducationNode = (props: any) => <CustomNode {...props} type="education" />;
export const CareerNode = (props: any) => <CustomNode {...props} type="career" />;
export const GoalNode = (props: any) => <CustomNode {...props} type="goal" />;
