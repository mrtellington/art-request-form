/**
 * Project Metadata Step
 *
 * Step for project metadata: budget, billable, client type, collaborators,
 * labels, project number, and pertinent information with rich text editor.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { FormData, ProjectValue, Billable, Label as FormLabel } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to reduce initial bundle size
const RichTextEditor = dynamic(
  () => import('../fields/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    loading: () => <Skeleton className="h-40 w-full" />,
    ssr: false,
  }
);

const labels: FormLabel[] = ['Call Needed', 'Rush', 'Needs Creative'];

export function ProjectMetadataStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  const projectValue = watch('projectValue');
  const billable = watch('billable');
  const selectedLabels = watch('labels') || [];
  const addCollaborators = watch('addCollaborators') || false;
  const collaborators = watch('collaborators') || [];

  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const handleAddCollaborator = () => {
    if (collaboratorEmail && collaboratorEmail.includes('@')) {
      setValue('collaborators', [...collaborators, collaboratorEmail], {
        shouldValidate: true,
      });
      setCollaboratorEmail('');
    }
  };

  const handleRemoveCollaborator = (index: number) => {
    setValue(
      'collaborators',
      collaborators.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleLabelToggle = (label: FormLabel) => {
    const isSelected = selectedLabels.includes(label);
    if (isSelected) {
      setValue(
        'labels',
        selectedLabels.filter((l) => l !== label),
        { shouldValidate: true }
      );
    } else {
      setValue('labels', [...selectedLabels, label], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Number */}
      <div>
        <Label htmlFor="projectNumber">
          Project# <span className="text-zinc-500 text-sm">(Optional)</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          CommonSKU project reference number
        </p>
        <Input
          id="projectNumber"
          {...register('projectNumber')}
          placeholder="e.g., PROJ-12345"
        />
      </div>

      {/* Project Value */}
      <div>
        <Label htmlFor="projectValue">
          Project Value <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Estimated project value range
        </p>
        <Select
          value={projectValue || undefined}
          onValueChange={(value) =>
            setValue('projectValue', value as ProjectValue, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="projectValue">
            <SelectValue placeholder="Select project value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="<$50k">Less than $50k</SelectItem>
            <SelectItem value="$50k-$250k">$50k - $250k</SelectItem>
            <SelectItem value=">$250k">Greater than $250k</SelectItem>
          </SelectContent>
        </Select>
        {errors.projectValue && (
          <p className="text-sm text-red-600 mt-2">
            {errors.projectValue.message}
          </p>
        )}
      </div>

      {/* Billable */}
      <div>
        <Label htmlFor="billable">
          Billable <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Is this project billable to the client?
        </p>
        <Select
          value={billable || undefined}
          onValueChange={(value) =>
            setValue('billable', value as Billable, { shouldValidate: true })
          }
        >
          <SelectTrigger id="billable">
            <SelectValue placeholder="Select billable status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
        {errors.billable && (
          <p className="text-sm text-red-600 mt-2">{errors.billable.message}</p>
        )}
      </div>

      {/* Client Type */}
      <div>
        <Label htmlFor="clientType">
          Client Type <span className="text-zinc-500 text-sm">(Optional)</span>
        </Label>
        <Input
          id="clientType"
          {...register('clientType')}
          placeholder="e.g., Enterprise, SMB, Startup"
        />
      </div>

      {/* Labels */}
      <div>
        <Label>Labels</Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Add labels to categorize this request
        </p>
        <div className="space-y-2">
          {labels.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <Checkbox
                id={`label-${label}`}
                checked={selectedLabels.includes(label)}
                onCheckedChange={() => handleLabelToggle(label)}
              />
              <Label htmlFor={`label-${label}`} className="font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Add Collaborators */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="addCollaborators"
            checked={addCollaborators}
            onCheckedChange={(checked) =>
              setValue('addCollaborators', !!checked, { shouldValidate: true })
            }
          />
          <Label htmlFor="addCollaborators" className="font-normal cursor-pointer">
            Add Collaborators
          </Label>
        </div>

        {addCollaborators && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                placeholder="colleague@whitestonebranding.com"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCollaborator();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCollaborator}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-zinc-50 px-3 py-2 rounded"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.collaborators && (
              <p className="text-sm text-red-600">
                {errors.collaborators.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pertinent Information - Rich Text */}
      <div>
        <Label htmlFor="pertinentInformation">
          Pertinent Information{' '}
          <span className="text-zinc-500 text-sm">(Optional)</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Any additional information, context, or special instructions
        </p>
        <RichTextEditor
          value={watch('pertinentInformation')}
          onChange={(value) => setValue('pertinentInformation', value)}
          placeholder="Enter any additional details, context, or special instructions..."
        />
      </div>
    </div>
  );
}
