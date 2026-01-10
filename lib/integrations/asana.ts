/**
 * Asana Integration
 *
 * Creates tasks in Asana Art Request board with custom fields.
 * Maps form data to Asana task properties and custom fields.
 */

import { FormData } from '@/types/form';
import { buildAsanaDescription, formatCustomFields } from '@/lib/utils/formatters';

const ASANA_API_URL = 'https://app.asana.com/api/1.0';

// Asana tag GIDs for labels
const ASANA_TAGS = {
  'Call Needed': process.env.ASANA_TAG_CALL_NEEDED || '',
  Rush: process.env.ASANA_TAG_RUSH || '',
  'Needs Creative': process.env.ASANA_TAG_NEEDS_CREATIVE || '',
} as Record<string, string>;

// Cache for user GID lookups
const userGidCache = new Map<string, string | null>();

// Cache for full user list (for autocomplete)
let userListCache: Array<{ gid: string; name: string; email: string }> | null = null;
let userListCacheTime = 0;
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
 * Get all Asana users in the workspace
 * Uses caching to reduce API calls
 */
export async function getAsanaUsers(): Promise<
  Array<{ gid: string; name: string; email: string }>
> {
  // Check cache
  if (userListCache && Date.now() - userListCacheTime < USER_CACHE_TTL) {
    return userListCache;
  }

  try {
    const workspaceId = process.env.ASANA_WORKSPACE_ID;
    if (!workspaceId) {
      console.warn('ASANA_WORKSPACE_ID not set, cannot fetch users');
      return [];
    }

    const response = await fetch(
      `${ASANA_API_URL}/workspaces/${workspaceId}/users?opt_fields=email,name`,
      { headers: getAsanaHeaders() }
    );

    if (!response.ok) {
      console.error('Failed to fetch Asana users');
      return [];
    }

    const result = await response.json();
    const users = (result.data || [])
      .filter((u: { email?: string; name?: string }) => u.email && u.name)
      .map((u: { gid: string; name: string; email: string }) => ({
        gid: u.gid,
        name: u.name,
        email: u.email,
      }));

    // Update cache
    userListCache = users;
    userListCacheTime = Date.now();

    // Also populate the GID cache
    for (const user of users) {
      userGidCache.set(user.email.toLowerCase(), user.gid);
    }

    return users;
  } catch (error) {
    console.error('Error fetching Asana users:', error);
    return [];
  }
}

/**
 * Search Asana users by name or email
 * Returns matching users for autocomplete
 */
export async function searchAsanaUsers(
  query: string
): Promise<Array<{ gid: string; name: string; email: string }>> {
  const users = await getAsanaUsers();

  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10); // Limit to 10 results
}

/**
 * Look up Asana user GID by email address
 * Returns null if user not found
 */
export async function getUserGidByEmail(email: string): Promise<string | null> {
  // Check cache first
  if (userGidCache.has(email)) {
    return userGidCache.get(email) || null;
  }

  try {
    const workspaceId = process.env.ASANA_WORKSPACE_ID;
    if (!workspaceId) {
      console.warn('ASANA_WORKSPACE_ID not set, cannot look up user');
      return null;
    }

    const response = await fetch(
      `${ASANA_API_URL}/workspaces/${workspaceId}/users?opt_fields=email,name`,
      { headers: getAsanaHeaders() }
    );

    if (!response.ok) {
      console.error('Failed to fetch Asana users');
      return null;
    }

    const result = await response.json();
    const users = result.data || [];

    // Find user by email (case-insensitive)
    const user = users.find(
      (u: { email?: string; gid: string }) =>
        u.email?.toLowerCase() === email.toLowerCase()
    );

    const gid = user?.gid || null;
    userGidCache.set(email, gid);
    return gid;
  } catch (error) {
    console.error('Error looking up Asana user:', error);
    userGidCache.set(email, null);
    return null;
  }
}

/**
 * Validate that an email exists as an active Asana user
 */
