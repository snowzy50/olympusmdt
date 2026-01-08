/**
 * Route de test pour diagnostiquer la connexion Supabase
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    config: {
      url: supabaseUrl || 'MISSING',
      key: supabaseKey ? 'SET (' + supabaseKey.length + ' chars)' : 'MISSING',
    },
    tests: {},
  };

  if (!supabaseUrl || !supabaseKey) {
    results.error = 'Missing Supabase configuration';
    return NextResponse.json(results, { status: 500 });
  }

  // Test 1: Direct fetch to agencies table
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/agencies?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();

    results.tests.directFetch = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500),
    };
  } catch (e: any) {
    results.tests.directFetch = {
      error: e.message,
      stack: e.stack,
    };
  }

  // Test 2: Check if URL is reachable
  try {
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
      },
    });
    results.tests.health = {
      status: healthResponse.status,
      statusText: healthResponse.statusText,
    };
  } catch (e: any) {
    results.tests.health = { error: e.message };
  }

  return NextResponse.json(results);
}
