
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
  NodeResizeControl,
  NodeToolbar,
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
  SystemNode,
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
  Calendar as CalendarIcon,
  Users,
  Rows,
  Maximize,
  Calendar,
  CalendarDays,
  Search as SearchIcon,
  Shrink,
  Repeat,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const initialNodes: Node[] = lifePlanTemplates.default.nodes;
const initialEdges: Edge[] = lifePlanTemplates.default.edges;

const nodeTypes = {
  lifeEvent: LifeEventNode,
  financial: FinancialMilestoneNode,
  education: EducationNode,
  career: CareerNode,
  goal: GoalNode,
  other: OtherNode,
  system: SystemNode,
};

const nodeMenu = [
  { type: 'career', label: 'Career', icon: Briefcase, color: 'orange' },
  { type: 'education', label: 'Education', icon: GraduationCap, color: 'blue' },
  { type: 'financial', label: 'Milestone', icon: PiggyBank, color: 'green' },
  { type: 'lifeEvent', label: 'Life Event', icon: Heart, color: 'pink' },
  { type: 'goal', label: 'Goal', icon: Flag, color: 'purple' },
  { type: 'other', label: 'Note', icon: Zap, color: 'teal' },
];

const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const defaultNodeWidth = 208;
const defaultNodeHeight = 88;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    const nodeWidth = node.width || defaultNodeWidth;
    const nodeHeight = node.height || defaultNodeHeight;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeWidth = node.width || defaultNodeWidth;
    const nodeHeight = node.height || defaultNodeHeight;
    
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
        <Card className="glass w-full max-w-4xl mx-auto">
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

