'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  DollarSign,
  Layout,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Logo } from '@/components/icons/logo';

const kpis = [
  {
    label: 'Total Value',
    value: '$124,580',
    delta: '+$13,850 today',
    tone: 'success',
  },
  {
    label: 'Holdings',
    value: '24 Stocks',
    delta: 'Across 8 sectors',
    tone: 'neutral',
  },
];

const holdings = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    value: '$42,150',
    change: '+2.4%',
    tone: 'success',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    value: '$38,920',
    change: '+1.8%',
    tone: 'success',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet',
    value: '$29,450',
    change: '-0.5%',
    tone: 'danger',
  },
];

const features = [
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: 'Signal Engine',
    desc: 'AI ranks momentum, quality, and value signals per ticker.',
  },
  {
    icon: <Layout className="w-8 h-8 text-primary" />,
    title: 'Portfolio Builder',
    desc: 'Optimizer targeting volatility or max Sharpe with constraints.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'Risk Guardrails',
    desc: 'Drawdown alerts, beta caps, and sector exposure limits.',
  },
];

const Hero = () => (
  <section className="relative w-full overflow-hidden">
    <div className="absolute inset-0 gradient-hero -z-10" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-8 text-center md:text-left" data-reveal>
          <div className="inline-flex items-center justify-center bg-chip rounded-full px-4 py-1.5 text-sm font-medium tracking-wide">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            AI-Powered Financial Coaching
          </div>
          <h1 className="text-4xl md:text-6xl font-bold !leading-tight">
            Maximize your
            <br />
            <span className="text-primary">Net Worth</span>
          </h1>
          <p className="max-w-prose mx-auto md:mx-0 text-lg text-text-muted">
            Base 44 is your personal financial strategist, combining intuitive design, secure integrations, and intelligent recommendations to guide you to long-term wealth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              asChild
              size="lg"
              className="btn-primary-gradient text-background font-bold text-base h-12 px-8 rounded-full"
              data-btn
            >
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="btn-secondary-glass border-outline text-text h-12 px-8 rounded-full font-bold text-base"
            >
              <Link href="#">View Demo</Link>
            </Button>
          </div>
          <div className="flex justify-center md:justify-start space-x-8 pt-4 text-center">
            <div>
              <p className="text-2xl font-bold">500K+</p>
              <p className="text-sm text-text-muted">Active Investors</p>
            </div>
            <div>
              <p className="text-2xl font-bold">$2.4B+</p>
              <p className="text-sm text-text-muted">Assets Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-text-muted">Users Coached</p>
            </div>
          </div>
        </div>
        <div data-reveal>
          <Card className="glass rounded-xl shadow-2xl">
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Real-time tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {kpis.map(kpi => (
                  <div
                    key={kpi.label}
                    className="glass rounded-lg p-4"
                  >
                    <p className="text-sm text-text-muted">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p
                      className={`text-xs ${
                        kpi.tone === 'success'
                          ? 'text-success'
                          : 'text-text-muted'
                      }`}
                    >
                      {kpi.delta}
                    </p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                {holdings.map(holding => (
                  <li
                    key={holding.ticker}
                    className="flex items-center p-2 rounded-md transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-chip rounded-full h-9 w-9 flex items-center justify-center font-bold text-sm">
                        {holding.ticker}
                      </div>
                      <div>
                        <p className="font-semibold">{holding.name}</p>
                        <p className="text-sm text-text-muted">
                          {holding.ticker}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{holding.value}</p>
                      <p
                        className={`text-sm font-medium ${
                          holding.tone === 'success'
                            ? 'text-success'
                            : 'text-danger'
                        }`}
                      >
                        {holding.change}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-16 md:py-24 bg-bg-elevated">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map(feature => (
          <div key={feature.title} className="glass rounded-xl p-8" data-reveal>
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-chip mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-text-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CtaBand = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-reveal>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Start your journey to financial freedom
      </h2>
      <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
        Connect your accounts, set your goals, and let your AI co-pilot do the rest.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className="btn-primary-gradient text-background font-bold text-base h-12 px-8 rounded-full"
          data-btn
        >
          <Link href="/dashboard">Get Started Free</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="btn-secondary-glass border-outline text-text h-12 px-8 rounded-full font-bold text-base"
        >
          <Link href="#">Book a Demo</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main>
        <Hero />
        <Features />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
