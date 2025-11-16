'use client';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { addDoc, collection, doc } from 'firebase/firestore';
import { CheckCircle, Map, Wallet, Brain } from 'lucide-react';
import { Goal } from '@/app/goals/page';

export function SummaryStep() {
    const { 
        fullName, age, careerStage, incomeRange,
        lifeGoals, financialSuccessDescription,
        planningPreferences, initialGoals,
        reset
    } = useOnboardingStore();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const handleFinish = async () => {
        if (!user || !firestore) return;

        const userProfileRef = doc(firestore, `users/${user.uid}/profiles`, user.uid);
        const userPreferencesRef = doc(firestore, `users/${user.uid}/preferences`, user.uid);
        const goalsCollectionRef = collection(firestore, `users/${user.uid}/goals`);

        // Save profile data
        updateDocumentNonBlocking(userProfileRef, {
            name: fullName,
            age: parseInt(age),
            careerStage,
            income: incomeRange,
        });

        // Save preferences data
        updateDocumentNonBlocking(userPreferencesRef, {
            lifeGoals,
            financialSuccessDescription,
            planningPreferences,
            onboardingComplete: true
        });

        // Save initial goals
        initialGoals.forEach((goal: Omit<Goal, 'id' | 'userId'>) => {
            addDoc(goalsCollectionRef, { ...goal, userId: user.uid });
        });
        
        // This is a bit of a hack to force the useUser hook to re-evaluate
        // A better solution would involve a global state invalidation
        await new Promise(resolve => setTimeout(resolve, 500)); 

        reset();
        router.push('/dashboard');
    };

    return (
        <Card className="w-full glass text-center">
            <CardHeader>
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold">You’re All Set!</CardTitle>
                <CardDescription className="text-lg">
                    We’ve built a personalized experience based on your goals and preferences.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Where would you like to start?</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => { handleFinish(); router.push('/life-plan'); }}>
                    <Map className="mr-2 h-5 w-5" />
                    Launch Life Plan
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => { handleFinish(); router.push('/portfolio'); }}>
                    <Wallet className="mr-2 h-5 w-5" />
                    Go to Portfolio
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => { handleFinish(); router.push('/ai-coach'); }}>
                   <Brain className="mr-2 h-5 w-5" />
                    Meet Your AI Coach
                </Button>
            </CardFooter>
        </Card>
    );
}
