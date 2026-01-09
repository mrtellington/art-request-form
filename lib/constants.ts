/**
 * Asana Custom Field GID Lookups
 *
 * These are the exact GIDs from the Zapier workflow and Asana API.
 * Ported from /Users/todellington/art request agent/zapier-transformations.js
 */

export const ASANA_GIDS = {
  // Custom Field IDs
  customFields: {
    request: '1211551541910237',
    client: '1211551542058961',
    billable: '1211551542058970',
    value: '1211551542058988',
    estimatedTime: '1209588204727028',
    googleFolder: '1211701715737841',
    projectNumber: '1210695790941177',
    region: '1212310605793914'
  },

  // Request Type Enum Values
  requestTypes: {
    "Creative Design Services": "1211551541910239",
    "Mockup": "1211551541910241",
    "PPTX": "1211551541910242",
    "Proofs": "1211551541910243",
    "Sneak Peek": "1211551541910244",
    "Rise & Shine": "1211551541910244" // Note: May need separate GID if different from Sneak Peek
  },

  // Value Range Enum Values
  valueRanges: {
    "<$50k": "1211551542058989",
    "$50k-$250k": "1211551542058990",
    ">$250k": "1211551542058991"
  },

  // Billable Enum Values
  billable: {
    "Yes": "1211551542058971",
    "No": "1211551542058972"
  },

  // Region Enum Values
  regions: {
    "US": "1212310605793915",
    "CAD": "1212310605793916",
    "EU": "1212310605793917",
    "UK": "1212310605793918",
    "APAC": "1212310605793919"
  }
} as const;

/**
 * Google Drive Root Folders
 * A-L clients go to one folder, M-Z to another
 */
export const GOOGLE_DRIVE_ROOT_FOLDERS = {
  A_L: '0ADaZpFm7TUV5Uk9PVA',
  M_Z: '0AJgvSmlJR1-tUk9PVA'
} as const;

/**
 * Asana Project ID
 * Development: Use Test Art Request board
 * Production: 1211223909834951
 */
export const ASANA_PROJECT_ID = process.env.ASANA_PROJECT_ID || '1211223909834951';

/**
 * CommonSKU API Configuration
 */
export const COMMONSKU_CONFIG = {
  baseUrl: process.env.COMMONSKU_BASE_URL || 'https://fws09sh894.execute-api.us-east-1.amazonaws.com/beta',
  apiKey: process.env.COMMONSKU_API_KEY || ''
} as const;
