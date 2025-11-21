'use client';

import React, { useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { X, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';

interface EdgeEditorProps {
  selectedEdge: Edge | null;
  onEdgeDataChange: (edgeId: string, newData: any) => void;
  closeEditor: () => void;
  onDeleteEdge: () => void;
}

export function EdgeEditor({ selectedEdge, onEdgeDataChange, closeEditor, onDeleteEdge }: EdgeEditorProps) {
  const [formData, setFormData] = useState(selectedEdge?.data);

  useEffect(() => {
    if (selectedEdge) {
      setFormData(selectedEdge.data || {});
    }
  }, [selectedEdge]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    if(selectedEdge) {
        onEdgeDataChange(selectedEdge.id, newFormData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
          closeEditor();
      }
  }

  if (!selectedEdge || !formData) {
    return <div className="w-0" style={{ transition: 'width 300ms ease-in-out' }}></div>;
  }
  
  return (
    <div 
        className="w-96 h-full glass !rounded-l-3xl !rounded-r-none !border-l-0 flex flex-col pointer-events-auto" 
        style={{ transition: 'width 300ms ease-in-out' }}
        onKeyDown={handleKeyDown}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div>
            <CardTitle>Edit System</CardTitle>
            <CardDescription>Update the details of this connection.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={closeEditor}>
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow p-4 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            name="label"
            value={formData.label || ''}
            onChange={handleInputChange}
            className="w-full"
            placeholder="e.g., Monthly Savings"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            placeholder="Describe the system or process that connects these two events."
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
      <div className="p-4 space-y-2 mt-auto">
        <Separator className="my-2" />
        <Button onClick={onDeleteEdge} variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Connection
        </Button>
      </div>
    </div>
  );
}
