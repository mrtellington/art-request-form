/**
 * Project Details Step
 *
 * Combined step for client info and basic request details:
 * - Requestor name and email (same line)
 * - Client name with autocomplete
 * - Region
 * - Request title
 * - Project number
 * - Due date and time
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData, Region } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2, Search } from 'lucide-react';

interface ClientResult {
  id: string;
  name: string;
}

const regions: Array<{ value: Region; label: string }> = [
  { value: 'US', label: 'United States' },
  { value: 'CAD', label: 'Canada' },
  { value: 'EU', label: 'Europe' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'APAC', label: 'Asia Pacific' },
];

export function ProjectDetailsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  // Client search state
  const clientName = watch('clientName');
  const clientExists = watch('clientExists');
  const region = watch('region');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ClientResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
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

  // Re-validate client on mount if there's an existing client name
  // This handles the case when switching request types and returning to this step
  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);

    // If there's a client name but we need to re-validate, trigger a search
    if (clientName && clientName.length >= 2 && !clientExists) {
      const validateExistingClient = async () => {
        setIsSearching(true);
        try {
          const response = await fetch(
            `/api/search-clients?q=${encodeURIComponent(clientName)}`
          );
          const data = await response.json();

          setSearchResults(data.clients || []);

          const exactMatch = data.clients?.find(
            (c: ClientResult) => c.name.toLowerCase() === clientName.toLowerCase()
          );

          if (exactMatch) {
            setValue('clientExists', true);
            setValue('clientId', exactMatch.id);
          }
        } catch (error) {
          console.error('Client validation error:', error);
        } finally {
          setIsSearching(false);
        }
      };

      validateExistingClient();
    }
  }, []);

  // Debounced client search for user input
  useEffect(() => {
    // Skip the initial mount - we handle that in the initialization effect
    if (!hasInitialized) return;

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
    }, 300);

    return () => clearTimeout(timer);
  }, [clientName, setValue, selectedFromList, hasInitialized]);

  const handleSelectClient = (client: ClientResult) => {
    setSelectedFromList(true);
    setValue('clientName', client.name);
    setValue('clientExists', true);
    setValue('clientId', client.id);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const { ref: registerRef, ...registerProps } = register('clientName');

  return (
    <div className="space-y-6">
      {/* Your Name and Email on same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requestorName">
            Your Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="requestorName"
            tabIndex={1}
            {...register('requestorName')}
            placeholder="First Last"
            className="mt-2"
          />
          {errors.requestorName && (
            <p className="text-sm text-red-600 mt-2">{errors.requestorName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="requestorEmail">
            Your Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="requestorEmail"
            type="email"
            tabIndex={2}
            {...register('requestorEmail')}
            placeholder="you@whitestonebranding.com"
            className="mt-2"
            readOnly
          />
          <p className="text-xs text-zinc-500 mt-1">Auto-filled from your login</p>
          {errors.requestorEmail && (
            <p className="text-sm text-red-600 mt-2">{errors.requestorEmail.message}</p>
          )}
        </div>
      </div>

      {/* Client Name with Autocomplete */}
      <div>
        <Label htmlFor="clientName">
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
              tabIndex={3}
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

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />}
              {!isSearching && clientExists && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          {showDropdown && searchResults.length > 0 && !clientExists && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  tabIndex={-1}
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

      {/* Client status messages */}
      {!isSearching && clientExists && clientName && clientName.length >= 2 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800">Client Found in commonsku</p>
        </div>
      )}

      {!isSearching &&
        !clientExists &&
        clientName &&
        clientName.length >= 2 &&
        searchResults.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800">
              Client not found in commonsku. Click next if ok to proceed.
            </p>
          </div>
        )}

      {/* Hidden fields */}
      <input type="hidden" {...register('clientExists')} />
      <input type="hidden" {...register('clientId')} />

      {/* Region */}
      <div>
        <Label htmlFor="region">
          Region <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Which region is this request for?
        </p>
        <Select
          value={region || undefined}
          onValueChange={(value) =>
            setValue('region', value as Region, { shouldValidate: true })
          }
        >
          <SelectTrigger id="region" tabIndex={4}>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && (
          <p className="text-sm text-red-600 mt-2">{errors.region.message}</p>
        )}
      </div>

      {/* Request Title */}
      <div>
        <Label htmlFor="requestTitle">
          Request Title <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          A brief, descriptive title for this request
        </p>
        <Input
          id="requestTitle"
          tabIndex={5}
          {...register('requestTitle')}
          placeholder="e.g., Water Bottle Mockup for Q1 Campaign"
          className="mt-2"
        />
        {errors.requestTitle && (
          <p className="text-sm text-red-600 mt-2">{errors.requestTitle.message}</p>
        )}
      </div>

      {/* Project Number */}
      <div>
        <Label htmlFor="projectNumber">
          Project# <span className="text-zinc-500 text-sm">(Optional)</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          commonsku project reference number (numbers only)
        </p>
        <Input
          id="projectNumber"
          tabIndex={6}
          {...register('projectNumber', {
            pattern: {
              value: /^[0-9]*$/,
              message: 'Project# must contain only numbers',
            },
          })}
          placeholder="e.g., 12345"
          inputMode="numeric"
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setValue('projectNumber', value);
          }}
        />
        {errors.projectNumber && (
          <p className="text-sm text-red-600 mt-2">{errors.projectNumber.message}</p>
        )}
      </div>

      {/* Due Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">
            Due Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dueDate"
            type="date"
            tabIndex={7}
            {...register('dueDate')}
            className="mt-2"
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600 mt-2">{errors.dueDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dueTime">
            Due Time <span className="text-zinc-500 text-sm">(Optional)</span>
          </Label>
          <Input
            id="dueTime"
            type="time"
            tabIndex={8}
            {...register('dueTime')}
            className="mt-2"
          />
          <p className="text-xs text-zinc-500 mt-1">Eastern Standard Time</p>
          {errors.dueTime && (
            <p className="text-sm text-red-600 mt-2">{errors.dueTime.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
