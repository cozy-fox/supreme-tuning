/**
 * Migration Script: JSON to MongoDB
 * Migrates data from local JSON file to MongoDB Atlas
 * 
 * Usage: node scripts/migrate-to-mongodb.js
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'supremetuning';
const DATA_FILE = path.join(process.cwd(), 'data', 'supreme-tuning-master.json');

async function migrate() {
  console.log('🚀 Starting migration from JSON to MongoDB...\n');

  // Step 1: Read JSON file
  console.log('📖 Reading JSON file...');
  let jsonData;
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    jsonData = JSON.parse(fileContent);
    console.log(`✅ JSON file loaded successfully`);
    console.log(`   - Brands: ${jsonData.brands?.length || 0}`);
    console.log(`   - Models: ${jsonData.models?.length || 0}`);
    console.log(`   - Types: ${jsonData.types?.length || 0}`);
    console.log(`   - Engines: ${jsonData.engines?.length || 0}`);
    console.log(`   - Stages: ${jsonData.stages?.length || 0}\n`);
  } catch (error) {
    console.error('❌ Error reading JSON file:', error.message);
    process.exit(1);
  }

  // Step 2: Connect to MongoDB
  console.log('🔌 Connecting to MongoDB Atlas...');
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    console.log('\n📝 Please add your MongoDB connection string to .env:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/supremetuning\n');
    process.exit(1);
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }

  const db = client.db(MONGODB_DB);

  try {
    // Step 3: Create collections and indexes
    console.log('📦 Creating collections and indexes...');
    
    const collections = ['brands', 'models', 'types', 'engines', 'stages'];
    
    for (const collName of collections) {
      // Drop existing collection if it exists
      try {
        await db.collection(collName).drop();
        console.log(`   - Dropped existing collection: ${collName}`);
      } catch (err) {
        // Collection doesn't exist, that's fine
      }
    }

    // Create indexes
    await db.collection('brands').createIndex({ id: 1 }, { unique: true });
    await db.collection('brands').createIndex({ name: 1 });
    
    await db.collection('models').createIndex({ id: 1 }, { unique: true });
    await db.collection('models').createIndex({ brandId: 1 });
    
    await db.collection('types').createIndex({ id: 1 }, { unique: true });
    await db.collection('types').createIndex({ modelId: 1 });
    await db.collection('types').createIndex({ brandId: 1 });
    
    await db.collection('engines').createIndex({ id: 1 }, { unique: true });
    await db.collection('engines').createIndex({ typeId: 1 });
    await db.collection('engines').createIndex({ modelId: 1 });
    
    await db.collection('stages').createIndex({ id: 1 }, { unique: true });
    await db.collection('stages').createIndex({ engineId: 1 });
    
    await db.collection('backups').createIndex({ timestamp: -1 });
    
    console.log('✅ Indexes created\n');

    // Step 4: Insert data
    console.log('💾 Inserting data into MongoDB...');
    
    if (jsonData.brands && jsonData.brands.length > 0) {
      await db.collection('brands').insertMany(jsonData.brands);
      console.log(`   ✅ Inserted ${jsonData.brands.length} brands`);
    }
    
    if (jsonData.models && jsonData.models.length > 0) {
      await db.collection('models').insertMany(jsonData.models);
      console.log(`   ✅ Inserted ${jsonData.models.length} models`);
    }
    
    if (jsonData.types && jsonData.types.length > 0) {
      await db.collection('types').insertMany(jsonData.types);
      console.log(`   ✅ Inserted ${jsonData.types.length} types`);
    }
    
    if (jsonData.engines && jsonData.engines.length > 0) {
      await db.collection('engines').insertMany(jsonData.engines);
      console.log(`   ✅ Inserted ${jsonData.engines.length} engines`);
    }
    
    if (jsonData.stages && jsonData.stages.length > 0) {
      await db.collection('stages').insertMany(jsonData.stages);
      console.log(`   ✅ Inserted ${jsonData.stages.length} stages`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update lib/data.js to use MongoDB (rename to lib/data-json.js)');
    console.log('   2. Rename lib/data-mongodb.js to lib/data.js');
    console.log('   3. Restart your Next.js application');
    console.log('   4. Test the application to ensure everything works\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run migration
migrate().catch(console.error);

