/**
 * Validate Collaborator API Route
 *
 * Checks if an email address exists as an active user in Asana.
 * Used when adding collaborators to ensure they can be added as followers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAsanaUser } from '@/lib/integrations/asana';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format', valid: false },
        { status: 400 }
      );
    }

    // Check if user exists in Asana
    const isValid = await validateAsanaUser(email);

    return NextResponse.json({
      success: true,
      email,
      valid: isValid,
      message: isValid ? 'User exists in Asana' : 'User not found in Asana workspace',
    });
  } catch (error) {
    console.error('Validate collaborator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        valid: false,
      },
      { status: 500 }
    );
  }
}
