'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  onSelect: (value: string) => void;
  value?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  onSelect,
  value,
  className
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? '' : currentValue;
    onSelect(newValue);
    setOpen(false);
    setSearch('');
  };

  const selectedOption = options.find((option) => option.value === value);

  // Efecto para enfocar el input cuando se abre el select
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  return (
    <div className={cn('relative w-full', className)}>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <span
          className={
            selectedOption ? 'text-foreground' : 'text-muted-foreground'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className='h-4 w-4 opacity-50' />
      </button>

      {open && (
        <div className='absolute top-full z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md'>
          <div className='flex items-center border-b border-input px-3'>
            <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
            <input
              ref={searchInputRef}
              type='text'
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground'
            />
          </div>

          <div className='max-h-[200px] overflow-y-auto p-1'>
            {filteredOptions.length === 0 ? (
              <div className='px-2 py-2 text-sm text-muted-foreground'>
                No se encontraron resultados.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => handleSelect(option.value)}
                  className='relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {open && (
        <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
