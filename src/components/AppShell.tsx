'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  BrainCircuit,
  Target,
  Settings,
  Map,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  BarChart,
  Home,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Header } from '@/components/landing/header';
import { Chatbot } from '@/components/chatbot';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'sky' },
  { href: '/life-plan', label: 'Life Plan', icon: Map, color: 'violet' },
  { href: '/portfolio', label: 'Portfolio', icon: BarChart, color: 'amber' },
  { href: '/ai-coach', label: 'AI Coach', icon: BrainCircuit, color: 'cyan' },
  { href: '/goals', label: 'Goals', icon: Star, color: 'rose' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'slate' },
];

const colorClasses = {
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
  isCollapsed,
  color,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isCollapsed: boolean;
  color: keyof typeof colorClasses;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const colors = colorClasses[color];

  const linkContent = (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-300 relative',
        colors.hoverBg,
        colors.hoverText,
        isActive && `${colors.bg} ${colors.text} font-semibold`,
        'transform-gpu hover:scale-105'
      )}
    >
      <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent rounded-r-full transition-all duration-500 opacity-0 group-hover:opacity-100",
        isActive ? `h-full opacity-100 shadow-lg ${colors.shadow}` : 'h-0'
      )} />
      <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && colors.text)} />
      {!isCollapsed && <span className="truncate">{label}</span>}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 hidden -translate-x-2 scale-0 rounded bg-card px-2 py-1 text-xs font-medium text-foreground shadow-md transition-all duration-300 group-hover:ml-4 group-hover:block group-hover:scale-100">
            {label}
        </div>
      )}

    </div>
  );

  return (
    <Link href={href} className="w-full">
      {linkContent}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300",
        isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]"
    )}>
      <aside className="hidden border-r bg-card/80 md:block glass">
        <div className="flex h-full max-h-screen flex-col gap-2 relative">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-3 font-semibold text-foreground transition-opacity duration-300">
              <span className="text-cyan-400">
                <BrainCircuit className="h-6 w-6" />
              </span>
              {!isCollapsed && <span>Base 44</span>}
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <NavLink key={item.href} {...item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t">
             <Button variant="ghost" onClick={() => setIsCollapsed(!isCollapsed)} className="w-full justify-center">
                {isCollapsed ? <ChevronsRight className="h-5 w-5"/> : <ChevronsLeft className="h-5 w-5" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
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
