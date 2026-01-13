/**
 * Request Type Step
 *
 * First step of the form where user selects the type of art request.
 * Determines which conditional fields appear in later steps.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { FormData, RequestType } from '@/types/form';
import { Palette, Image, Presentation, FileCheck, Eye, Sunrise } from 'lucide-react';

const requestTypes: Array<{
  value: RequestType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'Creative Design Services',
    label: 'Creative Design Services',
    description: 'Custom creative design work',
    icon: Palette,
  },
  {
    value: 'Mockup',
    label: 'Mockup',
    description: 'Product mockup visualization',
    icon: Image,
  },
  {
    value: 'PPTX',
    label: 'PPTX',
    description: 'PowerPoint presentation',
    icon: Presentation,
  },
  {
    value: 'Proofs',
    label: 'Proofs',
    description: 'Design proofs and approvals',
    icon: FileCheck,
  },
  {
    value: 'Sneak Peek',
    label: 'Sneak Peek',
    description: 'Preview or sneak peek content',
    icon: Eye,
  },
  {
    value: 'Rise & Shine',
    label: 'Rise & Shine',
    description: 'Rise & Shine presentation',
    icon: Sunrise,
  },
];

export function RequestTypeStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();
  const selectedType = watch('requestType');

  const handleSelect = (type: RequestType) => {
    setValue('requestType', type, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" {...register('requestType')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requestTypes.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            aria-pressed={selectedType === value}
            aria-label={`Select ${label}: ${description}`}
            className={`group relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedType === value
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]'
                : 'border-zinc-200 hover:border-primary/40 hover:bg-zinc-50 hover:shadow-md hover:scale-[1.01]'
            }`}
          >
            {/* Icon with enhanced animation */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                selectedType === value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-primary/10 group-hover:text-primary'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="font-semibold text-midnight text-base mb-1">{label}</div>
              <div className="text-sm text-zinc-600 leading-relaxed">{description}</div>
            </div>

            {/* Selected Indicator with animation */}
            {selectedType === value && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path d="M10.28 2.28L4.5 8.06l-2.78-2.78L0 7l4.5 4.5 7.5-7.5z" />
                </svg>
              </div>
            )}

            {/* Hover indicator for unselected cards */}
            {selectedType !== value && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-opacity-0 group-hover:ring-opacity-20 transition-all duration-200 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {errors.requestType && (
        <div
          className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errors.requestType.message}
        </div>
      )}
    </div>
  );
}
