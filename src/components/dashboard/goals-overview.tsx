import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const goals = [
    {
        name: "Emergency Fund",
        target: 15000,
        current: 12500,
        description: "6 months of expenses"
    },
    {
        name: "House Down Payment",
        target: 50000,
        current: 37500,
        description: "For a new home in 2026"
    },
    {
        name: "Retirement",
        target: 1000000,
        current: 250000,
        description: "401(k) and IRA contributions"
    },
    {
        name: "New Car",
        target: 20000,
        current: 5000,
        description: "Saving for a reliable vehicle"
    },
]

export default function GoalsOverview() {
    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Goals Overview</CardTitle>
                <CardDescription>Your progress towards financial independence.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {goals.map((goal) => {
                        const progress = (goal.current / goal.target) * 100;
                        return (
                            <div key={goal.name} className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-medium">{goal.name}</h4>
                                    <span className="text-sm font-mono text-muted-foreground">
                                        ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" indicatorClassName="bg-primary shadow-glow shadow-primary/50" />
                                <p className="text-xs text-muted-foreground">{goal.description}</p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
