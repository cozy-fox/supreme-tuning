/**
 * Data Service for Next.js - MongoDB Implementation
 * Replaces file-based storage with MongoDB Atlas
 */
import { getCollection } from './mongodb';

// Collection names
const COLLECTIONS = {
  brands: 'brands',
  models: 'models',
  types: 'types',
  engines: 'engines',
  stages: 'stages',
  backups: 'backups',
  metadata: 'metadata'
};

/**
 * Initialize MongoDB collections with indexes
 */
export async function initDataLayer() {
  try {
    // Create indexes for better query performance
    const brandsCol = await getCollection(COLLECTIONS.brands);
    await brandsCol.createIndex({ id: 1 }, { unique: true });
    await brandsCol.createIndex({ name: 1 });

    const modelsCol = await getCollection(COLLECTIONS.models);
    await modelsCol.createIndex({ id: 1 }, { unique: true });
    await modelsCol.createIndex({ brandId: 1 });

    const typesCol = await getCollection(COLLECTIONS.types);
    await typesCol.createIndex({ id: 1 }, { unique: true });
    await typesCol.createIndex({ modelId: 1 });
    await typesCol.createIndex({ brandId: 1 });

    const enginesCol = await getCollection(COLLECTIONS.engines);
    await enginesCol.createIndex({ id: 1 }, { unique: true });
    await enginesCol.createIndex({ typeId: 1 });
    await enginesCol.createIndex({ modelId: 1 });

    const stagesCol = await getCollection(COLLECTIONS.stages);
    await stagesCol.createIndex({ id: 1 }, { unique: true });
    await stagesCol.createIndex({ engineId: 1 });

    const backupsCol = await getCollection(COLLECTIONS.backups);
    await backupsCol.createIndex({ timestamp: -1 });

    console.log('📦 MongoDB indexes created successfully');

    // Check if data exists
    const brandCount = await brandsCol.countDocuments();
    console.log(`📦 MongoDB connected: ${brandCount} brands found`);

    return true;
  } catch (error) {
    console.error('❌ MongoDB initialization error:', error);
    throw error;
  }
}

/**
 * Get next available ID for a collection
 */
async function getNextId(collectionName) {
  const collection = await getCollection(collectionName);
  const lastItem = await collection.findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
  return lastItem ? lastItem.id + 1 : 1;
}




/**
 * Create backup before making changes
 */
