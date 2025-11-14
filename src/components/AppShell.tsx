'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Map,
  AreaChart,
  BrainCircuit,
  Star,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Header } from '@/components/landing/header';
import { Chatbot } from '@/components/chatbot';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'sky' },
  { href: '/life-plan', label: 'Life Plan', icon: Map, color: 'violet' },
  { href: '/portfolio', label: 'Portfolio', icon: AreaChart, color: 'amber' },
  { href: '/ai-coach', label: 'AI Coach', icon: BrainCircuit, color: 'cyan' },
  { href: '/goals', label: 'Goals', icon: Star, color: 'rose' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'slate' },
];

const colorClasses: { [key: string]: { [key: string]: string } } = {
    sky: {
        text: 'text-sky-400',
        bg: 'bg-sky-400/10',
        hoverBg: 'hover:bg-sky-400/10',
        hoverText: 'hover:text-sky-300',
        shadow: 'shadow-sky-500/50'
    },
    violet: {
        text: 'text-violet-400',
        bg: 'bg-violet-400/10',
        hoverBg: 'hover:bg-violet-400/10',
        hoverText: 'hover:text-violet-300',
        shadow: 'shadow-violet-500/50'
    },
    amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-400/10',
        hoverBg: 'hover:bg-amber-400/10',
        hoverText: 'hover:text-amber-300',
        shadow: 'shadow-amber-500/50'
    },
    cyan: {
        text: 'text-cyan-400',
        bg: 'bg-cyan-400/10',
        hoverBg: 'hover:bg-cyan-400/10',
        hoverText: 'hover:text-cyan-300',
        shadow: 'shadow-cyan-500/50'
    },
    rose: {
        text: 'text-rose-400',
        bg: 'bg-rose-400/10',
        hoverBg: 'hover:bg-rose-400/10',
        hoverText: 'hover:text-rose-300',
        shadow: 'shadow-rose-500/50'
    },
    slate: {
        text: 'text-slate-400',
        bg: 'bg-slate-400/10',
        hoverBg: 'hover:bg-slate-400/10',
        hoverText: 'hover:text-slate-300',
        shadow: 'shadow-slate-500/50'
    }
};


function NavLink({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  color: keyof typeof colorClasses;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const colors = colorClasses[color] || colorClasses.slate;

  return (
     <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'group flex items-center justify-center rounded-lg h-12 w-12 my-1 text-muted-foreground transition-all duration-300 relative',
              colors.hoverBg,
              colors.hoverText,
              isActive && `${colors.bg} ${colors.text} font-semibold`,
              'transform-gpu hover:scale-[1.03]'
            )}
          >
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent rounded-r-full transition-all duration-500 opacity-0 group-hover:opacity-100",
              isActive ? 'h-3/4 opacity-100' : 'h-0',
              isActive && `shadow-lg ${colors.shadow}`
            )} />
            <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", isActive && colors.text)} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-card/90 backdrop-blur-sm text-foreground">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || (!user && pathname !== '/')) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!user) {
     return <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[72px_1fr]">
      <aside className="hidden md:flex p-2">
        <div className="flex h-full max-h-screen flex-col items-center gap-2 relative glass rounded-xl">
          <div className="flex h-14 items-center justify-center w-full border-b border-border/20 lg:h-[60px]">
            <Link href="/" className="flex items-center justify-center gap-3 font-semibold text-foreground transition-opacity duration-300">
              <span className="text-primary">
                <BrainCircuit className="h-6 w-6" />
              </span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start text-sm font-medium">
              {navItems.map(item => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 md:pt-8">{children}</main>
        <Chatbot />
      </div>
    </div>
  );
}
