'use client';

import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Zap, Trash2, LocateFixed, Users, Link as LinkIcon, XCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Contact } from './resources/contact-types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface NodeEditorProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  closeEditor: () => void;
  startConnecting: () => void;
  onDeleteNode: () => void;
  onCenterNode: () => void;
}

export function NodeEditor({ selectedNode, onNodeDataChange, closeEditor, startConnecting, onDeleteNode, onCenterNode }: NodeEditorProps) {
  const [formData, setFormData] = useState(selectedNode?.data);
  const { user } = useUser();
  const firestore = useFirestore();

  const contactsCollection = useMemoFirebase(() => {
    if (firestore && user) {
        return collection(firestore, `users/${user.uid}/contacts`);
    }
    return null;
  }, [firestore, user]);

  const { data: contacts } = useCollection<Contact>(contactsCollection);

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    if(selectedNode) {
        onNodeDataChange(selectedNode.id, newFormData);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'year' ? parseInt(value) : parseFloat(value);
    const newFormData = { ...formData, [name]: isNaN(parsedValue) ? '' : parsedValue };
    setFormData(newFormData);
    if(selectedNode) {
        onNodeDataChange(selectedNode.id, newFormData);
    }
  };

  const handleFrequencyChange = (value: string) => {
    const newFormData = { ...formData, frequency: value };
    setFormData(newFormData);
    if(selectedNode) {
        onNodeDataChange(selectedNode.id, newFormData);
    }
  };
  
  const handleLinkContact = (contact: Contact) => {
      const newFormData = { ...formData, linkedContact: { id: contact.id, name: contact.name } };
      setFormData(newFormData);
      if(selectedNode) {
        onNodeDataChange(selectedNode.id, newFormData);
    }
  }
  
  const handleUnlinkContact = () => {
    const { linkedContact, ...rest } = formData;
    setFormData(rest);
    if(selectedNode) {
        onNodeDataChange(selectedNode.id, rest);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
          closeEditor();
      }
  }

  if (!selectedNode || !formData) {
    return (
      <div className="w-0" style={{ transition: 'width 300ms ease-in-out' }}></div>
    );
  }
  
  const isSystemNode = selectedNode.type === 'system';

  return (
    <div 
        className="w-96 h-full glass !rounded-l-3xl !rounded-r-none !border-l-0 flex flex-col pointer-events-auto" 
        style={{ transition: 'width 300ms ease-in-out' }}
        onKeyDown={handleKeyDown}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div>
            <CardTitle>Edit Node</CardTitle>
            <CardDescription>Update details for "{selectedNode.data.title}"</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={closeEditor}>
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow p-4 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleAmountChange}
            placeholder="e.g., 2025"
            disabled={isSystemNode}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    placeholder="e.g., 50000 or -2500"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" value={formData.frequency} onValueChange={handleFrequencyChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="one-time">One-Time</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {!isSystemNode && (
            <div className="space-y-2">
                <Label>Linked Contact</Label>
                {formData.linkedContact ? (
                    <div className="flex items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{formData.linkedContact.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleUnlinkContact}>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ) : (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Link a contact...
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-1">
                                {contacts && contacts.length > 0 ? (
                                    contacts.map(contact => (
                                        <Button
                                            key={contact.id}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => handleLinkContact(contact)}
                                        >
                                            {contact.name}
                                        </Button>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground p-2">No contacts found. Add one in the Resources tab.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        )}


        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any relevant notes here..."
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
      <div className="p-4 space-y-2 mt-auto">
        <Separator className="my-2" />
        {!isSystemNode && <Button onClick={startConnecting} className="w-full" variant="outline" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Connect to another node
        </Button>}
        <div className="grid grid-cols-2 gap-2">
            {!isSystemNode && <Button onClick={onCenterNode} variant="outline" className="w-full">
                <LocateFixed className="mr-2 h-4 w-4" />
                Center
            </Button>}
            <Button onClick={onDeleteNode} variant="destructive" className="w-full col-span-2">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Node
            </Button>
        </div>
      </div>
    </div>
  );
}