export async function validateAsanaUser(email: string): Promise<boolean> {
  const gid = await getUserGidByEmail(email);
  return gid !== null;
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

    // Look up requestor GID and add to custom fields
    if (formData.requestorEmail) {
      const requestorGid = await getUserGidByEmail(formData.requestorEmail);
      if (requestorGid) {
        // Requestor is a people field - needs special format
        customFields['1211831707949808'] = requestorGid;
      }
    }

    // Prepare task data with HTML notes for rich text
    // Wrap description in <body> tags as required by Asana
    const htmlNotes = `<body>${description}</body>`;

    // Build due date/time - use due_at if time is provided, otherwise due_on
    let dueOn: string | undefined;
    let dueAt: string | undefined;

    if (formData.dueDate) {
      if (formData.dueTime) {
        // Combine date and time into ISO 8601 datetime (Eastern time)
        // Format: 2026-01-19T18:00:00-05:00
        dueAt = `${formData.dueDate}T${formData.dueTime}:00-05:00`;
      } else {
        dueOn = formData.dueDate;
      }
    }

    // Collect tag GIDs for selected labels
    const tagGids: string[] = [];
    if (formData.labels && formData.labels.length > 0) {
      for (const label of formData.labels) {
        const tagGid = ASANA_TAGS[label];
        if (tagGid) {
          tagGids.push(tagGid);
        }
      }
    }

    const taskData: {
      data: {
        name: string;
        html_notes: string;
        projects: string[];
        due_on?: string;
        due_at?: string;
        custom_fields: Record<string, string | number>;
        tags?: string[];
      };
    } = {
      data: {
        name: formData.requestTitle || 'Untitled Art Request',
        html_notes: htmlNotes,
        projects: [projectId],
        custom_fields: customFields,
      },
    };

    // Add due date or datetime
    if (dueAt) {
      taskData.data.due_at = dueAt;
    } else if (dueOn) {
      taskData.data.due_on = dueOn;
    }

    // Add tags if any
    if (tagGids.length > 0) {
      taskData.data.tags = tagGids;
    }

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
 * Add followers to an Asana task by looking up user GIDs
 */
export async function addFollowersToTask(
  taskId: string,
  emails: string[]
): Promise<void> {
  try {
    if (!emails || emails.length === 0) return;

    // Look up GIDs for each email
    const followerGids: string[] = [];
    const notFoundEmails: string[] = [];

    for (const email of emails) {
      const gid = await getUserGidByEmail(email);
      if (gid) {
        followerGids.push(gid);
      } else {
        notFoundEmails.push(email);
      }
    }

    // Add followers via API if we found any
    if (followerGids.length > 0) {
      const response = await fetch(`${ASANA_API_URL}/tasks/${taskId}/addFollowers`, {
        method: 'POST',
        headers: getAsanaHeaders(),
        body: JSON.stringify({
          data: {
            followers: followerGids,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding followers:', errorData);
      }
    }

    // Add comment for any emails not found in Asana
    if (notFoundEmails.length > 0) {
      const comment = `Note: These collaborators are not in Asana: ${notFoundEmails.join(', ')}`;
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

  // Build list of followers: requestor + collaborators
  const followersToAdd: string[] = [];

  // Add requestor as follower
  if (formData.requestorEmail) {
    followersToAdd.push(formData.requestorEmail);
  }

  // Add collaborators as followers
  if (
    formData.addCollaborators &&
    formData.collaborators &&
    formData.collaborators.length > 0
  ) {
    followersToAdd.push(...formData.collaborators);
  }

  // Add all followers at once
  if (followersToAdd.length > 0) {
    await addFollowersToTask(taskId, followersToAdd);
  }

  // Attach individual files if they were uploaded
  if (uploadedFiles && uploadedFiles.length > 0) {
    for (const file of uploadedFiles) {
      await attachUrlToTask(taskId, file.url, file.name);
    }
  }

  return { taskId, taskUrl };
}
