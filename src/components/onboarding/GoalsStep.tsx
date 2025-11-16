'use client';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Home,
    Briefcase,
    Heart,
    Rocket,
    GraduationCap,
    TrendingUp,
    Globe,
    Palette,
    Smile,
    ShieldCheck,
    Gift,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { cn } from '@/lib/utils';
  
const goalsOptions = [
    { id: 'maximize_net_worth', label: 'Maximize Net Worth', icon: TrendingUp },
    { id: 'buy_home', label: 'Buy a Home', icon: Home },
    { id: 'start_family', label: 'Start a Family', icon: Heart },
    { id: 'corporate_ladder', label: 'Climb Corporate Ladder', icon: Briefcase },
    { id: 'start_business', label: 'Start a Business', icon: Rocket },
    { id: 'pay_off_loans', label: 'Pay Off Student Loans', icon: GraduationCap },
    { id: 'achieve_fire', label: 'Achieve FIRE', icon: TrendingUp },
    { id: 'travel_world', label: 'Travel the World', icon: Globe },
    { id: 'passion_project', label: 'Pursue a Passion Project', icon: Palette },
    { id: 'reduce_stress', label: 'Reduce Financial Stress', icon: Smile },
    { id: 'medical_expenses', label: 'Prepare for Medical Expenses', icon: ShieldCheck },
    { id: 'leave_legacy', label: 'Leave a Legacy / Estate Planning', icon: Gift },
];

export function GoalsStep() {
    const { lifeGoals, setLifeGoals, financialSuccessDescription, setFinancialSuccessDescription, nextStep, prevStep } = useOnboardingStore();

    const toggleGoal = (goalId: string) => {
        setLifeGoals(
            lifeGoals.includes(goalId)
                ? lifeGoals.filter(g => g !== goalId)
                : [...lifeGoals, goalId]
        );
    };

    return (
        <Card className="w-full glass">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Life Goals & Priorities</CardTitle>
                <CardDescription>
                    What are your biggest life goals right now? Choose all that apply — we’ll
                    tailor your plan accordingly.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {goalsOptions.map(({ id, label, icon: Icon }) => (
                        <div
                            key={id}
                            onClick={() => toggleGoal(id)}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                                lifeGoals.includes(id) ? "bg-primary/20 border-primary" : "bg-muted/30 border-border hover:border-primary/50"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", lifeGoals.includes(id) ? "text-primary" : "text-muted-foreground")} />
                            <span className="font-medium text-sm">{label}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="financial-success">In your own words, describe what financial success looks like to you. (Optional)</Label>
                    <Textarea
                        id="financial-success"
                        placeholder="e.g., Having the freedom to travel and work on projects I'm passionate about without worrying about money."
                        value={financialSuccessDescription}
                        onChange={(e) => setFinancialSuccessDescription(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
            </CardFooter>
        </Card>
    );
}
