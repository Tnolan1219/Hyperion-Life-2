'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { useUser, useAuth } from '@/firebase';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';


export const Header = () => {
  const { user } = useUser();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user ? [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Life Plan", href: "#" },
    { label: "Portfolio", href: "#" },
    { label: "AI Coach", href: "#" },
  ] : [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 border-b border-outline backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="text-primary h-7 w-7" />
          <span className="text-xl font-bold">Base 44</span>
        </Link>
        { user && (
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {navLinks.map(link => (
               <Button variant="ghost" size="sm" asChild key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user && auth ? (
            <Button variant="ghost" onClick={() => auth.signOut()}>
              Log out
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
