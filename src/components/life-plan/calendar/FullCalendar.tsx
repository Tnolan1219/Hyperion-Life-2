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
  startOfDay,
  endOfDay,
  eachHourOfInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { CalendarEvent, eventCategories, categoryStyles } from './calendar-types';
import { EventDialog } from './EventDialog';

const getWeekDays = (date: Date) => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return eachDayOfInterval({ start, end });
}

const getDayHours = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return eachHourOfInterval({ start, end });
}

const MonthView = ({ currentDate, eventsByDay, onDayClick, onEventClick }: { currentDate: Date, eventsByDay: Record<string, CalendarEvent[]>, onDayClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void }) => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="grid grid-cols-7 border-l border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground border-t border-r border-border bg-muted/30">{day}</div>
          ))}
          {days.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = (eventsByDay[dayKey] || []).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            return (
              <div
                key={day.toString()}
                className={cn(
                  'h-36 border-r border-b border-border p-1.5 flex flex-col relative group cursor-pointer hover:bg-muted/40 transition-colors',
                  isSameMonth(day, currentDate) ? '' : 'bg-muted/20 text-muted-foreground',
                  isToday(day) && 'bg-blue-500/10'
                )}
                onClick={() => onDayClick(day)}
              >
                <span className={cn('self-end text-sm', isToday(day) && 'font-bold text-blue-600')}>{format(day, 'd')}</span>
                <div className="mt-1 flex-grow overflow-y-auto space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={cn(
                        'p-1 text-xs rounded-md text-white truncate',
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
    )
}

const WeekView = ({ currentDate, events, onSlotClick, onEventClick }: { currentDate: Date, events: CalendarEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void }) => {
    const weekDays = getWeekDays(currentDate);
    const hours = getDayHours(new Date());

    const getEventPosition = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        const duration = Math.max(endHour - startHour, 0.5); // Minimum 30min block

        const top = startHour * 4; // 4rem per hour
        const height = duration * 4; // 4rem per hour

        return { top: `${top}rem`, height: `${height}rem` };
    }

    return (
        <div className="flex border-t border-border">
            <div className="w-16 text-center">
                {hours.map(hour => (
                    <div key={hour.toString()} className="h-16 flex items-center justify-center text-xs text-muted-foreground border-r border-border">
                        {format(hour, 'ha')}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-grow">
                {weekDays.map(day => (
                    <div key={day.toString()} className="border-r border-border relative">
                         <div className="text-center p-2 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                            <p className="text-sm font-semibold">{format(day, 'EEE')}</p>
                            <p className={cn("text-2xl font-bold", isToday(day) && "text-primary")}>{format(day, 'd')}</p>
                         </div>
                        {hours.map(hour => (
                            <div key={hour.toString()} className="h-16 border-b border-border cursor-pointer hover:bg-muted/40" onClick={() => onSlotClick(new Date(day.setHours(hour.getHours())))} />
                        ))}
                         {events.filter(e => isSameDay(new Date(e.start), day)).map(event => (
                            <div
                                key={event.id}
                                style={getEventPosition(event)}
                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                className={cn(
                                    'absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-20 cursor-pointer overflow-hidden',
                                    categoryStyles[event.category]?.bg
                                )}
                            >
                                <p className="font-semibold">{event.title}</p>
                                <p>{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

const DayView = ({ currentDate, events, onSlotClick, onEventClick }: { currentDate: Date, events: CalendarEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void }) => {
    const hours = getDayHours(new Date());

    const getEventPosition = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        const duration = Math.max(endHour - startHour, 0.5);

        const top = startHour * 4;
        const height = duration * 4;

        return { top: `${top}rem`, height: `${height}rem` };
    }
    
    const dayEvents = events.filter(e => isSameDay(new Date(e.start), currentDate));

    return (
        <div className="flex border-t border-border">
            <div className="w-20 text-center">
                {hours.map(hour => (
                    <div key={hour.toString()} className="h-16 flex items-center justify-center text-sm text-muted-foreground border-r border-border">
                        {format(hour, 'h a')}
                    </div>
                ))}
            </div>
            <div className="flex-grow border-r border-border relative">
                {hours.map(hour => (
                    <div key={hour.toString()} className="h-16 border-b border-border cursor-pointer hover:bg-muted/40" onClick={() => onSlotClick(new Date(currentDate.setHours(hour.getHours())))} />
                ))}
                {dayEvents.map(event => (
                    <div
                        key={event.id}
                        style={getEventPosition(event)}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={cn(
                            'absolute left-2 right-2 p-3 rounded-lg text-white z-10 cursor-pointer overflow-hidden',
                             categoryStyles[event.category]?.bg
                        )}
                    >
                        <p className="font-bold">{event.title}</p>
                        <p className="text-sm">{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                        {event.location && <p className="text-sm opacity-90">{event.location}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}


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

  const handlePrev = () => {
      const duration = view === 'month' ? { months: 1 } : view === 'week' ? { weeks: 1 } : { days: 1 };
      setCurrentDate(current => add(current, { [Object.keys(duration)[0]]: -Object.values(duration)[0] }));
  };
  const handleNext = () => {
      const duration = view === 'month' ? { months: 1 } : view === 'week' ? { weeks: 1 } : { days: 1 };
      setCurrentDate(current => add(current, duration));
  };
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
  
  const getHeaderText = () => {
      if (view === 'month') return format(currentDate, 'MMMM yyyy');
      if (view === 'week') {
          const start = startOfWeek(currentDate);
          const end = endOfWeek(currentDate);
          if (isSameMonth(start, end)) {
              return format(currentDate, 'MMMM yyyy');
          }
          return `${format(start, 'MMM yyyy')} - ${format(end, 'MMM yyyy')}`;
      }
      if (view === 'day') return format(currentDate, 'MMMM d, yyyy');
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft /></Button>
                <Button variant="outline" onClick={handleToday}>Today</Button>
                <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight /></Button>
                <h2 className="text-2xl font-bold ml-4">{getHeaderText()}</h2>
            </div>
            <div className="flex items-center gap-4">
                <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)}>
                    <ToggleGroupItem value="month">Month</ToggleGroupItem>
                    <ToggleGroupItem value="week">Week</ToggleGroupItem>
                    <ToggleGroupItem value="day">Day</ToggleGroupItem>
                </ToggleGroup>
                 <Button onClick={() => handleAddEvent(new Date())}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </div>
        </div>
        
        <div className="rounded-lg border border-border overflow-hidden glass">
            {view === 'month' && <MonthView currentDate={currentDate} eventsByDay={eventsByDay} onDayClick={handleAddEvent} onEventClick={handleEventClick} />}
            {view === 'week' && <WeekView currentDate={currentDate} events={events || []} onSlotClick={handleAddEvent} onEventClick={handleEventClick} />}
            {view === 'day' && <DayView currentDate={currentDate} events={events || []} onSlotClick={handleAddEvent} onEventClick={handleEventClick} />}
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
