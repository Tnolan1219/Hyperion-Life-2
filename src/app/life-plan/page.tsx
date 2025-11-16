'use client';
import React, { useState, useCallback, useMemo } from 'react';
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
  Map,
  Calendar,
  Users,
  Rows,
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
import { LifePlanTimeline } from '@/components/life-plan/LifePlanTimeline';
import { SearchNodes } from '@/components/life-plan/SearchNodes';
import { ContactManager } from '@/components/life-plan/resources/ContactManager';


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
        - data: An object with a 'title' (string), 'year' (number, representing the year of the event), and optionally 'amount' (number) and 'frequency' ('one-time' or 'yearly'). Infer amounts, years, and frequencies where possible.

        For each 'edge', include:
        - id: A unique string identifier (e.g., "e_1-2").
        - source: The id of the source node.
        - target: The id of the target node.
        - type: "smoothstep".
        - animated: true.

        Interpret the user's text to create logical nodes and connect them sequentially or logically with edges. Infer reasonable titles, years, and financial amounts if they are implied.`;

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
                    placeholder="e.g., I'll graduate in 2025, get a job in 2026 making $70k, buy a house in 2030 for a $50k down payment..."
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

const TimelineView = ({ nodes, onFocusNode }: { nodes: Node[], onFocusNode: (nodeId: string) => void }) => {
    return (
        <div className="mt-8 px-4 md:px-8">
            <LifePlanTimeline nodes={nodes} onNodeSelect={onFocusNode} />
        </div>
    );
};

const ResourcesView = () => (
    <div className="mt-8 px-4 md:px-8">
       <ContactManager />
    </div>
);

