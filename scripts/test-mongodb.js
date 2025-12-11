/**
 * Test MongoDB Connection
 * Run with: node --env-file=.env scripts/test-mongodb.js
 * Or: node -r dotenv/config scripts/test-mongodb.js
 */

import { getDb, getCollection, closeConnection } from '../lib/mongodb.js';
import { initializeDatabase } from '../lib/schema.js';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  try {
    // Test 1: Connect to database
    console.log('1️⃣ Connecting to MongoDB...');
    const db = await getDb();
    console.log('✅ Connected to database:', db.databaseName);
    
    // Test 2: Initialize database with schema
    console.log('\n2️⃣ Initializing database schema...');
    await initializeDatabase(db);
    console.log('✅ Database schema initialized');
    
    // Test 3: List collections
    console.log('\n3️⃣ Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections found:', collections.map(c => c.name).join(', '));
    
    // Test 4: Test brands collection
    console.log('\n4️⃣ Testing brands collection...');
    const brandsCollection = await getCollection('brands');
    const brandCount = await brandsCollection.countDocuments();
    console.log('✅ Brands collection has', brandCount, 'documents');
    
    if (brandCount > 0) {
      const sampleBrand = await brandsCollection.findOne({});
      console.log('   Sample brand:', sampleBrand);
    }
    
    // Test 5: Test models collection
    console.log('\n5️⃣ Testing models collection...');
    const modelsCollection = await getCollection('models');
    const modelCount = await modelsCollection.countDocuments();
    console.log('✅ Models collection has', modelCount, 'documents');
    
    // Test 6: Test types collection
    console.log('\n6️⃣ Testing types collection...');
    const typesCollection = await getCollection('types');
    const typeCount = await typesCollection.countDocuments();
    console.log('✅ Types collection has', typeCount, 'documents');
    
    // Test 7: Test engines collection
    console.log('\n7️⃣ Testing engines collection...');
    const enginesCollection = await getCollection('engines');
    const engineCount = await enginesCollection.countDocuments();
    console.log('✅ Engines collection has', engineCount, 'documents');
    
    // Test 8: Test stages collection
    console.log('\n8️⃣ Testing stages collection...');
    const stagesCollection = await getCollection('stages');
    const stageCount = await stagesCollection.countDocuments();
    console.log('✅ Stages collection has', stageCount, 'documents');
    
    // Test 9: Test backups collection
    console.log('\n9️⃣ Testing backups collection...');
    const backupsCollection = await getCollection('backups');
    const backupCount = await backupsCollection.countDocuments();
    console.log('✅ Backups collection has', backupCount, 'documents');
    
    console.log('\n✅ All tests passed! MongoDB is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

testConnection();

