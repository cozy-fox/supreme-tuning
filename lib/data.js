/**
 * Data Service for Next.js - MongoDB-based data operations
 */
import { getDb, getCollection } from './mongodb.js';
import { initializeDatabase } from './schema.js';

let isInitialized = false;

/**
 * Helper function to serialize MongoDB documents for Next.js Client Components
 * Converts ObjectId to string to avoid "Objects with toJSON methods are not supported" error
 */
function serializeDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id.toString()
  };
}

function serializeDocs(docs) {
  return docs.map(serializeDoc);
}

/**
 * Initialize MongoDB database with schema validation
 */
export async function initDataLayer() {
  if (isInitialized) return true;

  try {
    const db = await getDb();
    await initializeDatabase(db);
    isInitialized = true;
    console.log('📦 MongoDB data layer initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize data layer:', error);
    throw error;
  }
}

/**
 * Save complete dataset to MongoDB (used for bulk imports/restores)
 * Creates automatic backup before saving
 */
export async function saveData(newData) {
  if (!newData || !newData.brands) {
    throw new Error("Invalid data structure provided for save operation.");
  }

  await initDataLayer();
  const db = await getDb();

  // Create backup before saving
  const backupsCollection = db.collection('backups');
  const currentData = await getData();
  await backupsCollection.insertOne({
    timestamp: new Date().toISOString(),
    data: currentData,
    description: 'Automatic backup before bulk save'
  });

  // Clear existing collections and insert new data
  const collections = ['brands', 'models', 'types', 'engines', 'stages'];

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});

    if (newData[collectionName] && newData[collectionName].length > 0) {
      await collection.insertMany(newData[collectionName]);
    }
  }

  console.log('✅ Data saved to MongoDB');
  return true;
}

/**
 * Get all data from MongoDB (returns same structure as old JSON file)
 */
export async function getData() {
  await initDataLayer();
  const db = await getDb();

  const brands = await db.collection('brands').find({}).toArray();
  const models = await db.collection('models').find({}).toArray();
  const types = await db.collection('types').find({}).toArray();
  const engines = await db.collection('engines').find({}).toArray();
  const stages = await db.collection('stages').find({}).toArray();

  return {
    brands: serializeDocs(brands),
    models: serializeDocs(models),
    types: serializeDocs(types),
    engines: serializeDocs(engines),
    stages: serializeDocs(stages)
  };
}

/**
 * Get all brands from MongoDB
 */
export async function getBrands() {
  await initDataLayer();
  const collection = await getCollection('brands');
  const brands = await collection.find({}).sort({ name: 1 }).toArray();
  return serializeDocs(brands);
}

/**
 * Get models, optionally filtered by brandId
 */
export async function getModels(brandId) {
  await initDataLayer();
  const collection = await getCollection('models');

  let models;
  if (!brandId) {
    models = await collection.find({}).sort({ name: 1 }).toArray();
  } else {
    models = await collection.find({ brandId: parseInt(brandId) }).sort({ name: 1 }).toArray();
  }

  return serializeDocs(models);
}

/**
 * Get types/generations, optionally filtered by modelId
 */
export async function getTypes(modelId) {
  await initDataLayer();
  const collection = await getCollection('types');

  let types;
  if (!modelId) {
    types = await collection.find({}).sort({ name: 1 }).toArray();
  } else {
    types = await collection.find({ modelId: parseInt(modelId) }).sort({ name: 1 }).toArray();
  }

  return serializeDocs(types);
}

/**
 * Get engines, optionally filtered by typeId
 */
export async function getEngines(typeId) {
  await initDataLayer();
  const collection = await getCollection('engines');

  let engines;
  if (!typeId) {
    engines = await collection.find({}).sort({ name: 1 }).toArray();
  } else {
    engines = await collection.find({ typeId: parseInt(typeId) }).sort({ name: 1 }).toArray();
  }

  return serializeDocs(engines);
}

/**
 * Get stages, optionally filtered by engineId
 */
export async function getStages(engineId) {
  await initDataLayer();
  const collection = await getCollection('stages');

  let stages;
  if (!engineId) {
    stages = await collection.find({}).toArray();
  } else {
    stages = await collection.find({ engineId: parseInt(engineId) }).toArray();
  }

  return serializeDocs(stages);
}

/**
 * Helper functions for SEO - get items by name/slug
 */
export async function getBrandByName(name) {
  await initDataLayer();
  const collection = await getCollection('brands');
  const brand = await collection.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(brand);
}

