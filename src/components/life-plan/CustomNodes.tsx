'use client';
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, GraduationCap, PiggyBank, Heart, Flag } from 'lucide-react';

const iconMap = {
  career: Briefcase,
  education: GraduationCap,
  financial: PiggyBank,
  lifeEvent: Heart,
  goal: Flag,
};

const colorMap = {
  career: 'orange',
  education: 'blue',
  financial: 'green',
  lifeEvent: 'pink',
  goal: 'purple',
};

type CustomNodeProps = {
  data: {
    title: string;
    amount: number;
    frequency: 'one-time' | 'yearly';
  };
  type: keyof typeof iconMap;
  selected: boolean;
};

const formatCurrency = (value: number) => {
    if (value === 0) return '$0';
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue;
    if (absValue >= 1000000) {
        formattedValue = (absValue / 1000000).toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        formattedValue = (absValue / 1000).toFixed(1) + 'K';
    } else {
        formattedValue = absValue.toString();
    }
    return `${isNegative ? '-' : ''}$${formattedValue}`;
}


const CustomNode = ({ data, type, selected }: CustomNodeProps) => {
  const color = colorMap[type];
  const Icon = iconMap[type];
  const borderColorClass = `border-${color}-400/50`;
  const textColorClass = `text-${color}-400`;
  const shadowColorClass = `hover:shadow-${color}-400/20`;

  return (
    <Card
      className={cn(
        '!w-52 shadow-lg rounded-lg border-2 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10',
        shadowColorClass,
        borderColorClass,
        selected && 'border-primary shadow-lg shadow-primary/20'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-primary/10',
              textColorClass
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-sm font-semibold truncate">{data.title}</CardTitle>
        </div>
      </CardHeader>
      {data.amount !== 0 && (
          <CardContent className="p-3 pt-0">
            <div className={cn("text-lg font-bold", data.amount > 0 ? "text-green-400" : "text-red-400")}>
                {formatCurrency(data.amount)}
                {data.frequency === 'yearly' && <span className="text-xs text-muted-foreground ml-1">/yr</span>}
            </div>
          </CardContent>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary/50"
      />
    </Card>
  );
};

export const LifeEventNode = (props: any) => (
  <CustomNode {...props} type="lifeEvent" />
);
export const FinancialMilestoneNode = (props: any) => (
  <CustomNode {...props} type="financial" />
);
export const EducationNode = (props: any) => (
  <CustomNode {...props} type="education" />
);
export const CareerNode = (props: any) => <CustomNode {...props} type="career" />;
export const GoalNode = (props: any) => <CustomNode {...props} type="goal" />;
