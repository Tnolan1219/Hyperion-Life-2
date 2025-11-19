
export type CalendarEventCategory = 'Work' | 'Personal' | 'Financial' | 'Health' | 'Other';

export const eventCategories: CalendarEventCategory[] = ['Work', 'Personal', 'Financial', 'Health', 'Other'];

export const categoryStyles: Record<CalendarEventCategory, { text: string; bg: string; border: string }> = {
    Work: {
        text: 'text-blue-800 dark:text-blue-200',
        bg: 'bg-blue-500',
        border: 'border-blue-500',
    },
    Personal: {
        text: 'text-purple-800 dark:text-purple-200',
        bg: 'bg-purple-500',
        border: 'border-purple-500',
    },
    Financial: {
        text: 'text-green-800 dark:text-green-200',
        bg: 'bg-green-500',
        border: 'border-green-500',
    },
    Health: {
        text: 'text-red-800 dark:text-red-200',
        bg: 'bg-red-500',
        border: 'border-red-500',
    },
    Other: {
        text: 'text-gray-800 dark:text-gray-200',
        bg: 'bg-gray-500',
        border: 'border-gray-500',
    },
};

export interface CalendarEvent {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO 8601 format
  end: string;   // ISO 8601 format
  category: CalendarEventCategory;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}
