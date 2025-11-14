import Link from 'next/link';
import { Logo } from '@/components/icons/logo';

const footerLinks = {
  Product: ['Dashboard', 'Signals', 'Pricing', 'Docs'],
  Company: ['About', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Disclosures'],
};

export const Footer = () => (
  <footer className="bg-bg-elevated border-t border-outline">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold text-text-muted tracking-wider uppercase">
              {title}
            </h3>
            <ul className="mt-4 space-y-4">
              {links.map(link => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-base text-text-muted hover:text-text"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-outline pt-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo className="h-6 w-6 text-primary" />
          <p className="text-base text-text-muted">
            &copy; {new Date().getFullYear()} StockMind AI. All rights reserved.
          </p>
        </div>
        {/* Add social media icons here if needed */}
      </div>
    </div>
  </footer>
);