async function createBackup() {
  try {
    const timestamp = new Date().toISOString();
    const backupsCol = await getCollection(COLLECTIONS.backups);

    // Get all current data (skip if no data exists yet)
    let data;
    try {
      data = await getData();

      // Only create backup if there's actual data
      if (!data.brands || data.brands.length === 0) {
        console.log('⚠️ No data to backup, skipping backup creation');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Cannot get data for backup, skipping backup creation');
      return true;
    }

    // Save backup
    await backupsCol.insertOne({
      timestamp,
      data,
      createdAt: new Date()
    });

    console.log(`📦 Backup created: ${timestamp}`);

    // Keep only last 50 backups
    const backupCount = await backupsCol.countDocuments();
    if (backupCount > 50) {
      const oldBackups = await backupsCol
        .find({})
        .sort({ timestamp: 1 })
        .limit(backupCount - 50)
        .toArray();

      const idsToDelete = oldBackups.map(b => b._id);
      await backupsCol.deleteMany({ _id: { $in: idsToDelete } });
    }

    return true;
  } catch (error) {
    console.error('❌ Backup creation error:', error);
    // Don't throw error - allow save to continue even if backup fails
    return false;
  }
}

/**
 * Save data to MongoDB (replaces entire dataset)
 */
export async function saveData(newData) {
  // Validate data structure
  if (!newData) {
    throw new Error('Invalid data: newData is null or undefined');
  }

  // Ensure all required arrays exist (even if empty)
  const validatedData = {
    brands: Array.isArray(newData.brands) ? newData.brands : [],
    models: Array.isArray(newData.models) ? newData.models : [],
    types: Array.isArray(newData.types) ? newData.types : [],
    engines: Array.isArray(newData.engines) ? newData.engines : [],
    stages: Array.isArray(newData.stages) ? newData.stages : []
  };

  try {
    // Create backup before making changes (non-blocking)
    try {
      await createBackup();
    } catch (backupError) {
      console.warn('⚠️ Backup failed, but continuing with save:', backupError.message);
    }

    // Clear existing data
    await Promise.all([
      (await getCollection(COLLECTIONS.brands)).deleteMany({}),
      (await getCollection(COLLECTIONS.models)).deleteMany({}),
      (await getCollection(COLLECTIONS.types)).deleteMany({}),
      (await getCollection(COLLECTIONS.engines)).deleteMany({}),
      (await getCollection(COLLECTIONS.stages)).deleteMany({})
    ]);

    // Insert new data (only if arrays are not empty)
    if (validatedData.brands.length > 0) {
      await (await getCollection(COLLECTIONS.brands)).insertMany(validatedData.brands);
    }
    if (validatedData.models.length > 0) {
      await (await getCollection(COLLECTIONS.models)).insertMany(validatedData.models);
    }
    if (validatedData.types.length > 0) {
      await (await getCollection(COLLECTIONS.types)).insertMany(validatedData.types);
    }
    if (validatedData.engines.length > 0) {
      await (await getCollection(COLLECTIONS.engines)).insertMany(validatedData.engines);
    }
    if (validatedData.stages.length > 0) {
      await (await getCollection(COLLECTIONS.stages)).insertMany(validatedData.stages);
    }

    console.log('✅ Data saved to MongoDB successfully');
    console.log(`   - Brands: ${validatedData.brands.length}`);
    console.log(`   - Models: ${validatedData.models.length}`);
    console.log(`   - Types: ${validatedData.types.length}`);
    console.log(`   - Engines: ${validatedData.engines.length}`);
    console.log(`   - Stages: ${validatedData.stages.length}`);

    return true;
  } catch (error) {
    console.error('❌ Save data error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Failed to save data to MongoDB: ${error.message}`);
  }
}

/**
 * Get all data from MongoDB
 * Note: This loads ALL data and should only be used in admin panel
 * For public pages, use specific functions like getBrands(), getModels(), etc.
 */
export async function getData() {
  try {
    const [brands, models, types, engines, stages] = await Promise.all([
      (await getCollection(COLLECTIONS.brands)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.models)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.types)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.engines)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.stages)).find({}).sort({ id: 1 }).toArray()
    ]);

    // Remove MongoDB _id field from results
    const cleanData = {
      brands: brands.map(({ _id, ...rest }) => rest),
      models: models.map(({ _id, ...rest }) => rest),
      types: types.map(({ _id, ...rest }) => rest),
      engines: engines.map(({ _id, ...rest }) => rest),
      stages: stages.map(({ _id, ...rest }) => rest)
    };

    return cleanData;
  } catch (error) {
    console.error('❌ Get data error:', error);
    throw error;
  }
}


/**
 * Get all brands (sorted alphabetically by name)
 */
export async function getBrands() {
  try {
    const collection = await getCollection(COLLECTIONS.brands);
    const brands = await collection.find({}).sort({ name: 1 }).toArray();
    return brands.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Get brands error:', error);
    return [];
  }
}

/**
 * Get models by brandId (sorted alphabetically by name)
 */
export async function getModels(brandId) {
  try {
    const collection = await getCollection(COLLECTIONS.models);
    const query = brandId ? { brandId: parseInt(brandId) } : {};
    const models = await collection.find(query).sort({ name: 1 }).toArray();
    return models.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Get models error:', error);
    return [];
  }
}

/**
 * Get types by modelId (sorted alphabetically by name)
 */
export async function getTypes(modelId) {
  try {
    const collection = await getCollection(COLLECTIONS.types);
    const query = modelId ? { modelId: parseInt(modelId) } : {};
    const types = await collection.find(query).sort({ name: 1 }).toArray();
    return types.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Get types error:', error);
    return [];
  }
}

/**
 * Get engines by typeId (sorted alphabetically by name)
 */
