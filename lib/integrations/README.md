# Backend Integrations

This directory contains integration clients for external services used in the Art Request Form application.

## Integrations

### Google Drive (`google-drive.ts`)

Handles all Google Drive operations:
- **Folder Creation**: Creates folders with A-L/M-Z routing based on client name
- **File Uploads**: Uploads attachments to created folders
- **Permissions**: Sets folder permissions for collaborators
- **Folder Naming**: Uses format `YYYY-MM-DD - Client Name - Request Title`

**Environment Variables:**
- `GOOGLE_DRIVE_CREDENTIALS` - Service account credentials JSON
- `GOOGLE_DRIVE_AL_FOLDER_ID` - Parent folder ID for clients A-L
- `GOOGLE_DRIVE_MZ_FOLDER_ID` - Parent folder ID for clients M-Z
- `GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID` - Parent folder ID for unlisted clients

### Asana (`asana.ts`)

Creates and manages Asana tasks:
- **Task Creation**: Creates tasks in Art Request board with all form data
- **Description Formatting**: Converts form data to markdown description
- **Custom Fields**: Maps form fields to Asana custom field GIDs
- **Attachments**: Attaches Google Drive links to tasks
- **Comments**: Adds collaborator information as comments

**Environment Variables:**
- `ASANA_ACCESS_TOKEN` - Personal access token for Asana API
- `ASANA_PROJECT_ID` - Art Request board project ID (1211223909834951)

### Slack (`slack.ts`)

Sends notifications to Slack channels:
- **Error Notifications**: Sends alerts to #tech-alert on submission failures
- **Success Notifications**: Optional success confirmations (if webhook configured)
- **Structured Messages**: Uses Block Kit for rich formatting
- **Admin Links**: Includes links to admin dashboard for error recovery

**Environment Variables:**
- `SLACK_TECH_ALERT_WEBHOOK` - Webhook URL for error notifications
- `SLACK_SUCCESS_WEBHOOK` - (Optional) Webhook URL for success notifications

## Usage

These integrations are orchestrated by the `/api/submit` route:

```typescript
import { handleGoogleDriveIntegration } from '@/lib/integrations/google-drive';
import { handleAsanaIntegration } from '@/lib/integrations/asana';
import { sendSlackErrorNotification } from '@/lib/integrations/slack';

// Create Google Drive folder and upload files
const { folderId, folderUrl, uploadedFiles } = await handleGoogleDriveIntegration(formData);

// Create Asana task with links to Drive
const { taskId, taskUrl } = await handleAsanaIntegration(formData, folderUrl, uploadedFiles);

// Send error notification if needed
await sendSlackErrorNotification(error, formData, 'drive_folder', submissionId);
```

## Error Handling

All integration functions:
- Throw errors on critical failures (Drive folder, Asana task)
- Log errors but don't throw for non-critical operations (permissions, comments)
- Return structured error messages for Slack notifications
- Support retry logic through Firestore error tracking

## Formatting Utilities

See `lib/utils/formatters.ts` for shared formatting functions:
- `formatProducts()` - Converts product array to markdown
- `formatWebsiteLinks()` - Converts links to markdown
- `buildAsanaDescription()` - Builds complete task description
- `formatCustomFields()` - Maps form fields to Asana custom field GIDs
- `getParentFolderForClient()` - Determines Drive folder based on client name
- `generateFolderName()` - Creates standardized folder names

## Testing

To test integrations without full deployment:
1. Set up environment variables in `.env.local`
2. Configure Google Drive service account and folder IDs
3. Create test Asana board and update `ASANA_PROJECT_ID`
4. Use Postman or similar to POST to `/api/submit`
5. Check Firestore, Google Drive, Asana, and Slack for results

## Security

- Service account credentials stored securely in environment variables
- API tokens never exposed to client-side code
- Firebase Admin SDK used for server-side Firestore access
- All integrations run server-side only (API routes)
