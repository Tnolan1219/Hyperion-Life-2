
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  add,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { CalendarEvent, eventCategories, categoryStyles } from './calendar-types';
import { EventDialog } from './EventDialog';

export function FullCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [dialogDefaultDate, setDialogDefaultDate] = useState<Date | undefined>(undefined);
  const { user } = useUser();
  const firestore = useFirestore();

  const eventsCollection = useMemoFirebase(() => {
    if (firestore && user) {
        return collection(firestore, `users/${user.uid}/calendarEvents`);
    }
    return null;
  }, [firestore, user]);

  const { data: events } = useCollection<CalendarEvent>(eventsCollection);

  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));
  const days = eachDayOfInterval({ start, end });

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    (events || []).forEach(event => {
      const dayKey = format(new Date(event.start), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(event);
    });
    return grouped;
  }, [events]);

  const handlePrev = () => setCurrentDate(add(currentDate, { months: -1 }));
  const handleNext = () => setCurrentDate(add(currentDate, { months: 1 }));
  const handleToday = () => setCurrentDate(new Date());
  
  const handleAddEvent = (date: Date) => {
    setSelectedEvent(undefined);
    setDialogDefaultDate(date);
    setIsDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogDefaultDate(undefined);
    setIsDialogOpen(true);
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 border-l border-border">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground border-t border-r border-border bg-muted/30">{day}</div>
      ))}
      {days.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDay[dayKey] || [];
        return (
          <div
            key={day.toString()}
            className={cn(
              'h-36 border-r border-b border-border p-1.5 flex flex-col relative group',
              isSameMonth(day, currentDate) ? '' : 'bg-muted/20 text-muted-foreground',
              isToday(day) && 'bg-blue-500/10'
            )}
            onClick={() => handleAddEvent(day)}
          >
            <span className={cn('self-end text-sm', isToday(day) && 'font-bold text-blue-600')}>{format(day, 'd')}</span>
            <div className="mt-1 flex-grow overflow-y-auto space-y-1">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                  className={cn(
                    'p-1 text-xs rounded-md text-white truncate cursor-pointer',
                    categoryStyles[event.category]?.bg,
                  )}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft /></Button>
                <Button variant="outline" onClick={handleToday}>Today</Button>
                <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight /></Button>
                <h2 className="text-2xl font-bold ml-4">{format(currentDate, 'MMMM yyyy')}</h2>
            </div>
            <div className="flex items-center gap-4">
                <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="hidden md:inline-flex">
                    <ToggleGroupItem value="month">Month</ToggleGroupItem>
                    <ToggleGroupItem value="week" disabled>Week</ToggleGroupItem>
                    <ToggleGroupItem value="day" disabled>Day</ToggleGroupItem>
                </ToggleGroup>
                 <Button onClick={() => handleAddEvent(new Date())}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </div>
        </div>
        
        <div className="rounded-lg border border-border overflow-hidden glass">
            {view === 'month' && renderMonthView()}
        </div>
        <EventDialog 
            isOpen={isDialogOpen} 
            setIsOpen={setIsDialogOpen} 
            event={selectedEvent} 
            defaultDate={dialogDefaultDate}
        />
    </div>
  );
}
