'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { useUser, useAuth } from '@/firebase';

export const Header = () => {
  const { user } = useUser();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
        scrolled
          ? 'bg-bg-elevated/80 border-b border-outline backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="text-primary h-7 w-7" />
          <span className="text-xl font-bold">StockMind AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#">Analysis</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#">Portfolio</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#">Profile</Link>
          </Button>
        </nav>
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
    </header>
  );
};
