'use client';

import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeEditorProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  closeEditor: () => void;
}

export function NodeEditor({ selectedNode, onNodeDataChange, closeEditor }: NodeEditorProps) {
  const [formData, setFormData] = useState(selectedNode?.data);

  useEffect(() => {
    setFormData(selectedNode?.data);
  }, [selectedNode]);

  if (!selectedNode || !formData) {
    return (
        <div className={cn("w-0 md:w-96 h-full bg-card border-l border-border transition-all duration-300 ease-in-out")}>
        </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const handleFrequencyChange = (value: string) => {
    setFormData({ ...formData, frequency: value });
  };

  const handleSaveChanges = () => {
    onNodeDataChange(selectedNode.id, formData);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          handleSaveChanges();
      }
  }

  return (
    <div className={cn("w-full md:w-96 h-full bg-card border-l border-border transition-all duration-300 ease-in-out p-4 flex flex-col", selectedNode ? 'w-96' : 'w-0 p-0')} onKeyDown={handleKeyDown}>
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <div>
            <CardTitle>Edit Node</CardTitle>
            <CardDescription>Update the node's details.</CardDescription>
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
      <div className="p-2">
        <Button onClick={handleSaveChanges} className="w-full">
          Save Changes (Ctrl+S)
        </Button>
      </div>
    </div>
  );
}
