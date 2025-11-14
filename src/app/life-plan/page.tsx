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
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  LifeEventNode,
  FinancialMilestoneNode,
  EducationNode,
  CareerNode,
  GoalNode,
} from '@/components/life-plan/CustomNodes';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  GraduationCap,
  PiggyBank,
  Heart,
  Flag,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeEditor } from '@/components/life-plan/NodeEditor';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'career',
    position: { x: 250, y: 50 },
    data: {
      title: 'First Job',
      amount: 50000,
      frequency: 'yearly',
      notes: 'Starting salary as a software engineer.',
    },
  },
  {
    id: '2',
    type: 'financial',
    position: { x: 450, y: 250 },
    data: {
      title: 'Emergency Fund',
      amount: -10000,
      frequency: 'one-time',
      notes: 'Initial savings for a 3-month emergency fund.',
    },
  },
  {
    id: '3',
    type: 'goal',
    position: { x: 650, y: 50 },
    data: {
      title: 'Buy a House',
      amount: -50000,
      frequency: 'one-time',
      notes: 'Down payment for a starter home.',
    },
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
];

function LifePlanCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node_${+new Date()}`,
      type,
      position: screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 3,
      }),
      data: {
        title: `New ${
          type.charAt(0).toUpperCase() + type.slice(1)
        }`,
        amount: 0,
        frequency: 'one-time',
        notes: '',
      },
    };
    setNodes(nds => nds.concat(newNode));
    setSelectedNode(newNode);
  };
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDataChange = (nodeId: string, newData: any) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? {...prev, data: {...prev.data, ...newData}} : null);
    }
  };

  return (
    <div className="w-full h-[85vh] rounded-lg overflow-hidden relative flex">
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-card/30"
        >
          <Background gap={24} size={1} color="hsl(var(--border))" />
          <Controls className="react-flow-controls" />
          <MiniMap
            nodeColor={node => {
              switch (node.type) {
                case 'career':
                  return '#fb923c';
                case 'education':
                  return '#60a5fa';
                case 'financial':
                  return '#4ade80';
                case 'lifeEvent':
                  return '#f472b6';
                case 'goal':
                  return '#c084fc';
                default:
                  return '#888';
              }
            }}
          />
        </ReactFlow>
      </div>

      <NodeEditor selectedNode={selectedNode} onNodeDataChange={onNodeDataChange} closeEditor={() => setSelectedNode(null)}/>

      <div className="absolute top-4 left-4 z-10">
        <Card className="glass">
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add to Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 grid grid-cols-3 gap-2">
            {nodeMenu.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addNode(type)}
                className="flex flex-col h-16 gap-1 border-border/60 hover:border-primary"
              >
                <Icon className={`h-5 w-5 text-${color}-400`} />
                <span className="text-xs">{label}</span>
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
            Visualize and map out your financial future. Drag, drop, and connect
            the dots.
          </p>
        </div>
      </div>
      <ReactFlowProvider>
        <LifePlanCanvas />
      </ReactFlowProvider>
    </div>
  );
}
