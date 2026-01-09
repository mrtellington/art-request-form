/**
 * Form Validation Schemas
 *
 * Zod schemas for validating art request form data.
 * Used for both client-side and server-side validation.
 */

import { z } from 'zod';

/**
 * Request Type Schema
 */
export const requestTypeSchema = z.enum([
  'Creative Design Services',
  'Mockup',
  'PPTX',
  'Proofs',
  'Sneak Peek',
  'Rise & Shine',
]);

/**
 * Region Schema
 */
export const regionSchema = z.enum(['US', 'CAD', 'EU', 'UK', 'APAC']);

/**
 * Project Value Schema
 */
export const projectValueSchema = z.enum(['<$50k', '$50k-$250k', '>$250k']);

/**
 * Billable Schema
 */
export const billableSchema = z.enum(['Yes', 'No']);

/**
 * Rise & Shine Level Schema
 */
export const riseAndShineLevelSchema = z.enum(['Bronze', 'Silver', 'Gold']);

/**
 * Label Schema
 */
export const labelSchema = z.enum(['Call Needed', 'Rush', 'Needs Creative']);

/**
 * Product Schema
 * Uses object structure instead of parallel arrays
 */
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  color: z.string().optional(),
  imprintMethod: z.string().optional(),
  imprintColor: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

/**
 * Website Link Schema
 */
export const websiteLinkSchema = z.object({
  id: z.string(),
  type: z.string().min(1, 'Link type is required'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
});

/**
 * File Attachment Schema
 */
export const fileAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  file: z.any().optional(), // File object
  driveFileId: z.string().optional(),
  driveUrl: z.string().optional(),
  localUrl: z.string().optional(),
});

/**
 * Email validation
 */
const emailSchema = z.string().email('Invalid email address');

/**
 * Main Form Data Schema
 * All fields from the Cognito form with validation rules
 */
export const formDataSchema = z
  .object({
    // Basic Information
    requestType: requestTypeSchema.nullable(),
    requestorName: z.string().min(1, 'Name is required').nullable(),
    requestorEmail: emailSchema.nullable(),
    region: regionSchema.nullable(),
    requestTitle: z.string().min(1, 'Request title is required').nullable(),

    // Client Information
    clientName: z.string().min(1, 'Client name is required').nullable(),
    clientExists: z.boolean(),
    clientId: z.string().optional(),

    // Due Date/Time
    dueDate: z.string().nullable(), // ISO 8601 date
    dueTime: z.string().optional(), // HH:mm format

    // Project Metadata
    projectNumber: z.string().optional(),
    projectValue: projectValueSchema.nullable(),
    billable: billableSchema.nullable(),
    clientType: z.string().nullable(),

    // Collaborators
    addCollaborators: z.boolean(),
    collaborators: z.array(emailSchema),

    // Labels
    labels: z.array(labelSchema),

    // Pertinent Information (Rich Text HTML)
    pertinentInformation: z.string().optional(),

    // Conditional Fields (based on requestType)
    mockupType: z.string().optional(),
    pptxType: z.string().optional(),
    numberOfSlides: z.number().int().positive().optional(),
    presentationStructure: z.string().optional(),
    riseAndShineLevel: riseAndShineLevelSchema.optional(),
    proofType: z.string().optional(),
    sneakPeekOptions: z.string().optional(),

    // Repeatable Sections
    products: z.array(productSchema),
    websiteLinks: z.array(websiteLinkSchema),
    attachments: z.array(fileAttachmentSchema),
  })
  .refine(
    (data) => {
      // If addCollaborators is true, must have at least one collaborator
      if (data.addCollaborators) {
        return data.collaborators.length > 0;
      }
      return true;
    },
    {
      message: 'At least one collaborator email is required',
      path: ['collaborators'],
    }
  )
  .refine(
    (data) => {
      // If requestType is Mockup, must have at least one product
      if (data.requestType === 'Mockup') {
        return data.products.length > 0;
      }
      return true;
    },
    {
      message: 'At least one product is required for Mockup requests',
      path: ['products'],
    }
  )
  .refine(
    (data) => {
      // If requestType is PPTX or Rise & Shine, numberOfSlides is required
      if (data.requestType === 'PPTX' || data.requestType === 'Rise & Shine') {
        return data.numberOfSlides !== undefined && data.numberOfSlides > 0;
      }
      return true;
    },
    {
      message: 'Number of slides is required for PPTX and Rise & Shine requests',
      path: ['numberOfSlides'],
    }
  )
  .refine(
    (data) => {
      // If requestType is Rise & Shine, riseAndShineLevel is required
      if (data.requestType === 'Rise & Shine') {
        return data.riseAndShineLevel !== undefined;
      }
      return true;
    },
    {
      message: 'Rise & Shine level is required for Rise & Shine requests',
      path: ['riseAndShineLevel'],
    }
  );

/**
 * Type inference from schema
 */
export type FormDataInput = z.input<typeof formDataSchema>;
export type FormDataOutput = z.output<typeof formDataSchema>;

/**
 * Validation helper functions
 */
export function validateFormData(data: unknown) {
  return formDataSchema.parse(data);
}

export function validateFormDataSafe(data: unknown) {
  return formDataSchema.safeParse(data);
}

/**
 * Step-specific validation schemas
 * Used for validating individual steps in the multi-step form
 */

export const requestTypeStepSchema = z.object({
  requestType: requestTypeSchema,
});

export const clientStepSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientExists: z.boolean(),
  clientId: z.string().optional(),
});

export const basicInfoStepSchema = z.object({
  requestorName: z.string().min(1, 'Name is required'),
  requestorEmail: emailSchema,
  region: regionSchema,
  requestTitle: z.string().min(1, 'Request title is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().optional(),
});

export const projectMetadataStepSchema = z.object({
  projectNumber: z.string().optional(),
  projectValue: projectValueSchema,
  billable: billableSchema,
  clientType: z.string().nullable(),
  addCollaborators: z.boolean(),
  collaborators: z.array(emailSchema),
  labels: z.array(labelSchema),
  pertinentInformation: z.string().optional(),
});

export const productsStepSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

export const attachmentsStepSchema = z.object({
  attachments: z.array(fileAttachmentSchema),
  websiteLinks: z.array(websiteLinkSchema),
});
