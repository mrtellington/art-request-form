/**
 * Google Drive Integration
 *
 * Creates folders and uploads files to Google Drive using service account.
 * Implements full folder hierarchy:
 * Root (A-L or M-Z) > First Letter > Client Name > Year > Request Title > Subfolders
 */

import { google, drive_v3 } from 'googleapis';
import { FormData, FileAttachment } from '@/types/form';
import { sanitizeFilename } from '@/lib/utils/formatters';

// Subfolder names for each request
const REQUEST_SUBFOLDERS = ['Blanks', 'Edits', 'Proof', 'Attachments'];

// Initialize Google Drive API client
function getDriveClient(): drive_v3.Drive {
  const credentials = process.env.GOOGLE_DRIVE_CREDENTIALS;

  if (!credentials) {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS environment variable not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Get the root shared drive ID based on client name (A-L or M-Z)
 */
function getRootFolderId(clientName: string): string {
  if (!clientName) {
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
 * Find a folder by name within a parent folder
 * Returns folder ID if found, null otherwise
 */
async function findFolderByName(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string
): Promise<string | null> {
  try {
    const response = await drive.files.list({
      q: `name = '${folderName.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files[0].id || null;
    }
    return null;
  } catch (error) {
    console.error(`Error finding folder "${folderName}":`, error);
    return null;
  }
}

/**
 * Create a folder in the specified parent
 * Returns the created folder's ID
 */
async function createFolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string
): Promise<string> {
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
    supportsAllDrives: true,
  });

  if (!folder.data.id) {
    throw new Error(`Failed to create folder: ${folderName}`);
  }

  return folder.data.id;
}

/**
 * Find or create a folder by name within a parent
 * Returns the folder ID (existing or newly created)
 */
async function findOrCreateFolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string
): Promise<string> {
  // First try to find existing folder
  const existingId = await findFolderByName(drive, parentId, folderName);
  if (existingId) {
    console.log(`Found existing folder: ${folderName}`);
    return existingId;
  }

  // Create new folder if not found
  console.log(`Creating new folder: ${folderName}`);
  return await createFolder(drive, parentId, folderName);
}

/**
 * Build the complete folder path and create subfolders
 * Path: Root > First Letter > Client Name > Year > Request Title > Subfolders
 *
 * Returns the main request folder ID and URL, plus the Attachments subfolder ID
 */
export async function createGoogleDriveFolderStructure(formData: FormData): Promise<{
  folderId: string;
  folderUrl: string;
  attachmentsFolderId: string;
}> {
  const drive = getDriveClient();
  const clientName = formData.clientName || 'Unknown Client';
  const requestTitle = formData.requestTitle || 'Untitled Request';
  const year = new Date().getFullYear().toString();
  const firstLetter = clientName.charAt(0).toUpperCase();

  // Get root shared drive ID
  const rootId = getRootFolderId(clientName);
  if (!rootId) {
    throw new Error('Root folder ID not configured');
  }

  console.log(
    `Building folder path: ${firstLetter} > ${clientName} > ${year} > ${requestTitle}`
  );

  // Navigate/create folder path
  // Step 1: Find or create first letter folder (e.g., "S")
  const letterFolderId = await findOrCreateFolder(drive, rootId, firstLetter);

  // Step 2: Find or create client folder (e.g., "Spotify")
  const clientFolderId = await findOrCreateFolder(drive, letterFolderId, clientName);

  // Step 3: Find or create year folder (e.g., "2026")
  const yearFolderId = await findOrCreateFolder(drive, clientFolderId, year);

  // Step 4: Create request folder (always create new - include date for uniqueness)
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const requestFolderName = `${date} - ${requestTitle}`;
  const requestFolderId = await createFolder(drive, yearFolderId, requestFolderName);

  // Step 5: Create subfolders (Blanks, Edits, Proof, Attachments)
  let attachmentsFolderId = '';
  for (const subfolderName of REQUEST_SUBFOLDERS) {
    const subfolderId = await createFolder(drive, requestFolderId, subfolderName);
    if (subfolderName === 'Attachments') {
      attachmentsFolderId = subfolderId;
    }
  }

  // Get the folder URL
  const folderResponse = await drive.files.get({
    fileId: requestFolderId,
    fields: 'webViewLink',
    supportsAllDrives: true,
  });

  const folderUrl = folderResponse.data.webViewLink;
  if (!folderUrl) {
    throw new Error('Failed to get folder URL');
  }

  console.log(`Created folder structure: ${folderUrl}`);

  return {
    folderId: requestFolderId,
    folderUrl,
    attachmentsFolderId,
  };
}

/**
 * Upload a single file to Google Drive folder
 * Returns file ID and URL
 */
export async function uploadFileToDrive(
  file: FileAttachment,
  folderId: string
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    const drive = getDriveClient();

    if (!file.file) {
      throw new Error('File object is missing from attachment');
    }

    const sanitizedName = sanitizeFilename(file.name);

    // Convert File to Buffer for upload
    const arrayBuffer = await file.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileMetadata = {
      name: sanitizedName,
      parents: [folderId],
    };

    const media = {
      mimeType: file.mimeType,
      body: buffer,
    };

    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const fileId = uploadedFile.data.id;
    const fileUrl = uploadedFile.data.webViewLink;

    if (!fileId || !fileUrl) {
      throw new Error('Failed to upload file to Google Drive');
    }

    return { fileId, fileUrl };
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Upload multiple files to Google Drive folder
 * Returns array of uploaded file info
 */
export async function uploadFilesToDrive(
  files: FileAttachment[],
  folderId: string
): Promise<Array<{ id: string; name: string; url: string }>> {
  const uploadedFiles: Array<{ id: string; name: string; url: string }> = [];

  for (const file of files) {
    try {
      const { fileId, fileUrl } = await uploadFileToDrive(file, folderId);
      uploadedFiles.push({
        id: fileId,
        name: file.name,
        url: fileUrl,
      });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }

  return uploadedFiles;
}

/**
 * Set folder permissions (make accessible to specific users/groups)
 */
export async function setFolderPermissions(
  folderId: string,
  emailAddresses: string[],
  role: 'reader' | 'writer' | 'commenter' = 'writer'
): Promise<void> {
  try {
    const drive = getDriveClient();

    for (const email of emailAddresses) {
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          type: 'user',
          role: role,
          emailAddress: email,
        },
        sendNotificationEmail: false,
        supportsAllDrives: true,
      });
    }
  } catch (error) {
    console.error('Error setting folder permissions:', error);
    // Don't throw - permissions are not critical for basic functionality
  }
}

/**
 * Complete Google Drive integration
 * Creates folder structure, uploads files to Attachments, and sets permissions
 */
export async function handleGoogleDriveIntegration(formData: FormData): Promise<{
  folderId: string;
  folderUrl: string;
  uploadedFiles: Array<{ id: string; name: string; url: string }>;
}> {
  // Create full folder structure
  const { folderId, folderUrl, attachmentsFolderId } =
    await createGoogleDriveFolderStructure(formData);

  // Upload files to Attachments subfolder if any
  let uploadedFiles: Array<{ id: string; name: string; url: string }> = [];
  if (formData.attachments && formData.attachments.length > 0) {
    uploadedFiles = await uploadFilesToDrive(formData.attachments, attachmentsFolderId);
  }

  // Set permissions for collaborators if specified
  if (
    formData.addCollaborators &&
    formData.collaborators &&
    formData.collaborators.length > 0
  ) {
    await setFolderPermissions(folderId, formData.collaborators, 'writer');
  }

  return { folderId, folderUrl, uploadedFiles };
}
