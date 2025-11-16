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
import { useUser, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { CheckCircle, Map, Wallet, Brain } from 'lucide-react';
import { Goal } from '@/app/goals/page';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    const [isSaving, setIsSaving] = useState(false);

    const handleFinish = async (redirectPath: string) => {
        if (!user || !firestore) return;

        setIsSaving(true);

        const userProfileRef = doc(firestore, `users/${user.uid}/profiles`, user.uid);
        const userPreferencesRef = doc(firestore, `users/${user.uid}/preferences`, user.uid);
        const goalsCollectionRef = collection(firestore, `users/${user.uid}/goals`);

        const profilePromise = setDocumentNonBlocking(userProfileRef, {
            id: user.uid,
            name: fullName,
            age: parseInt(age) || 0,
            careerStage,
            income: incomeRange,
            location: 'Not specified'
        }, { merge: true });
        
        const preferencesPromise = setDocumentNonBlocking(userPreferencesRef, {
            id: user.uid,
            lifeGoals,
            financialSuccessDescription,
            planningPreferences,
            onboardingComplete: true, // This is the crucial flag
            riskTolerance: 'Not specified',
            darkMode: true,
            reducedMotion: false,
            notificationOptIn: false
        }, { merge: true });

        const goalPromises = initialGoals.map((goal: Omit<Goal, 'id' | 'userId'>) => {
            return addDocumentNonBlocking(goalsCollectionRef, { ...goal, userId: user.uid });
        });

        // The useUser hook will automatically detect the 'onboardingComplete' change
        // and handle the redirection. We don't need to manually router.push here.
        // We just wait for the save to complete.
        await Promise.all([profilePromise, preferencesPromise, ...goalPromises]);

        reset();
        
        // The router.push is now just a fallback, the primary navigation
        // is handled by the auth state listeners in AppShell and the landing page.
        router.push(redirectPath);
        setIsSaving(false);
    };

    return (
        <Card className="w-full glass text-center onboarding-card">
            <CardHeader>
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
                    {isSaving ? <Loader2 className="h-10 w-10 text-green-500 animate-spin" /> : <CheckCircle className="h-10 w-10 text-green-500" />}
                </div>
                <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{isSaving ? 'Saving Your Profile...' : 'You’re All Set!'}</CardTitle>
                <CardDescription className="text-lg">
                    {isSaving ? 'Please wait while we personalize your experience.' : 'We’ve built a personalized experience based on your goals and preferences.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Where would you like to start?</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => handleFinish('/life-plan')} disabled={isSaving}>
                    <Map className="mr-2 h-5 w-5" />
                    Launch Life Plan
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => handleFinish('/portfolio')} disabled={isSaving}>
                    <Wallet className="mr-2 h-5 w-5" />
                    Go to Portfolio
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => handleFinish('/ai-coach')} disabled={isSaving}>
                   <Brain className="mr-2 h-5 w-5" />
                    Meet Your AI Coach
                </Button>
            </CardFooter>
        </Card>
    );
}
