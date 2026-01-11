/**
 * Review Step
 *
 * Final step showing all entered data for review before submission.
 * Displays formatted view of all form fields organized by section.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { FormData } from '@/types/form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function ReviewStep() {
  const { watch } = useFormContext<FormData>();
  const formData = watch();

  // Format date for display
  const formatDate = (date?: string | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (time?: string | null) => {
    if (!time) return 'Not specified';
    return time;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Review Your Request</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Please review all information before submitting. You can go back to any step to
          make changes.
        </p>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Basic Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Request Type</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.requestType || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Client Name</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.clientName || 'Not specified'}
              {formData.clientExists && (
                <span className="ml-2 text-xs text-green-600">
                  (Verified in commonsku)
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Request Title</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.requestTitle || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Region</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.region || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Submitted By</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.requestorEmail || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Requestor Name</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.requestorName || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Due Date</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatDate(formData.dueDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Due Time</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatTime(formData.dueTime)}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Request-Specific Details */}
      {formData.requestType && formData.requestType !== 'Creative Design Services' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Request Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mockup */}
            {formData.requestType === 'Mockup' && (
              <div>
                <dt className="text-sm font-medium text-zinc-500">Mockup Type</dt>
                <dd className="mt-1 text-base text-zinc-900">
                  {formData.mockupType || 'Not specified'}
                </dd>
              </div>
            )}

            {/* PPTX */}
            {formData.requestType === 'PPTX' && (
              <>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">PPTX Type</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formData.pptxType || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Number of Slides</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formData.numberOfSlides || 'Not specified'}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-zinc-500">
                    Presentation Structure
                  </dt>
                  <dd className="mt-1 text-base text-zinc-900 whitespace-pre-wrap">
                    {formData.presentationStructure || 'Not specified'}
                  </dd>
                </div>
              </>
            )}

            {/* Rise & Shine */}
            {formData.requestType === 'Rise & Shine' && (
              <>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Rise & Shine Level
                  </dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formData.riseAndShineLevel || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Number of Slides</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formData.numberOfSlides || 'Not specified'}
                  </dd>
                </div>
              </>
            )}

            {/* Proofs */}
            {formData.requestType === 'Proofs' && (
              <div>
                <dt className="text-sm font-medium text-zinc-500">Proof Type</dt>
                <dd className="mt-1 text-base text-zinc-900">
                  {formData.proofType || 'Not specified'}
                </dd>
              </div>
            )}

            {/* Sneak Peek */}
            {formData.requestType === 'Sneak Peek' && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-zinc-500">Sneak Peek Options</dt>
                <dd className="mt-1 text-base text-zinc-900 whitespace-pre-wrap">
                  {formData.sneakPeekOptions || 'Not specified'}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {/* Products - Only for Mockup requests */}
      {formData.requestType === 'Mockup' &&
        formData.products &&
        formData.products.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">
              Products ({formData.products.length})
            </h3>
            <div className="space-y-4">
              {formData.products.map((product, index) => (
                <div
                  key={product.id}
                  className="border-b border-zinc-200 last:border-0 pb-4 last:pb-0"
                >
                  <h4 className="font-medium text-zinc-900 mb-3">Product {index + 1}</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="font-medium text-zinc-500">Product Name</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.name || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Product Link</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.link ? (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {product.link}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Color</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.color || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Imprint Method</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.imprintMethod || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Imprint Color</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.imprintColor || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Imprint Location</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.location || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Size</dt>
                      <dd className="mt-1 text-zinc-900">
                        {product.size || 'Not specified'}
                      </dd>
                    </div>
                    {product.notes && (
                      <div className="md:col-span-2">
                        <dt className="font-medium text-zinc-500">Notes</dt>
                        <dd className="mt-1 text-zinc-900 whitespace-pre-wrap">
                          {product.notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Project Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Project Metadata</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.projectNumber && (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Project Number</dt>
              <dd className="mt-1 text-base text-zinc-900">{formData.projectNumber}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-zinc-500">Project Value</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.projectValue || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Billable</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formData.billable || 'Not specified'}
            </dd>
          </div>
          {formData.clientType && (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Client Type</dt>
              <dd className="mt-1 text-base text-zinc-900">{formData.clientType}</dd>
            </div>
          )}
          {formData.labels && formData.labels.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-zinc-500">Labels</dt>
              <dd className="mt-1">
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-midnight"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
          {formData.addCollaborators &&
            formData.collaborators &&
            formData.collaborators.length > 0 && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-zinc-500">Collaborators</dt>
                <dd className="mt-1">
                  <ul className="list-disc list-inside text-base text-zinc-900">
                    {formData.collaborators.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
        </dl>
      </Card>

      {/* Pertinent Information */}
      {formData.pertinentInformation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Pertinent Information
          </h3>
          <div
            className="prose prose-sm max-w-none text-zinc-900"
            dangerouslySetInnerHTML={{ __html: formData.pertinentInformation }}
          />
        </Card>
      )}

      {/* Attachments and Links */}
      {((formData.attachments && formData.attachments.length > 0) ||
        (formData.websiteLinks && formData.websiteLinks.length > 0)) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Attachments & Links
          </h3>

          {/* File Attachments */}
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="mb-6 last:mb-0">
              <Label className="text-sm font-medium text-zinc-500 mb-2 block">
                File Attachments ({formData.attachments.length})
              </Label>
              <ul className="space-y-2">
                {formData.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between bg-zinc-50 px-3 py-2 rounded"
                  >
                    <span className="text-sm text-zinc-900 truncate">{file.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {formatFileSize(file.size)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Website Links */}
          {formData.websiteLinks && formData.websiteLinks.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-zinc-500 mb-2 block">
                Website & Social Links ({formData.websiteLinks.length})
              </Label>
              <ul className="space-y-2">
                {formData.websiteLinks.map((link) => (
                  <li key={link.id} className="bg-zinc-50 px-3 py-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs font-medium text-zinc-500">
                        {link.type}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* What Happens Next */}
      <div className="bg-primary/5 border border-primary/20 text-midnight px-4 py-3 rounded text-sm">
        <p className="font-medium">What Happens Next?</p>
        <p className="mt-1">
          Upon submission, we will automatically create the Google Drive folder (if
          applicable), upload your attached files, and create the ARF in Asana. After
          successful submission, links to the folders and ARF will display on the screen.
          Please review the ARF to ensure everything is accurate.
        </p>
      </div>
    </div>
  );
}
