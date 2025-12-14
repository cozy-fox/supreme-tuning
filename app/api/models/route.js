import { getModels } from '@/lib/data';
import { NextResponse } from 'next/server';
import { filterModelsByGroup, brandHasGroups } from '@/lib/brandGroups';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const groupId = searchParams.get('groupId'); // Optional: filter by group (standard, rs, m, amg)

    let models = await getModels(brandId);

    // If a groupId is specified and the brand has groups, filter the models
    if (groupId && brandHasGroups(parseInt(brandId))) {
      models = filterModelsByGroup(parseInt(brandId), models, groupId);
    }

    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

