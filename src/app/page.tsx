'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { BrainCircuit } from 'lucide-react';

const SignInPrompt = () => {
  const auth = useAuth();
  const handleAnonymousSignIn = async () => {
    if (auth) {
      try {
        initiateAnonymousSignIn(auth);
      } catch (error) {
        console.error('Anonymous sign-in failed', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary py-2">
            Base 44
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Your AI-powered financial co-pilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <Button onClick={handleAnonymousSignIn} className="w-full" size="lg">
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            For this demo, we'll sign you in anonymously to explore the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};


export default function LandingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);


  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return <SignInPrompt />;
}
