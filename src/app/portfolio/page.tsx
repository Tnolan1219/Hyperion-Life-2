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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PortfolioDialog } from '@/components/portfolio/PortfolioDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioValueChart } from '@/components/portfolio/charts/PortfolioValueChart';
import { AssetAllocationChart } from '@/components/portfolio/charts/AssetAllocationChart';
import { SectorDiversificationChart } from '@/components/portfolio/charts/SectorDiversificationChart';
import { CashFlowChart } from '@/components/portfolio/CashFlowChart';
import { BudgetTracker } from '@/components/portfolio/BudgetTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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

const HoldingsAnalysisSection = () => {
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
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-2/4 mb-2" /><Skeleton className="h-8 w-3/4" /></CardHeader></Card>
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                    <CardContent><div className="space-y-4">{[...Array(3)].map((_, i) => (<div key={i} className="flex justify-between items-center p-2"><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/4"><Skeleton className="h-5 w-full" /></div><div className="w-1/6"><Skeleton className="h-5 w-full" /></div></div>))}</div ></CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                    <p className="text-xs text-muted-foreground">+1.5% from last month</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Gain/Loss</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${overallGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(overallGainLoss)}</div>
                    <p className="text-xs text-muted-foreground">Total return since inception</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-400">+{formatCurrency(482.19)} (+2.15%)</div>
                    <p className="text-xs text-muted-foreground">Across all holdings</p>
                </CardContent>
                </Card>
            </div>
            
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
                        {processedAssets.map(asset => (
                            <AssetRow key={asset.id} asset={asset} totalValue={totalValue} />
                        ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}

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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
      
      <HoldingsAnalysisSection />
      
      <PortfolioDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
