'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { BrainCircuit } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const SignInPrompt = () => {
  const auth = useAuth();
  const handleGoogleSignIn = async () => {
    if (auth) {
      try {
        initiateGoogleSignIn(auth);
      } catch (error) {
        console.error('Google sign-in failed', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-background px-4">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary py-2">
            Base 44
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Your AI-powered financial co-pilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            Sign in to securely save and track your financial data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return <SignInPrompt />;
}
