
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Node } from 'reactflow';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface SearchNodesProps {
  nodes: Node[];
  onFocusNode: (nodeId: string) => void;
}

export function SearchNodes({ nodes, onFocusNode }: SearchNodesProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const filteredNodes = useMemo(() => {
    if (!debouncedSearch) return [];
    return nodes.filter(node =>
      node.data.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, nodes]);

  useEffect(() => {
    if(debouncedSearch && filteredNodes.length > 0 && !open) {
        setOpen(true);
    }
  }, [debouncedSearch, filteredNodes, open]);

  const handleSelect = (nodeId: string) => {
    onFocusNode(nodeId);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-start text-muted-foreground glass">
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search events..."
          />
          <CommandList>
            {filteredNodes.length === 0 && debouncedSearch && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandGroup>
              {filteredNodes.map(node => (
                <CommandItem
                  key={node.id}
                  value={node.data.title}
                  onSelect={() => handleSelect(node.id)}
                >
                  {node.data.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
