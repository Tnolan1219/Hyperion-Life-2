'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  BrainCircuit,
  Target,
  Settings,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Header } from '@/components/landing/header';
import { Chatbot } from '@/components/chatbot';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/life-plan', label: 'Life Plan', icon: Map },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/ai-coach', label: 'AI Coach', icon: BrainCircuit },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary relative',
        isActive && 'bg-primary/10 text-primary font-semibold',
        'hover:bg-primary/5'
      )}
    >
      <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-primary rounded-r-full transition-all duration-300 group-hover:h-1/2",
        isActive ? 'h-full' : 'h-0'
      )}
      style={{
        boxShadow: isActive ? '0 0 12px hsl(var(--primary))' : 'none'
      }}
      />
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
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
     return <>{children}</>
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card/80 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">
                <BrainCircuit className="h-6 w-6" />
              </span>
              <span>Base 44</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">{children}</main>
        <Chatbot />
      </div>
    </div>
  );
}
