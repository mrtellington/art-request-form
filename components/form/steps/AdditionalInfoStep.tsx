/**
 * Additional Information Step
 *
 * Combined step for project metadata, pertinent info, websites, and attachments:
 * - Project Number, Value, Billable, Client Type
 * - Proof Type (for Proofs only)
 * - Labels and Collaborators
 * - Pertinent Information (rich text)
 * - Websites, Social, & Inspiration
 * - Attachments or Logos
 */

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormData,
  ProjectValue,
  Billable,
  Label as FormLabel,
  ClientType,
  WebsiteLink,
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
import dynamic from 'next/dynamic';
import { CheckCircle } from 'lucide-react';
import { UserAutocomplete } from '../fields/UserAutocomplete';
import { RepeatableSection } from '../fields/RepeatableSection';
import { WebsiteLinkInput } from '../fields/WebsiteLinkInput';
import { FileUpload } from '../fields/FileUpload';

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

const emptyLink: Omit<WebsiteLink, 'id'> = {
  type: '',
  url: '',
};

export function AdditionalInfoStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'websiteLinks',
  });

  const requestType = watch('requestType');
  const projectValue = watch('projectValue');
  const billable = watch('billable');
  const clientType = watch('clientType');
  const selectedLabels = watch('labels') || [];
  const addCollaborators = watch('addCollaborators') || false;
  const collaborators = watch('collaborators') || [];
  const attachments = watch('attachments') || [];

  const handleAddCollaborator = (user: { gid: string; name: string; email: string }) => {
    setValue('collaborators', [...collaborators, user.email], {
      shouldValidate: true,
    });
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

  const handleCloneLink = (index: number) => {
    const linkToClone = fields[index];
    append({
      ...linkToClone,
      id: crypto.randomUUID(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Project Metadata Section */}
      <div className="space-y-6">
        {/* Project Value - Only for Mockup, PPTX, Rise & Shine */}
        {(requestType === 'Mockup' ||
          requestType === 'PPTX' ||
          requestType === 'Rise & Shine') && (
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
              <p className="text-sm text-red-600 mt-2">{errors.projectValue.message}</p>
            )}
          </div>
        )}

        {/* Billable - Only for Creative Design Services, Mockup */}
        {(requestType === 'Creative Design Services' || requestType === 'Mockup') && (
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
        )}

        {/* Client Type */}
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
                Search for team members by name or email to add as collaborators.
              </p>
              <UserAutocomplete
                onSelect={handleAddCollaborator}
                excludeEmails={collaborators}
                placeholder="Search by name or email..."
              />

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
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200" />

      {/* Pertinent Information */}
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

      {/* Divider */}
      <div className="border-t border-zinc-200" />

      {/* Website Links */}
      <div>
        <RepeatableSection<WebsiteLink>
          items={fields}
          onAdd={(item) => append(item)}
          onRemove={(index) => remove(index)}
          onClone={handleCloneLink}
          renderItem={(link, index) => (
            <WebsiteLinkInput
              link={link}
              onChange={(updated) => update(index, updated)}
            />
          )}
          emptyTemplate={emptyLink}
          title="Websites, Social, & Inspiration"
          description="Add reference links for websites, social media, or design inspiration"
          minItems={0}
          addButtonLabel="Add Website Link"
          hideItemLabels
          showCloneButton={false}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200" />

      {/* File Attachments */}
      <div>
        <Label>Attachments or Logos</Label>
        <p className="text-sm text-zinc-600 mb-4">
          Upload any files, logos, or reference materials
        </p>
        <FileUpload
          files={attachments}
          onFilesChange={(files) => setValue('attachments', files)}
        />
      </div>
    </div>
  );
}
