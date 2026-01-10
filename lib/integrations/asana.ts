/**
 * Asana Integration
 *
 * Creates tasks in Asana Art Request board with custom fields.
 * Maps form data to Asana task properties and custom fields.
 */

import { FormData } from '@/types/form';
import { buildAsanaDescription, formatCustomFields } from '@/lib/utils/formatters';

const ASANA_API_URL = 'https://app.asana.com/api/1.0';

/**
 * Get Asana API headers
 */
function getAsanaHeaders(): HeadersInit {
  const token = process.env.ASANA_ACCESS_TOKEN;

  if (!token) {
    throw new Error('ASANA_ACCESS_TOKEN environment variable not set');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create an Asana task for the art request
 * Returns task GID and URL
 */
export async function createAsanaTask(
  formData: FormData,
  googleDriveFolderUrl?: string
): Promise<{ taskId: string; taskUrl: string }> {
  try {
    const projectId = process.env.ASANA_PROJECT_ID;

    if (!projectId) {
      throw new Error('ASANA_PROJECT_ID environment variable not set');
    }

    // Build task description (HTML format for rich text)
    let description = buildAsanaDescription(formData);

    // Add Google Drive link to description if available
    if (googleDriveFolderUrl) {
      description += `\n<strong>FILES</strong>\n<a href="${googleDriveFolderUrl}">View Files in Google Drive</a>`;
    }

    // Build custom fields (now with actual GIDs)
    const customFields = formatCustomFields(formData, googleDriveFolderUrl);

    // Prepare task data with HTML notes for rich text
    // Wrap description in <body> tags as required by Asana
    const htmlNotes = `<body>${description}</body>`;

    const taskData = {
      data: {
        name: formData.requestTitle || 'Untitled Art Request',
        html_notes: htmlNotes,
        projects: [projectId],
        due_on: formData.dueDate || undefined,
        custom_fields: customFields,
      },
    };

    // Create task
    const response = await fetch(`${ASANA_API_URL}/tasks`, {
      method: 'POST',
      headers: getAsanaHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Asana API error: ${errorData.errors?.[0]?.message || response.statusText}`
      );
    }

    const result = await response.json();
    const taskId = result.data.gid;
    const taskUrl = `https://app.asana.com/0/${projectId}/${taskId}`;

    return { taskId, taskUrl };
  } catch (error) {
    console.error('Error creating Asana task:', error);
    throw new Error(
      `Failed to create Asana task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Add a comment to an existing Asana task
 */
export async function addCommentToTask(taskId: string, comment: string): Promise<void> {
  try {
    const response = await fetch(`${ASANA_API_URL}/tasks/${taskId}/stories`, {
      method: 'POST',
      headers: getAsanaHeaders(),
      body: JSON.stringify({
        data: {
          text: comment,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Asana API error: ${errorData.errors?.[0]?.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error('Error adding comment to Asana task:', error);
    // Don't throw - comments are not critical
  }
}

/**
 * Attach a file URL to an Asana task
 */
export async function attachUrlToTask(
  taskId: string,
  url: string,
  name: string
): Promise<void> {
  try {
    const response = await fetch(`${ASANA_API_URL}/attachments`, {
      method: 'POST',
      headers: getAsanaHeaders(),
      body: JSON.stringify({
        data: {
          parent: taskId,
          resource_subtype: 'external',
          name: name,
          url: url,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Asana API error: ${errorData.errors?.[0]?.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error('Error attaching URL to Asana task:', error);
    // Don't throw - attachments are not critical
  }
}

/**
 * Add followers to an Asana task
 */
export async function addFollowersToTask(
  taskId: string,
  followers: string[]
): Promise<void> {
  try {
    // Asana API expects user GIDs, not email addresses
    // In a production environment, you would need to:
    // 1. Map email addresses to Asana user GIDs
    // 2. Use the /users endpoint to find users by email
    // For now, we'll add this as a comment instead

    if (followers.length > 0) {
      const comment = `Collaborators to notify: ${followers.join(', ')}`;
      await addCommentToTask(taskId, comment);
    }
  } catch (error) {
    console.error('Error adding followers to Asana task:', error);
    // Don't throw - followers are not critical
  }
}

/**
 * Complete Asana integration
 * Creates task, adds comments, and attaches files
 */
export async function handleAsanaIntegration(
  formData: FormData,
  googleDriveFolderUrl?: string,
  uploadedFiles?: Array<{ id: string; name: string; url: string }>
): Promise<{ taskId: string; taskUrl: string }> {
  // Create task
  const { taskId, taskUrl } = await createAsanaTask(formData, googleDriveFolderUrl);

  // Add followers/collaborators
  if (
    formData.addCollaborators &&
    formData.collaborators &&
    formData.collaborators.length > 0
  ) {
    await addFollowersToTask(taskId, formData.collaborators);
  }

  // Attach individual files if they were uploaded
  if (uploadedFiles && uploadedFiles.length > 0) {
    for (const file of uploadedFiles) {
      await attachUrlToTask(taskId, file.url, file.name);
    }
  }

  return { taskId, taskUrl };
}
