import { getEngines } from '@/lib/data';
import { NextResponse } from 'next/server';

// Disable caching for this API route to always fetch fresh data from MongoDB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');
    const engines = await getEngines(typeId);
    return NextResponse.json(engines, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch engines' }, { status: 500 });
  }
}

