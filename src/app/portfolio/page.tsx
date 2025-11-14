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
  FilePieChart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const exampleHoldings = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    balance: 25.5,
    price: 189.98,
    value: 4844.49,
    change24h: 1.25,
    allocation: 21.3,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    balance: 15.2,
    price: 335.94,
    value: 5106.29,
    change24h: -0.42,
    allocation: 22.5,
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    balance: 10,
    price: 136.5,
    value: 1365.0,
    change24h: 2.1,
    allocation: 6.0,
  },
  {
    ticker: 'BTC',
    name: 'Bitcoin',
    balance: 0.2,
    price: 34500.0,
    value: 6900.0,
    change24h: 5.8,
    allocation: 30.4,
  },
  {
    ticker: 'ETH',
    name: 'Ethereum',
    balance: 2.5,
    price: 1850.0,
    value: 4500.0,
    change24h: 3.5,
    allocation: 19.8,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export default function PortfolioPage() {
  const totalValue = exampleHoldings.reduce((acc, h) => acc + h.value, 0);

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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analysis">
        <TabsList className="grid w-full grid-cols-2 max-w-lg">
          <TabsTrigger value="analysis">Stock Analysis</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Gain/Loss
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  +{formatCurrency(3450.72)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total return since inception
                </p>
              </CardContent>
            </Card>
            <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Positions</CardTitle>
              <CardDescription>
                Your individual investment holdings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Asset</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h</TableHead>
                    <TableHead className="text-right">Allocation</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exampleHoldings.map(holding => (
                    <TableRow key={holding.ticker}>
                      <TableCell>
                        <div className="font-medium">{holding.ticker}</div>
                        <div className="text-sm text-muted-foreground">
                          {holding.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{holding.balance}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(holding.value)}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(holding.price)}</TableCell>
                      <TableCell
                        className={
                          holding.change24h > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        <div className="flex items-center">
                          {holding.change24h > 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {holding.change24h.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {holding.allocation.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview">
           <Card className="min-h-[60vh] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
                <FilePieChart className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Overview Coming Soon</CardTitle>
              <CardDescription className="text-muted-foreground">
                This section will provide a high-level visual breakdown of your portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="max-w-md text-center text-muted-foreground">
                Expect charts showing asset class diversification (stocks, crypto, etc.), performance over time, and risk analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
