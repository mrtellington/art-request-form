/**
 * Formatting Utilities
 *
 * Functions to transform form data into formats required by Asana, Google Drive, etc.
 * Uses HTML for Asana rich text descriptions.
 */

import { FormData, Product, WebsiteLink } from '@/types/form';

/**
 * Asana Custom Field GIDs
 * Retrieved from Testing Art Requests project (also same in Art Request production)
 */
const ASANA_CUSTOM_FIELDS = {
  // Request Type (enum)
  REQUEST_TYPE: '1212723982330507',
  REQUEST_TYPE_OPTIONS: {
    'Creative Design Services': '1212723982330508',
    Mockup: '1212723982330509',
    PPTX: '1212723982330510',
    Proofs: '1212723982330511',
    'Sneak Peek': '1212723982330512',
    // Note: "Rise & Shine" not in Asana enum - may need to be added
  } as Record<string, string>,

  // Client (text)
  CLIENT: '1212723982330523',

  // Billable (enum)
  BILLABLE: '1212723982330529',
  BILLABLE_OPTIONS: {
    Yes: '1212723982330530',
    No: '1212723982330531',
  } as Record<string, string>,

  // Value/Project Value (enum)
  VALUE: '1212723980470386',
  VALUE_OPTIONS: {
    '<$50k': '1212723980470387',
    '$50k-$250k': '1212723980470388',
    '>$250k': '1212723980470389',
  } as Record<string, string>,

  // Region (enum)
  REGION: '1212310605793914',
  REGION_OPTIONS: {
    US: '1212310605793915',
    CAD: '1212310605793916',
    EU: '1212310605793917',
    UK: '1212310605793918',
    APAC: '1212310605793919',
  } as Record<string, string>,

  // Google Folder URL (text)
  GOOGLE_FOLDER: '1211701715737841',

  // Project Number (text)
  PROJECT_NUMBER: '1210695790941177',

  // Estimated Time (number) - not used in form currently
  ESTIMATED_TIME: '1209588204727028',

  // Requestor (people) - requires user GID lookup
  REQUESTOR: '1211831707949808',
};

/**
 * Escape XML for product/link content (local helper before main escapeXml is defined)
 */
function escapeForXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  // Note: apostrophe ' doesn't need escaping in HTML content
}

/**
 * Ensure URL has a protocol (https:// or http://)
 */
function ensureProtocol(url: string): string {
  if (!url) return url;
  // Check if URL already has a protocol
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  // Add https:// by default
  return `https://${url}`;
}

/**
 * Format products array into HTML list for Asana description
 */
export function formatProductsHtml(products: Product[]): string {
  if (!products || products.length === 0) return '';

  return products
    .map((product, index) => {
      const lines: string[] = [
        `<strong>Product ${index + 1}: ${escapeForXml(product.name || 'Unnamed Product')}</strong>`,
      ];

      if (product.link)
        lines.push(
          `<li>Link: <a href="${escapeForXml(ensureProtocol(product.link))}">${escapeForXml(product.link)}</a></li>`
        );
      if (product.color) lines.push(`<li>Color: ${escapeForXml(product.color)}</li>`);
      if (product.imprintMethod)
        lines.push(`<li>Imprint Method: ${escapeForXml(product.imprintMethod)}</li>`);
      if (product.imprintColor)
        lines.push(`<li>Imprint Color: ${escapeForXml(product.imprintColor)}</li>`);
      if (product.location)
        lines.push(`<li>Location: ${escapeForXml(product.location)}</li>`);
      if (product.size) lines.push(`<li>Size: ${escapeForXml(product.size)}</li>`);
      if (product.notes) lines.push(`<li>Notes: ${escapeForXml(product.notes)}</li>`);

      const listItems = lines.slice(1);
      if (listItems.length > 0) {
        return `${lines[0]}<ul>${listItems.join('')}</ul>`;
      }
      return lines[0];
    })
    .join('\n');
}

/**
 * Format website links array into HTML list for Asana description
 */
export function formatWebsiteLinksHtml(links: WebsiteLink[]): string {
  if (!links || links.length === 0) return '';

  return (
    '<ul>' +
    links
      .map(
        (link) =>
          `<li><strong>${escapeForXml(link.type)}:</strong> <a href="${escapeForXml(ensureProtocol(link.url))}">${escapeForXml(link.url)}</a></li>`
      )
      .join('') +
    '</ul>'
  );
}

/**
 * Escape special characters for XML/HTML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  // Note: apostrophe ' doesn't need escaping in HTML content
}

/**
 * Build complete Asana task description from form data using HTML (rich text)
 * Uses only Asana-supported HTML tags: strong, em, u, s, code, ol, ul, li, a
 * Line breaks use \n (XHTML compliant)
 */
