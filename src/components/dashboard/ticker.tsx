'use client';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';
import React from 'react';

type TickerProps = {
  items: string[];
  className?: string;
};

const Ticker: React.FC<TickerProps> = ({ items, className }) => {
  return (
    <div
      className={cn(
        'relative flex w-full overflow-hidden bg-card/50 border border-border rounded-lg p-2 group',
        className
      )}
    >
      <div className="absolute left-2 top-0 bottom-0 flex items-center z-10 bg-card/0">
        <Megaphone className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, index) => (
            <div
              key={index}
              className="flex items-center px-6 text-sm text-foreground/80 whitespace-nowrap"
            >
              <span className="mr-6">•</span>
              {item}
            </div>
          ))}
        </div>
      </div>
       <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