export async function getEngines(typeId) {
  try {
    const collection = await getCollection(COLLECTIONS.engines);
    const query = typeId ? { typeId: parseInt(typeId) } : {};
    const engines = await collection.find(query).sort({ name: 1 }).toArray();
    return engines.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Get engines error:', error);
    return [];
  }
}

/**
 * Get stages by engineId
 */
export async function getStages(engineId) {
  try {
    const collection = await getCollection(COLLECTIONS.stages);
    const query = engineId ? { engineId: parseInt(engineId) } : {};
    const stages = await collection.find(query).sort({ id: 1 }).toArray();
    return stages.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Get stages error:', error);
    return [];
  }
}

/**
 * Get brand by name (for SEO)
 */
export async function getBrandByName(name) {
  try {
    const collection = await getCollection(COLLECTIONS.brands);
    const brand = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!brand) return null;
    const { _id, ...rest } = brand;
    return rest;
  } catch (error) {
    console.error('❌ Get brand by name error:', error);
    return null;
  }
}

/**
 * Get model by name (for SEO)
 */
export async function getModelByName(brandId, name) {
  try {
    const collection = await getCollection(COLLECTIONS.models);
    const model = await collection.findOne({
      brandId: parseInt(brandId),
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (!model) return null;
    const { _id, ...rest } = model;
    return rest;
  } catch (error) {
    console.error('❌ Get model by name error:', error);
    return null;
  }
}

/**
 * Get type by name (for SEO)
 */
export async function getTypeByName(modelId, name) {
  try {
    const collection = await getCollection(COLLECTIONS.types);
    const type = await collection.findOne({
      modelId: parseInt(modelId),
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (!type) return null;
    const { _id, ...rest } = type;
    return rest;
  } catch (error) {
    console.error('❌ Get type by name error:', error);
    return null;
  }
}

/**
 * Get engine by ID
 */
export async function getEngineById(engineId) {
  try {
    const collection = await getCollection(COLLECTIONS.engines);
    const engine = await collection.findOne({ id: parseInt(engineId) });
    if (!engine) return null;
    const { _id, ...rest } = engine;
    return rest;
  } catch (error) {
    console.error('❌ Get engine by ID error:', error);
    return null;
  }
}

/**
 * Get all vehicles (for sitemap generation)
 */
export async function getAllVehicles() {
  try {
    const [brands, models, types, engines] = await Promise.all([
      getBrands(),
      getModels(),
      getTypes(),
      getEngines()
    ]);

    return { brands, models, types, engines };
  } catch (error) {
    console.error('❌ Get all vehicles error:', error);
    return { brands: [], models: [], types: [], engines: [] };
  }
}

/**
 * Get all backups
 */
export async function getBackups(limit = 50) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const backups = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .project({ _id: 1, timestamp: 1, createdAt: 1 })
      .toArray();

    return backups.map(b => ({
      id: b._id.toString(),
      timestamp: b.timestamp,
      createdAt: b.createdAt
    }));
  } catch (error) {
    console.error('❌ Get backups error:', error);
    return [];
  }
}

/**
 * Restore from backup
 */
export async function restoreBackup(backupId) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const { ObjectId } = require('mongodb');
    const backup = await collection.findOne({ _id: new ObjectId(backupId) });

    if (!backup) {
      throw new Error('Backup not found');
    }

    await saveData(backup.data, false);
    console.log(`✅ Restored from backup: ${backup.timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Restore backup error:', error);
    throw error;
  }
}

/**
 * Delete old backups (keep only the most recent N backups)
 */
export async function cleanupBackups(keepCount = 50) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const backupCount = await collection.countDocuments();

    if (backupCount > keepCount) {
      const oldBackups = await collection
        .find({})
        .sort({ timestamp: 1 })
        .limit(backupCount - keepCount)
        .toArray();

      const idsToDelete = oldBackups.map(b => b._id);
      await collection.deleteMany({ _id: { $in: idsToDelete } });

      console.log(`✅ Cleaned up ${idsToDelete.length} old backups`);
    }

    return true;
  } catch (error) {
    console.error('❌ Cleanup backups error:', error);
    throw error;
  }
}


