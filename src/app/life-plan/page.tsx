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
  Position,
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
  Shrink,
  Repeat,
  Route,
  HeartPulse,
  Save,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NodeEditor } from '@/components/life-plan/NodeEditor';
import { EdgeEditor } from '@/components/life-plan/EdgeEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { LifePlanTimeline } from '@/components/life-plan/LifePlanTimeline';
import { ContactManager } from '@/components/life-plan/resources/ContactManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullCalendar } from '@/components/life-plan/calendar/FullCalendar';
import { Slider } from '@/components/ui/slider';
import { CustomEdge } from '@/components/life-plan/CustomEdge';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

const edgeTypes = {
  custom: CustomEdge,
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

const defaultNodeWidth = 208;
const YEAR_GAP_HORIZONTAL = 350;
const NODE_GAP_VERTICAL = 120;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: 'TB' | 'LR', timeScale: number }
) => {
  const { direction, timeScale } = options;
  const isHorizontal = direction === 'LR';

  const yearNodes = nodes.filter(n => n.data.year && n.type !== 'system');
  const systemNodes = nodes.filter(n => n.type === 'system');
  const years = yearNodes.map(n => n.data.year).filter(y => y);
  const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear();

  const layoutedNodes: Node[] = [];
  const nodesByYear: { [year: number]: Node[] } = {};

  yearNodes.forEach(node => {
    const year = node.data.year || minYear;
    if (!nodesByYear[year]) {
      nodesByYear[year] = [];
    }
    nodesByYear[year].push(node);
  });
  
  Object.keys(nodesByYear).sort((a, b) => parseInt(a) - parseInt(b)).forEach(yearStr => {
    const year = parseInt(yearStr);
    const nodesInYear = nodesByYear[year];
    const yearOffset = year - minYear;

    nodesInYear.forEach((node, index) => {
      const xPos = isHorizontal ? yearOffset * YEAR_GAP_HORIZONTAL * timeScale : index * NODE_GAP_VERTICAL;
      const yPos = isHorizontal ? index * NODE_GAP_VERTICAL : yearOffset * (NODE_GAP_VERTICAL * 2) * timeScale;
      
      node.position = { x: xPos, y: yPos };
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      layoutedNodes.push(node);
    });
  });

  let currentX = 10;
  systemNodes.forEach(node => {
    node.position = { x: currentX, y: isHorizontal ? -100 : -150 };
    currentX += (node.width || defaultNodeWidth) + 10;
    layoutedNodes.push(node);
  });

  const layoutedEdges = edges.map(edge => ({
    ...edge,
    type: 'custom',
    animated: true,
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

function useSystemNodeSnapper(nodes: Node[], setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void) {
    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type !== 'system') return;
        const systemTrayY = -100;
        const snapThreshold = 50;
        if (Math.abs(node.position.y - systemTrayY) > snapThreshold) {
            const newNode = {
                ...node,
                type: 'financial',
                position: { x: node.position.x, y: node.position.y },
                data: {
                    ...node.data,
                    title: node.data.title || 'New Financial Event',
                    year: new Date().getFullYear(),
                },
            };
            setNodes(nds => nds.map(n => n.id === node.id ? newNode : n));
        } else {
            setNodes(nds => nds.map(n => n.id === node.id ? { ...n, position: { ...n.position, y: systemTrayY } } : n));
        }
    }, [setNodes]);
    return onNodeDragStop;
}

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
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Describe Your Life Plan with AI</CardTitle>
                <CardDescription>Write down your life goals, career ambitions, and major life events, and let our AI build the plan for you.</CardDescription>
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

const TimelineView = ({ nodes, onFocusNode }: { nodes: Node[], onFocusNode: (nodeId: string) => void }) => (
    <div className="mt-8 px-4 md:px-8"><LifePlanTimeline nodes={nodes} onNodeSelect={onFocusNode} /></div>
);
const ResourcesView = () => (<div className="mt-8 px-4 md:px-8"><ContactManager /></div>);

const GuideLines = ({ show, timeScale, yearRange, direction }: { show: boolean, timeScale: number, yearRange: {min: number, max: number}, direction: 'TB' | 'LR' }) => {
    if (!show || yearRange.max < yearRange.min) return null;
    const totalYears = yearRange.max - yearRange.min + 1;
    const years = Array.from({ length: totalYears }, (_, i) => yearRange.min + i);
    const yearScale = direction === 'LR' ? YEAR_GAP_HORIZONTAL * timeScale : YEAR_GAP_VERTICAL * timeScale;
    return (
        <div className={cn("absolute inset-0 pointer-events-none z-0", direction === 'TB' ? 'flex flex-col' : 'flex flex-row')}>
            {years.map((year) => (
                <div key={year} className={cn('border-dashed border-primary/20', direction === 'TB' ? 'w-full border-t' : 'h-full border-l')} style={direction === 'TB' ? { minHeight: yearScale } : { minWidth: yearScale }}>
                    <span className="text-xs text-primary/40 p-1 font-semibold">{year}</span>
                </div>
            ))}
        </div>
    );
};

type LifePlan = {
  id?: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
};

function SavePlanDialog({ onSave }: { onSave: (name: string) => void }) {
    const [name, setName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="glass h-auto py-2"><Save className="mr-2 h-4 w-4" /> Save Plan</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Life Plan</DialogTitle>
                    <DialogDescription>Give your current life plan a name to save it.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Ambitious Plan" />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={() => { onSave(name); setIsOpen(false); setName(''); }}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function useLifePlan() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, setCenter, getNode, getViewport, setViewport } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
    const [timeScale, setTimeScale] = useState(1);
    const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR');
    const [showYearGuides, setShowYearGuides] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const { user } = useUser();
    const firestore = useFirestore();

    const lifePlansCollection = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/lifePlans`) : null, [user, firestore]);
    const { data: savedPlans } = useCollection<LifePlan>(lifePlansCollection);

    const onNodeDragStop = useSystemNodeSnapper(nodes, setNodes);

    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, { direction: layoutDirection, timeScale });
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        // This effect should only re-run when the fundamental structure changes, not on every node move.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes.length, edges.length, timeScale, layoutDirection, activePlanId]);

    const passedNodes = useMemo(() => nodes.map(node => ({ ...node, data: { ...node.data, connecting: node.id === connectingNodeId } })), [nodes, connectingNodeId]);

    const addNode = (type: string, label: string) => {
        const { x, y, zoom } = getViewport();
        const position = { x: (window.innerWidth / 2 - x) / zoom, y: (window.innerHeight / 2 - y) / zoom };
        const newNode: Node = {
            id: `node_${+new Date()}`, type, position, data: { title: label, year: new Date().getFullYear(), amount: 0, frequency: 'one-time', notes: '' },
        };
        setNodes(nds => nds.concat(newNode));
        setSelectedNode(newNode);
    };
    
    const handleTemplateLoad = (templateName: keyof typeof lifePlanTemplates | string) => {
        const template = lifePlanTemplates[templateName as keyof typeof lifePlanTemplates];
        if (template) {
            setNodes(template.nodes);
            setEdges(template.edges);
        } else { addNode(templateName, `New ${templateName}`); }
        setSelectedNode(null);
        setActivePlanId(null);
    };

    const handleAIGenerate = (aiNodes: Node[], aiEdges: Edge[]) => {
        setNodes(aiNodes);
        setEdges(aiEdges);
        setSelectedNode(null);
        setActivePlanId(null);
    };

    const handleFocusNode = (nodeId: string) => {
        const node = getNode(nodeId);
        if (node) {
            const zoom = 1.5;
            setCenter(node.position.x + (node.width || 0) / 2, node.position.y + (node.height || 0) / 2, { zoom, duration: 800 });
            setSelectedNode(node);
        }
    };
    
    const handleSavePlan = (name: string) => {
        if (!user || !firestore || !name) return;
        const planData: LifePlan = { name, nodes, edges };
        addDocumentNonBlocking(lifePlansCollection!, planData);
    };

    const handleLoadPlan = (plan: LifePlan) => {
        setNodes(plan.nodes);
        setEdges(plan.edges);
        setActivePlanId(plan.id!);
        setTimeout(() => fitView({ duration: 500 }), 100);
    };

    const handleDeletePlan = (planId: string) => {
        if (!user || !firestore) return;
        const planDocRef = doc(firestore, `users/${user.uid}/lifePlans`, planId);
        deleteDocumentNonBlocking(planDocRef);
    };

    const onEdgeClick = (evt: React.MouseEvent, edge: Edge) => {
      evt.stopPropagation();
      setSelectedEdge(edge);
    };
    
    return {
        nodes, edges, passedNodes, onNodesChange, onEdgesChange, selectedNode, setSelectedNode,
        handleTemplateLoad, handleAIGenerate, handleFocusNode, connectingNodeId, setConnectingNodeId, onNodeDragStop,
        isExpanded, setIsExpanded, fitView, layoutDirection, setLayoutDirection, timeScale, setTimeScale, showYearGuides, setShowYearGuides,
        savedPlans, handleSavePlan, handleLoadPlan, handleDeletePlan, activePlanId,
        selectedEdge, setSelectedEdge, onEdgeClick
    };
}

function LifePlanCanvas() {
    const { 
        nodes, edges, passedNodes, onNodesChange, onEdgesChange, selectedNode, setSelectedNode,
        handleTemplateLoad, handleAIGenerate, handleFocusNode, connectingNodeId, setConnectingNodeId, onNodeDragStop,
        isExpanded, setIsExpanded, fitView, layoutDirection, setLayoutDirection, timeScale, setTimeScale, showYearGuides, setShowYearGuides,
        savedPlans, handleSavePlan, handleLoadPlan, handleDeletePlan, activePlanId,
        selectedEdge, setSelectedEdge, onEdgeClick
    } = useLifePlan();
  
    const [activeTab, setActiveTab] = useState<'life-plan' | 'timeline' | 'resources' | 'calendar'>('life-plan');

    const yearRange = useMemo(() => {
        const years = nodes.map(n => n.data.year).filter(y => y);
        if (years.length === 0) return { min: new Date().getFullYear(), max: new Date().getFullYear() + 1 };
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [nodes]);

    return (
      <div className={cn("flex flex-col", isExpanded ? "fixed inset-0 bg-background z-50 p-0 h-screen" : "relative h-[calc(100vh-8rem)]")}>
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Life Plan</h1>
            <div className="flex items-center justify-center px-4 md:px-8 mt-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="life-plan"><Map className="mr-2 h-4 w-4" />Map</TabsTrigger>
                        <TabsTrigger value="timeline"><CalendarIcon className="mr-2 h-4 w-4" />Timeline</TabsTrigger>
                        <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Calendar</TabsTrigger>
                        <TabsTrigger value="resources"><Users className="mr-2 h-4 w-4" />Resources</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
        
        <div className={cn("flex-grow mt-4", isExpanded ? "p-4" : "")}>
             <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
                <TabsContent value="life-plan" className="h-full m-0">
                    <div className="relative border border-border/20 rounded-xl overflow-hidden h-full">
                            <ReactFlow
                                nodes={passedNodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={(params) => setEdges((eds: Edge[]) => addEdge({ ...params, type: 'custom', animated: true, data: { label: 'New System' } }, eds))}
                                onNodeClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                                onEdgeClick={onEdgeClick}
                                onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                fitView={false}
                                panOnScroll
                                panOnDrag
                                className={cn('bg-card/30')}
                                proOptions={{ hideAttribution: true }}
                                deleteKeyCode={['Backspace', 'Delete']}
                                minZoom={0.1}
                                onNodeDragStop={onNodeDragStop}
                            >
                                <Background gap={24} size={1} color="hsl(var(--border))" />
                                <GuideLines show={showYearGuides} timeScale={timeScale} yearRange={yearRange} direction={layoutDirection} />
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="glass h-auto py-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Node</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {nodeMenu.map(({ type, label, icon: Icon, color }) => (<DropdownMenuItem key={type} onClick={() => handleTemplateLoad(type)}><Icon className={cn('mr-2 h-4 w-4', `text-${color}-400`)} /><span>{label}</span></DropdownMenuItem>))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="glass h-auto py-2"><FolderOpen className="mr-2 h-4 w-4" /> Plans</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger><Zap className="mr-2 h-4 w-4" /> Templates</DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleTemplateLoad('default')}>Standard Career Path</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleTemplateLoad('earlyRetirement')}>Early Retirement (FIRE)</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleTemplateLoad('startup')}>Startup Founder</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            {savedPlans?.map(plan => (
                                                <DropdownMenuItem key={plan.id} onClick={() => handleLoadPlan(plan as LifePlan)} className={cn(plan.id === activePlanId && 'bg-accent')}>
                                                    {plan.name}
                                                    <div className="flex-grow" />
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id!); }}><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                                                </DropdownMenuItem>
                                            ))}
                                            {savedPlans && savedPlans.length > 0 && <DropdownMenuSeparator />}
                                            <SavePlanDialog onSave={handleSavePlan} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Panel position="top-left">
                                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"}>{isExpanded ? <Shrink className="h-5 w-5" /> : <Maximize className="h-5 w-5"/>}</Button>
                                </Panel>
                                <Panel position="bottom-center" className={cn(isExpanded && "block")}>
                                    <div className={cn("flex flex-col md:flex-row items-center gap-2 glass p-2 rounded-2xl")}>
                                        <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 500 })} title="Fit View"><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setLayoutDirection('TB')} title="Top-to-Bottom Layout" className={cn(layoutDirection === 'TB' && 'text-primary bg-primary/10')}><LayoutIcon className="h-5 w-5"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setLayoutDirection('LR')} title="Left-to-Right Layout" className={cn(layoutDirection === 'LR' && 'text-primary bg-primary/10')}><Rows className="h-5 w-5"/></Button>
                                        <Slider defaultValue={[timeScale]} min={0.25} max={4} step={0.25} onValueChange={(value) => setTimeScale(value[0])} className="w-32" />
                                        <Button variant="ghost" size="icon" onClick={() => setShowYearGuides(!showYearGuides)} title="Toggle Year Guides" className={cn(showYearGuides && 'text-primary bg-primary/10')}><CalendarIcon className="h-5 w-5" /></Button>
                                    </div>
                                </Panel>
                            </ReactFlow>
                            <div className="absolute top-0 right-0 h-full w-auto pointer-events-none">
                                <NodeEditor
                                    selectedNode={selectedNode}
                                    onNodeDataChange={(nodeId, newData) => setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))}
                                    closeEditor={() => setSelectedNode(null)}
                                    startConnecting={() => { if (selectedNode) { setConnectingNodeId(selectedNode.id); } setSelectedNode(null); }}
                                    onDeleteNode={() => { if (selectedNode) setNodes(nds => nds.filter(n => n.id !== selectedNode.id)); }}
                                    onCenterNode={() => { if (selectedNode) handleFocusNode(selectedNode.id); }}
                                />
                                <EdgeEditor
                                    selectedEdge={selectedEdge}
                                    onEdgeDataChange={(edgeId, newData) => setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, data: { ...e.data, ...newData } } : e))}
                                    closeEditor={() => setSelectedEdge(null)}
                                    onDeleteEdge={() => { if (selectedEdge) setEdges(eds => eds.filter(e => e.id !== selectedEdge.id)); }}
                                />
                            </div>
                            <style jsx global>{`
                                .react-flow__handle {
                                    width: 16px !important;
                                    height: 16px !important;
                                    border-radius: 99px;
                                    border-width: 3px !important;
                                    border-color: hsl(var(--primary)) !important;
                                    background: hsl(var(--background)) !important;
                                }
                                .react-flow__handle.connecting, [data-connecting='true'] .react-flow__handle { animation: pulse 1.5s infinite; }
                                @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.7); } 50% { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); } }
                            `}</style>
                    </div>
                    <div className={cn('pt-8 pb-8 flex-shrink-0 w-full', isExpanded && 'hidden')}>
                        <AIPlanGenerator onGenerate={handleAIGenerate} />
                    </div>
                </TabsContent>
                <TabsContent value="timeline" className="flex-grow mt-0"><TimelineView nodes={nodes} onFocusNode={(nodeId) => { handleFocusNode(nodeId); setActiveTab('life-plan'); }} /></TabsContent>
                <TabsContent value="calendar" className="flex-grow mt-0"><FullCalendar /></TabsContent>
                <TabsContent value="resources" className="flex-grow mt-0"><ResourcesView /></TabsContent>
            </Tabs>
        </div>
    </div>
    );
}

export default function LifePlanPage() {
    return (
        <ReactFlowProvider>
          <LifePlanCanvas />
        </ReactFlowProvider>
    );
}
