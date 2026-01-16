/**
 * Test Slack Error Notification
 *
 * Sends a test error notification to the tech-alert channel.
 * Access: /api/test-slack-error
 */

import { NextResponse } from 'next/server';
import { sendSlackErrorNotification } from '@/lib/integrations/slack';
import { FormData } from '@/types/form';

export async function GET() {
  try {
    // Create test form data
    const testFormData: FormData = {
      requestType: 'Creative Design Services',
      clientName: 'Test Client Inc.',
      requestTitle: 'Test Art Request - Slack Error Notification',
      region: 'US',
      projectValue: '$50k-$250k',
      billable: 'Yes',
      requestorName: 'Test User',
      requestorEmail: 'test@whitestonebranding.com',
      pertinentInformation: '<p>This is a test error notification.</p>',
    };

    // Create test error
    const testError = new Error(
      'Test error: Failed to create Asana task - Invalid custom field value'
    );

    // Send test error notification
    await sendSlackErrorNotification(
      testError,
      testFormData,
      'Asana Task Creation',
      'test-submission-id-12345'
    );

    return NextResponse.json({
      success: true,
      message: 'Test error notification sent to tech-alert channel',
      details: {
        channel: 'tech-alert',
        requestTitle: testFormData.requestTitle,
        error: testError.message,
      },
    });
  } catch (error) {
    console.error('Test error notification failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
