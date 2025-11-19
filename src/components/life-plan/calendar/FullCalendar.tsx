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
  set,
  differenceInMinutes,
  getMinutes,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useCollection, useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { CalendarEvent, categoryStyles } from './calendar-types';
import { EventDialog } from './EventDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';


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
                  <TooltipProvider>
                    {dayEvents.map(event => (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                            className={cn(
                              'p-1 text-xs rounded-md text-white truncate',
                              categoryStyles[event.category]?.bg,
                            )}
                          >
                            {event.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}
                            </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
    )
}

const WeekView = ({ currentDate, events, onSlotClick, onEventClick, onEventUpdate }: { currentDate: Date, events: CalendarEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void, onEventUpdate: (event: CalendarEvent) => void }) => {
    const weekDays = getWeekDays(currentDate);
    const hours = getDayHours(new Date());
    const timeSlotsPerHour = 4; // 15-minute intervals
    const slotHeight = 1; // 1rem height for each 15-min slot

    const getEventPosition = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        
        const durationMinutes = Math.max(differenceInMinutes(end, start), 15);

        const top = (startMinutes / 15) * slotHeight;
        const height = (durationMinutes / 15) * slotHeight;

        return { top: `${top}rem`, height: `${height}rem` };
    }
    
    const handleResize = (event: CalendarEvent, newHeight: number) => {
        const durationMinutes = (newHeight / slotHeight) * 15;
        const newEnd = add(new Date(event.start), { minutes: durationMinutes });
        onEventUpdate({ ...event, end: newEnd.toISOString() });
    }

    return (
        <div className="flex border-t border-border">
            <div className="w-16 text-center shrink-0">
                {hours.map(hour => (
                    <div key={hour.toString()} className="h-16 flex items-start justify-center text-xs text-muted-foreground border-r border-border pt-1">
                        {format(hour, 'ha')}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-grow">
                {weekDays.map((day, dayIndex) => (
                    <Droppable key={day.toString()} droppableId={format(day, 'yyyy-MM-dd')}>
                        {(dayProvided, daySnapshot) => (
                            <div
                                ref={dayProvided.innerRef}
                                {...dayProvided.droppableProps}
                                className={cn("border-r border-border relative", daySnapshot.isDraggingOver && 'bg-primary/50')}
                            >
                                <div className="text-center p-2 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                                    <p className="text-sm font-semibold">{format(day, 'EEE')}</p>
                                    <p className={cn("text-2xl font-bold", isToday(day) && "text-primary")}>{format(day, 'd')}</p>
                                </div>
                                {Array.from({ length: 24 * timeSlotsPerHour }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="h-4 border-b border-border/50 cursor-pointer hover:bg-muted/40" 
                                        style={{ borderStyle: (i + 1) % timeSlotsPerHour === 0 ? 'solid' : 'dashed' }}
                                        onClick={() => onSlotClick(add(startOfDay(day), { minutes: i * 15 }))} 
                                    />
                                ))}
                                {events.filter(e => isSameDay(new Date(e.start), day)).map((event, eventIndex) => (
                                    <Draggable key={event.id} draggableId={event.id!} index={eventIndex}>
                                        {(eventProvided, eventSnapshot) => (
                                            <div
                                                ref={eventProvided.innerRef}
                                                {...eventProvided.draggableProps}
                                                style={{...getEventPosition(event), ...eventProvided.draggableProps.style}}
                                                className={cn('absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-20 cursor-pointer overflow-hidden group', categoryStyles[event.category]?.bg, eventSnapshot.isDragging && 'shadow-2xl')}
                                            >
                                                <div {...eventProvided.dragHandleProps} className="absolute top-1 left-1 opacity-60 group-hover:opacity-100 cursor-move">
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <div onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className="pl-4">
                                                    <p className="font-semibold">{event.title}</p>
                                                    <p>{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                                                </div>
                                                <div 
                                                    className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                                                        const initialHeight = rect.height;
                                                        const initialY = e.clientY;
                                                        
                                                        const handleMouseMove = (moveE: MouseEvent) => {
                                                            const newHeight = initialHeight + (moveE.clientY - initialY);
                                                            if (newHeight > slotHeight) { // min height 15min
                                                                handleResize(event, newHeight / 16); // px to rem assuming 1rem = 16px
                                                            }
                                                        };
                                                        const handleMouseUp = () => {
                                                            document.removeEventListener('mousemove', handleMouseMove);
                                                            document.removeEventListener('mouseup', handleMouseUp);
                                                        };
                                                        document.addEventListener('mousemove', handleMouseMove);
                                                        document.addEventListener('mouseup', handleMouseUp);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {dayProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </div>
    )
}

const DayView = ({ currentDate, events, onSlotClick, onEventClick, onEventUpdate }: { currentDate: Date, events: CalendarEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void, onEventUpdate: (event: CalendarEvent) => void }) => {
    const hours = getDayHours(new Date());
    const timeSlotsPerHour = 4;
    const slotHeight = 1;

    const getEventPosition = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const durationMinutes = Math.max(differenceInMinutes(end, start), 15);

        const top = (startMinutes / 15) * slotHeight;
        const height = (durationMinutes / 15) * slotHeight;

        return { top: `${top}rem`, height: `${height}rem` };
    }
    
    const dayEvents = events.filter(e => isSameDay(new Date(e.start), currentDate));

    const handleResize = (event: CalendarEvent, newHeight: number) => {
        const durationMinutes = (newHeight / slotHeight) * 15;
        const newEnd = add(new Date(event.start), { minutes: durationMinutes });
        onEventUpdate({ ...event, end: newEnd.toISOString() });
    }

    return (
        <div className="flex border-t border-border">
            <div className="w-20 text-center shrink-0">
                {hours.map(hour => (
                    <div key={hour.toString()} className="h-16 flex items-start justify-center text-sm text-muted-foreground border-r border-border pt-1">
                        {format(hour, 'h a')}
                    </div>
                ))}
            </div>
             <Droppable droppableId={format(currentDate, 'yyyy-MM-dd')}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-grow border-r border-border relative">
                        {Array.from({ length: 24 * timeSlotsPerHour }).map((_, i) => (
                            <div 
                                key={i} 
                                className="h-4 border-b border-border/50 cursor-pointer hover:bg-muted/40" 
                                style={{ borderStyle: (i + 1) % timeSlotsPerHour === 0 ? 'solid' : 'dashed' }}
                                onClick={() => onSlotClick(add(startOfDay(currentDate), { minutes: i * 15 }))} 
                            />
                        ))}

                        {dayEvents.map((event, index) => (
                           <Draggable key={event.id} draggableId={event.id!} index={index}>
                            {(eventProvided, eventSnapshot) => (
                                <div
                                    ref={eventProvided.innerRef}
                                    {...eventProvided.draggableProps}
                                    style={{...getEventPosition(event), ...eventProvided.draggableProps.style}}
                                    className={cn('absolute left-2 right-2 p-3 rounded-lg text-white z-10 cursor-pointer overflow-hidden group', categoryStyles[event.category]?.bg, eventSnapshot.isDragging && 'shadow-2xl')}
                                >
                                    <div {...eventProvided.dragHandleProps} className="absolute top-2 left-2 opacity-60 group-hover:opacity-100 cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className="pl-6">
                                        <p className="font-bold">{event.title}</p>
                                        <p className="text-sm">{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                                        {event.location && <p className="text-sm opacity-90">{event.location}</p>}
                                    </div>
                                     <div 
                                          className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
                                          onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                                              const initialHeight = rect.height;
                                              const initialY = e.clientY;
                                              
                                              const handleMouseMove = (moveE: MouseEvent) => {
                                                  const newHeight = initialHeight + (moveE.clientY - initialY);
                                                  if (newHeight > slotHeight * 16) { // min height 15min (1rem)
                                                      handleResize(event, newHeight / 16); // px to rem
                                                  }
                                              };
                                              const handleMouseUp = () => {
                                                  document.removeEventListener('mousemove', handleMouseMove);
                                                  document.removeEventListener('mouseup', handleMouseUp);
                                              };
                                              document.addEventListener('mousemove', handleMouseMove);
                                              document.addEventListener('mouseup', handleMouseUp);
                                          }}
                                      />
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
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
  
  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    if (!firestore || !user || !updatedEvent.id) return;
    const eventRef = doc(firestore, `users/${user.uid}/calendarEvents`, updatedEvent.id);
    updateDocumentNonBlocking(eventRef, updatedEvent);
  }

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }
    
    const event = events?.find(e => e.id === draggableId);
    if (!event) return;

    const sourceDate = new Date(event.start);
    const destinationDay = new Date(destination.droppableId);

    // This is a simplification. A real implementation would need to get the time from the drop position.
    // For now, we just move the event to the new day, keeping the original time.
    const newStartDate = set(destinationDay, {
        hours: sourceDate.getHours(),
        minutes: sourceDate.getMinutes()
    });

    const duration = new Date(event.end).getTime() - sourceDate.getTime();
    const newEndDate = new Date(newStartDate.getTime() + duration);

    const updatedEvent = {
        ...event,
        start: newStartDate.toISOString(),
        end: newEndDate.toISOString()
    };
    handleEventUpdate(updatedEvent);

  }, [events, handleEventUpdate]);

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
        
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="rounded-lg border border-border overflow-hidden glass">
                {view === 'month' && <MonthView currentDate={currentDate} eventsByDay={eventsByDay} onDayClick={handleAddEvent} onEventClick={handleEventClick} />}
                {view === 'week' && <WeekView currentDate={currentDate} events={events || []} onSlotClick={handleAddEvent} onEventClick={handleEventClick} onEventUpdate={handleEventUpdate}/>}
                {view === 'day' && <DayView currentDate={currentDate} events={events || []} onSlotClick={handleAddEvent} onEventClick={handleEventClick} onEventUpdate={handleEventUpdate}/>}
            </div>
        </DragDropContext>

        <EventDialog 
            isOpen={isDialogOpen} 
            setIsOpen={setIsDialogOpen} 
            event={selectedEvent} 
            defaultDate={dialogDefaultDate}
        />
    </div>
  );
}