export function buildAsanaDescription(formData: FormData): string {
  const sections: string[] = [];

  // Define creative request types (other data is captured in custom fields)
  const creativeRequestTypes = [
    'Creative Design Services',
    'Mockup',
    'PPTX',
    'Rise & Shine',
    'Sneak Peek',
  ];
  const isCreativeRequest = creativeRequestTypes.includes(formData.requestType || '');

  if (isCreativeRequest) {
    // Simplified description for creative requests
    // Only show: Project Information (Billable, Client Type), Pertinent Information, Website Links

    // Project Information - Only Billable and Client Type
    sections.push('<strong>PROJECT INFORMATION</strong>\n');
    if (formData.billable) {
      sections.push(`<strong>Billable:</strong> ${escapeXml(formData.billable)}\n`);
    }
    if (formData.clientType) {
      sections.push(`<strong>Client Type:</strong> ${escapeXml(formData.clientType)}\n`);
    }

    // Pertinent Information - convert TipTap HTML to Asana-compatible HTML
    if (formData.pertinentInformation) {
      sections.push('\n<strong>PERTINENT INFORMATION</strong>\n');
      // Convert TipTap HTML to Asana-compatible format (preserves lists, bold, italic, links)
      const asanaHtml = convertHtmlForAsana(formData.pertinentInformation);
      sections.push(`${asanaHtml}\n`);
    }

    // Website Links
    if (formData.websiteLinks && formData.websiteLinks.length > 0) {
      sections.push('\n<strong>WEBSITE &amp; SOCIAL LINKS</strong>\n');
      sections.push(formatWebsiteLinksHtml(formData.websiteLinks));
    }
  } else {
    // Full description for non-creative requests (Proofs, etc.)

    // Basic Information - use bold text as section headers (Asana doesn't support h1-h6)
    sections.push('<strong>REQUEST DETAILS</strong>\n');
    sections.push(
      `<strong>Request Type:</strong> ${escapeXml(formData.requestType || 'Not specified')}\n`
    );
    sections.push(
      `<strong>Client:</strong> ${escapeXml(formData.clientName || 'Not specified')}\n`
    );
    sections.push(
      `<strong>Request Title:</strong> ${escapeXml(formData.requestTitle || 'Not specified')}\n`
    );
    sections.push(
      `<strong>Region:</strong> ${escapeXml(formData.region || 'Not specified')}\n`
    );
    sections.push(
      `<strong>Submitted By:</strong> ${escapeXml(formData.requestorName || 'Unknown')} (${escapeXml(formData.requestorEmail || 'no-email')})\n`
    );

    if (formData.dueDate) {
      sections.push(
        `<strong>Due Date:</strong> ${escapeXml(formData.dueDate)}${formData.dueTime ? ` at ${escapeXml(formData.dueTime)}` : ''}\n`
      );
    }

    // Request-specific details
    if (formData.requestType) {
      sections.push('\n<strong>REQUEST-SPECIFIC DETAILS</strong>\n');

      switch (formData.requestType) {
        case 'Mockup':
          if (formData.mockupType)
            sections.push(
              `<strong>Mockup Type:</strong> ${escapeXml(formData.mockupType)}\n`
            );
          break;
        case 'PPTX':
          if (formData.pptxType)
            sections.push(
              `<strong>PPTX Type:</strong> ${escapeXml(formData.pptxType)}\n`
            );
          if (formData.numberOfSlides)
            sections.push(
              `<strong>Number of Slides:</strong> ${formData.numberOfSlides}\n`
            );
          if (formData.presentationStructure) {
            sections.push(
              `<strong>Presentation Structure:</strong>\n${escapeXml(formData.presentationStructure).replace(/\n/g, '\n')}\n`
            );
          }
          break;
        case 'Rise & Shine':
          if (formData.riseAndShineLevel)
            sections.push(
              `<strong>Level:</strong> ${escapeXml(formData.riseAndShineLevel)}\n`
            );
          if (formData.numberOfSlides)
            sections.push(
              `<strong>Number of Slides:</strong> ${formData.numberOfSlides}\n`
            );
          break;
        case 'Proofs':
          if (formData.proofType)
            sections.push(
              `<strong>Proof Type:</strong> ${escapeXml(formData.proofType)}\n`
            );
          break;
        case 'Sneak Peek':
          if (formData.sneakPeekOptions) {
            sections.push(
              `<strong>Sneak Peek Options:</strong>\n${escapeXml(formData.sneakPeekOptions).replace(/\n/g, '\n')}\n`
            );
          }
          break;
      }
    }

    // Products (for Mockup and Proofs requests)
    if (
      (formData.requestType === 'Mockup' || formData.requestType === 'Proofs') &&
      formData.products &&
      formData.products.length > 0
    ) {
      sections.push('\n<strong>PRODUCTS</strong>\n');
      sections.push(formatProductsHtml(formData.products));
    }

    // Project Metadata
    sections.push('\n<strong>PROJECT INFORMATION</strong>\n');
    if (formData.projectNumber)
      sections.push(
        `<strong>Project Number:</strong> ${escapeXml(formData.projectNumber)}\n`
      );
    sections.push(
      `<strong>Project Value:</strong> ${escapeXml(formData.projectValue || 'Not specified')}\n`
    );
    sections.push(
      `<strong>Billable:</strong> ${escapeXml(formData.billable || 'Not specified')}\n`
    );
    if (formData.clientType)
      sections.push(`<strong>Client Type:</strong> ${escapeXml(formData.clientType)}\n`);

    if (formData.labels && formData.labels.length > 0) {
      sections.push(
        `<strong>Labels:</strong> ${formData.labels.map((l) => escapeXml(l)).join(', ')}\n`
      );
    }

    if (
      formData.addCollaborators &&
      formData.collaborators &&
      formData.collaborators.length > 0
    ) {
      sections.push(
        `<strong>Collaborators:</strong> ${formData.collaborators.map((c) => escapeXml(c)).join(', ')}\n`
      );
    }

    // Pertinent Information - convert TipTap HTML to Asana-compatible HTML
    if (formData.pertinentInformation) {
      sections.push('\n<strong>PERTINENT INFORMATION</strong>\n');
      // Convert TipTap HTML to Asana-compatible format (preserves lists, bold, italic, links)
      const asanaHtml = convertHtmlForAsana(formData.pertinentInformation);
      sections.push(`${asanaHtml}\n`);
    }

    // Website Links
    if (formData.websiteLinks && formData.websiteLinks.length > 0) {
      sections.push('\n<strong>WEBSITE &amp; SOCIAL LINKS</strong>\n');
      sections.push(formatWebsiteLinksHtml(formData.websiteLinks));
    }
  }

  return sections.join('');
}

