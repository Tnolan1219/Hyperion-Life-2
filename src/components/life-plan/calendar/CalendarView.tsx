'use client';

import React, { useMemo, useState } from 'react';
import { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Briefcase,
  GraduationCap,
  PiggyBank,
  Heart,
  Flag,
  Zap,
  Calendar as CalendarIcon,
  MapPin,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FcGoogle } from 'react-icons/fc';
import { format } from 'date-fns';

const nodeIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  career: { icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  education: { icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  financial: { icon: PiggyBank, color: 'text-green-400', bg: 'bg-green-400/10' },
  lifeEvent: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  goal: { icon: Flag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  other: { icon: Zap, color: 'text-teal-400', bg: 'bg-teal-400/10' },
  system: { icon: Zap, color: 'text-gray-400', bg: 'bg-gray-400/10' },
};

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return null;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
};


export function CalendarView({ nodes, onFocusNode }: { nodes: Node[], onFocusNode: (nodeId: string) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventsByDate = useMemo(() => {
    const events: Record<string, Node[]> = {};
    nodes.forEach(node => {
      if (node.data.year) {
        const date = new Date(node.data.year, 0, 2); // Use Day 2 for stability
        const dateString = format(date, 'yyyy-MM-dd');
        if (!events[dateString]) {
          events[dateString] = [];
        }
        events[dateString].push(node);
      }
    });
    return events;
  }, [nodes]);
  
  const selectedDayEvents = useMemo(() => {
      if (!selectedDate) return [];
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      return eventsByDate[dateString] || [];
  }, [selectedDate, eventsByDate])

  const DayWithEvents = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateString] || [];
    
    if (date.getMonth() !== displayMonth.getMonth()) {
      return (
        <div className="flex justify-center items-center h-full w-full text-muted-foreground/50">
            {format(date, 'd')}
        </div>
      );
    }
    
    return (
      <div className="relative flex flex-col h-full w-full p-1">
        <div className="text-right text-sm">{format(date, 'd')}</div>
        <div className="flex-grow flex flex-col justify-end gap-1 mt-1">
            {dayEvents.slice(0, 2).map(event => {
                const config = nodeIcons[event.type!] || nodeIcons.other;
                return (
                    <div key={event.id} className={cn("w-full rounded-sm px-1 py-0.5 text-xs truncate", config.bg, config.color)}>
                        {event.data.title}
                    </div>
                )
            })}
             {dayEvents.length > 2 && <p className="text-xs text-muted-foreground">+ {dayEvents.length - 2} more</p>}
        </div>
      </div>
    );
  };

  return (
    <Card className="glass mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Life Plan Calendar</CardTitle>
            <CardDescription>A calendar view of your key life events and milestones.</CardDescription>
        </div>
        <Button variant="outline">
            <FcGoogle className="mr-2 h-4 w-4" />
            Connect Google Calendar
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: "text-xl font-bold",
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-24 w-full text-left text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-0 font-normal aria-selected:opacity-100',
                day_selected: 'bg-primary/20 text-primary-foreground focus:bg-primary focus:text-primary-foreground border-2 border-primary',
              }}
              components={{
                  Day: DayWithEvents
              }}
            />
        </div>
        <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">
                Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '...'}
            </h3>
            <div className="space-y-4">
                {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map(node => {
                        const { icon: Icon, color, bg } = nodeIcons[node.type!] || nodeIcons.other;
                        const formattedAmount = formatCurrency(node.data.amount);
                        return (
                            <div key={node.id} className={cn("p-3 rounded-lg border", bg)}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{node.data.title}</h4>
                                            <p className="text-sm text-muted-foreground capitalize">{node.type}</p>
                                        </div>
                                    </div>
                                     <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100" onClick={() => onFocusNode(node.id)}>
                                        <MapPin className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formattedAmount && (
                                     <div className={cn("mt-2 text-right font-semibold", node.data.amount > 0 ? "text-green-400" : "text-red-400")}>
                                        {formattedAmount}
                                        {node.data.frequency === 'yearly' && <span className="text-xs text-muted-foreground ml-1">/yr</span>}
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <CalendarIcon className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-4">No events for this day.</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}