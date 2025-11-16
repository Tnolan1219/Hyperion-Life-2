'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PlusCircle, Briefcase, UserCheck, Shield, Users, Loader2 } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import { ContactCategory, ContactCard } from './ContactCard';
import { ContactDialog } from './ContactDialog';
import { Contact } from './contact-types';


const categories: { name: ContactCategory, icon: React.ElementType, description: string }[] = [
    { name: 'Career', icon: Briefcase, description: 'Professional contacts, colleagues, and network.' },
    { name: 'Mentor', icon: UserCheck, description: 'Advisors and mentors guiding your journey.' },
    { name: 'Financial', icon: Shield, description: 'Financial advisors, accountants, and lawyers.' },
    { name: 'Personal', icon: Users, description: 'Friends, family, and personal support system.' },
];

export function ContactManager() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

    const contactsCollection = useMemoFirebase(() => {
        if (firestore && user) {
            return collection(firestore, `users/${user.uid}/contacts`);
        }
        return null;
    }, [firestore, user]);

    const { data: contacts, isLoading } = useCollection<Contact>(contactsCollection);

    const groupedContacts = useMemo(() => {
        if (!contacts) return {};
        return contacts.reduce((acc, contact) => {
            const category = contact.category || 'Personal';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(contact);
            return acc;
        }, {} as Record<ContactCategory, Contact[]>);
    }, [contacts]);

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDialogOpen(true);
    };
    
    const handleAddContact = () => {
        setSelectedContact(undefined);
        setIsDialogOpen(true);
    }

    return (
        <>
            <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-primary" />
                            Resource Network
                        </CardTitle>
                        <CardDescription>Manage your network of mentors, partners, and contacts.</CardDescription>
                    </div>
                    <Button onClick={handleAddContact}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Contact
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {!isLoading && contacts && contacts.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                            <p className="font-semibold">Your network is empty.</p>
                            <p>Click "Add Contact" to start building your resource list.</p>
                        </div>
                    )}
                    <Accordion type="multiple" defaultValue={categories.map(c => c.name)} className="w-full space-y-4">
                        {categories.map(category => (
                            (groupedContacts[category.name] && groupedContacts[category.name].length > 0) && (
                                <ContactCard 
                                    key={category.name}
                                    category={category.name}
                                    icon={category.icon}
                                    contacts={groupedContacts[category.name]}
                                    onEditContact={handleEditContact}
                                />
                            )
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            <ContactDialog 
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                contact={selectedContact}
            />
        </>
    );
}