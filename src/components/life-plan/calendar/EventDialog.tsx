
'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { CalendarEvent, eventCategories } from './calendar-types';
import DateTimePicker from './DateTimePicker';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.date({ required_error: 'Start time is required.' }),
  end: z.date({ required_error: 'End time is required.' }),
  category: z.enum(eventCategories),
}).refine(data => data.end >= data.start, {
  message: 'End date must be after start date.',
  path: ['end'],
});


type EventFormData = z.infer<typeof eventSchema>;

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event?: CalendarEvent;
  defaultDate?: Date;
}

export function EventDialog({ isOpen, setIsOpen, event, defaultDate }: EventDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        event
          ? {
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
            }
          : {
              title: '',
              description: '',
              location: '',
              start: defaultDate || new Date(),
              end: defaultDate ? new Date(defaultDate.getTime() + 60 * 60 * 1000) : new Date(new Date().getTime() + 60 * 60 * 1000),
              category: 'Personal',
            }
      );
    }
  }, [event, isOpen, defaultDate, form]);

  const onSubmit = (data: EventFormData) => {
    if (!firestore || !user) return;
    
    const eventData = { 
        ...data,
        userId: user.uid,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
    };

    if (event?.id) {
      const eventRef = doc(firestore, `users/${user.uid}/calendarEvents`, event.id);
      updateDocumentNonBlocking(eventRef, eventData);
    } else {
      const eventsRef = collection(firestore, `users/${user.uid}/calendarEvents`);
      addDocumentNonBlocking(eventsRef, eventData);
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (!firestore || !user || !event?.id) return;
    const eventRef = doc(firestore, `users/${user.uid}/calendarEvents`, event.id);
    updateDocumentNonBlocking(eventRef, { deleted: true }); // Soft delete
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg glass">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {event ? "Update your event's details." : 'Add a new event to your calendar.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Team Meeting" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="start" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                            <DateTimePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="end" render={({ field }) => (
                    <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                            <DateTimePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                      {eventCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input placeholder="e.g., Conference Room 4B or Zoom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Add a description or notes..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
                {event && (
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete Event
                    </Button>
                )}
                <div className="flex-grow" />
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{event ? 'Save Changes' : 'Create Event'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
