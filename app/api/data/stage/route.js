import { getData, saveData } from '@/lib/data';
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

    const data = await getData();
    
    // Find the brand
    const brandData = data.brands?.find(b => 
      b.name?.toLowerCase() === brand.toLowerCase() ||
      b.slug?.toLowerCase() === brand.toLowerCase()
    );
    
    if (!brandData) {
      return NextResponse.json(
        { message: 'Brand not found' },
        { status: 404 }
      );
    }

    // Find the model
    const modelData = brandData.models?.find(m => 
      m.name?.toLowerCase() === model.toLowerCase() ||
      m.slug?.toLowerCase() === model.toLowerCase()
    );
    
    if (!modelData) {
      return NextResponse.json(
        { message: 'Model not found' },
        { status: 404 }
      );
    }

    // Find the type/generation
    const typeData = modelData.types?.find(t => 
      t.name?.toLowerCase() === type.toLowerCase() ||
      t.slug?.toLowerCase() === type.toLowerCase()
    );
    
    if (!typeData) {
      return NextResponse.json(
        { message: 'Type not found' },
        { status: 404 }
      );
    }

    // Find the engine
    const engineData = typeData.engines?.find(e => 
      e.name?.toLowerCase() === engine.toLowerCase() ||
      e.slug?.toLowerCase() === engine.toLowerCase()
    );
    
    if (!engineData) {
      return NextResponse.json(
        { message: 'Engine not found' },
        { status: 404 }
      );
    }

    // Update the stage
    if (!engineData.stages || !engineData.stages[stageIndex]) {
      return NextResponse.json(
        { message: 'Stage not found' },
        { status: 404 }
      );
    }

    // Update only the allowed fields
    const allowedFields = ['stageName', 'stockHp', 'tunedHp', 'stockNm', 'tunedNm', 'price'];
    allowedFields.forEach(field => {
      if (stageData[field] !== undefined) {
        engineData.stages[stageIndex][field] = stageData[field];
      }
    });

    // Save the updated data
    await saveData(data);

    return NextResponse.json({ 
      message: 'Stage updated successfully',
      stage: engineData.stages[stageIndex]
    });
  } catch (error) {
    console.error('Stage update error:', error);
    return NextResponse.json(
      { message: 'Update failed', error: error.message },
      { status: 500 }
    );
  }
}