export async function getModelByName(brandId, name) {
  await initDataLayer();
  const collection = await getCollection('models');
  const model = await collection.findOne({
    brandId: parseInt(brandId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(model);
}

export async function getTypeByName(modelId, name) {
  await initDataLayer();
  const collection = await getCollection('types');
  const type = await collection.findOne({
    modelId: parseInt(modelId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(type);
}

export async function getEngineById(engineId) {
  await initDataLayer();
  const collection = await getCollection('engines');
  const engine = await collection.findOne({ id: parseInt(engineId) });
  return serializeDoc(engine);
}

/**
 * Get all data for sitemap generation
 */
export async function getAllVehicles() {
  await initDataLayer();
  const db = await getDb();

  const brands = await db.collection('brands').find({}).toArray();
  const models = await db.collection('models').find({}).toArray();
  const types = await db.collection('types').find({}).toArray();
  const engines = await db.collection('engines').find({}).toArray();

  return {
    brands: serializeDocs(brands),
    models: serializeDocs(models),
    types: serializeDocs(types),
    engines: serializeDocs(engines)
  };
}

/**
 * Backup Management Functions
 */

/**
 * Get all backups from MongoDB
 */
export async function getBackups() {
  await initDataLayer();
  const collection = await getCollection('backups');
  const backups = await collection.find({}).sort({ timestamp: -1 }).toArray();
  return serializeDocs(backups);
}

/**
 * Create a manual backup
 */
export async function createBackup(description = 'Manual backup') {
  await initDataLayer();
  const db = await getDb();
  const backupsCollection = db.collection('backups');

  const currentData = await getData();
  const backup = {
    timestamp: new Date().toISOString(),
    data: currentData,
    description
  };

  const result = await backupsCollection.insertOne(backup);
  return { ...backup, _id: result.insertedId };
}

/**
 * Restore data from a backup
 */
export async function restoreBackup(backupId) {
  await initDataLayer();
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  // Get the backup
  const backupsCollection = db.collection('backups');
  const backup = await backupsCollection.findOne({ _id: new ObjectId(backupId) });

  if (!backup || !backup.data) {
    throw new Error('Backup not found');
  }

  // Create a backup of current state before restoring
  await createBackup('Automatic backup before restore');

  // Restore the data
  await saveData(backup.data);

  return true;
}

/**
 * Delete a backup
 */
export async function deleteBackup(backupId) {
  await initDataLayer();
  const collection = await getCollection('backups');
  const { ObjectId } = await import('mongodb');

  const result = await collection.deleteOne({ _id: new ObjectId(backupId) });
  return result.deletedCount > 0;
}

/**
 * Stage Management Functions
 */

/**
 * Update a stage by ID
 */
export async function updateStage(stageId, stageData) {
  await initDataLayer();
  const db = await getDb();
  const collection = db.collection('stages');

  // Create backup before update
  const backupsCollection = db.collection('backups');
  const currentData = await getData();
  await backupsCollection.insertOne({
    timestamp: new Date().toISOString(),
    data: currentData,
    description: 'Automatic backup before stage update'
  });

  // Update only allowed fields
  const allowedFields = ['stageName', 'stockHp', 'tunedHp', 'stockNm', 'tunedNm', 'price'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (stageData[field] !== undefined) {
      updateData[field] = stageData[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  const result = await collection.updateOne(
    { id: parseInt(stageId) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    throw new Error('Stage not found');
  }

  // Return updated stage
  const stage = await collection.findOne({ id: parseInt(stageId) });
  return serializeDoc(stage);
}

/**
 * Get stage by engine name and stage index (for backward compatibility)
 */
export async function getStageByEngineAndIndex(brandName, modelName, typeName, engineName, stageIndex) {
  await initDataLayer();
  const db = await getDb();

  // Find brand by name (case-insensitive)
  const brand = await db.collection('brands').findOne({
    name: { $regex: new RegExp(`^${brandName}$`, 'i') }
  });

  if (!brand) {
    throw new Error('Brand not found');
  }

  // Find model by name and brandId
  const model = await db.collection('models').findOne({
    brandId: brand.id,
    name: { $regex: new RegExp(`^${modelName}$`, 'i') }
  });

  if (!model) {
    throw new Error('Model not found');
  }

  // Find type by name and modelId
  const type = await db.collection('types').findOne({
    modelId: model.id,
    name: { $regex: new RegExp(`^${typeName}$`, 'i') }
  });

  if (!type) {
    throw new Error('Type not found');
  }

  // Find engine by name and typeId
  const engine = await db.collection('engines').findOne({
    typeId: type.id,
    name: { $regex: new RegExp(`^${engineName}$`, 'i') }
  });

  if (!engine) {
    throw new Error('Engine not found');
  }

  // Get all stages for this engine, sorted by ID
  const stages = await db.collection('stages')
    .find({ engineId: engine.id })
    .sort({ id: 1 })
    .toArray();

  if (!stages || stages.length <= stageIndex) {
    throw new Error('Stage not found');
  }

  return serializeDoc(stages[stageIndex]);
}

