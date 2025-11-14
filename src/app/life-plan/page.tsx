'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { lifePlanTemplates } from '@/lib/life-plan-templates';

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
  Zap,
  ZoomIn,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeEditor } from '@/components/life-plan/NodeEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const initialNodes: Node[] = lifePlanTemplates.default.nodes;
const initialEdges: Edge[] = lifePlanTemplates.default.edges;

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
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [connectingNode, setConnectingNode] = useState<string | null>(null);

  const [netWorth, setNetWorth] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);

  useEffect(() => {
    let totalWorth = 0;
    let totalIncome = 0;
    nodes.forEach(node => {
      const amount = node.data.amount || 0;
      if (node.data.frequency === 'one-time') {
        totalWorth += amount;
      } else if (node.data.frequency === 'yearly') {
        totalIncome += amount;
      }
    });
    setNetWorth(totalWorth);
    setAnnualIncome(totalIncome);
  }, [nodes]);

  useEffect(() => {
    fitView({ duration: 300 });
  }, [fitView, nodes]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setConnectingNode(null);
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
      );
    },
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node_${+new Date()}`,
      type,
      position: screenToFlowPosition({
        x: window.innerWidth / 2.5,
        y: window.innerHeight / 3,
      }),
      data: {
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        amount: 0,
        frequency: 'one-time',
        notes: '',
      },
    };
    setNodes(nds => nds.concat(newNode));
    setSelectedNode(newNode);
  };

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (connectingNode) {
        onConnect({ source: connectingNode, target: node.id, sourceHandle: null, targetHandle: null });
      } else {
        setSelectedNode(node);
      }
    },
    [connectingNode, onConnect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setConnectingNode(null);
  }, []);

  const onNodeDataChange = (nodeId: string, newData: any) => {
    let newNodes: Node[] = [];
    setNodes(nds => {
      newNodes = nds.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      );
      return newNodes;
    });

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev =>
        prev ? { ...prev, data: { ...prev.data, ...newData } } : null
      );
    }
  };
  
  const handleLoadTemplate = (templateName: keyof typeof lifePlanTemplates) => {
    const template = lifePlanTemplates[templateName];
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNode(null);
    setTimeout(() => fitView({duration: 500}), 100);
  }

  return (
    <div className="w-full grow rounded-lg overflow-hidden relative flex">
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
        className={cn('bg-card/30', connectingNode && 'cursor-crosshair')}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} color="hsl(var(--border))" />
        <Controls className="react-flow-controls" position='bottom-left'>
            <button onClick={() => fitView({ duration: 500 })}>
                <ZoomIn />
            </button>
        </Controls>
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
        <Panel position="top-left">
          <div className="flex gap-2">
            <Card className="glass">
              <CardHeader className="p-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add to Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 grid grid-cols-5 gap-2">
                {nodeMenu.map(({ type, label, icon: Icon, color }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addNode(type)}
                    className="flex flex-col h-16 w-16 gap-1 border-border/60 hover:border-primary"
                  >
                    <Icon className={`h-5 w-5 text-${color}-400`} />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass h-full">
                  <Zap className="mr-2 h-4 w-4" /> Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLoadTemplate('default')}>
                  Standard Career Path
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLoadTemplate('earlyRetirement')}>
                  Early Retirement (FIRE)
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleLoadTemplate('startup')}>
                  Startup Founder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Panel>
         <Panel position="bottom-center">
            <Card className="glass py-2 px-4 flex items-center gap-6">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Projected Net Worth</p>
                    <p className="text-lg font-bold text-green-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(netWorth)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Est. Annual Income</p>
                    <p className="text-lg font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(annualIncome)}/yr</p>
                </div>
            </Card>
        </Panel>
      </ReactFlow>

      <NodeEditor
        selectedNode={selectedNode}
        onNodeDataChange={onNodeDataChange}
        closeEditor={() => setSelectedNode(null)}
        startConnecting={() => {
            if (selectedNode) setConnectingNode(selectedNode.id);
            setSelectedNode(null);
        }}
      />

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
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex flex-col gap-8">
      <div className="flex-shrink-0">
        <h1 className="text-4xl font-bold">Life Plan</h1>
        <p className="text-muted-foreground mt-2">
          Visualize and map out your financial future. Drag, drop, and connect
          the dots.
        </p>
      </div>
      <ReactFlowProvider>
        <LifePlanCanvas />
      </ReactFlowProvider>
    </div>
  );
}
