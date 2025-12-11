import { getStageByEngineAndIndex, updateStage } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { brand, model, type, engine, stageIndex, stageData } = await request.json();

    if (!brand || !model || !type || !engine || stageIndex === undefined || !stageData) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the stage using MongoDB queries
    const stage = await getStageByEngineAndIndex(brand, model, type, engine, stageIndex);

    // Update the stage
    const updatedStage = await updateStage(stage.id, stageData);

    return NextResponse.json({
      message: 'Stage updated successfully',
      stage: updatedStage
    });
  } catch (error) {
    console.error('Stage update error:', error);

    // Handle specific error messages
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Update failed', error: error.message },
      { status: 500 }
    );
  }
}