const GuideLines = ({ nodes, show, type, direction }: { nodes: Node[], show: boolean, type: 'year' | 'month', direction: 'TB' | 'LR'}) => {
    if (!show || nodes.length === 0) return null;

    const years = [...new Set(nodes.map(n => n.data.year).filter(y => y))].sort();
    if (years.length < 2) return null;

    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    const totalYears = lastYear - firstYear + 1;
    const items = type === 'year' ? Array.from({ length: totalYears }, (_, i) => firstYear + i) : Array.from({ length: totalYears * 12 }, (_, i) => i);
    const scale = direction === 'TB' ? '400px' : '600px';

    return (
        <div className={cn("absolute inset-0 pointer-events-none", direction === 'TB' ? 'flex flex-col' : 'flex flex-row')}>
            {items.map((item, index) => (
                <div 
                    key={index}
                    className={cn(
                        'border-dashed border-primary/20',
                        direction === 'TB' ? 'w-full border-t' : 'h-full border-l',
                        type === 'month' && 'border-primary/10'
                    )}
                    style={direction === 'TB' ? { height: scale } : { width: scale }}
                >
                    {type === 'year' && (
                        <span className="text-xs text-primary/40 p-1">{item}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

function LifePlanCanvas({ nodes, edges, onNodesChange, setNodes, setEdges, setSelectedNode, onFocusNode, onAIGenerate, onTemplateLoad, selectedNode, connectingNodeId, setConnectingNodeId, onDeleteNode, isExpanded, setIsExpanded }: any) {
  const { fitView } = useReactFlow();
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR');
  const [showYearGuides, setShowYearGuides] = useState(false);
  const [showMonthGuides, setShowMonthGuides] = useState(false);


  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    setLayoutDirection(direction);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => fitView({ duration: 500 }));
  }, [nodes, edges, setNodes, setEdges, fitView]);


  return (
    <div className="flex-grow h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={(changes) => setEdges((prevEdges: any) => addEdge(changes, prevEdges))}
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
          connectionRadius={80}
        >
          <Background gap={24} size={1} color="hsl(var(--border))" />
          <GuideLines nodes={nodes} show={showYearGuides} type="year" direction={layoutDirection} />
          <GuideLines nodes={nodes} show={showMonthGuides} type="month" direction={layoutDirection} />
           <NodeResizeControl minWidth={208} minHeight={88} />
          <div className="absolute top-4 right-4 z-10 flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="glass h-auto py-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Node
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

               <Button variant="outline" className="glass h-auto py-2" onClick={() => onTemplateLoad('system')}>
                    <Repeat className="mr-2 h-4 w-4" /> Add System
               </Button>
              

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
          
           <Panel position="top-left">
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"}>
                    {isExpanded ? <Shrink className="h-5 w-5" /> : <Maximize className="h-5 w-5"/>}
              </Button>
          </Panel>

          <Panel position="bottom-center" className={cn(isExpanded && "block")}>
            <div className={cn("flex flex-col md:flex-row items-center gap-2 glass p-2 rounded-2xl")}>
              <SearchNodes nodes={nodes} onFocusNode={onFocusNode} />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 500 })} title="Fit View">
                    <ZoomIn className="h-5 w-5"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onLayout('TB')} title="Top-to-Bottom Layout">
                    <Layout className="h-5 w-5"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onLayout('LR')} title="Left-to-Right Layout">
                    <Rows className="h-5 w-5"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowYearGuides(!showYearGuides)} title="Toggle Year Guides" className={cn(showYearGuides && 'text-primary bg-primary/10')}>
                    <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowMonthGuides(!showMonthGuides)} title="Toggle Month Guides" className={cn(showMonthGuides && 'text-primary bg-primary/10')}>
                    <CalendarDays className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Panel>
        </ReactFlow>

        <div className="absolute top-0 right-0 h-full w-auto pointer-events-none">
            <NodeEditor
              selectedNode={selectedNode}
              onNodeDataChange={(nodeId: string, newData: any) => setNodes((nds: Node[]) => nds.map((n: Node) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))}
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
        <style jsx global>{`
            .react-flow__edge-path {
                filter: drop-shadow(0 0 5px hsl(var(--primary)));
            }

            .react-flow__node {
                --glow-color-career: hsl(28 90% 60%);
                --glow-color-education: hsl(210 90% 60%);
                --glow-color-financial: hsl(140 80% 50%);
                --glow-color-lifeEvent: hsl(330 90% 65%);
                --glow-color-goal: hsl(270 90% 65%);
                --glow-color-other: hsl(180 80% 50%);
                --glow-color-system: hsl(220 80% 70%);
                --glow-color-default: hsl(var(--primary));
            }
            
            .react-flow__node.connecting, 
            .react-flow__node[data-connecting='true'],
            .react-flow__node:hover {
                 box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px var(--glow-color, var(--glow-color-default)), 0 0 15px var(--glow-color, var(--glow-color-default));
            }
            .react-flow__node[data-type='career']:hover, .react-flow__node[data-type='career'][data-connecting='true'] { --glow-color: var(--glow-color-career); }
            .react-flow__node[data-type='education']:hover, .react-flow__node[data-type='education'][data-connecting='true'] { --glow-color: var(--glow-color-education); }
            .react-flow__node[data-type='financial']:hover, .react-flow__node[data-type='financial'][data-connecting='true'] { --glow-color: var(--glow-color-financial); }
            .react-flow__node[data-type='lifeEvent']:hover, .react-flow__node[data-type='lifeEvent'][data-connecting='true'] { --glow-color: var(--glow-color-lifeEvent); }
            .react-flow__node[data-type='goal']:hover, .react-flow__node[data-type='goal'][data-connecting='true'] { --glow-color: var(--glow-color-goal); }
            .react-flow__node[data-type='other']:hover, .react-flow__node[data-type='other'][data-connecting='true'] { --glow-color: var(--glow-color-other); }
             .react-flow__node[data-type='system']:hover, .react-flow__node[data-type='system'][data-connecting='true'] { --glow-color: var(--glow-color-system); }

            .react-flow__resize-control.handle {
                width: 10px;
                height: 10px;
                border-radius: 2px;
                background-color: hsl(var(--primary));
                border-color: hsl(var(--primary-foreground));
                border-width: 2px;
            }

        `}</style>
    </div>
  );
}


function LifePlanFlowProvider(props: any) {
  return (
    <ReactFlowProvider>
      <LifePlanPageContent {...props} />
    </ReactFlowProvider>
  )
}


