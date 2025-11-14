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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowUp,
  ArrowDown,
  PlusCircle,
  MoreHorizontal,
  RefreshCw,
  DollarSign,
  TrendingUp,
  BrainCircuit,
  Star,
  AreaChart,
  Wand2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PortfolioDialog } from '@/components/portfolio/PortfolioDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioValueChart } from '@/components/portfolio/charts/PortfolioValueChart';
import { AssetAllocationChart } from '@/components/portfolio/charts/AssetAllocationChart';
import { SectorDiversificationChart } from '@/components/portfolio/charts/SectorDiversificationChart';
import { PredictiveControls } from '@/components/portfolio/forecasting/Controls';
import { ProjectedGrowthChart } from '@/components/portfolio/forecasting/ProjectedGrowthChart';
import { MonteCarloChart } from '@/components/portfolio/forecasting/MonteCarloChart';
import { AiInsights } from '@/components/portfolio/forecasting/AiInsights';


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

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="bg-card/60 border-border/60"><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
             <Card className="bg-card/60 border-border/60"><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
             <Card className="bg-card/60 border-border/60"><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
        </div>
         <Card className="bg-card/60 border-border/60">
            <CardHeader>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="flex justify-between items-center p-2">
                            <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                            <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                            <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                            <div className="w-1/6"><Skeleton className="h-5 w-full" /></div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);

export default function PortfolioPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const assetsCollection = useMemo(() => {
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
        // Mock price for now
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-2">
            Analyze and manage your investments.
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
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mb-6">
          <TabsTrigger value="overview"><AreaChart className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
          <TabsTrigger value="analysis">Holdings Analysis</TabsTrigger>
          <TabsTrigger value="predictive"><Wand2 className="w-4 h-4 mr-2" />Predictive Modeling</TabsTrigger>
          <TabsTrigger value="insights"><BrainCircuit className="w-4 h-4 mr-2" />AI Insights</TabsTrigger>
          <TabsTrigger value="watchlist"><Star className="w-4 h-4 mr-2" />Watchlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
             <PortfolioValueChart />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {isLoading ? <LoadingSkeleton /> : (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Total Value
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        {formatCurrency(totalValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                        +1.5% from last month
                        </p>
                    </CardContent>
                    </Card>
                    <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Overall Gain/Loss
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overallGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(overallGainLoss)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                        Total return since inception
                        </p>
                    </CardContent>
                    </Card>
                    <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                        +{formatCurrency(482.19)} (+2.15%)
                        </div>
                        <p className="text-xs text-muted-foreground">
                        Across all holdings
                        </p>
                    </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1">
                        <AssetAllocationChart assets={processedAssets} />
                    </div>
                     <div className="xl:col-span-2">
                        <SectorDiversificationChart assets={processedAssets} />
                    </div>
                </div>

                <Card className="bg-card/60 border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                    <CardHeader>
                    <CardTitle>Positions</CardTitle>
                    <CardDescription>
                        Your individual investment holdings.
                    </CardDescription>
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
                            {processedAssets.map(asset => (
                                <AssetRow key={asset.id} asset={asset} totalValue={totalValue} />
                            ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="predictive" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <PredictiveControls />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <ProjectedGrowthChart />
                <MonteCarloChart />
                <AiInsights />
            </div>
        </TabsContent>
         <TabsContent value="insights">
           <Card className="min-h-[60vh] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
                <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">AI Insights Coming Soon</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get AI-powered recommendations and analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="max-w-md text-center text-muted-foreground">
                This area will feature rebalancing suggestions, tax-loss harvesting tips, and goal alignment analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="watchlist">
           <Card className="min-h-[60vh] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
                <Star className="h-12 w-12 text-primary" />
              </div >
              <CardTitle className="text-2xl font-bold">Watchlist Coming Soon</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track assets you're interested in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="max-w-md text-center text-muted-foreground">
                You'll be able to add tickers, view trends, and set price alerts right here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PortfolioDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
