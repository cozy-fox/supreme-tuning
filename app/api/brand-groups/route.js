import { NextResponse } from 'next/server';
import { getGroups, brandHasGroups } from '@/lib/data';

// Disable caching for this API route to always fetch fresh data from MongoDB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/brand-groups?brandId=1
 * Returns the groups for a brand from the database
 * Now reads from the 'groups' collection instead of hardcoded config
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
    }

    const brandIdNum = parseInt(brandId);

    // Check if this brand has any groups in the database
    const hasGroups = await brandHasGroups(brandIdNum);

    if (!hasGroups) {
      return NextResponse.json({
        hasGroups: false,
        groups: []
      });
    }

    // Fetch groups from database
    const groups = await getGroups(brandIdNum);
    // Map groups to the expected format for the frontend
    const serializedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      displayName: group.displayName || group.name,
      description: group.description || '',
      tagline: group.tagline || null,
      color: group.color || null,
      icon: group.icon || null,
      logo: group.logo || null,
      isPerformance: group.isPerformance || false,
      order: group.order || 0,
    }));

    return NextResponse.json({
      hasGroups: true,
      groups: serializedGroups,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching brand groups:', error);
    return NextResponse.json({ error: 'Failed to fetch brand groups' }, { status: 500 });
  }
}

