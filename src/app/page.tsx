'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

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

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative w-full overflow-hidden">
          <div className="absolute inset-0 gradient-hero -z-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center" data-reveal>
              <div className="inline-flex items-center justify-center bg-chip rounded-full px-4 py-1.5 text-sm font-medium tracking-wide mb-6">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Your AI-Powered Financial Co-Pilot
              </div>
              <h1 className="text-4xl md:text-6xl font-bold !leading-tight tracking-tighter">
                Maximize Your Net Worth.
                <br />
                <span className="text-primary">Design Your Future.</span>
              </h1>
              <p className="max-w-2xl mx-auto mt-6 text-lg text-text-muted">
                Base 44 is your personal financial strategist, combining intuitive design, secure integrations, and intelligent recommendations to guide you to long-term wealth.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="btn-primary-gradient text-background font-bold text-base h-12 px-8 rounded-full"
                >
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