/**
 * Format custom fields for Asana API
 * Maps form data to Asana custom field GIDs
 * For enum fields, we pass the option GID as the value
 */
export function formatCustomFields(
  formData: FormData,
  googleDriveFolderUrl?: string
): Record<string, string | number> {
  const customFields: Record<string, string | number> = {};

  // Request Type (enum) - map to option GID
  if (formData.requestType) {
    const optionGid = ASANA_CUSTOM_FIELDS.REQUEST_TYPE_OPTIONS[formData.requestType];
    if (optionGid) {
      customFields[ASANA_CUSTOM_FIELDS.REQUEST_TYPE] = optionGid;
    }
  }

  // Client (text)
  if (formData.clientName) {
    customFields[ASANA_CUSTOM_FIELDS.CLIENT] = formData.clientName;
  }

  // Billable (enum) - map to option GID
  if (formData.billable) {
    const optionGid = ASANA_CUSTOM_FIELDS.BILLABLE_OPTIONS[formData.billable];
    if (optionGid) {
      customFields[ASANA_CUSTOM_FIELDS.BILLABLE] = optionGid;
    }
  }

  // Project Value (enum) - map to option GID
  if (formData.projectValue) {
    const optionGid = ASANA_CUSTOM_FIELDS.VALUE_OPTIONS[formData.projectValue];
    if (optionGid) {
      customFields[ASANA_CUSTOM_FIELDS.VALUE] = optionGid;
    }
  }

  // Region (enum) - map to option GID
  if (formData.region) {
    const optionGid = ASANA_CUSTOM_FIELDS.REGION_OPTIONS[formData.region];
    if (optionGid) {
      customFields[ASANA_CUSTOM_FIELDS.REGION] = optionGid;
    }
  }

  // Project Number (text)
  if (formData.projectNumber) {
    customFields[ASANA_CUSTOM_FIELDS.PROJECT_NUMBER] = formData.projectNumber;
  }

  // Google Folder URL (text)
  if (googleDriveFolderUrl) {
    customFields[ASANA_CUSTOM_FIELDS.GOOGLE_FOLDER] = googleDriveFolderUrl;
  }

  return customFields;
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

/**
 * Convert TipTap HTML to Asana-compatible HTML
 * Preserves lists (ul, ol, li), bold, italic, links
 * Converts paragraphs and line breaks appropriately
 * Strips unsupported attributes (Asana only allows href on anchor tags)
 */
export function convertHtmlForAsana(html: string): string {
  if (!html) return '';

  // Convert <p> tags to newlines (Asana doesn't use <p>)
  let result = html
    .replace(/<p><\/p>/gi, '\n') // Empty paragraphs to newline
    .replace(/<p>/gi, '') // Remove opening <p>
    .replace(/<\/p>/gi, '\n'); // Closing </p> to newline

  // Convert <br> tags to newlines
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Strip all attributes from anchor tags except href
  // TipTap adds class="..." which Asana rejects
  // Also ensure URLs have a protocol
  result = result.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>/gi, (match, url) => {
    const validUrl = ensureProtocol(url);
    return `<a href="${validUrl}">`;
  });

  // Remove any unsupported tags but keep their content
  // Asana supports: strong, em, u, s, code, ol, ul, li, a
  // We need to strip things like <div>, <span>, etc.
  result = result.replace(/<\/?(?!(?:strong|em|u|s|code|ol|ul|li|a)\b)[a-z][^>]*>/gi, '');

  // Clean up multiple newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

// Legacy exports for backwards compatibility (no longer used)
export function formatProducts(products: Product[]): string {
  return formatProductsHtml(products);
}

export function formatWebsiteLinks(links: WebsiteLink[]): string {
  return formatWebsiteLinksHtml(links);
}
