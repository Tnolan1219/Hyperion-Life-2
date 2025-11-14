'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Goal } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface GoalsOverviewProps {
    goals: Goal[] | null;
    isLoading: boolean;
}

export default function GoalsOverview({ goals, isLoading }: GoalsOverviewProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Goals Overview</CardTitle>
                <CardDescription>Your progress towards financial independence.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                           <div key={i} className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        ))
                    ) : goals && goals.length > 0 ? (
                        goals.map((goal) => {
                            const progress = (goal.progressAmount / goal.targetAmount) * 100;
                            return (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-medium">{goal.goalType}</h4>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            ${goal.progressAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground">{goal.goalType}</p>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-muted-foreground text-sm text-center py-8">No goals set yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
