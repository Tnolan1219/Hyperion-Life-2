
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
  HealthNode,
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
  Layout as LayoutIcon,
  Sparkles,
  Loader2,
  Map,
  Calendar as CalendarIcon,
  Users,
  Rows,
  Maximize,
  CalendarDays,
  Search as SearchIcon,
  Shrink,
  Repeat,
  Route,
  HeartPulse,
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
import { ContactManager } from '@/components/life-plan/resources/ContactManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/life-plan/calendar/CalendarView';
import { FullCalendar } from '@/components/life-plan/calendar/FullCalendar';
import { Slider } from '@/components/ui/slider';


const initialNodes: Node[] = lifePlanTemplates.default.nodes;
const initialEdges: Edge[] = lifePlanTemplates.default.edges;

const nodeTypes = {
  lifeEvent: LifeEventNode,
  financial: FinancialMilestoneNode,
  education: EducationNode,
  career: CareerNode,
  goal: GoalNode,
  health: HealthNode,
  other: OtherNode,
  system: SystemNode,
};

const nodeMenu = [
  { type: 'career', label: 'Career', icon: Briefcase, color: 'orange' },
  { type: 'education', label: 'Education', icon: GraduationCap, color: 'blue' },
  { type: 'financial', label: 'Milestone', icon: PiggyBank, color: 'green' },
  { type: 'lifeEvent', label: 'Life Event', icon: Heart, color: 'pink' },
  { type: 'health', label: 'Health', icon: HeartPulse, color: 'red' },
  { type: 'goal', label: 'Goal', icon: Flag, color: 'purple' },
  { type: 'other', label: 'Note', icon: Zap, color: 'teal' },
];

