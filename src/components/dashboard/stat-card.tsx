import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type StatCardProps = {
  title: string;
  value: number;
  trend: string;
  icon: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  isCurrency?: boolean;
};

export default function StatCard({ title, value, trend, icon, className, isLoading, isCurrency = false }: StatCardProps) {
  const isPositive = trend.startsWith('+');

  const formattedValue = isCurrency ? `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}` : value.toLocaleString();

  return (
    <Card className={cn('bg-card/80 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-36 mt-1" />
        ) : (
          <div className="text-2xl font-bold font-headline">{formattedValue}</div>
        )}
        <p className={cn('text-xs', isPositive ? 'text-green-400' : 'text-red-400')}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
