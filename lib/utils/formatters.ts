/**
 * Formatting Utilities
 *
 * Functions to transform form data into formats required by Asana, Google Drive, etc.
 * Ported from original Zapier transformations.
 */

import { FormData, Product, WebsiteLink } from '@/types/form';

/**
 * Format products array into markdown list for Asana description
 */
export function formatProducts(products: Product[]): string {
  if (!products || products.length === 0) return '';

  return products
    .map((product, index) => {
      const lines: string[] = [
        `**Product ${index + 1}: ${product.name || 'Unnamed Product'}**`,
      ];

      if (product.link) lines.push(`• Link: ${product.link}`);
      if (product.color) lines.push(`• Color: ${product.color}`);
      if (product.imprintMethod) lines.push(`• Imprint Method: ${product.imprintMethod}`);
      if (product.imprintColor) lines.push(`• Imprint Color: ${product.imprintColor}`);
      if (product.location) lines.push(`• Location: ${product.location}`);
      if (product.size) lines.push(`• Size: ${product.size}`);
      if (product.notes) lines.push(`• Notes: ${product.notes}`);

      return lines.join('\n');
    })
    .join('\n\n');
}

/**
 * Format website links array into markdown list for Asana description
 */
export function formatWebsiteLinks(links: WebsiteLink[]): string {
  if (!links || links.length === 0) return '';

  return links.map((link) => `• **${link.type}**: ${link.url}`).join('\n');
}

/**
 * Build complete Asana task description from form data
 */
export function buildAsanaDescription(formData: FormData): string {
  const sections: string[] = [];

  // Basic Information
  sections.push('## Request Details');
  sections.push(`**Request Type:** ${formData.requestType || 'Not specified'}`);
  sections.push(`**Client:** ${formData.clientName || 'Not specified'}`);
  sections.push(`**Request Title:** ${formData.requestTitle || 'Not specified'}`);
  sections.push(`**Region:** ${formData.region || 'Not specified'}`);
  sections.push(
    `**Submitted By:** ${formData.requestorName || 'Unknown'} (${formData.requestorEmail || 'no-email'})`
  );

  if (formData.dueDate) {
    sections.push(
      `**Due Date:** ${formData.dueDate}${formData.dueTime ? ` at ${formData.dueTime}` : ''}`
    );
  }

  // Request-specific details
  if (formData.requestType) {
    sections.push('\n## Request-Specific Details');

    switch (formData.requestType) {
      case 'Mockup':
        if (formData.mockupType) sections.push(`**Mockup Type:** ${formData.mockupType}`);
        break;
      case 'PPTX':
        if (formData.pptxType) sections.push(`**PPTX Type:** ${formData.pptxType}`);
        if (formData.numberOfSlides)
          sections.push(`**Number of Slides:** ${formData.numberOfSlides}`);
        if (formData.presentationStructure) {
          sections.push(`**Presentation Structure:**\n${formData.presentationStructure}`);
        }
        break;
      case 'Rise & Shine':
        if (formData.riseAndShineLevel)
          sections.push(`**Level:** ${formData.riseAndShineLevel}`);
        if (formData.numberOfSlides)
          sections.push(`**Number of Slides:** ${formData.numberOfSlides}`);
        break;
      case 'Proofs':
        if (formData.proofType) sections.push(`**Proof Type:** ${formData.proofType}`);
        break;
      case 'Sneak Peek':
        if (formData.sneakPeekOptions) {
          sections.push(`**Sneak Peek Options:**\n${formData.sneakPeekOptions}`);
        }
        break;
    }
  }

  // Products (for Mockup requests)
  if (
    formData.requestType === 'Mockup' &&
    formData.products &&
    formData.products.length > 0
  ) {
    sections.push('\n## Products');
    sections.push(formatProducts(formData.products));
  }

  // Project Metadata
  sections.push('\n## Project Information');
  if (formData.projectNumber)
    sections.push(`**Project Number:** ${formData.projectNumber}`);
  sections.push(`**Project Value:** ${formData.projectValue || 'Not specified'}`);
  sections.push(`**Billable:** ${formData.billable || 'Not specified'}`);
  if (formData.clientType) sections.push(`**Client Type:** ${formData.clientType}`);

  if (formData.labels && formData.labels.length > 0) {
    sections.push(`**Labels:** ${formData.labels.join(', ')}`);
  }

  if (
    formData.addCollaborators &&
    formData.collaborators &&
    formData.collaborators.length > 0
  ) {
    sections.push(`**Collaborators:** ${formData.collaborators.join(', ')}`);
  }

  // Pertinent Information (strip HTML tags for Asana)
  if (formData.pertinentInformation) {
    sections.push('\n## Pertinent Information');
    // Strip HTML tags but preserve line breaks
    const plainText = formData.pertinentInformation
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    sections.push(plainText);
  }

  // Website Links
  if (formData.websiteLinks && formData.websiteLinks.length > 0) {
    sections.push('\n## Website & Social Links');
    sections.push(formatWebsiteLinks(formData.websiteLinks));
  }

  return sections.join('\n');
}

