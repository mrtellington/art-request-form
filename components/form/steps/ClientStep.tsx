/**
 * Client Step
 *
 * Second step where user enters client information.
 * Features autocomplete search against cached commonsku clients.
 * Allows "Not Listed" clients to proceed without being in the database.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader2, Search } from 'lucide-react';

interface ClientResult {
  id: string;
  name: string;
}

export function ClientStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  const clientName = watch('clientName');
  const clientExists = watch('clientExists');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ClientResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced client search
  useEffect(() => {
    // Don't search if user selected from list
    if (selectedFromList) {
      setSelectedFromList(false);
      return;
    }

    if (!clientName || clientName.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setValue('clientExists', false);
      setValue('clientId', undefined);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search-clients?q=${encodeURIComponent(clientName)}`
        );
        const data = await response.json();

        setSearchResults(data.clients || []);
        setShowDropdown(data.clients?.length > 0);

        // Check for exact match (case-insensitive)
        const exactMatch = data.clients?.find(
          (c: ClientResult) => c.name.toLowerCase() === clientName.toLowerCase()
        );

        if (exactMatch) {
          setValue('clientExists', true);
          setValue('clientId', exactMatch.id);
        } else {
          setValue('clientExists', false);
          setValue('clientId', undefined);
        }
      } catch (error) {
        console.error('Client search error:', error);
        setSearchResults([]);
        setValue('clientExists', false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [clientName, setValue, selectedFromList]);

  // Handle client selection from dropdown
  const handleSelectClient = (client: ClientResult) => {
    setSelectedFromList(true);
    setValue('clientName', client.name);
    setValue('clientExists', true);
    setValue('clientId', client.id);
    setShowDropdown(false);
    setSearchResults([]); // Clear results after selection
  };

  // Get the registration props but exclude ref since we need our own
  const { ref: registerRef, ...registerProps } = register('clientName');

  return (
    <div className="space-y-6">
      {/* Client Name Input with Autocomplete */}
      <div>
        <Label htmlFor="clientName" className="text-base font-semibold">
          Client Name <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Start typing to search for a client.
        </p>

        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              id="clientName"
              {...registerProps}
              ref={(e) => {
                registerRef(e);
                (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
              }}
              placeholder="Start typing client name..."
              className={`pl-10 pr-10 ${
                errors.clientName
                  ? 'border-red-500 focus:ring-red-500'
                  : clientExists
                    ? 'border-green-500 focus:ring-green-500'
                    : ''
              }`}
              onFocus={() => {
                if (searchResults.length > 0 && !clientExists) {
                  setShowDropdown(true);
                }
              }}
              autoComplete="off"
            />

            {/* Status Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />}
              {!isSearching && clientExists && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown - only show when not already selected */}
          {showDropdown && searchResults.length > 0 && !clientExists && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none border-b border-zinc-100 last:border-b-0 transition-colors"
                >
                  <span className="font-medium text-zinc-900">{client.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {errors.clientName && (
          <p className="text-sm text-red-600 mt-2">{errors.clientName.message}</p>
        )}
      </div>

      {/* Only show confirmation when client is found */}
      {!isSearching && clientExists && clientName && clientName.length >= 2 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 border-green-200">
          <div className="flex-shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              Client Found in commonsku
            </p>
          </div>
        </div>
      )}

      {/* Show not found message only when user has typed something and no match */}
      {!isSearching &&
        !clientExists &&
        clientName &&
        clientName.length >= 2 &&
        searchResults.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200">
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                Client not found in commonsku. Click next if ok to proceed.
              </p>
            </div>
          </div>
        )}

      {/* Hidden fields for form state */}
      <input type="hidden" {...register('clientExists')} />
      <input type="hidden" {...register('clientId')} />
    </div>
  );
}
