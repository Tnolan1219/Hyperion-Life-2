'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { GoalsStep } from '@/components/onboarding/GoalsStep';
import { PlanningStep } from '@/components/onboarding/PlanningStep';
import { InitialGoalsStep } from '@/components/onboarding/InitialGoalsStep';
import { SummaryStep } from '@/components/onboarding/SummaryStep';

export default function OnboardingPage() {
  const { currentStep } = useOnboardingStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <GoalsStep />;
      case 3:
        return <PlanningStep />;
      case 4:
        return <InitialGoalsStep />;
      case 5:
        return <SummaryStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {renderStep()}
    </div>
  );
}
