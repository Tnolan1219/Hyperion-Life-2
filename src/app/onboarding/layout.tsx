'use client';

import React from 'react';
import { Logo } from '@/components/icons/logo';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center animated-background p-4">
      <div className="absolute top-8 flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to Net Worth Max
        </h1>
      </div>
      {children}
    </div>
  );
}
