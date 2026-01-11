/**
 * Request Type Step
 *
 * First step of the form where user selects the type of art request.
 * Determines which conditional fields appear in later steps.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { FormData, RequestType } from '@/types/form';
import { Label } from '@/components/ui/label';
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
      <div>
        <Label htmlFor="requestType">
          What type of request is this? <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1">
          Select the type of art request you need
        </p>
      </div>

      <input type="hidden" {...register('requestType')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requestTypes.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selectedType === value
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedType === value
                  ? 'bg-primary text-white'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-midnight">{label}</div>
              <div className="text-sm text-zinc-600 mt-0.5">{description}</div>
            </div>

            {/* Selected Indicator */}
            {selectedType === value && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M10.28 2.28L4.5 8.06l-2.78-2.78L0 7l4.5 4.5 7.5-7.5z" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {errors.requestType && (
        <p className="text-sm text-red-600">{errors.requestType.message}</p>
      )}
    </div>
  );
}