/**
 * Format custom fields for Asana API
 * Maps form data to Asana custom field GIDs
 */
export function formatCustomFields(formData: FormData): Record<string, string | number> {
  const customFields: Record<string, string | number> = {};

  // Map form fields to Asana custom field GIDs
  // These GIDs come from the Asana project configuration
  // Note: Actual GIDs will need to be updated based on your Asana project setup

  // Request Type
  if (formData.requestType) {
    customFields['1234567890123456'] = formData.requestType; // Replace with actual GID
  }

  // Region
  if (formData.region) {
    customFields['1234567890123457'] = formData.region; // Replace with actual GID
  }

  // Client Name
  if (formData.clientName) {
    customFields['1234567890123458'] = formData.clientName; // Replace with actual GID
  }

  // Project Value
  if (formData.projectValue) {
    customFields['1234567890123459'] = formData.projectValue; // Replace with actual GID
  }

  // Billable
  if (formData.billable) {
    customFields['1234567890123460'] = formData.billable; // Replace with actual GID
  }

  // Due Date (if not using Asana's built-in due date)
  if (formData.dueDate) {
    customFields['1234567890123461'] = formData.dueDate; // Replace with actual GID
  }

  return customFields;
}

/**
 * Get parent folder ID for Google Drive based on first letter of client name
 * - A-L clients go to A-L folder
 * - M-Z clients go to M-Z folder
 * - Numbers/special chars default to A-L folder
 * Note: This applies regardless of whether client exists in CommonSKU
 */
export function getParentFolderForClient(clientName: string): string {
  if (!clientName) {
    // Default to A-L folder if no name
    return process.env.GOOGLE_DRIVE_AL_SHARED_DRIVE_ID || '';
  }

  const firstLetter = clientName.charAt(0).toUpperCase();

  if (firstLetter >= 'A' && firstLetter <= 'L') {
    return process.env.GOOGLE_DRIVE_AL_SHARED_DRIVE_ID || '';
  } else if (firstLetter >= 'M' && firstLetter <= 'Z') {
    return process.env.GOOGLE_DRIVE_MZ_SHARED_DRIVE_ID || '';
  } else {
    // Numbers or special characters default to A-L folder
    return process.env.GOOGLE_DRIVE_AL_SHARED_DRIVE_ID || '';
  }
}

/**
 * Generate folder name for Google Drive
 * Format: "YYYY-MM-DD - Client Name - Request Title"
 */
export function generateFolderName(formData: FormData): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const client = formData.clientName || 'Unknown Client';
  const title = formData.requestTitle || 'Untitled Request';

  return `${date} - ${client} - ${title}`;
}

/**
 * Sanitize filename for Google Drive upload
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid characters and limit length
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').substring(0, 255);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Strip HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}
