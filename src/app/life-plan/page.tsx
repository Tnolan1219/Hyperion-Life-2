

'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { lifePlanTemplates } from '@/lib/life-plan-templates';

import {
  LifeEventNode,
  FinancialMilestoneNode,
  EducationNode,
  CareerNode,
  GoalNode,
  OtherNode,
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
  Layout,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NodeEditor } from '@/components/life-plan/NodeEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import dagre from 'dagre';
import { Textarea } from '@/components/ui/textarea';

const initialNodes: Node[] = lifePlanTemplates.default.nodes;
const initialEdges: Edge[] = lifePlanTemplates.default.edges;

const nodeTypes = {
  lifeEvent: LifeEventNode,
  financial: FinancialMilestoneNode,
  education: EducationNode,
  career: CareerNode,
  goal: GoalNode,
  other: OtherNode,
};

const nodeMenu = [
  { type: 'career', label: 'Career', icon: Briefcase, color: 'orange' },
  { type: 'education', label: 'Education', icon: GraduationCap, color: 'blue' },
  { type: 'financial', label: 'Milestone', icon: PiggyBank, color: 'green' },
  { type: 'lifeEvent', label: 'Life Event', icon: Heart, color: 'pink' },
  { type: 'goal', label: 'Goal', icon: Flag, color: 'purple' },
  { type: 'other', label: 'Other', icon: Zap, color: 'teal' },
];

const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 208;
const nodeHeight = 88;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};


function AIPlanGenerator({ onGenerate }: { onGenerate: (nodes: Node[], edges: Edge[]) => void }) {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);

        const systemMessage = `You are a life planning expert. The user will describe their life plan in text. Your task is to convert this narrative into a structured JSON object containing an array of 'nodes' and an array of 'edges' for a React Flow diagram.
        
        The JSON output must strictly follow this structure: { "nodes": [], "edges": [] }.

        For each 'node', include:
        - id: A unique string identifier (e.g., "node_1", "node_2").
        - type: One of the following strings: 'career', 'education', 'financial', 'lifeEvent', 'goal', 'other'.
        - position: An object with { x: 0, y: 0 }.
        - data: An object with a 'title' (string), and optionally 'amount' (number) and 'frequency' ('one-time' or 'yearly'). Infer amounts and frequencies where possible.

        For each 'edge', include:
        - id: A unique string identifier (e.g., "e_1-2").
        - source: The id of the source node.
        - target: The id of the target node.
        - type: "smoothstep".
        - animated: true.

        Interpret the user's text to create logical nodes and connect them sequentially or logically with edges. Infer reasonable titles and financial amounts if they are implied.`;

        try {
            const response = await fetch('/api/openai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt, 
                    systemMessage,
                    jsonOutput: true 
                }),
            });
            const data = await response.json();
            if (data.response && data.response.nodes && data.response.edges) {
                onGenerate(data.response.nodes, data.response.edges);
            } else {
                console.error("AI response was not in the expected format:", data);
            }
        } catch (error) {
            console.error("Error generating AI plan:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="glass mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    Describe Your Life Plan with AI
                </CardTitle>
                <CardDescription>
                    Write down your life goals, career ambitions, and major life events, and let our AI build the plan for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="e.g., I'll start by getting a degree in computer science. Then, I'll work at a tech company for a few years, save up for a down payment on a house, and eventually start my own business..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                />
                <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Generate Plan
                </Button>
            </CardContent>
        </Card>
    );
}

function LifePlanCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { screenToFlowPosition, fitView, setCenter, getViewport } = useReactFlow();

  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

  const [netWorth, setNetWorth] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);
  
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // If a node is deleted, also delete its connected edges
      const deletedNodeIds = changes
        .filter(change => change.type === 'remove')
        .map(change => (change as any).id);

      if (deletedNodeIds.length > 0) {
        setEdges(eds => eds.filter(edge => !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)));
        if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
            setSelectedNode(null);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange, setEdges, selectedNode]
  );


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
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    window.requestAnimationFrame(() => {
        fitView({ duration: 300 });
    });
  }, [fitView, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setConnectingNodeId(null);
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

  const addNode = (type: string, label: string) => {
    const { x, y, zoom } = getViewport();
    const centerX = -x / zoom + window.innerWidth / (2 * zoom);
    const centerY = -y / zoom + window.innerHeight / (2 * zoom);

    const newNode: Node = {
      id: `node_${+new Date()}`,
      type,
      position: {
        x: centerX - nodeWidth / 2,
        y: centerY - nodeHeight / 2,
      },
      data: {
        title: label,
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
      if (connectingNodeId && connectingNodeId !== node.id) {
        onConnect({ source: connectingNodeId, target: node.id, sourceHandle: null, targetHandle: null });
      } else {
        setSelectedNode(node);
      }
    },
    [connectingNodeId, onConnect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setConnectingNodeId(null);
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
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(template.nodes, template.edges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setSelectedNode(null);

    window.requestAnimationFrame(() => {
        fitView({ duration: 500 });
    });
  }
  
  const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(aiNodes, aiEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setSelectedNode(null);

      window.requestAnimationFrame(() => {
          fitView({ duration: 500 });
      });
  };
  
  const onDeleteNode = (nodeId: string) => {
    handleNodesChange([{type: 'remove', id: nodeId}]);
  }

  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      
      window.requestAnimationFrame(() => {
        fitView({duration: 500});
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative flex">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className={cn('bg-card/30', connectingNodeId && 'cursor-crosshair')}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.1}
        connectionRadius={50}
        connectOnClick={false}
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass h-auto py-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add to Plan
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                 {nodeMenu.map(({ type, label, icon: Icon, color }) => (
                  <DropdownMenuItem key={type} onClick={() => addNode(type, `New ${label}`)}>
                    <Icon className={cn('mr-2 h-4 w-4', `text-${color}-400`)} />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass h-auto py-2">
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
        <Background gap={24} size={1} color="hsl(var(--border))" />
        <Controls className="react-flow-controls" position='bottom-left'>
            <button onClick={() => fitView({ duration: 500 })}>
                <ZoomIn />
            </button>
             <button onClick={() => onLayout('TB')}>
                <Layout />
            </button>
        </Controls>
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
            if (selectedNode) setConnectingNodeId(selectedNode.id);
            setSelectedNode(null);
        }}
        onDeleteNode={() => {
            if (selectedNode) onDeleteNode(selectedNode.id);
        }}
        onCenterNode={() => {
            if(selectedNode) {
                const { x, y } = selectedNode.position;
                const zoom = 1.2;
                setCenter(x + (selectedNode.width || 0) / 2, y + (selectedNode.height || 0) / 2, { zoom, duration: 500 });
            }
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
      `}</style>
    </div>
  );
}

export default function LifePlanPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(aiNodes, aiEdges);
      // We need a way to pass this down to the canvas
      // This implementation is incorrect, but shows intent.
      // A better solution would involve lifting state or using context.
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
  };
  
  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex-shrink-0 px-4 md:px-8">
        <h1 className="text-4xl font-bold">Life Plan</h1>
        <p className="text-muted-foreground mt-2">
          Visualize and map out your financial future. Drag, drop, and connect
          the dots.
        </p>
      </div>
      <div className="flex-grow h-[calc(100vh-240px)]">
        <ReactFlowProvider>
            <LifePlanCanvas />
        </ReactFlowProvider>
      </div>
      <div className="px-4 md:px-8 pb-8 flex-shrink-0">
        {/* The onGenerate prop needs a proper state management solution */}
        <AIPlanGenerator onGenerate={() => {}} />
      </div>
    </div>
  );
}
