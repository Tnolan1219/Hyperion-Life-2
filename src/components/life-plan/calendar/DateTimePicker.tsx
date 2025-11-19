
'use client';
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export default function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) return;
    const newDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      date.getHours(),
      date.getMinutes()
    );
    setDate(newDate);
  };

  const handleTimeChange = (part: 'hours' | 'minutes', value: string) => {
    const newDate = new Date(date);
    if (part === 'hours') {
      newDate.setHours(parseInt(value, 10));
    } else {
      newDate.setMinutes(parseInt(value, 10));
    }
    setDate(newDate);
  };
  
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP p') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-4 border-t border-border flex items-center justify-center gap-2">
            <Select onValueChange={(value) => handleTimeChange('hours', value)} value={date.getHours().toString().padStart(2, '0')}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {hours.map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                </SelectContent>
            </Select>
            <span>:</span>
            <Select onValueChange={(value) => handleTimeChange('minutes', value)} value={Math.floor(date.getMinutes() / 5) * 5 .toString().padStart(2, '0')}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {minutes.map(minute => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
