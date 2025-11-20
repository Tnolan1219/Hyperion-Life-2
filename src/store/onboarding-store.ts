
import { create } from 'zustand';
import { Goal } from '@/app/life-stats/page';

interface OnboardingState {
  currentStep: number;
  fullName: string;
  age: string;
  careerStage: string;
  incomeRange: string;
  lifeGoals: string[];
  financialSuccessDescription: string;
  planningPreferences: string[];
  initialGoals: Omit<Goal, 'id' | 'userId'>[];

  setFullName: (name: string) => void;
  setAge: (age: string) => void;
  setCareerStage: (stage: string) => void;
  setIncomeRange: (range: string) => void;
  setLifeGoals: (goals: string[]) => void;
  setFinancialSuccessDescription: (description: string) => void;
  setPlanningPreferences: (preferences: string[]) => void;
  setInitialGoals: (goals: Omit<Goal, 'id' | 'userId'>[]) => void;

  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  fullName: '',
  age: '',
  careerStage: '',
  incomeRange: '',
  lifeGoals: [],
  financialSuccessDescription: '',
  planningPreferences: [],
  initialGoals: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setFullName: (name) => set({ fullName: name }),
  setAge: (age) => set({ age }),
  setCareerStage: (stage) => set({ careerStage: stage }),
  setIncomeRange: (range) => set({ incomeRange: range }),
  setLifeGoals: (goals) => set({ lifeGoals: goals }),
  setFinancialSuccessDescription: (description) => set({ financialSuccessDescription: description }),
  setPlanningPreferences: (preferences) => set({ planningPreferences: preferences }),
  setInitialGoals: (goals) => set({ initialGoals: goals }),
  
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
  reset: () => set(initialState),
}));
