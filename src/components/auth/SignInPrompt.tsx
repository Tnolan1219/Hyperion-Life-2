
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import {
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
import { Alert, AlertDescription } from '@/components/ui/alert';

const SignInForm = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (auth) {
      try {
        await initiateEmailSignIn(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          setError('No account found with that email. Would you like to sign up?');
        } else {
          setError(err.message || 'An unknown error occurred.');
        }
        console.error('Email sign-in failed', err);
      }
    }
  };

  return (
    <form onSubmit={handleEmailSignIn}>
      <div className="grid gap-4">
        {error && (
            <Alert variant="destructive">
                <AlertDescription className="flex flex-col items-center gap-2 text-center">
                   {error}
                   {error.includes('No account found') && (
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab('signup')}>Go to Sign Up</Button>
                   )}
                </AlertDescription>
            </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </div>
    </form>
  );
};

const SignUpForm = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (auth) {
      try {
        await initiateEmailSignUp(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('This email is already in use. Please sign in instead.');
        } else {
            setError(err.message || 'An unknown error occurred.');
        }
        console.error('Email sign-up failed', err);
      }
    }
  };

  return (
    <form onSubmit={handleEmailSignUp}>
      <div className="grid gap-4">
        {error && (
             <Alert variant="destructive">
                <AlertDescription className="flex flex-col items-center gap-2 text-center">
                   {error}
                   {error.includes('already in use') && (
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab('signin')}>Go to Sign In</Button>
                   )}
                </AlertDescription>
            </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email-signup">Email</Label>
          <Input
            id="email-signup"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password-signup">Password</Label>
          <Input
            id="password-signup"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </div>
    </form>
  );
};

export const SignInPrompt = () => {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  
  const handleGoogleSignIn = async () => {
    if (auth) {
      try {
        await initiateGoogleSignIn(auth);
      } catch (error: any) {
        // The 'auth/cancelled-popup-request' error occurs when the user closes the
        // Google sign-in popup. It's a normal part of the flow and not an actual
        // application error, so we can safely ignore it.
        if (error.code !== 'auth/cancelled-popup-request') {
            console.error('Google sign-in failed', error);
        }
      }
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary py-2">
          Hyperion Life
        </CardTitle>
        <CardDescription className="text-muted-foreground pt-2">
          Your AI-powered financial co-pilot.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="pt-6">
            <SignInForm setActiveTab={setActiveTab} />
          </TabsContent>
          <TabsContent value="signup" className="pt-6">
            <SignUpForm setActiveTab={setActiveTab} />
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
    </>
  );
};
