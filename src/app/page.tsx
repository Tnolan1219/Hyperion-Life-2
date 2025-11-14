'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SignInPrompt = () => {
  const auth = useAuth();
  const handleAnonymousSignIn = async () => {
    if (auth) {
      try {
        await (await import('@/firebase/non-blocking-login')).initiateAnonymousSignIn(auth);
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
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleAnonymousSignIn} className="w-full">
            Sign In As Guest
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service. For this demo, we'll
            sign you in anonymously.
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

  React.useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!prefersReduced) {
      const els = document.querySelectorAll('[data-reveal]');
      const io = new IntersectionObserver(
        entries => {
          entries.forEach((e, i) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).animate(
                [
                  { opacity: 0, transform: 'translateY(24px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                {
                  duration: 650,
                  easing: 'cubic-bezier(0.22,0.61,0.36,1)',
                  delay: i * 80,
                  fill: 'forwards',
                }
              );
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      els.forEach(el => io.observe(el));
    }
  }, []);

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
