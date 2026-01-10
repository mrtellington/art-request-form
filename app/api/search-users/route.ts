/**
 * Search Users API Route
 *
 * Searches Asana workspace users by name or email for autocomplete.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAsanaUsers } from '@/lib/integrations/asana';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    const users = await searchAsanaUsers(query);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        users: [],
      },
      { status: 500 }
    );
  }
}
