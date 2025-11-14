'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUp,
  ArrowDown,
  PlusCircle,
  MoreHorizontal,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Wallet,
  PiggyBank,
  Scale,
  Activity,
  Percent,
  Info,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PortfolioDialog } from '@/components/portfolio/PortfolioDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetAllocationChart } from '@/components/portfolio/charts/AssetAllocationChart';
import { SectorDiversificationChart } from '@/components/portfolio/charts/SectorDiversificationChart';
import { CashFlowChart } from '@/components/portfolio/CashFlowChart';
import { BudgetTracker } from '@/components/portfolio/BudgetTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PredictiveControls } from '@/components/portfolio/forecasting/Controls';
import { ProjectedGrowthChart } from '@/components/portfolio/forecasting/ProjectedGrowthChart';
import { MonteCarloChart } from '@/components/portfolio/forecasting/MonteCarloChart';
import { AiInsights } from '@/components/portfolio/forecasting/AiInsights';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BudgetSummary } from '@/components/portfolio/budget/BudgetSummary';
import { CategorySpendingChart } from '@/components/portfolio/budget/CategorySpendingChart';
import { IncomeExpenseTable } from '@/components/portfolio/budget/IncomeExpenseTable';
import dynamic from 'next/dynamic';

export type Asset = {
  id?: string;
  type: 'Stock' | 'ETF' | 'Crypto' | 'Bond' | 'Real Estate' | 'Cash';
  ticker: string;
  name: string;
  balance: number;
  averageCost?: number;
  sector?: string;
  notes?: string;
  userId?: string;
  price?: number; // Price will be fetched from an API in a future step
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
};

export type Transaction = {
    id?: string;
    type: 'Income' | 'Expense';
    category: string;
    description: string;
    amount: number;
    date: string; // ISO 8601 format
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const AssetRow = ({ asset, totalValue }: { asset: Asset, totalValue: number }) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    // Mock data for display until API is integrated
    const price = asset.price || (asset.type === 'Stock' ? Math.random() * 500 : asset.type === 'Crypto' ? Math.random() * 70000 : 100);
    const value = asset.balance * price;
    const gainLoss = asset.averageCost ? value - (asset.balance * asset.averageCost) : 0;
    const gainLossPercent = asset.averageCost && asset.averageCost > 0 ? (gainLoss / (asset.balance * asset.averageCost)) * 100 : 0;
    const change24h = (Math.random() - 0.5) * 10;
    const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;

    const handleDelete = () => {
        if (firestore && user && asset.id) {
            const assetDocRef = doc(firestore, `users/${user.uid}/assets`, asset.id);
            deleteDocumentNonBlocking(assetDocRef);
        }
    }
    
    return (
        <>
        <TableRow key={asset.id} className="transition-colors hover:bg-muted/40">
          <TableCell>
            <div className="font-medium">{asset.ticker}</div>
            <div className="text-sm text-muted-foreground">
              {asset.name}
            </div>
          </TableCell>
           <TableCell>{asset.sector || 'N/A'}</TableCell>
          <TableCell>
            <div>{asset.balance}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(value)}
            </div>
          </TableCell>
          <TableCell>
            <div>{formatCurrency(price)}</div>
            <div className="text-xs text-muted-foreground">
                Avg. {formatCurrency(asset.averageCost || 0)}
            </div>
          </TableCell>
           <TableCell className={gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
            <div>{formatCurrency(gainLoss)}</div>
            <div className="text-xs">({gainLossPercent.toFixed(2)}%)</div>
          </TableCell>
          <TableCell
            className={
              change24h > 0
                ? 'text-green-400'
                : 'text-red-400'
            }
          >
            <div className="flex items-center">
              {change24h > 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {change24h.toFixed(2)}%
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="font-medium">
              {allocation.toFixed(1)}%
            </div>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <PortfolioDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} asset={asset} />
        </>
    )
}

