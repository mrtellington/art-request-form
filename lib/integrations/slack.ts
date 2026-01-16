/**
 * Slack Integration
 *
 * Sends error notifications to tech-alert channel via webhook.
 * Notifies team when submission processing fails.
 */

import { FormData } from '@/types/form';

/**
 * Send error notification to Slack
 */
export async function sendSlackErrorNotification(
  error: Error,
  formData: FormData,
  step: string,
  submissionId?: string
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_TECH_ALERT_WEBHOOK;

    if (!webhookUrl) {
      console.warn('SLACK_TECH_ALERT_WEBHOOK not configured, skipping notification');
      return;
    }

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Art Request Submission Error',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Step Failed:*\n${step}`,
            },
            {
              type: 'mrkdwn',
              text: `*Request Title:*\n${formData.requestTitle || 'Untitled'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Client:*\n${formData.clientName || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Request Type:*\n${formData.requestType || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Submitted By:*\n${formData.requestorEmail || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date().toISOString()}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error Message:*\n\`\`\`${error.message}\`\`\``,
          },
        },
      ],
    };

    // Add submission ID link if available
    if (submissionId) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Submission ID:*\n${submissionId}\n\n<${process.env.NEXT_PUBLIC_APP_URL}/admin/${submissionId}|View in Admin Dashboard>`,
        },
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    // Don't throw - Slack notifications are not critical for submission
  }
}

/**
 * Send success notification to Slack (optional)
 */
export async function sendSlackSuccessNotification(
  formData: FormData,
  asanaTaskUrl: string,
  googleDriveFolderUrl: string
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_SUCCESS_WEBHOOK;

    if (!webhookUrl) {
      // Success notifications are optional
      return;
    }

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ New Art Request Submitted',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Request Title:*\n${formData.requestTitle || 'Untitled'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Client:*\n${formData.clientName || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Request Type:*\n${formData.requestType || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Submitted By:*\n${formData.requestorEmail || 'Unknown'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Asana',
                emoji: true,
              },
              url: asanaTaskUrl,
              style: 'primary',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Files',
                emoji: true,
              },
              url: googleDriveFolderUrl,
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    // Don't throw - Slack notifications are not critical
  }
}

/**
 * Send cron job success notification to personal Slack DM
 */
export async function sendSlackCronSuccessNotification(
  clientCount: number,
  syncDuration: number
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_CRON_SUCCESS_WEBHOOK;

    if (!webhookUrl) {
      console.log('SLACK_CRON_SUCCESS_WEBHOOK not configured, skipping notification');
      return;
    }

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Client Sync Completed',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Clients Synced:*\n${clientCount.toLocaleString()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${syncDuration.toFixed(1)}s`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n✅ Success`,
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack cron notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Slack cron notification:', error);
    // Don't throw - Slack notifications are not critical
  }
}

/**
 * Send cron job error notification to personal Slack DM
 */
export async function sendSlackCronErrorNotification(error: Error): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_CRON_SUCCESS_WEBHOOK;

    if (!webhookUrl) {
      return;
    }

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Client Sync Failed',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n❌ Failed`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error Message:*\n\`\`\`${error.message}\`\`\``,
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack cron error notification:', response.statusText);
    }
  } catch (err) {
    console.error('Error sending Slack cron error notification:', err);
  }
}