function LifePlanCanvas({ nodes, edges, onNodesChange, setNodes, setEdges, setSelectedNode, onFocusNode, onAIGenerate, onTemplateLoad, selectedNode, connectingNodeId, setConnectingNodeId }: any) {
  const { fitView } = useReactFlow();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const deletedNodeIds = changes
        .filter(change => change.type === 'remove')
        .map(change => (change as any).id);

      if (deletedNodeIds.length > 0) {
        setEdges((eds: Edge[]) => eds.filter(edge => !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)));
        if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
            setSelectedNode(null);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange, setEdges, selectedNode, setSelectedNode]
  );
  
  const onDeleteNode = (nodeId: string) => {
    handleNodesChange([{type: 'remove', id: nodeId}]);
  }

  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => fitView({ duration: 500 }));
  }, [nodes, edges, setNodes, setEdges, fitView]);


  return (
    <>
      <div className="flex-grow h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={(changes) => setEdges(changes)}
          onConnect={(params) => setEdges((eds: Edge[]) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds))}
          onNodeClick={(e, node) => {
            if (connectingNodeId && connectingNodeId !== node.id) {
              setEdges((eds: Edge[]) => addEdge({ source: connectingNodeId, target: node.id, type: 'smoothstep', animated: true }, eds));
              setConnectingNodeId(null);
            } else {
              setSelectedNode(node);
            }
          }}
          onPaneClick={() => {
            setSelectedNode(null);
            setConnectingNodeId(null);
          }}
          nodeTypes={nodeTypes}
          fitView
          className={cn('bg-card/30', connectingNodeId && 'cursor-crosshair')}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={['Backspace', 'Delete']}
          minZoom={0.1}
          connectionRadius={50}
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
                    <DropdownMenuItem key={type} onClick={() => onTemplateLoad(type, `New ${label}`)}>
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
                  <DropdownMenuItem onClick={() => onTemplateLoad('default')}>
                    Standard Career Path
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTemplateLoad('earlyRetirement')}>
                    Early Retirement (FIRE)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTemplateLoad('startup')}>
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
              <button onClick={() => onLayout('TB')} title="Top-to-Bottom Layout">
                  <Layout />
              </button>
              <button onClick={() => onLayout('LR')} title="Left-to-Right Layout">
                  <Rows />
              </button>
          </Controls>
        </ReactFlow>

        <div className="absolute top-0 right-0 h-full w-auto pointer-events-none">
            <NodeEditor
              selectedNode={selectedNode}
              onNodeDataChange={(nodeId: string, newData: any) => setNodes((nds: Node[]) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))}
              closeEditor={() => setSelectedNode(null)}
              startConnecting={() => {
                  if (selectedNode) setConnectingNodeId(selectedNode.id);
                  setSelectedNode(null);
              }}
              onDeleteNode={() => {
                  if (selectedNode) onDeleteNode(selectedNode.id);
              }}
              onCenterNode={() => {
                  if (selectedNode) onFocusNode(selectedNode.id);
              }}
            />
        </div>
      </div>
      
      <div className="px-4 md:px-8 mt-8 flex-shrink-0">
          <AIPlanGenerator onGenerate={onAIGenerate} />
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
      `}</style>
    </>
  );
}

const tabOptions = [
    { id: 'life-plan', label: 'Life Plan', icon: Map },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Users },
]

function LifePlanFlowProvider({ children, ...props } : any) {
  return (
    <ReactFlowProvider>
      <LifePlanPageContent {...props}>
        {children}
      </LifePlanPageContent>
    </ReactFlowProvider>
  )
}


function LifePlanPageContent({
  nodes,
  edges,
  onNodesChange,
  setNodes,
  setEdges,
  activeTab,
  onFocusNode,
  ...props
}: any) {
    const { fitView, setCenter, getNode } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
    const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

    const onNodeDataChange = (nodeId: string, newData: any) => {
        setNodes((nds: Node[]) =>
            nds.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...newData } }
                    : node
            )
        );
        if (selectedNode?.id === nodeId) {
            setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
        }
    };
    
    const onLayout = useCallback((direction: 'TB' | 'LR') => {
        setLayoutDirection(direction);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        window.requestAnimationFrame(() => fitView({ duration: 500 }));
    }, [nodes, edges, setNodes, setEdges, fitView]);

    const addNode = (type: string, label: string) => {
        const newNode: Node = {
            id: `node_${+new Date()}`,
            type,
            position: { x: 100, y: 100 },
            data: { title: label, year: new Date().getFullYear(), amount: 0, frequency: 'one-time', notes: '' },
        };
        setNodes((nds: Node[]) => nds.concat(newNode));
        setSelectedNode(newNode);
    };

    const handleTemplateLoad = (templateName: keyof typeof lifePlanTemplates | string) => {
        const template = lifePlanTemplates[templateName as keyof typeof lifePlanTemplates];
        if (template) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(template.nodes, template.edges, layoutDirection);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } else {
             addNode(templateName, `New ${templateName}`);
        }
        setSelectedNode(null);
        window.requestAnimationFrame(() => fitView({ duration: 500 }));
    };

    const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(aiNodes, aiEdges, layoutDirection);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setSelectedNode(null);
        window.requestAnimationFrame(() => fitView({ duration: 500 }));
    };

    const handleFocusNode = (nodeId: string) => {
        const node = getNode(nodeId);
        if (node) {
            const { x, y } = node.position;
            const zoom = 1.5;
            setCenter(x + (node.width || 0) / 2, y + (node.height || 0) / 2, { zoom, duration: 500 });
            setSelectedNode(node);
        }
        props.setActiveTab('life-plan');
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'life-plan':
                return <LifePlanCanvas 
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            setNodes={setNodes}
                            setEdges={setEdges}
                            setSelectedNode={setSelectedNode}
                            onFocusNode={handleFocusNode}
                            onLayout={onLayout}
                            onAIGenerate={handleAIGenerate}
                            onTemplateLoad={handleTemplateLoad}
                            selectedNode={selectedNode}
                            connectingNodeId={connectingNodeId}
                            setConnectingNodeId={setConnectingNodeId}
                        />;
            case 'timeline':
                return <TimelineView nodes={nodes} onFocusNode={handleFocusNode} />;
            case 'resources':
                return <ResourcesView />;
            default:
                return null;
        }
    };
    
    return renderContent();
}

export default function LifePlanPage() {
    const [activeTab, setActiveTab] = useState<'life-plan' | 'timeline' | 'resources'>('life-plan');
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="flex flex-col h-full space-y-4">
        <div className="px-4 md:px-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Life Plan</h1>
            <p className="text-muted-foreground mt-2">
                Visualize and map out your financial future. Drag, drop, and connect the dots.
            </p>
        </div>

        <div className="px-4 md:px-8 flex items-center justify-center gap-2">
            {tabOptions.map(tab => (
                <Button 
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    className={cn(
                        'rounded-full gap-2 transition-all duration-300',
                        activeTab === tab.id ? 'w-32' : 'w-14 h-14',
                        activeTab !== tab.id && 'glass text-muted-foreground'
                    )}
                    onClick={() => setActiveTab(tab.id as any)}
                >
                    <tab.icon className="h-6 w-6" />
                    <span className={cn('transition-all', activeTab === tab.id ? 'block' : 'hidden')}>{tab.label}</span>
                </Button>
            ))}
        </div>
        
        <div className="flex-grow flex flex-col">
            <LifePlanFlowProvider
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              setNodes={setNodes}
              setEdges={setEdges}
              onEdgesChange={onEdgesChange}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
        </div>
    </div>
  );
}
