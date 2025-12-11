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

    // MongoDB uses flat structure - find entities by name/slug
    // Find the brand
    const brandData = data.brands?.find(b =>
      b.name?.toLowerCase() === brand.toLowerCase() ||
      b.slug?.toLowerCase() === brand.toLowerCase()
    );

    if (!brandData) {
      return NextResponse.json(
        { message: `Brand not found: ${brand}` },
        { status: 404 }
      );
    }

    // Find the model (in flat models array, filtered by brandId)
    const modelData = data.models?.find(m =>
      m.brandId === brandData.id && (
        m.name?.toLowerCase() === model.toLowerCase() ||
        m.slug?.toLowerCase() === model.toLowerCase()
      )
    );

    if (!modelData) {
      return NextResponse.json(
        { message: `Model not found: ${model} for brand ${brand}` },
        { status: 404 }
      );
    }

    // Find the type/generation (in flat types array, filtered by modelId)
    const typeData = data.types?.find(t =>
      t.modelId === modelData.id && (
        t.name?.toLowerCase() === type.toLowerCase() ||
        t.slug?.toLowerCase() === type.toLowerCase()
      )
    );

    if (!typeData) {
      return NextResponse.json(
        { message: `Type/Generation not found: ${type} for model ${model}` },
        { status: 404 }
      );
    }

    // Find the engine (in flat engines array, filtered by typeId)
    const engineData = data.engines?.find(e =>
      e.typeId === typeData.id && (
        e.name?.toLowerCase() === engine.toLowerCase() ||
        e.slug?.toLowerCase() === engine.toLowerCase() ||
        e.id?.toString() === engine.toString()
      )
    );

    if (!engineData) {
      return NextResponse.json(
        { message: `Engine not found: ${engine} for type ${type}` },
        { status: 404 }
      );
    }

    // Find the stages for this engine (in flat stages array, filtered by engineId)
    const engineStages = data.stages?.filter(s => s.engineId === engineData.id) || [];

    if (!engineStages || engineStages.length === 0) {
      return NextResponse.json(
        { message: 'No stages found for this engine' },
        { status: 404 }
      );
    }

    if (stageIndex < 0 || stageIndex >= engineStages.length) {
      return NextResponse.json(
        { message: `Stage index ${stageIndex} out of range (0-${engineStages.length - 1})` },
        { status: 404 }
      );
    }

    // Get the specific stage to update
    const stageToUpdate = engineStages[stageIndex];

    // Update only the allowed fields
    const allowedFields = ['stageName', 'stockHp', 'tunedHp', 'stockNm', 'tunedNm', 'price'];
    allowedFields.forEach(field => {
      if (stageData[field] !== undefined) {
        stageToUpdate[field] = stageData[field];
      }
    });

    // Update the stage in the data.stages array
    const stageArrayIndex = data.stages.findIndex(s => s.id === stageToUpdate.id);
    if (stageArrayIndex !== -1) {
      data.stages[stageArrayIndex] = stageToUpdate;
    }

    // Save the updated data back to MongoDB
    await saveData(data);

    return NextResponse.json({
      message: 'Stage updated successfully',
      stage: stageToUpdate
    });
  } catch (error) {
    console.error('❌ Stage update error:', error);
    return NextResponse.json(
      { message: 'Update failed', error: error.message },
      { status: 500 }
    );
  }
}

