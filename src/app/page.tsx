'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  initiateGoogleSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { FcGoogle } from 'react-icons/fc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignInForm = () => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth) {
      try {
        initiateEmailSignIn(auth, email, password);
      } catch (error) {
        console.error('Email sign-in failed', error);
      }
    }
  };
  
  return (
      <form onSubmit={handleEmailSignIn}>
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full">
                Sign In
            </Button>
        </div>
    </form>
  );
};

const SignUpForm = () => {
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (auth) {
        try {
            initiateEmailSignUp(auth, email, password);
        } catch (error) {
            console.error('Email sign-up failed', error);
        }
        }
    };
    
    return (
        <form onSubmit={handleEmailSignUp}>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                    id="email-signup"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input 
                    id="password-signup" 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full">
                   Create Account
                </Button>
            </div>
        </form>
    );
};


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
    <div className="min-h-screen flex items-center justify-center animated-background p-4">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary py-2">
            Net Worth Max
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Your AI-powered financial co-pilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="pt-6">
                    <SignInForm />
                </TabsContent>
                <TabsContent value="signup" className="pt-6">
                    <SignUpForm />
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 pt-0">
             <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                <FcGoogle className="mr-2 h-5 w-5" />
                Google
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function LandingPage() {
  const { user, isUserLoading, onboardingComplete } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && user) {
      if (onboardingComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, isUserLoading, onboardingComplete, router]);

  if (isUserLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return <SignInPrompt />;
}
