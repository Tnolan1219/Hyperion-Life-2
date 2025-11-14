'use client';

import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeEditorProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  closeEditor: () => void;
  startConnecting: () => void;
}

export function NodeEditor({ selectedNode, onNodeDataChange, closeEditor, startConnecting }: NodeEditorProps) {
  const [formData, setFormData] = useState(selectedNode?.data);

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
    const newFormData = { ...formData, [name]: parseFloat(value) || 0 };
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

  return (
    <div 
        className="w-96 h-full bg-card border-l border-border p-4 flex flex-col shadow-2xl" 
        style={{ transition: 'width 300ms ease-in-out' }}
        onKeyDown={handleKeyDown}
    >
      <CardHeader className="flex flex-row items-start justify-between p-2">
        <div>
            <CardTitle>Edit Node</CardTitle>
            <CardDescription>Update details for "{selectedNode.data.title}"</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={closeEditor}>
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow p-2 overflow-y-auto">
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
                    </SelectContent>
                </Select>
            </div>
        </div>

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
      <div className="p-2 space-y-2">
        <Button onClick={startConnecting} className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Connect to another node
        </Button>
      </div>
    </div>
  );
}
