'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import type { User } from 'firebase/auth';
import { Sun, Moon, Bell, User as UserIcon, Menu, Award } from 'lucide-react';
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
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Brain,
  Target,
  Settings,
  Map,
  Home,
  Star,
  AreaChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../icons/logo';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog';
import { SignInPrompt } from '../auth/SignInPrompt';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'sky' },
  { href: '/life-plan', label: 'Life Plan', icon: Map, color: 'violet' },
  { href: '/portfolio', label: 'Net Worth', icon: Wallet, color: 'amber' },
  { href: '/ai-coach', label: 'AI Coach', icon: Brain, color: 'cyan' },
  { href: '/goals', label: 'Goals', icon: Star, color: 'rose' },
  { href: '/settings', label: 'Profile', icon: UserIcon, color: 'slate' },
];


function MobileNavLink({
  href,
  label,
  icon: Icon,
  closeSheet,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  closeSheet: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} legacyBehavior>
      <a
        onClick={closeSheet}
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/20 bg-background/80 backdrop-blur-lg px-4 lg:h-[60px] lg:px-6">
      <div className="flex-1 md:flex-none">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <Logo className="h-6 w-6 text-primary" />
                <span>Hyperion Life</span>
              </Link>
              {user && navItems.map(item => (
                <MobileNavLink key={item.href} {...item} closeSheet={() => setIsSheetOpen(false)} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

       <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center gap-3 font-semibold text-foreground transition-opacity duration-300">
            <span className="text-primary">
                <Logo className="h-7 w-7" />
            </span>
            <span className="text-xl font-bold hidden sm:inline">Hyperion Life</span>
            </Link>
        </div>

      <div className="flex flex-1 items-center justify-end gap-2">
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
            <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5 text-sm font-semibold">
              <Award className="h-5 w-5 text-amber-400" />
              <span>1,250 MP</span>
            </div>
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
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
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
                      {user.email || 'No email provided'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => auth.signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Dialog>
              <DialogTrigger asChild>
                  <Button>Log In</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass">
                  <DialogTitle className="sr-only">Log In or Sign Up</DialogTitle>
                  <DialogDescription className="sr-only">Log in to your Hyperion Life account or create a new one.</DialogDescription>
                  <SignInPrompt />
              </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
};