const CharacteristicCard = ({ title, value, tooltip, icon: Icon }: { title: string, value: string, tooltip: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {title}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
        </CardContent>
    </Card>
);

const AIPortfolioAnalysis = ({ assets }: { assets: Asset[] }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    
    const handleAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || assets.length === 0) return;
        
        setIsLoading(true);
        setAnalysis('');

        const assetSummary = assets.map(a => `${a.name} (${a.ticker}): ${a.balance} units, Sector: ${a.sector}`).join('\n');
        const fullPrompt = `User's question: "${prompt}"\n\nCurrent Portfolio Holdings:\n${assetSummary}`;
        
        const systemMessage = "You are an expert financial analyst. Your task is to analyze the user's investment portfolio based on their question and the provided holdings. Provide clear, concise, and actionable insights. Respond in simple bullet points using markdown.";

        try {
            const response = await fetch('/api/openai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt, systemMessage }),
            });
            const data = await response.json();
            if (data.response) {
                setAnalysis(data.response);
            }
        } catch (error) {
            console.error("AI analysis error:", error);
            setAnalysis("<p>Sorry, I encountered an error while analyzing your portfolio.</p>");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="glass mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    AI Portfolio Analysis
                </CardTitle>
                <CardDescription>
                    Ask the AI to analyze your portfolio, check diversification, or suggest improvements.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAnalysis} className="flex w-full items-center space-x-2">
                    <Input
                        placeholder="e.g., How is my tech sector exposure?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>

                {(isLoading || analysis) && (
                    <div className="pt-4">
                        {isLoading && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Analyzing your portfolio...</span>
                            </div>
                        )}
                        {analysis && (
                            <div className="prose prose-sm prose-invert max-w-full rounded-lg bg-muted/30 p-4" dangerouslySetInnerHTML={{ __html: analysis }} />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const LoadingSection = () => (
     <div className="space-y-6">
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
            <CardContent><div className="space-y-4">{[...Array(3)].map((_, i) => (<div key={i} className="flex justify-between items-center p-2"><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/6"><Skeleton className="h-5 w-full" /></div></div>))}</div ></CardContent>
        </Card>
    </div>
);


const HoldingsAnalysisSection = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const assetsCollection = useMemoFirebase(() => {
        if (firestore && user) {
        return collection(firestore, `users/${user.uid}/assets`);
        }
        return null;
    }, [firestore, user]);

    const { data: assets, isLoading } = useCollection<Asset>(assetsCollection);
    
    const { totalValue, totalCost, overallGainLoss, processedAssets } = useMemo(() => {
        if (!assets) return { totalValue: 0, totalCost: 0, overallGainLoss: 0, processedAssets: [] };

        let runningTotalValue = 0;
        let runningTotalCost = 0;

        const processed = assets.map(asset => {
            const price = asset.price || (asset.type === 'Stock' ? Math.random() * 500 : asset.type === 'Crypto' ? Math.random() * 70000 : 100);
            const value = asset.balance * price;
            const cost = asset.balance * (asset.averageCost || 0);
            runningTotalValue += value;
            runningTotalCost += cost;
            return { ...asset, price, value };
        });

        return {
            totalValue: runningTotalValue,
            totalCost: runningTotalCost,
            overallGainLoss: runningTotalValue - runningTotalCost,
            processedAssets: processed,
        };
    }, [assets]);
    
     const portfolioCharacteristics = useMemo(() => {
        if (!processedAssets || processedAssets.length === 0) {
            return { peRatio: 0, dividendYield: 0, beta: 0 };
        }

        const totalPE = processedAssets.reduce((acc, asset) => acc + (asset.peRatio || 0) * asset.value, 0);
        const totalDividend = processedAssets.reduce((acc, asset) => acc + ((asset.dividendYield || 0) / 100) * asset.value, 0);
        const totalBeta = processedAssets.reduce((acc, asset) => acc + (asset.beta || 0) * asset.value, 0);
        
        return {
            peRatio: totalValue > 0 ? totalPE / totalValue : 0,
            dividendYield: totalValue > 0 ? (totalDividend / totalValue) * 100 : 0,
            beta: totalValue > 0 ? totalBeta / totalValue : 0,
        };
    }, [processedAssets, totalValue]);


    if (isLoading) {
        return <LoadingSection />;
    }
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                    <AssetAllocationChart assets={processedAssets} />
                </div>
                    <div className="xl:col-span-2">
                    <SectorDiversificationChart assets={processedAssets} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Portfolio Characteristics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CharacteristicCard
                        title="P/E Ratio"
                        value={portfolioCharacteristics.peRatio.toFixed(2)}
                        tooltip="Price-to-Earnings Ratio: a measure of the company's value."
                        icon={Scale}
                    />
                    <CharacteristicCard
                        title="Dividend Yield"
                        value={`${portfolioCharacteristics.dividendYield.toFixed(2)}%`}
                        tooltip="Annual dividend income relative to share price."
                        icon={Percent}
                    />
                    <CharacteristicCard
                        title="Beta"
                        value={portfolioCharacteristics.beta.toFixed(2)}
                        tooltip="A measure of the portfolio's volatility in relation to the market."
                        icon={Activity}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Investment Holdings</CardTitle>
                <CardDescription>Your individual investment positions.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Asset</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                        <TableHead>24h</TableHead>
                        <TableHead className="text-right">Allocation</TableHead>
                        <TableHead className="w-[50px] text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(processedAssets || []).map(asset => (
                            <AssetRow key={asset.id} asset={asset} totalValue={totalValue} />
                        ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            <AIPortfolioAnalysis assets={assets || []} />
        </div>
    )
}

const BudgetSection = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const incomeCollection = useMemoFirebase(() => {
        if (firestore && user) return collection(firestore, `users/${user.uid}/income`);
        return null;
    }, [firestore, user]);

    const expensesCollection = useMemoFirebase(() => {
        if (firestore && user) return collection(firestore, `users/${user.uid}/expenses`);
        return null;
    }, [firestore, user]);

    const { data: income, isLoading: incomeLoading } = useCollection<Transaction>(incomeCollection);
    const { data: expenses, isLoading: expensesLoading } = useCollection<Transaction>(expensesCollection);

    if (incomeLoading || expensesLoading) {
        return <LoadingSection />;
    }

    return (
        <div className="space-y-8">
            <BudgetSummary income={income || []} expenses={expenses || []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CategorySpendingChart expenses={expenses || []} />
                <CashFlowChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <IncomeExpenseTable title="Income" data={income || []} collectionName='income' />
                 <IncomeExpenseTable title="Expenses" data={expenses || []} collectionName='expenses' />
            </div>
        </div>
    );
};

const DynamicHoldingsSection = dynamic(() => Promise.resolve(HoldingsAnalysisSection), { loading: () => <LoadingSection /> });
const DynamicBudgetSection = dynamic(() => Promise.resolve(BudgetSection), { loading: () => <LoadingSection /> });

const DynamicForecastingSection = () => (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <PredictiveControls />
        </div>
        <div className="lg:col-span-2 space-y-8">
            <ProjectedGrowthChart />
            <MonteCarloChart />
            <AiInsights />
        </div>
    </div>
);

const DynamicOverviewSection = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-green-400">+$1,850.75</p>
                    <p className="text-xs text-muted-foreground">Income minus expenses this month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Budget vs. Actual</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">$2,150 / $3,000</p>
                    <p className="text-xs text-muted-foreground">71% of monthly budget spent</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Monthly Investments</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">+$750.00</p>
                    <p className="text-xs text-muted-foreground">Contributions to investment accounts</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">$124,812</p>
                    <p className="text-xs text-muted-foreground">+3.2% this month</p>
                </CardContent>
            </Card>
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <BudgetTracker />
            </div>
            <div className="lg:col-span-3">
                <CashFlowChart />
            </div>
        </div>
    </div>
);


export default function NetWorthPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Net Worth</h1>
          <p className="text-muted-foreground mt-2">
            A comprehensive overview of your financial landscape.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        </div>
      </div>

       <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-6">
            <DynamicOverviewSection />
        </TabsContent>
        <TabsContent value="holdings" className="pt-6">
            <DynamicHoldingsSection />
        </TabsContent>
        <TabsContent value="budget" className="pt-6">
            <DynamicBudgetSection />
        </TabsContent>
         <TabsContent value="forecasting" className="pt-6">
            <DynamicForecastingSection />
        </TabsContent>
      </Tabs>
      
      <PortfolioDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
