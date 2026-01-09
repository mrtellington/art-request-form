/**
 * Basic Info Step
 *
 * Third step where user enters basic request information:
 * - Requestor name and email
 * - Region
 * - Request title
 * - Due date and time
 */

'use client';

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

const regions: Array<{ value: Region; label: string }> = [
  { value: 'US', label: 'United States' },
  { value: 'CAD', label: 'Canada' },
  { value: 'EU', label: 'Europe' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'APAC', label: 'Asia Pacific' },
];

export function BasicInfoStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();

  const region = watch('region');

  return (
    <div className="space-y-6">
      {/* Requestor Name */}
      <div>
        <Label htmlFor="requestorName" className="text-base font-semibold">
          Your Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="requestorName"
          {...register('requestorName')}
          placeholder="First Last"
          className="mt-2"
        />
        {errors.requestorName && (
          <p className="text-sm text-red-600 mt-2">
            {errors.requestorName.message}
          </p>
        )}
      </div>

      {/* Requestor Email */}
      <div>
        <Label htmlFor="requestorEmail" className="text-base font-semibold">
          Your Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="requestorEmail"
          type="email"
          {...register('requestorEmail')}
          placeholder="you@whitestonebranding.com"
          className="mt-2"
          readOnly
        />
        <p className="text-xs text-zinc-500 mt-1">
          Your email is auto-filled from your login
        </p>
        {errors.requestorEmail && (
          <p className="text-sm text-red-600 mt-2">
            {errors.requestorEmail.message}
          </p>
        )}
      </div>

      {/* Region */}
      <div>
        <Label htmlFor="region" className="text-base font-semibold">
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
          <SelectTrigger id="region">
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
        <Label htmlFor="requestTitle" className="text-base font-semibold">
          Request Title <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          A brief, descriptive title for this request
        </p>
        <Input
          id="requestTitle"
          {...register('requestTitle')}
          placeholder="e.g., Water Bottle Mockup for Q1 Campaign"
          className="mt-2"
        />
        {errors.requestTitle && (
          <p className="text-sm text-red-600 mt-2">
            {errors.requestTitle.message}
          </p>
        )}
      </div>

      {/* Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate" className="text-base font-semibold">
            Due Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            className="mt-2"
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600 mt-2">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="dueTime" className="text-base font-semibold">
            Due Time <span className="text-zinc-500 text-sm">(Optional)</span>
          </Label>
          <Input
            id="dueTime"
            type="time"
            {...register('dueTime')}
            className="mt-2"
          />
          <p className="text-xs text-zinc-500 mt-1">Eastern Standard Time</p>
          {errors.dueTime && (
            <p className="text-sm text-red-600 mt-2">
              {errors.dueTime.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
