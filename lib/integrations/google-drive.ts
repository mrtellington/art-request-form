/**
 * Google Drive Integration
 *
 * Creates folders and uploads files to Google Drive using service account.
 * Implements A-L/M-Z folder routing based on client name.
 */

import { google } from 'googleapis';
import { FormData, FileAttachment } from '@/types/form';
import { getParentFolderForClient, generateFolderName, sanitizeFilename } from '@/lib/utils/formatters';

// Initialize Google Drive API client
function getDriveClient() {
  const credentials = process.env.GOOGLE_DRIVE_CREDENTIALS;

  if (!credentials) {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS environment variable not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Create a Google Drive folder for the art request
 * Returns folder ID and URL
 */
export async function createGoogleDriveFolder(
  formData: FormData
): Promise<{ folderId: string; folderUrl: string }> {
  try {
    const drive = getDriveClient();
    const folderName = generateFolderName(formData);
    const parentFolderId = getParentFolderForClient(formData.clientName || '');

    if (!parentFolderId) {
      throw new Error('Parent folder ID not configured for client');
    }

    // Create folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, webViewLink',
    });

    const folderId = folder.data.id;
    const folderUrl = folder.data.webViewLink;

    if (!folderId || !folderUrl) {
      throw new Error('Failed to create Google Drive folder');
    }

    return { folderId, folderUrl };
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    throw new Error(`Failed to create Google Drive folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    });

    const fileId = uploadedFile.data.id;
    const fileUrl = uploadedFile.data.webViewLink;

    if (!fileId || !fileUrl) {
      throw new Error('Failed to upload file to Google Drive');
    }

    return { fileId, fileUrl };
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      // Error will be logged in submission document
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
      });
    }
  } catch (error) {
    console.error('Error setting folder permissions:', error);
    // Don't throw - permissions are not critical for basic functionality
  }
}

/**
 * Complete Google Drive integration
 * Creates folder, uploads files, and sets permissions
 */
export async function handleGoogleDriveIntegration(
  formData: FormData
): Promise<{
  folderId: string;
  folderUrl: string;
  uploadedFiles: Array<{ id: string; name: string; url: string }>;
}> {
  // Create folder
  const { folderId, folderUrl } = await createGoogleDriveFolder(formData);

  // Upload files if any
  let uploadedFiles: Array<{ id: string; name: string; url: string }> = [];
  if (formData.attachments && formData.attachments.length > 0) {
    uploadedFiles = await uploadFilesToDrive(formData.attachments, folderId);
  }

  // Set permissions for collaborators if specified
  if (formData.addCollaborators && formData.collaborators && formData.collaborators.length > 0) {
    await setFolderPermissions(folderId, formData.collaborators, 'writer');
  }

  return { folderId, folderUrl, uploadedFiles };
}
