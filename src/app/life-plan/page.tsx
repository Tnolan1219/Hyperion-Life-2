'use client';
import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
    LifeEventNode,
    FinancialMilestoneNode,
    EducationNode,
    CareerNode,
    GoalNode
} from '@/components/life-plan/CustomNodes';
import { Button } from '@/components/ui/button';
import {
    Heart,
    Home,
    PiggyBank,
    Briefcase,
    GraduationCap,
    Flag,
    PlusCircle,
    Locate,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const initialNodes = [
  {
    id: '1',
    type: 'career',
    position: { x: 250, y: 50 },
    data: { title: 'First Job', emoji: '🎉' },
  },
  {
    id: '2',
    type: 'financial',
    position: { x: 450, y: 250 },
    data: { title: 'Emergency Fund', emoji: '💰' },
  },
  {
    id: '3',
    type: 'goal',
    position: { x: 650, y: 50 },
    data: { title: 'Buy a House', emoji: '🏡' },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  lifeEvent: LifeEventNode,
  financial: FinancialMilestoneNode,
  education: EducationNode,
  career: CareerNode,
  goal: GoalNode,
};

const nodeMenu = [
    { type: 'career', label: 'Career', icon: Briefcase, color: 'orange' },
    { type: 'education', label: 'Education', icon: GraduationCap, color: 'blue' },
    { type: 'financial', label: 'Milestone', icon: PiggyBank, color: 'green' },
    { type: 'lifeEvent', label: 'Life Event', icon: Heart, color: 'pink' },
    { type: 'goal', label: 'Goal', icon: Flag, color: 'purple' },
]

function LifePlanCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges(eds => addEdge({ ...params, type: 'smoothstep', animated: true, style: {stroke: 'hsl(var(--primary))', strokeWidth: 2} }, eds)),
    [setEdges]
  );
  
  const addNode = (type: string) => {
    const newNode = {
        id: (nodes.length + 1).toString(),
        type,
        position: {
            x: Math.random() * 500,
            y: Math.random() * 500,
        },
        data: { title: `New ${type}`, emoji: '💡' },
    };
    setNodes((nds) => nds.concat(newNode));
  }

  return (
    <div className="w-full h-[85vh] rounded-lg overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-card/30"
        >
          <Background gap={24} size={1} color="hsl(var(--border))" />
          <Controls className="react-flow-controls" />
          <MiniMap nodeColor={(node) => {
              switch (node.type) {
                case 'career': return '#fb923c';
                case 'education': return '#60a5fa';
                case 'financial': return '#4ade80';
                case 'lifeEvent': return '#f472b6';
                case 'goal': return '#c084fc';
                default: return '#888';
              }
          }} />
        </ReactFlow>
        <div className="absolute top-4 left-4 z-10">
             <Card className="glass">
                <CardHeader className='p-4'>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PlusCircle className='h-5 w-5'/>
                        Add to Plan
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-4 pt-0 grid grid-cols-3 gap-2'>
                    {nodeMenu.map(({type, label, icon: Icon, color}) => (
                         <Button key={type} variant="outline" size="sm" onClick={() => addNode(type)} className="flex flex-col h-16 gap-1 border-border/60 hover:border-primary">
                            <Icon className={`h-5 w-5 text-${color}-400`} />
                            <span className='text-xs'>{label}</span>
                         </Button>
                    ))}
                </CardContent>
            </Card>
        </div>

        <style jsx global>{`
            .react-flow__edge-path {
                filter: drop-shadow(0 0 5px hsl(var(--primary)));
            }
            .react-flow-controls button {
                background-color: hsl(var(--card));
                border-bottom: 1px solid hsl(var(--border));
                border-radius: 4px;
            }
            .react-flow-controls button:hover {
                background-color: hsl(var(--muted));
            }
            .react-flow-controls svg {
                fill: hsl(var(--foreground));
            }
             .react-flow__minimap {
                background-color: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: 8px;
            }
        `}</style>
    </div>
  );
}


export default function LifePlanPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Life Plan</h1>
          <p className="text-muted-foreground mt-2">
            Visualize and map out your financial future. Drag, drop, and connect the dots.
          </p>
        </div>
      </div>
      <ReactFlowProvider>
        <LifePlanCanvas />
      </ReactFlowProvider>
    </div>
  );
}
