'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Base 44</CardTitle>
          <CardDescription>
            Your AI-powered financial co-pilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleAnonymousSignIn} className="w-full">
            Sign In As Guest
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            For this demo, we'll sign you in anonymously.
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


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if(user) {
    return null; // or a loading spinner, since the redirect is happening
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <SignInPrompt />
      </main>
      <Footer />
    </div>
  );
}
