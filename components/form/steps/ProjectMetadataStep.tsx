/**
 * Project Metadata Step
 *
 * Step for project metadata: budget, billable, client type, collaborators,
 * labels, project number, proof type, and pertinent information with rich text editor.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormData,
  ProjectValue,
  Billable,
  Label as FormLabel,
  ClientType,
} from '@/types/form';
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
import { Loader2, CheckCircle } from 'lucide-react';

// Dynamically import RichTextEditor to reduce initial bundle size
const RichTextEditor = dynamic(
  () =>
    import('../fields/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    loading: () => <Skeleton className="h-40 w-full" />,
    ssr: false,
  }
);

const labels: FormLabel[] = ['Call Needed', 'Rush', 'Needs Creative'];
const clientTypes: ClientType[] = ['Prospect', 'Client', 'Enterprise'];
const proofTypes = [
  'Whitestone Letterhead',
  'Tech Pack (List Specs in Pertinent Information)',
  'Supplier Template',
  'No Template (Use for Printed Materials)',
];

export function ProjectMetadataStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  const requestType = watch('requestType');
  const projectValue = watch('projectValue');
  const billable = watch('billable');
  const clientType = watch('clientType');
  const proofType = watch('proofType');
  const selectedLabels = watch('labels') || [];
  const addCollaborators = watch('addCollaborators') || false;
  const collaborators = watch('collaborators') || [];

  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail || !collaboratorEmail.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Check if already added
    if (collaborators.includes(collaboratorEmail)) {
      setValidationError('This collaborator has already been added');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate email exists in Asana
      const response = await fetch(
        `/api/validate-collaborator?email=${encodeURIComponent(collaboratorEmail)}`
      );
      const result = await response.json();

      if (!result.valid) {
        setValidationError(
          `${collaboratorEmail} is not found in Asana. Please ensure they have an active Asana account.`
        );
        return;
      }

      // Email is valid, add to collaborators
      setValue('collaborators', [...collaborators, collaboratorEmail], {
        shouldValidate: true,
      });
      setCollaboratorEmail('');
    } catch (error) {
      console.error('Error validating collaborator:', error);
      setValidationError('Failed to validate email. Please try again.');
    } finally {
      setIsValidating(false);
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
      {/* Project Number - Numeric Only */}
      <div>
        <Label htmlFor="projectNumber">
          Project# <span className="text-zinc-500 text-sm">(Optional)</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          commonsku project reference number (numbers only)
        </p>
        <Input
          id="projectNumber"
          {...register('projectNumber', {
            pattern: {
              value: /^[0-9]*$/,
              message: 'Project# must contain only numbers',
            },
          })}
          placeholder="e.g., 12345"
          inputMode="numeric"
          onChange={(e) => {
            // Only allow numeric input
            const value = e.target.value.replace(/[^0-9]/g, '');
            setValue('projectNumber', value);
          }}
        />
        {errors.projectNumber && (
          <p className="text-sm text-red-600 mt-2">{errors.projectNumber.message}</p>
        )}
      </div>

      {/* Project Value */}
      <div>
        <Label htmlFor="projectValue">
          Project Value <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">Estimated project value range</p>
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
          <p className="text-sm text-red-600 mt-2">{errors.projectValue.message}</p>
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

      {/* Client Type - Required Dropdown */}
      <div>
        <Label htmlFor="clientType">
          Client Type <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Select the client relationship type
        </p>
        <Select
          value={clientType || undefined}
          onValueChange={(value) =>
            setValue('clientType', value as ClientType, { shouldValidate: true })
          }
        >
          <SelectTrigger id="clientType">
            <SelectValue placeholder="Select client type" />
          </SelectTrigger>
          <SelectContent>
            {clientTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientType && (
          <p className="text-sm text-red-600 mt-2">{errors.clientType.message}</p>
        )}
      </div>

      {/* Proof Type - Only shown for Proofs requests */}
      {requestType === 'Proofs' && (
        <div>
          <Label htmlFor="proofType">
            Proof Type <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-zinc-600 mt-1 mb-3">
            Select the type of proof needed
          </p>
          <Select
            value={proofType || undefined}
            onValueChange={(value) =>
              setValue('proofType', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="proofType">
              <SelectValue placeholder="Select proof type" />
            </SelectTrigger>
            <SelectContent>
              {proofTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.proofType && (
            <p className="text-sm text-red-600 mt-2">{errors.proofType.message}</p>
          )}
        </div>
      )}

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
            <p className="text-sm text-zinc-600">
              Add team members who should be notified about this request. They must have
              an active Asana account.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={collaboratorEmail}
                onChange={(e) => {
                  setCollaboratorEmail(e.target.value);
                  setValidationError(null);
                }}
                placeholder="colleague@whitestonebranding.com"
                disabled={isValidating}
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
                disabled={isValidating || !collaboratorEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Add'
                )}
              </button>
            </div>

            {validationError && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                {validationError}
              </p>
            )}

            {collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">{email}</span>
                    </div>
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
              <p className="text-sm text-red-600">{errors.collaborators.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Pertinent Information - Rich Text */}
      <div>
        <Label htmlFor="pertinentInformation">
          Pertinent Information <span className="text-zinc-500 text-sm">(Optional)</span>
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
