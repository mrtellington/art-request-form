/**
 * Attachments Step
 *
 * Step for file uploads and website/social media links.
 * Uses file upload component and repeatable website links section.
 */

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormData, WebsiteLink } from '@/types/form';
import { RepeatableSection } from '../fields/RepeatableSection';
import { WebsiteLinkInput } from '../fields/WebsiteLinkInput';
import { FileUpload } from '../fields/FileUpload';
import { Label } from '@/components/ui/label';

const emptyLink: Omit<WebsiteLink, 'id'> = {
  type: '',
  url: '',
};

export function AttachmentsStep() {
  const { control, watch, setValue } = useFormContext<FormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'websiteLinks',
  });

  const attachments = watch('attachments') || [];

  const handleCloneLink = (index: number) => {
    const linkToClone = fields[index];
    append({
      ...linkToClone,
      id: crypto.randomUUID(),
    });
  };

  return (
    <div className="space-y-8">
      {/* File Attachments */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Attachments or Logos
        </Label>
        <p className="text-sm text-zinc-600 mb-4">
          Upload any files, logos, or reference materials
        </p>
        <FileUpload
          files={attachments}
          onFilesChange={(files) => setValue('attachments', files)}
        />
      </div>

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
          cloneButtonLabel="Clone Link"
        />
      </div>
    </div>
  );
}
