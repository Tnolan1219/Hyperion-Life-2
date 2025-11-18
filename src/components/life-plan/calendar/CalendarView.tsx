
'use client';

import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FcGoogle } from 'react-icons/fc';

const nodeIcons: Record<string, { icon: React.ElementType; color: string }> = {
  career: { icon: Briefcase, color: 'text-orange-400' },
  education: { icon: GraduationCap, color: 'text-blue-400' },
  financial: { icon: PiggyBank, color: 'text-green-400' },
  lifeEvent: { icon: Heart, color: 'text-pink-400' },
  goal: { icon: Flag, color: 'text-purple-400' },
  other: { icon: Zap, color: 'text-teal-400' },
  system: { icon: Zap, color: 'text-gray-400' },
};

export function CalendarView({ nodes, onFocusNode }: { nodes: Node[], onFocusNode: (nodeId: string) => void }) {
  const eventsByDate = useMemo(() => {
    const events: Record<string, Node[]> = {};
    nodes.forEach(node => {
      if (node.data.year) {
        // For simplicity, we'll place all events on the 1st of January of their year.
        // A full implementation would use a more precise date.
        const date = new Date(node.data.year, 0, 2); // Use Day 2 to avoid timezone issues with Day 1
        const dateString = date.toISOString().split('T')[0];
        if (!events[dateString]) {
          events[dateString] = [];
        }
        events[dateString].push(node);
      }
    });
    return events;
  }, [nodes]);

  const eventDates = useMemo(() => {
    return Object.keys(eventsByDate).map(dateString => new Date(dateString));
  }, [eventsByDate]);

  const DayWithEvents = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dateString] || [];
    
    // Only render event dots if the day is within the currently displayed month
    if (date.getMonth() !== displayMonth.getMonth()) {
      return (
        <div className="flex justify-center items-center h-full w-full">
            {date.getDate()}
        </div>
      );
    }
    
    return (
      <div className="relative flex flex-col justify-between h-full w-full p-1">
        <div className="flex-grow flex justify-center items-center font-semibold">
          {date.getDate()}
        </div>
        {dayEvents.length > 0 && (
          <div className="flex justify-center items-end gap-1 h-2">
            {dayEvents.slice(0, 3).map(event => {
                const config = nodeIcons[event.type!] || nodeIcons.other;
                return <div key={event.id} className={cn("w-2 h-2 rounded-full", config.color.replace('text-','bg-'))} />
            })}
          </div>
        )}
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
      <CardContent>
        <Calendar
          mode="single"
          selected={eventDates}
          className="p-0"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-full w-full p-0 font-normal aria-selected:opacity-100',
            day_selected: 'bg-primary/10 text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          }}
          components={{
              Day: DayWithEvents
          }}
        />
      </CardContent>
    </Card>
  );
}
