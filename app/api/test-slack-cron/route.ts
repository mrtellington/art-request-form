/**
 * Test Slack Cron Notifications
 *
 * Sends test Slack messages for cron job success and error notifications.
 * Access: /api/test-slack-cron?type=success or ?type=error
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendSlackCronSuccessNotification,
  sendSlackCronErrorNotification,
} from '@/lib/integrations/slack';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.searchParams;
    const type = searchParams.get('type') || 'success';

    if (type === 'success') {
      // Send test success notification
      await sendSlackCronSuccessNotification(5337, 12.3);
      return NextResponse.json({
        success: true,
        message: 'Test success notification sent',
        type: 'success',
      });
    } else if (type === 'error') {
      // Send test error notification
      const testError = new Error(
        'Test error: CommonSKU API connection timeout after 30s'
      );
      await sendSlackCronErrorNotification(testError);
      return NextResponse.json({
        success: true,
        message: 'Test error notification sent',
        type: 'error',
      });
    } else if (type === 'both') {
      // Send both notifications
      await sendSlackCronSuccessNotification(5337, 12.3);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between messages
      const testError = new Error(
        'Test error: CommonSKU API connection timeout after 30s'
      );
      await sendSlackCronErrorNotification(testError);
      return NextResponse.json({
        success: true,
        message: 'Test success and error notifications sent',
        type: 'both',
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid type. Use ?type=success, ?type=error, or ?type=both',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test Slack notification failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
