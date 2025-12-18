/**
 * Migration Script: Move Mercedes AMG Engines to AMG Group
 * 
 * This script:
 * 1. Creates a backup of current state before any changes
 * 2. Finds all Mercedes engines that contain "AMG" in their name
 * 3. For each AMG engine:
 *    - Creates a corresponding model in the AMG group (if not exists)
 *    - Creates a corresponding type/generation for that model (if not exists)
 *    - Updates the engine to point to the new type
 * 4. Saves a detailed log of all changes
 * 
 * Run with: node --env-file=.env scripts/migrate-mercedes-amg-engines.js
 * Or: node -r dotenv/config scripts/migrate-mercedes-amg-engines.js
 */

import { getDb, getCollection, closeConnection } from '../lib/mongodb.js';
import fs from 'fs';
import path from 'path';

// Configuration
const MERCEDES_BRAND_ID = 4;
const DRY_RUN = process.argv.includes('--dry-run');

async function createBackup(db) {
  console.log('\n📦 Creating backup before migration...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {
    timestamp,
    collections: {}
  };

  // Backup relevant collections
  const collectionsToBackup = ['models', 'types', 'engines', 'groups'];
  
  for (const collName of collectionsToBackup) {
    const collection = db.collection(collName);
    const docs = await collection.find({}).toArray();
    backupData.collections[collName] = docs;
    console.log(`   ✅ Backed up ${docs.length} documents from ${collName}`);
  }

  // Save backup to file
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, `mercedes-amg-migration-backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`   📁 Backup saved to: ${backupPath}`);

  // Save a reference to the backup in MongoDB (not the full data to avoid size issues)
  try {
    const backupsCollection = await getCollection('backups');
    await backupsCollection.insertOne({
      type: 'migration',
      name: 'mercedes-amg-engines-migration',
      timestamp: new Date(),
      backupFilePath: backupPath,
      stats: {
        models: backupData.collections.models?.length || 0,
        types: backupData.collections.types?.length || 0,
        engines: backupData.collections.engines?.length || 0,
        groups: backupData.collections.groups?.length || 0
      }
    });
    console.log('   ✅ Backup reference saved to MongoDB backups collection\n');
  } catch (err) {
    console.log(`   ⚠️  Could not save backup reference to MongoDB: ${err.message}\n`);
  }

  return backupPath;
}

async function getAMGGroupId(db) {
  const groupsCollection = db.collection('groups');
  const amgGroup = await groupsCollection.findOne({ 
    brandId: MERCEDES_BRAND_ID, 
    $or: [
      { name: { $regex: /AMG/i } },
      { displayName: { $regex: /AMG/i } },
      { isPerformance: true }
    ]
  });
  
  if (!amgGroup) {
    throw new Error('AMG group not found for Mercedes. Please create the AMG group first.');
  }
  
  console.log(`🏎️  Found AMG group: "${amgGroup.name}" (ID: ${amgGroup.id})`);
  return amgGroup.id;
}

async function getNextId(collection, fieldName = 'id') {
  const maxDoc = await collection.find({}).sort({ [fieldName]: -1 }).limit(1).toArray();
  return maxDoc.length > 0 ? maxDoc[0][fieldName] + 1 : 1;
}

async function findAMGEngines(db) {
  const enginesCollection = db.collection('engines');
  const typesCollection = db.collection('types');
  
  // Find all types for Mercedes
  const mercedesTypes = await typesCollection.find({ brandId: MERCEDES_BRAND_ID }).toArray();
  const mercedesTypeIds = mercedesTypes.map(t => t.id);
  
  // Find engines that contain "AMG" in their name and belong to Mercedes types
  const amgEngines = await enginesCollection.find({
    typeId: { $in: mercedesTypeIds },
    name: { $regex: /AMG/i }
  }).toArray();
  
  console.log(`\n🔍 Found ${amgEngines.length} engines with "AMG" in their name`);
  return amgEngines;
}

async function getEngineContext(db, engine) {
  const typesCollection = db.collection('types');
  const modelsCollection = db.collection('models');
  
  const type = await typesCollection.findOne({ id: engine.typeId });
  if (!type) return null;
  
  const model = await modelsCollection.findOne({ id: type.modelId });
  if (!model) return null;
  
  return { type, model };
}

async function findOrCreateAMGModel(db, originalModel, amgGroupId, createdModels) {
  const modelsCollection = db.collection('models');
  
  // Check if model already exists in AMG group with same name
  const cacheKey = `${originalModel.name}-${amgGroupId}`;
  if (createdModels.has(cacheKey)) {
    return createdModels.get(cacheKey);
  }
  
  let amgModel = await modelsCollection.findOne({
    name: originalModel.name,
    groupId: amgGroupId
  });
  
  if (!amgModel) {
    const newId = await getNextId(modelsCollection);
    amgModel = {
      id: newId,
      brandId: MERCEDES_BRAND_ID,
      groupId: amgGroupId,
      name: originalModel.name
    };
    
    if (!DRY_RUN) {
      await modelsCollection.insertOne(amgModel);
    }
    console.log(`   ➕ Created new AMG model: "${amgModel.name}" (ID: ${amgModel.id})`);
  } else {
    console.log(`   ✓ Found existing AMG model: "${amgModel.name}" (ID: ${amgModel.id})`);
  }
  
  createdModels.set(cacheKey, amgModel);
  return amgModel;
}

async function findOrCreateAMGType(db, originalType, amgModel, createdTypes) {
  const typesCollection = db.collection('types');
  
  // Check cache first
  const cacheKey = `${originalType.name}-${amgModel.id}`;
  if (createdTypes.has(cacheKey)) {
    return createdTypes.get(cacheKey);
  }
  
  // Check if type already exists for AMG model
  let amgType = await typesCollection.findOne({
    modelId: amgModel.id,
    name: originalType.name
  });

  if (!amgType) {
    const newId = await getNextId(typesCollection);
    amgType = {
      id: newId,
      modelId: amgModel.id,
      brandId: MERCEDES_BRAND_ID,
      brandName: 'Mercedes',
      modelName: amgModel.name,
      name: originalType.name
    };

    if (!DRY_RUN) {
      await typesCollection.insertOne(amgType);
    }
    console.log(`   ➕ Created new AMG type: "${amgType.name}" (ID: ${amgType.id})`);
  } else {
    console.log(`   ✓ Found existing AMG type: "${amgType.name}" (ID: ${amgType.id})`);
  }

  createdTypes.set(cacheKey, amgType);
  return amgType;
}

async function migrateEngine(db, engine, amgType) {
  const enginesCollection = db.collection('engines');

  const oldTypeId = engine.typeId;
  const oldModelId = engine.modelId;

  if (!DRY_RUN) {
    await enginesCollection.updateOne(
      { id: engine.id },
      {
        $set: {
          typeId: amgType.id,
          modelId: amgType.modelId
        }
      }
    );
  }

  return {
    engineId: engine.id,
    engineName: engine.name,
    oldTypeId,
    newTypeId: amgType.id,
    oldModelId,
    newModelId: amgType.modelId
  };
}

async function runMigration() {
  console.log('🚀 Mercedes AMG Engines Migration Script');
  console.log('========================================');

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made to the database');
  }

  try {
    const db = await getDb();
    console.log('✅ Connected to MongoDB');

    // Step 1: Create backup
    const backupPath = await createBackup(db);

    // Step 2: Get AMG group ID
    const amgGroupId = await getAMGGroupId(db);

    // Step 3: Find all AMG engines
    const amgEngines = await findAMGEngines(db);

    if (amgEngines.length === 0) {
      console.log('\n✅ No AMG engines found to migrate. Done!');
      return;
    }

    // Cache for created models and types to avoid duplicates
    const createdModels = new Map();
    const createdTypes = new Map();

    // Track all changes for report
    const migrationReport = {
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      backupPath,
      amgGroupId,
      totalEngines: amgEngines.length,
      modelsCreated: 0,
      typesCreated: 0,
      enginesMigrated: 0,
      changes: []
    };

    console.log('\n📋 Processing engines...\n');

    for (const engine of amgEngines) {
      console.log(`\n🔧 Processing engine: "${engine.name}" (ID: ${engine.id})`);

      // Get original context
      const context = await getEngineContext(db, engine);
      if (!context) {
        console.log(`   ⚠️  Could not find type/model for engine. Skipping.`);
        continue;
      }

      const { type: originalType, model: originalModel } = context;
      console.log(`   📍 Original: Model "${originalModel.name}" > Type "${originalType.name}"`);

      // Find or create AMG model
      const amgModel = await findOrCreateAMGModel(db, originalModel, amgGroupId, createdModels);

      // Find or create AMG type
      const amgType = await findOrCreateAMGType(db, originalType, amgModel, createdTypes);

      // Migrate engine to new type
      const changeInfo = await migrateEngine(db, engine, amgType);
      migrationReport.changes.push(changeInfo);

      console.log(`   ✅ Engine migrated from type ${changeInfo.oldTypeId} to ${changeInfo.newTypeId}`);
    }

    // Calculate final stats
    migrationReport.modelsCreated = createdModels.size;
    migrationReport.typesCreated = createdTypes.size;
    migrationReport.enginesMigrated = migrationReport.changes.length;

    // Save migration report
    const reportPath = path.join(
      process.cwd(),
      'backups',
      `mercedes-amg-migration-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2));

    // Print summary
    console.log('\n\n========================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('========================================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'LIVE'}`);
    console.log(`Total AMG engines found: ${migrationReport.totalEngines}`);
    console.log(`Models created in AMG group: ${migrationReport.modelsCreated}`);
    console.log(`Types created in AMG group: ${migrationReport.typesCreated}`);
    console.log(`Engines migrated: ${migrationReport.enginesMigrated}`);
    console.log(`\nBackup saved to: ${backupPath}`);
    console.log(`Report saved to: ${reportPath}`);

    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. Run without --dry-run to apply changes.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run the migration
runMigration();

