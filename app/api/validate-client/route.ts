/**
 * CommonSKU Client Validation API Route
 *
 * Validates client name against CommonSKU API.
 * Returns whether client exists and their client ID if found.
 */

import { NextRequest, NextResponse } from 'next/server';

const COMMONSKU_API_KEY = process.env.COMMONSKU_API_KEY;
const COMMONSKU_BASE_URL =
  process.env.COMMONSKU_BASE_URL ||
  'https://fws09sh894.execute-api.us-east-1.amazonaws.com/beta';

export async function GET(request: NextRequest) {
  try {
    // Get client name from query parameters
    const searchParams = request.nextUrl.searchParams;
    const clientName = searchParams.get('clientName');

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!COMMONSKU_API_KEY) {
      console.warn('CommonSKU API key not configured');
      return NextResponse.json({
        exists: false,
        message: 'CommonSKU API not configured',
      });
    }

    // Call CommonSKU API
    const response = await fetch(
      `${COMMONSKU_BASE_URL}/clients?client_name=${encodeURIComponent(clientName)}`,
      {
        headers: {
          'x-api-key': COMMONSKU_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CommonSKU API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if client exists
    const exists = data.clients && data.clients.length > 0;
    const client = exists ? data.clients[0] : null;

    return NextResponse.json({
      exists,
      clientId: client?.id || undefined,
      clientData: client || undefined,
      message: exists
        ? 'Client found in CommonSKU'
        : 'Client not found in CommonSKU',
    });
  } catch (error: any) {
    console.error('CommonSKU validation error:', error);

    return NextResponse.json(
      {
        exists: false,
        error: 'Failed to validate client',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