function LifePlanPageContent({
  nodes,
  edges,
  onNodesChange,
  setNodes,
  setEdges,
  onEdgesChange,
  activeTab,
  isExpanded,
  setIsExpanded,
  ...props
}: any) {
    const { fitView, setCenter, getNode, addNodes, getNodes, getViewport } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

    useEffect(() => {
        getNodes().forEach(node => {
            if (node.id === connectingNodeId) {
                node.data = { ...node.data, connecting: true };
            } else if (node.data.connecting) {
                const { connecting, ...rest } = node.data;
                node.data = rest;
            }
        });
        setNodes([...getNodes()]);
    }, [connectingNodeId, getNodes, setNodes]);


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
    
    const addNode = (type: string, label: string) => {
        const { x, y, zoom } = getViewport();
        const position = {
            x: -x/zoom + 100/zoom,
            y: -y/zoom + 100/zoom,
        };

        const newNode: Node = {
            id: `node_${+new Date()}`,
            type,
            position,
            data: { title: label, year: new Date().getFullYear(), amount: 0, frequency: 'one-time', notes: '' },
        };
        setNodes((nds: Node[]) => nds.concat(newNode));
        setSelectedNode(newNode);
    };
    
    const addSystemNode = () => {
        const { x, y, zoom } = getViewport();
        const position = {
            x: -x/zoom + 100/zoom,
            y: -y/zoom + 100/zoom,
        };

        const newNode: Node = {
            id: `node_${+new Date()}`,
            type: 'system',
            position,
            data: { title: 'Weekly Investment', amount: 100, frequency: 'weekly', notes: 'Auto-invest into VTI' },
        };
        setNodes((nds: Node[]) => nds.concat(newNode));
        window.requestAnimationFrame(() => fitView({ duration: 500, nodes: [newNode] }));
    }

    const handleTemplateLoad = (templateName: keyof typeof lifePlanTemplates | string) => {
        if (templateName === 'system') {
            addSystemNode();
            return;
        }

        const template = lifePlanTemplates[templateName as keyof typeof lifePlanTemplates];
        if (template) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(template.nodes, template.edges, 'LR');
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } else {
             addNode(templateName, `New ${templateName}`);
        }
        setSelectedNode(null);
        window.requestAnimationFrame(() => fitView({ duration: 500 }));
    };

    const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(aiNodes, aiEdges, 'LR');
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

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-between relative">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Life Plan
            </h1>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => props.setActiveTab(value)}
          className="flex-grow flex flex-col mt-4"
        >
          <TabsList className="mx-auto">
            <TabsTrigger value="life-plan">
              <Map className="mr-2 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Users className="mr-2 h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="life-plan" className="flex-grow flex flex-col min-h-0 mt-4">
            <div
              className={cn(
                'flex-grow relative h-full border border-border/20 rounded-xl overflow-hidden',
                isExpanded && 'h-screen !rounded-none !border-0'
              )}
            >
              <LifePlanCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                setNodes={setNodes}
                setEdges={setEdges}
                setSelectedNode={setSelectedNode}
                onFocusNode={handleFocusNode}
                onAIGenerate={handleAIGenerate}
                onTemplateLoad={handleTemplateLoad}
                selectedNode={selectedNode}
                onDeleteNode={onDeleteNode}
                connectingNodeId={connectingNodeId}
                setConnectingNodeId={setConnectingNodeId}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
            </div>
            <div
              className={cn(
                'pt-8 pb-8 flex-shrink-0 w-full',
                isExpanded && 'hidden'
              )}
            >
              <AIPlanGenerator onGenerate={handleAIGenerate} />
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="flex-grow mt-0">
            <TimelineView nodes={nodes} onFocusNode={handleFocusNode} />
          </TabsContent>
          <TabsContent value="resources" className="flex-grow mt-0">
            <ResourcesView />
          </TabsContent>
        </Tabs>
      </div>
    );
}

export default function LifePlanPage() {
    const [activeTab, setActiveTab] = useState<'life-plan' | 'timeline' | 'resources'>('life-plan');
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isExpanded, setIsExpanded] = useState(false);


  return (
    <div className={cn(
        "flex flex-col h-[calc(100vh-8rem)]",
        isExpanded ? "fixed inset-0 bg-background z-50 h-screen !p-0" : "relative"
    )}>
        
        <ReactFlowProvider>
            <LifePlanPageContent
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            />
        </ReactFlowProvider>
    </div>
  );
}
