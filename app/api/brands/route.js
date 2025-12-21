import { getBrands } from '@/lib/data';
import { NextResponse } from 'next/server';

// Disable caching for this API route to always fetch fresh data from MongoDB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTest = searchParams.get('includeTest') === 'true';

    const brands = await getBrands(includeTest);
    return NextResponse.json(brands, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

