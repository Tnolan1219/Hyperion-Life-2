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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export function WelcomeStep() {
    const { 
        fullName, setFullName, 
        age, setAge, 
        careerStage, setCareerStage, 
        incomeRange, setIncomeRange,
        nextStep 
    } = useOnboardingStore();
    
    const { user } = useUser();
    
    useEffect(() => {
        if(user?.displayName && !fullName) {
            setFullName(user.displayName);
        }
    }, [user, fullName, setFullName]);

    const canProceed = fullName && age && careerStage;

    return (
        <Card className="w-full glass onboarding-card">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Welcome to Net Worth Max!</CardTitle>
                <CardDescription>
                    Let’s personalize your experience. This will only take a minute.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="30" value={age} onChange={(e) => setAge(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="career-stage">Career Stage</Label>
                    <Select value={careerStage} onValueChange={setCareerStage}>
                        <SelectTrigger id="career-stage">
                            <SelectValue placeholder="Select your career stage" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="early-career">Early Career</SelectItem>
                            <SelectItem value="mid-career">Mid Career</SelectItem>
                            <SelectItem value="late-career">Late Career</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="income-range">Income Range (Optional)</Label>
                    <Select value={incomeRange} onValueChange={setIncomeRange}>
                        <SelectTrigger id="income-range">
                            <SelectValue placeholder="Select your income range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0-50k">$0 - $50,000</SelectItem>
                            <SelectItem value="50k-100k">$50,001 - $100,000</SelectItem>
                            <SelectItem value="100k-200k">$100,001 - $200,000</SelectItem>
                            <SelectItem value="200k+">$200,001+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={nextStep} disabled={!canProceed}>Next</Button>
            </CardFooter>
        </Card>
    );
}
