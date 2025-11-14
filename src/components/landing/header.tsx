'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { Sun, Moon, Bell, User as UserIcon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  BrainCircuit,
  Target,
  Settings,
  Map,
  Home,
  Star,
  AreaChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'sky' },
  { href: '/life-plan', label: 'Life Plan', icon: Map, color: 'violet' },
  { href: '/portfolio', label: 'Portfolio', icon: AreaChart, color: 'amber' },
  { href: '/ai-coach', label: 'AI Coach', icon: BrainCircuit, color: 'cyan' },
  { href: '/goals', label: 'Goals', icon: Star, color: 'rose' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'slate' },
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
    <Link href={href} legacyBehavior>
      <a
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
          isActive && 'bg-primary/10 text-primary'
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </a>
    </Link>
  );
}


export const Header = () => {
  const { user } = useUser();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  
  if (!user && pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/20 bg-transparent px-4 backdrop-blur-lg lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col glass !border-r-0">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span>Base 44</span>
            </Link>
            {navItems.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can be used for breadcrumbs or page title */}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {user && auth ? (
        <>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || 'Guest User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || 'guest@email.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => auth.signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button asChild>
          <Link href="/">Log In</Link>
        </Button>
      )}
    </header>
  );
};
