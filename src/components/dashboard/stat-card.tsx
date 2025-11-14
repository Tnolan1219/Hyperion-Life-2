import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  className?: string;
};

export default function StatCard({ title, value, trend, icon, className }: StatCardProps) {
  const isPositive = trend.startsWith('+');

  return (
    <Card className={cn('bg-card/80 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className={cn('text-xs', isPositive ? 'text-green-400' : 'text-red-400')}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
