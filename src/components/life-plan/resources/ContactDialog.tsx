'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Contact, ContactCategory } from './contact-types';

const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  role: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().optional(),
  category: z.enum(['Career', 'Mentor', 'Financial', 'Personal']),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contact?: Contact;
}

const categories: ContactCategory[] = ['Career', 'Mentor', 'Financial', 'Personal'];

export function ContactDialog({ isOpen, setIsOpen, contact }: ContactDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
      category: 'Career',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        contact
          ? { ...contact, email: contact.email || '' }
          : {
              name: '',
              role: '',
              email: '',
              phone: '',
              category: 'Career',
              notes: '',
            }
      );
    }
  }, [contact, isOpen, form]);

  const onSubmit = (data: ContactFormData) => {
    if (!firestore || !user) return;
    
    const contactData = { ...data, userId: user.uid };

    if (contact?.id) {
      const contactRef = doc(firestore, `users/${user.uid}/contacts`, contact.id);
      updateDocumentNonBlocking(contactRef, contactData);
    } else {
      const contactsRef = collection(firestore, `users/${user.uid}/contacts`);
      addDocumentNonBlocking(contactsRef, contactData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {contact ? "Update this contact's details." : "Add a person to your network."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role / Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Financial Advisor" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} /></FormControl>
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
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Met at a networking event. Expert in SaaS." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{contact ? 'Save Changes' : 'Add Contact'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
