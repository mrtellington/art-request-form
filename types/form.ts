/**
 * Form Data Types
 *
 * Type definitions for the art request form based on the Cognito Forms schema.
 * Source: /Users/todellington/art request agent/conversation-state-schema.json
 */

export type RequestType =
  | 'Creative Design Services'
  | 'Mockup'
  | 'PPTX'
  | 'Proofs'
  | 'Sneak Peek';

export type Region = 'US' | 'CAD' | 'EU' | 'UK' | 'APAC';

export type ProjectValue = '<$50k' | '$50k-$250k' | '>$250k';

export type Billable = 'Yes' | 'No';

export type RiseAndShineLevel = 'Bronze' | 'Silver' | 'Gold';

export type Label = 'Call Needed' | 'Rush' | 'Needs Creative';

export type ClientType = 'Prospect' | 'Client' | 'Enterprise';

/**
 * Product interface - uses object structure instead of parallel arrays
 * This solves the Cognito Forms data misalignment problem
 */
export interface Product {
  id: string; // UUID for React keys
  name: string;
  color?: string;
  imprintMethod?: string;
  imprintColor?: string;
  location?: string; // Decoration location
  size?: string; // Decoration size
  link?: string; // Product URL
  notes?: string; // Other info - STAYS WITH PRODUCT
}

/**
 * Website/Social Media Link interface
 */
export interface WebsiteLink {
  id: string; // UUID for React keys
  type: string; // "Instagram", "Website", "Pinterest", etc.
  url: string;
}

/**
 * File Attachment interface
 */
export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  file?: File; // During upload (client-side only, not serializable)
  base64Data?: string; // Base64 encoded file data for server transfer
  driveFileId?: string; // After upload to Google Drive
  driveUrl?: string;
  localUrl?: string; // Blob URL for preview
}

/**
 * Slide Product interface (for Rise & Shine Presentation Structure)
 */
export interface SlideProduct {
  id: string;
  title: string;
  link?: string;
}

/**
 * Presentation Slide interface (for Rise & Shine)
 */
export interface PresentationSlide {
  id: string;
  title: string;
  products: SlideProduct[];
}

/**
 * Trend Shop interface (for Rise & Shine Additional Content)
 */
export interface TrendShop {
  id: string;
  name: string;
  link: string;
}

/**
 * Marketing Collateral interface (for Rise & Shine Additional Content)
 */
export interface MarketingCollateral {
  id: string;
  collateral: string;
  link: string;
}

/**
 * Main Form Data interface
 * All fields from the Cognito form
 */
export interface FormData {
  // Basic Information
  requestType: RequestType | null;
  requestorName: string | null; // First + Last name combined
  requestorEmail: string | null;
  region: Region | null;
  requestTitle: string | null;
  userId?: string; // User ID for draft deletion (not part of form, added at submission)

  // Client Information
  clientName: string | null;
  clientExists: boolean;
  clientId?: string; // CommonSKU client ID if exists

  // Due Date/Time
  dueDate: string | null; // ISO 8601 date
  dueTime?: string; // Time in format "HH:mm" (Eastern)

  // Project Metadata
  projectNumber?: string;
  projectValue: ProjectValue | null;
  billable: Billable | null;
  clientType: ClientType | null;

  // Collaborators
  addCollaborators: boolean;
  collaborators: string[]; // Email addresses

  // Labels
  labels: Label[];

  // Pertinent Information (Rich Text)
  pertinentInformation?: string; // HTML from TipTap editor

  // Conditional Fields (based on requestType)
  mockupType?: string;
  pptxType?: string;
  numberOfSlides?: number;
  presentationStructure?: string; // For regular PPTX (text description)
  riseAndShineLevel?: RiseAndShineLevel;
  proofType?: string;
  sneakPeekOptions?: string;

  // Rise & Shine Presentation Structure (slides with products)
  slides: PresentationSlide[];

  // Rise & Shine Additional Content
  trendShops: TrendShop[];
  marketingCollateral: MarketingCollateral[];

  // Repeatable Sections (OBJECT ARRAYS - not parallel arrays!)
  products: Product[];
  websiteLinks: WebsiteLink[];
  attachments: FileAttachment[];
}

/**
 * Initial/default form data
 */
export const initialFormData: FormData = {
  requestType: null,
  requestorName: null,
  requestorEmail: null,
  region: 'US',
  requestTitle: null,
  clientName: null,
  clientExists: false,
  dueDate: null,
  dueTime: '18:00',
  projectValue: null,
  billable: null,
  clientType: null,
  addCollaborators: false,
  collaborators: [],
  labels: [],
  slides: [],
  trendShops: [],
  marketingCollateral: [],
  products: [],
  websiteLinks: [],
  attachments: [],
};
