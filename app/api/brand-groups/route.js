import { NextResponse } from 'next/server';
import { getBrandGroupConfig, brandHasGroups, BRAND_IDS } from '@/lib/brandGroups';

/**
 * GET /api/brand-groups?brandId=1
 * Returns the group configuration for a brand (e.g., Audi with Standard/RS options)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    
    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
    }
    
    const brandIdNum = parseInt(brandId);
    
    if (!brandHasGroups(brandIdNum)) {
      return NextResponse.json({ 
        hasGroups: false,
        groups: [] 
      });
    }
    
    const config = getBrandGroupConfig(brandIdNum);
    
    // Return a serialized version (without the filter functions)
    const serializedGroups = config.groups.map(group => ({
      id: group.id,
      name: group.name,
      displayName: group.displayName,
      description: group.description,
      logo: group.logo,
    }));
    
    return NextResponse.json({
      hasGroups: true,
      brandName: config.brandName,
      groups: serializedGroups,
    });
  } catch (error) {
    console.error('Error fetching brand groups:', error);
    return NextResponse.json({ error: 'Failed to fetch brand groups' }, { status: 500 });
  }
}

