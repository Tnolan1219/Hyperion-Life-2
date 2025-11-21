'use client';
import React from 'react';
import { Handle, Position, NodeResizer, useReactFlow, useNodeId } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, GraduationCap, PiggyBank, Heart, Flag, Zap, Users, Repeat, HeartPulse } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const iconMap = {
  career: Briefcase,
  education: GraduationCap,
  financial: PiggyBank,
  lifeEvent: Heart,
  goal: Flag,
  health: HeartPulse,
  other: Zap,
  system: Repeat,
};

const colorMap = {
  career: 'orange',
  education: 'blue',
  financial: 'green',
  lifeEvent: 'pink',
  goal: 'purple',
  health: 'red',
  other: 'teal',
  system: 'system',
};

type CustomNodeProps = {
  data: {
    title: string;
    amount?: number;
    frequency?: 'one-time' | 'yearly' | 'weekly';
    linkedContact?: { id: string, name: string };
    notes?: string;
    htmlContent?: string;
    connecting?: boolean;
  };
  type: keyof typeof iconMap;
  selected: boolean;
  is3dMode?: boolean;
};

const formatCurrency = (value?: number) => {
    if (value === undefined || value === 0) return null;
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


const CustomNode = ({ data, type, selected, is3dMode }: CustomNodeProps) => {
  const color = colorMap[type];
  const Icon = iconMap[type];
  const colorClass = colorMap[type as keyof typeof colorMap];
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();


  const formattedAmount = formatCurrency(data.amount);
  
  const onContentChange = (evt: React.FormEvent<HTMLDivElement>) => {
    const newContent = evt.currentTarget.innerHTML;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            htmlContent: newContent,
          };
        }
        return node;
      })
    );
  };
  
    if (is3dMode) {
        return (
            <div className="relative group">
                <Handle type="target" position={Position.Top} className="!opacity-0" />
                <div className={cn(
                    "w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300",
                    selected ? 'border-primary shadow-lg shadow-primary/20 scale-110' : `border-${colorClass}-400/50`,
                    `bg-${colorClass}-400/10`
                )}>
                    <Icon className={cn("h-8 w-8", `text-${colorClass}-400`)} />
                </div>
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 text-center text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/50 rounded-md p-1">
                    {data.title}
                </p>
                <Handle type="source" position={Position.Bottom} className="!opacity-0" />
            </div>
        )
    }
  
  if (type === 'other') {
    return (
      <Card
        className={cn(
          `shadow-lg rounded-lg border-2 bg-yellow-200/80 dark:bg-yellow-800/50 backdrop-blur-sm transition-all duration-300 w-full h-full react-flow__node-other`,
          selected ? 'border-primary shadow-lg shadow-primary/20' : `border-yellow-400/20`
        )}
      >
        <NodeResizer minWidth={150} minHeight={100} isVisible={selected} />
        <Handle type="target" position={Position.Top} className="!bg-primary/50" isConnectable={true} />
        <div 
          className="editable-content prose dark:prose-invert"
          contentEditable={true}
          dangerouslySetInnerHTML={{ __html: data.htmlContent || data.title || '' }}
          onBlur={onContentChange}
          suppressContentEditableWarning={true}
        />
        <Handle type="source" position={Position.Bottom} className="!bg-primary/50" isConnectable={true} />
      </Card>
    );
  }
  
  if (type === 'system') {
    return (
       <Card
        className={cn(
          `!h-16 shadow-lg rounded-lg border-2 bg-card/80 backdrop-blur-sm transition-all duration-300 w-full`,
          selected ? 'border-primary shadow-lg shadow-primary/20' : `border-system-400/20`
        )}
      >
        <NodeResizer minWidth={250} minHeight={64} maxHeight={64} isVisible={selected} lineClassName="border-dashed" handleClassName="h-3 w-3 bg-background border-primary" />
        <Handle type="target" position={Position.Top} className="!bg-primary/50" isConnectable={true} />
        <div className="flex items-center p-3 h-full">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                `bg-system-400/10 text-system-400`
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="ml-3 flex-grow">
                <CardTitle className="text-sm font-semibold leading-tight">{data.title}</CardTitle>
                {data.notes && (<p className="text-xs text-muted-foreground truncate">{data.notes}</p>)}
            </div>
            {formattedAmount && (
                <div className={cn("text-lg font-bold ml-4", data.amount && data.amount > 0 ? "text-green-400" : "text-red-400")}>
                    {formattedAmount}
                    {data.frequency === 'yearly' && <span className="text-xs text-muted-foreground ml-1">/yr</span>}
                    {data.frequency === 'weekly' && <span className="text-xs text-muted-foreground ml-1">/wk</span>}
                </div>
            )}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-primary/50" isConnectable={true} />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        `!w-52 shadow-lg rounded-lg border-2 bg-card/80 backdrop-blur-sm transition-all duration-300`,
        selected ? 'border-primary shadow-lg shadow-primary/20' : `border-${colorClass}-400/20`
      )}
      data-connecting={data.connecting}
    >
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <CardHeader className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                `bg-${colorClass}-400/10 text-${colorClass}-400`
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-semibold truncate leading-tight">{data.title}</CardTitle>
          </div>
          {data.linkedContact && (
             <div className="text-muted-foreground" title={`Linked to: ${data.linkedContact.name}`}>
                <Users className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      {(formattedAmount || data.notes) && (
          <CardContent className="p-3 pt-0">
            {formattedAmount && (
                <div className={cn("text-lg font-bold", data.amount && data.amount > 0 ? "text-green-400" : "text-red-400")}>
                    {formattedAmount}
                    {data.frequency === 'yearly' && <span className="text-xs text-muted-foreground ml-1">/yr</span>}
                    {data.frequency === 'weekly' && <span className="text-xs text-muted-foreground ml-1">/wk</span>}
                </div>
            )}
            {data.notes && !data.htmlContent && (
                <p className="text-xs text-muted-foreground mt-1">{data.notes}</p>
            )}
          </CardContent>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={true}
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
export const HealthNode = (props: any) => <CustomNode {...props} type="health" />;
export const OtherNode = (props: any) => <CustomNode {...props} type="other" />;
export const SystemNode = (props: any) => <CustomNode {...props} type="system" />;
    