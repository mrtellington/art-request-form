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
import { FormData, Region, RiseAndShineLevel } from '@/types/form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip-simple';
import { DatePickerEnhanced } from '@/components/ui/date-picker-enhanced';
import {
  RISE_AND_SHINE_LEVELS,
  ASANA_BOARD_URL,
  FOLLOW_TEMPLATE_URL,
} from '@/lib/constants/rise-and-shine';
import {
  MOCKUP_TYPE_OPTIONS,
  PPTX_TYPE_OPTIONS,
  PROOF_TYPE_OPTIONS,
} from '@/lib/constants/type-options';
import { PresentationStructure } from '../fields/PresentationStructure';

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

  // Watch form values
  const requestType = watch('requestType');
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
            <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-auto">
              <div className="p-2 bg-zinc-50 border-b border-zinc-200">
                <p className="text-xs text-zinc-600 font-medium">
                  {searchResults.length} client{searchResults.length !== 1 ? 's' : ''}{' '}
                  found
                </p>
              </div>
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/5 focus:bg-primary/5 focus:outline-none border-b border-zinc-100 last:border-b-0 transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900 group-hover:text-primary transition-colors">
                      {client.name}
                    </span>
                    <svg
                      className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
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
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Client Found in commonsku
            </p>
            <p className="text-xs text-green-700 mt-1">
              This request will be linked to the existing client record
            </p>
          </div>
        </div>
      )}

      {!isSearching &&
        !clientExists &&
        clientName &&
        clientName.length >= 2 &&
        searchResults.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Client not found in commonsku
              </p>
              <p className="text-xs text-amber-700 mt-1">
                A new client record may be created. You can proceed if this is correct.
              </p>
            </div>
          </div>
        )}

      {/* Hidden fields */}
      <input type="hidden" {...register('clientExists')} />
      <input type="hidden" {...register('clientId')} />

      {/* Client Type - Required for all request types */}
      <div>
        <Label htmlFor="clientType">
          Client Type <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Select the client relationship type
        </p>
        <Select
          value={watch('clientType') || undefined}
          onValueChange={(value) =>
            setValue('clientType', value as 'Prospect' | 'Client' | 'Enterprise', {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="clientType" tabIndex={4}>
            <SelectValue placeholder="Select client type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Client">Client</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        {errors.clientType && (
          <p className="text-sm text-red-600 mt-2">{errors.clientType.message}</p>
        )}
      </div>

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
          <SelectTrigger id="region" tabIndex={5}>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="requestTitle">
            Request Title <span className="text-red-500">*</span>
          </Label>
          {watch('requestTitle') && (
            <span className="text-xs text-zinc-500">
              {watch('requestTitle').length} characters
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          A brief, descriptive title for this request
        </p>
        <div className="relative">
          <Input
            id="requestTitle"
            tabIndex={6}
            {...register('requestTitle')}
            placeholder="e.g., Water Bottle Mockup for Q1 Campaign"
            className={`pr-10 ${errors.requestTitle ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {watch('requestTitle') && watch('requestTitle').length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {watch('requestTitle').length > 5 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
          )}
        </div>
        {errors.requestTitle ? (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.requestTitle.message}
          </p>
        ) : watch('requestTitle') &&
          watch('requestTitle').length > 0 &&
          watch('requestTitle').length < 6 ? (
          <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Consider adding more detail to your title
          </p>
        ) : null}
      </div>

      {/* Type-Specific Fields - Conditionally rendered based on requestType */}
      {requestType === 'Mockup' && (
        <div>
          <Label htmlFor="mockupType">
            Mockup Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('mockupType') || undefined}
            onValueChange={(value) =>
              setValue('mockupType', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="mockupType" className="mt-2">
              <SelectValue placeholder="Select mockup type" />
            </SelectTrigger>
            <SelectContent>
              {MOCKUP_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.mockupType && (
            <p className="text-sm text-red-600 mt-2">{errors.mockupType.message}</p>
          )}
        </div>
      )}

      {requestType === 'PPTX' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="pptxType">
              PPTX Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('pptxType') || undefined}
              onValueChange={(value) =>
                setValue('pptxType', value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="pptxType" className="mt-2">
                <SelectValue placeholder="Select PPTX type" />
              </SelectTrigger>
              <SelectContent>
                {PPTX_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pptxType && (
              <p className="text-sm text-red-600 mt-2">{errors.pptxType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numberOfSlides">
              Number of Slides <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfSlides"
              type="number"
              min="1"
              {...register('numberOfSlides', { valueAsNumber: true })}
              placeholder="e.g., 10"
              className="mt-2"
            />
            {errors.numberOfSlides && (
              <p className="text-sm text-red-600 mt-2">{errors.numberOfSlides.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="presentationStructure">Presentation Structure</Label>
            <Textarea
              id="presentationStructure"
              {...register('presentationStructure')}
              placeholder="Outline the structure or flow of the presentation..."
              rows={4}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {requestType === 'Proofs' && (
        <div>
          <Label htmlFor="proofType">
            Proof Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('proofType') || undefined}
            onValueChange={(value) =>
              setValue('proofType', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="proofType" className="mt-2">
              <SelectValue placeholder="Select proof type" />
            </SelectTrigger>
            <SelectContent>
              {PROOF_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.proofType && (
            <p className="text-sm text-red-600 mt-2">{errors.proofType.message}</p>
          )}
        </div>
      )}

      {requestType === 'Sneak Peek' && (
        <div>
          <Label htmlFor="sneakPeekOptions">
            Sneak Peek Options <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="sneakPeekOptions"
            {...register('sneakPeekOptions')}
            placeholder="Describe what you'd like to preview..."
            rows={4}
            className="mt-2"
          />
          {errors.sneakPeekOptions && (
            <p className="text-sm text-red-600 mt-2">{errors.sneakPeekOptions.message}</p>
          )}
        </div>
      )}

      {requestType === 'Rise & Shine' && (
        <RiseAndShineSection watch={watch} setValue={setValue} errors={errors} />
      )}

      {/* Project Number - shown for all types except Sneak Peek */}
      {requestType !== 'Sneak Peek' && (
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="projectNumber">
              Project# <span className="text-zinc-500 text-sm">(Optional)</span>
            </Label>
            <Tooltip content="The commonsku project reference number. This is a numeric identifier used to link this art request to an existing project in commonsku. You can find this in the project URL or project details page." />
          </div>
          <p className="text-sm text-zinc-600 mt-1 mb-3">
            commonsku project reference number (numbers only)
          </p>
          <Input
            id="projectNumber"
            tabIndex={7}
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
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.projectNumber.message}
            </p>
          )}
        </div>
      )}

      {/* Due Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">
            Due Date <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2">
            <DatePickerEnhanced
              id="dueDate"
              value={watch('dueDate')}
              onChange={(value) => setValue('dueDate', value, { shouldValidate: true })}
              error={errors.dueDate?.message}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dueTime">
            Due Time <span className="text-zinc-500 text-sm">(Optional)</span>
          </Label>
          <div className="relative mt-2">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Input
              id="dueTime"
              type="time"
              tabIndex={8}
              {...register('dueTime')}
              className="pl-10"
              defaultValue="18:00"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Eastern Standard Time (EST)
          </p>
          {errors.dueTime && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.dueTime.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Rise & Shine Section Component
 * Shows level-specific messaging and presentation structure
 */
interface RiseAndShineSectionProps {
  watch: ReturnType<typeof useFormContext<FormData>>['watch'];
  setValue: ReturnType<typeof useFormContext<FormData>>['setValue'];
  errors: ReturnType<typeof useFormContext<FormData>>['formState']['errors'];
}

function RiseAndShineSection({ watch, setValue, errors }: RiseAndShineSectionProps) {
  const riseAndShineLevel = watch('riseAndShineLevel');
  const levelConfig = riseAndShineLevel ? RISE_AND_SHINE_LEVELS[riseAndShineLevel] : null;

  return (
    <div className="space-y-6">
      {/* Rise & Shine Level Dropdown */}
      <div>
        <Label htmlFor="riseAndShineLevel">
          Rise & Shine Level <span className="text-red-500">*</span>
        </Label>
        <Select
          value={riseAndShineLevel || undefined}
          onValueChange={(value) =>
            setValue('riseAndShineLevel', value as RiseAndShineLevel, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="riseAndShineLevel" className="mt-2">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
          </SelectContent>
        </Select>
        {errors.riseAndShineLevel && (
          <p className="text-sm text-red-600 mt-2">{errors.riseAndShineLevel.message}</p>
        )}
      </div>

      {/* Level-Specific Messaging */}
      {levelConfig && (
        <div className="space-y-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-800">{levelConfig.title}:</h3>

          <p className="text-sm text-zinc-700">{levelConfig.description}</p>

          <div className="space-y-2">
            <p className="text-sm text-zinc-600">
              Look at the{' '}
              <a
                href={ASANA_BOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 underline inline-flex items-center gap-1"
              >
                Asana board
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              to compose a reasonable deadline.
            </p>

            <p className="text-sm font-medium text-zinc-700">
              Video Call REQUIRED -{' '}
              <a
                href={FOLLOW_TEMPLATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 underline inline-flex items-center gap-1"
              >
                FOLLOW TEMPLATE
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <p
            className={`text-sm font-medium ${levelConfig.eligibilityColor === 'red' ? 'text-red-600' : 'text-sky-600'}`}
          >
            {levelConfig.eligibility}
          </p>

          {levelConfig.extraNote && (
            <p className="text-sm text-zinc-600 italic">{levelConfig.extraNote}</p>
          )}
        </div>
      )}

      {/* Presentation Structure - Only show when level is selected */}
      {riseAndShineLevel && <PresentationStructure />}
    </div>
  );
}
