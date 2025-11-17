'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Map, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

const features = [
    {
        icon: Map,
        title: 'Visual Life Planning',
        description: 'Map out your entire life, from career moves to personal milestones, on an interactive canvas.',
        color: 'violet'
    },
    {
        icon: Wallet,
        title: 'Unified Net Worth',
        description: 'Connect all your accounts to see a complete picture of your financial health in one place.',
        color: 'amber'
    },
    {
        icon: Brain,
        title: 'AI-Powered Insights',
        description: 'Your personal AI coach analyzes your plan to provide personalized advice and simulate financial futures.',
        color: 'cyan'
    }
]

function LandingPageContent() {
  return (
    <div className="space-y-16 md:space-y-24">
      <div className="text-center pt-12 md:pt-16">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary leading-tight">
          Design Your Destiny
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
          Hyperion Life is more than a financial tool—it's your AI-powered co-pilot for strategic life planning.
          Integrate your goals, finances, and career into a single, actionable roadmap.
        </p>
        <div className="mt-8 flex justify-center items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass">
                  <DialogTitle className="sr-only">Sign In or Sign Up</DialogTitle>
                  <DialogDescription className="sr-only">A dialog to sign in or create a new account for Hyperion Life.</DialogDescription>
                  <SignInPrompt />
              </DialogContent>
            </Dialog>
             <Button size="lg" variant="outline">
                View Plans
            </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map(feature => {
                  const colorClass = `text-${feature.color}-400`;
                  return (
                    <Card key={feature.title} className="text-center glass hover:border-primary/50 hover:-translate-y-1 transition-transform">
                        <CardHeader className="items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <feature.icon className={`h-6 w-6 ${colorClass}`} />
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                  )
              })}
          </div>
      </div>
    </div>
  )
}

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

  return <LandingPageContent />;
}
