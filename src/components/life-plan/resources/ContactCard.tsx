'use client';
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Edit, User as UserIcon } from 'lucide-react';
import { Contact, ContactCategory } from './contact-types';
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ContactCardProps {
  category: ContactCategory;
  icon: React.ElementType;
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
}

const SingleContact = ({ contact, onEdit }: { contact: Contact, onEdit: (contact: Contact) => void }) => {
    const { user } = useUser();
    const firestore = useFirestore();

    const handleDelete = () => {
        if(firestore && user && contact.id) {
            deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/contacts`, contact.id));
        }
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {contact.email && <Button asChild variant="ghost" size="icon"><a href={`mailto:${contact.email}`}><Mail className="h-4 w-4" /></a></Button>}
                {contact.phone && <Button asChild variant="ghost" size="icon"><a href={`tel:${contact.phone}`}><Phone className="h-4 w-4" /></a></Button>}
                <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}><Edit className="h-4 w-4" /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500">
                           <Edit className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this contact from your network.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

export function ContactCard({ category, icon: Icon, contacts, onEditContact }: ContactCardProps) {
  return (
    <AccordionItem value={category}>
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-primary" />
          {category}
          <span className="text-sm font-normal text-muted-foreground">({contacts.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {contacts.map(contact => (
            <SingleContact key={contact.id} contact={contact} onEdit={onEditContact} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export { type ContactCategory };
