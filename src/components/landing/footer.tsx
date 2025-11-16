import Link from 'next/link';
import { Logo } from '@/components/icons/logo';

export const Footer = () => (
  <footer className="border-t border-border/20 mt-8">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-3">
          <Logo className="h-5 w-5 text-primary" />
          <p>
            &copy; {new Date().getFullYear()} Hyperion Life. All rights reserved.
          </p>
        </div>
        <div className="flex gap-x-4 mt-4 sm:mt-0">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link href="/policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
    </div>
  </footer>
);