const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const defaultNodeWidth = 208;
const defaultNodeHeight = 88;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: 'TB' | 'LR', timeScale: number, is3dMode: boolean }
) => {
  const { direction, timeScale, is3dMode } = options;
  const isHorizontal = direction === 'LR';
  const ranksep = isHorizontal ? 150 * timeScale : 100;
  const nodesep = isHorizontal ? 100 : 150 * timeScale;


  if (!is3dMode) {
    dagreGraph.setGraph({ rankdir: direction, nodesep: ranksep, ranksep: nodesep });

    nodes.forEach((node) => {
      const isSystem = node.type === 'system';
      const nodeWidth = isSystem ? node.width || 250 : defaultNodeWidth;
      const nodeHeight = isSystem ? node.height || 64 : defaultNodeHeight;
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);
  }
  
  const years = nodes.map(n => n.data.year).filter(Boolean);
  const minYear = Math.min(...years, new Date().getFullYear());

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = !is3dMode ? dagreGraph.node(node.id) : null;
    const isSystem = node.type === 'system';
    const nodeWidth = isSystem ? node.width || 250 : defaultNodeWidth;
    const nodeHeight = isSystem ? node.height || 64 : defaultNodeHeight;

    
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    
    if (is3dMode) {
        const yearOffset = (node.data.year || minYear) - minYear;
        node.position = {
            x: (Math.random() - 0.5) * 400,
            y: yearOffset * 200 * timeScale,
        };
    } else if (nodeWithPosition) {
       node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    }

    return node;
  });

  const layoutedEdges = edges.map(edge => {
    if (is3dMode) {
      edge.type = 'smoothstep';
      edge.animated = false;
      edge.data = { ...edge.data, is3dMode: true, sourceNodeType: nodes.find(n => n.id === edge.source)?.type };
    } else {
      edge.type = 'smoothstep';
      edge.animated = true;
      edge.data = { ...edge.data, is3dMode: false };
    }
    return edge;
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
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
        - type: One of the following strings: 'career', 'education', 'financial', 'lifeEvent', 'goal', 'health', 'other'.
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

const GuideLines = ({ nodes, show, type, direction, timeScale }: { nodes: Node[], show: boolean, type: 'year' | 'month', direction: 'TB' | 'LR', timeScale: number }) => {
    if (!show || nodes.length === 0) return null;

    const years = [...new Set(nodes.map(n => n.data.year).filter(y => y))].sort();
    if (years.length === 0) return null;
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const totalYears = maxYear - minYear + 1;
    const items = type === 'year' ? Array.from({ length: totalYears }, (_, i) => minYear + i) : Array.from({ length: totalYears * 12 }, (_, i) => i);
    
    const ranksep = direction === 'LR' ? 150 * timeScale : 100;
    const nodesep = direction === 'LR' ? 100 : 150 * timeScale;
    
    const yearScale = direction === 'TB' ? nodesep : ranksep;

    return (
        <div className={cn("absolute inset-0 pointer-events-none z-0", direction === 'TB' ? 'flex flex-col' : 'flex flex-row')}>
            {items.map((item, index) => (
                <div 
                    key={index}
                    className={cn(
                        'border-dashed border-primary/20',
                        direction === 'TB' ? 'w-full border-t' : 'h-full border-l',
                        type === 'month' && 'border-primary/10'
                    )}
                    style={direction === 'TB' ? { minHeight: type === 'year' ? yearScale : yearScale / 12 } : { minWidth: type === 'year' ? yearScale : yearScale / 12 }}
                >
                    {type === 'year' && (
                        <span className="text-xs text-primary/40 p-1 font-semibold">{item}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

function LifePlanPageContent({
  activeTab,
  setActiveTab,
  isExpanded,
  setIsExpanded
}: any) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, setCenter, getNode, getViewport } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
    const [timeScale, setTimeScale] = useState(1);
    const [is3dMode, setIs3dMode] = useState(false);
    const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR');
    const [showYearGuides, setShowYearGuides] = useState(true);
    const [showMonthGuides, setShowMonthGuides] = useState(false);
  
    const useSystemNodeSnapper = (nodes: Node[], setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void) => {
        const onNodeDragStop = useCallback((_: any, node: Node) => {
            if (node.type !== 'system') {
                return;
            }

            const systemNodes = nodes.filter(n => n.type === 'system');
            const otherSystemNodes = systemNodes.filter(n => n.id !== node.id);

            for (const otherNode of otherSystemNodes) {
                const dx = Math.abs(node.position.x - (otherNode.position.x + (otherNode.width || 0)));
                const dy = Math.abs(node.position.y - otherNode.position.y);

                if (dx < 20 && dy < 20) {
                    const newX = otherNode.position.x + (otherNode.width || 0) + 10;
                    setNodes(nds =>
                        nds.map(n =>
                            n.id === node.id ? { ...n, position: { ...n.position, x: newX, y: otherNode.position.y } } : n
                        )
                    );
                    break;
                }
            }
        }, [nodes, setNodes]);

        return onNodeDragStop;
    };
    
    const onNodeDragStop = useSystemNodeSnapper(nodes, setNodes);

    const onLayout = useCallback((direction: 'TB' | 'LR', currentNodes: Node[], currentEdges: Edge[], scale: number, is3d: boolean) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges, { direction, timeScale: scale, is3dMode: is3d });
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        window.requestAnimationFrame(() => fitView({ duration: 500 }));
    }, [setNodes, setEdges, fitView]);
    
    useEffect(() => {
      onLayout(layoutDirection, nodes, edges, timeScale, is3dMode);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeScale, is3dMode, layoutDirection]);


    const passedNodes = useMemo(() => {
        return nodes.map((node: Node) => ({
        ...node,
        data: { ...node.data, is3dMode },
        }));
    }, [nodes, is3dMode]);

    const handleNodesChange = (changes: NodeChange[]) => {
      onNodesChange(changes);
      
      const resizeChange = changes.find(c => c.type === 'dimensions' && c.resizing);
      if (resizeChange && (resizeChange as any).id) {
          const node = getNode((resizeChange as any).id);
          if (node?.type === 'system') {
              const systemNodes = nodes.filter(n => n.type === 'system' && n.id !== node.id);
              let currentX = 10 + (node.width || 208) + 10;
              
              const updatedNodes = systemNodes.sort((a,b) => a.position.x - b.position.x).map(sn => {
                  sn.position.x = currentX;
                  currentX += (sn.width || 208) + 10;
                  return sn;
              });

              setNodes([...nodes.filter(n => n.type !== 'system' || n.id === node.id), ...updatedNodes]);
          }
      }
    };


    const handleDeleteNode = (nodeId: string) => {
        const changes: NodeChange[] = [{type: 'remove', id: nodeId}];
        
        const deletedNodeIds = [nodeId];
        setEdges((eds: Edge[]) => eds.filter(edge => !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)));
        if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
            setSelectedNode(null);
        }
        onNodesChange(changes);
    }
    
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
       const systemNodes = nodes.filter(n => n.type === 'system');
       const xPos = systemNodes.reduce((acc, node) => acc + (node.width || 208) + 10, 10);

        const newNode: Node = {
            id: `node_${+new Date()}`,
            type: 'system',
            position: { x: xPos, y: 10 },
            data: { title: 'Weekly Investment', amount: 100, frequency: 'weekly', notes: 'Auto-invest into VTI' },
            width: 250,
            height: 64,
        };
        setNodes((nds: Node[]) => nds.concat(newNode));
    }

    const handleTemplateLoad = (templateName: keyof typeof lifePlanTemplates | string) => {
        if (templateName === 'system') {
            addSystemNode();
            return;
        }

        const template = lifePlanTemplates[templateName as keyof typeof lifePlanTemplates];
        if (template) {
            onLayout(layoutDirection, template.nodes, template.edges, timeScale, is3dMode);
        } else {
             addNode(templateName, `New ${templateName}`);
        }
        setSelectedNode(null);
    };

    const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
        onLayout(layoutDirection, aiNodes, aiEdges, timeScale, is3dMode);
        setSelectedNode(null);
    };

    const handleFocusNode = (nodeId: string) => {
        const node = getNode(nodeId);
        if (node) {
            const { x, y } = node.position;
            const zoom = 1.5;
            setCenter(x + (node.width || 0) / 2, y + (node.height || 0) / 2, { zoom, duration: 500 });
            setSelectedNode(node);
        }
        setActiveTab('life-plan');
    };

    return (
        <div className={cn("flex flex-col", isExpanded ? "fixed inset-0 bg-background z-50 p-0 h-screen" : "relative h-[calc(100vh-8rem)]")}>
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Life Plan
            </h1>
            <div className="flex items-center justify-center px-4 md:px-8 mt-4">
                <TabsList>
                    <TabsTrigger value="life-plan">
                        <Map className="mr-2 h-4 w-4" />
                        Map
                    </TabsTrigger>
                    <TabsTrigger value="timeline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="resources">
                        <Users className="mr-2 h-4 w-4" />
                        Resources
                    </TabsTrigger>
                </TabsList>
            </div>
        </div>
        
        <TabsContent value="life-plan" className="flex-grow flex flex-col mt-4">
            <div className="relative border border-border/20 rounded-xl overflow-hidden h-[85vh]">
                <div className={cn("flex-grow h-full relative", is3dMode && 'react-flow-3d-mode')}>
                    <ReactFlow
                    nodes={passedNodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={(changes) => setEdges((prevEdges: any) => addEdge(changes, prevEdges))}
                    onConnect={(params) => setEdges((eds: Edge[]) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds))}
                    onNodeClick={(e, node) => {
                        if (connectingNodeId) {
                            setEdges((eds: Edge[]) => addEdge({ source: connectingNodeId, target: node.id, type: 'smoothstep', animated: true }, eds));
                            setConnectingNodeId(null);
                        } else {
                            setSelectedNode(node);
                        }
                    }}
                    onPaneClick={() => {
                        setSelectedNode(null);
                        if (connectingNodeId) {
                            setConnectingNodeId(null);
                        }
                    }}
                    nodeTypes={nodeTypes}
                    fitView
                    className={cn('bg-card/30', connectingNodeId && 'cursor-crosshair')}
                    proOptions={{ hideAttribution: true }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    minZoom={0.1}
                    connectionRadius={120}
                    onNodeDragStop={onNodeDragStop}
                    >
                    <Background gap={24} size={1} color="hsl(var(--border))" />
                    <GuideLines nodes={nodes} show={showYearGuides} type="year" direction={layoutDirection} timeScale={timeScale} />
                    <GuideLines nodes={nodes} show={showMonthGuides} type="month" direction={layoutDirection} timeScale={timeScale} />
                    <NodeResizeControl minWidth={208} minHeight={88} isVisible={selectedNode?.type === 'system' || selectedNode?.type === 'other'}>
                        <div className="w-full h-full border-2 border-dashed border-primary rounded-lg" />
                    </NodeResizeControl>
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="glass h-auto py-2">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Node
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            {nodeMenu.map(({ type, label, icon: Icon, color }) => (
                                <DropdownMenuItem key={type} onClick={() => handleTemplateLoad(type)}>
                                <Icon className={cn('mr-2 h-4 w-4', `text-${color}-400`)} />
                                <span>{label}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" className="glass h-auto py-2" onClick={() => handleTemplateLoad('system')}>
                            <Repeat className="mr-2 h-4 w-4" /> Add System
                        </Button>
                        

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="glass h-auto py-2">
                                <Zap className="mr-2 h-4 w-4" /> Templates
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleTemplateLoad('default')}>
                                Standard Career Path
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTemplateLoad('earlyRetirement')}>
                                Early Retirement (FIRE)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTemplateLoad('startup')}>
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
                            <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 500 })} title="Fit View">
                                <ZoomIn className="h-5 w-5"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setLayoutDirection('TB')} title="Top-to-Bottom Layout">
                                <LayoutIcon className="h-5 w-5"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setLayoutDirection('LR')} title="Left-to-Right Layout">
                                <Rows className="h-5 w-5"/>
                            </Button>
                            <Slider defaultValue={[timeScale]} min={0.25} max={4} step={0.25} onValueChange={(value) => setTimeScale(value[0])} className="w-32" />
                            <Button variant="ghost" size="icon" onClick={() => setIs3dMode(!is3dMode)} title="Toggle 3D Roadmap View" className={cn(is3dMode && 'text-primary bg-primary/10')}>
                                <Route className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowYearGuides(!showYearGuides)} title="Toggle Year Guides" className={cn(showYearGuides && 'text-primary bg-primary/10')}>
                                <CalendarIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowMonthGuides(!showMonthGuides)} title="Toggle Month Guides" className={cn(showMonthGuides && 'text-primary bg-primary/10')}>
                                <CalendarDays className="h-5 w-5" />
                            </Button>
                        </div>
                    </Panel>
                    </ReactFlow>

                    <div className="absolute top-0 right-0 h-full w-auto pointer-events-none">
                        <NodeEditor
                        selectedNode={selectedNode}
                        onNodeDataChange={(nodeId: string, newData: any) => setNodes((nds: Node[]) => nds.map((n: Node) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))}
                        closeEditor={() => setSelectedNode(null)}
                        startConnecting={() => {
                            if (selectedNode) {
                                setNodes((nds: Node[]) => nds.map(n => n.id === selectedNode.id ? {...n, data: { ...n.data, connecting: true }} : n));
                                setConnectingNodeId(selectedNode.id);
                            }
                            setSelectedNode(null);
                        }}
                        onDeleteNode={() => {
                            if (selectedNode) handleDeleteNode(selectedNode.id);
                        }}
                        onCenterNode={() => {
                            if (selectedNode) handleFocusNode(selectedNode.id);
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
                            --glow-color-health: hsl(0 80% 60%);
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
                        .react-flow__node[data-type='health']:hover, .react-flow__node[data-type='health'][data-connecting='true'] { --glow-color: var(--glow-color-health); }
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
                        
                        .react-flow__node-other .editable-content {
                            background-color: transparent;
                            border: none;
                            width: 100%;
                            height: 100%;
                            padding: 1rem;
                            outline: none;
                            resize: none;
                            color: inherit;
                        }

                        .react-flow-3d-mode .react-flow__viewport {
                            perspective: 1000px;
                            transform: scale(1) translate(0px, 0px) rotateX(60deg) rotateZ(0deg);
                            transition: transform 0.5s;
                        }
                        .react-flow-3d-mode .react-flow__node {
                            transform: rotateX(-60deg) rotateZ(0deg);
                            
                        }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='career'] { --edge-color: hsl(28 90% 60%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='education'] { --edge-color: hsl(210 90% 60%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='financial'] { --edge-color: hsl(140 80% 50%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='lifeEvent'] { --edge-color: hsl(330 90% 65%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='goal'] { --edge-color: hsl(270 90% 65%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='health'] { --edge-color: hsl(0 80% 60%); }
                        .react-flow-3d-mode .react-flow__edge-path[data-node-type='other'] { --edge-color: hsl(180 80% 50%); }
                        
                        .react-flow-3d-mode .react-flow__edge-path {
                            stroke-width: 10;
                            stroke: var(--edge-color, hsl(var(--primary)));
                            filter: none;
                            stroke-dasharray: 1 12;
                            stroke-linecap: round;
                        }


                    `}
</style>
                </div>
            </div>
            <div className={cn('pt-8 pb-8 flex-shrink-0 w-full', isExpanded && 'hidden')}>
                <AIPlanGenerator onGenerate={handleAIGenerate} />
            </div>
        </TabsContent>
        <TabsContent value="timeline" className="flex-grow mt-0">
            <TimelineView nodes={nodes} onFocusNode={handleFocusNode} />
        </TabsContent>
        <TabsContent value="calendar" className="flex-grow mt-0">
            <FullCalendar />
        </TabsContent>
        <TabsContent value="resources" className="flex-grow mt-0">
            <ResourcesView />
        </TabsContent>
      </div>
    );
}

export default function LifePlanPage() {
    const [activeTab, setActiveTab] = useState<'life-plan' | 'timeline' | 'resources' | 'calendar'>('life-plan');
    const [isExpanded, setIsExpanded] = useState(false);


    return (
    <Tabs 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className={cn(
            "flex flex-col",
            isExpanded ? "fixed inset-0 bg-background z-50 p-0" : "relative h-[calc(100vh-8rem)]"
        )}
    >
        <ReactFlowProvider>
          <LifePlanPageContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </ReactFlowProvider>
    </Tabs>
    );
}

    