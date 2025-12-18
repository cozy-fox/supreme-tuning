/**
 * Restore Script: Restore from Mercedes AMG Migration Backup
 * 
 * This script restores the database from a backup file created by the migration script.
 * 
 * Run with: node --env-file=.env scripts/restore-mercedes-amg-backup.js <backup-file>
 * Example: node --env-file=.env scripts/restore-mercedes-amg-backup.js backups/mercedes-amg-migration-backup-2024-01-15T12-30-00-000Z.json
 */

import { getDb, closeConnection } from '../lib/mongodb.js';
import fs from 'fs';
import path from 'path';

async function restoreFromBackup() {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Error: Please provide a backup file path');
    console.log('\nUsage: node --env-file=.env scripts/restore-mercedes-amg-backup.js <backup-file>');
    console.log('\nAvailable backups:');
    
    const backupDir = path.join(process.cwd(), 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.includes('mercedes-amg-migration-backup'));
      if (files.length > 0) {
        files.forEach(f => console.log(`  - backups/${f}`));
      } else {
        console.log('  No backup files found');
      }
    }
    process.exit(1);
  }
  
  // Resolve backup path
  const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(process.cwd(), backupFile);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Error: Backup file not found: ${backupPath}`);
    process.exit(1);
  }
  
  console.log('🔄 Mercedes AMG Migration Restore Script');
  console.log('========================================');
  console.log(`📁 Restoring from: ${backupPath}`);
  
  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`📅 Backup timestamp: ${backupData.timestamp}`);
    
    const db = await getDb();
    console.log('✅ Connected to MongoDB\n');
    
    // Restore each collection
    for (const [collName, docs] of Object.entries(backupData.collections)) {
      console.log(`🔄 Restoring ${collName}...`);
      
      const collection = db.collection(collName);
      
      // Clear current collection
      const deleteResult = await collection.deleteMany({});
      console.log(`   - Deleted ${deleteResult.deletedCount} existing documents`);
      
      // Insert backup documents
      if (docs.length > 0) {
        await collection.insertMany(docs);
        console.log(`   - Inserted ${docs.length} documents from backup`);
      } else {
        console.log(`   - No documents to restore`);
      }
    }
    
    console.log('\n========================================');
    console.log('✅ Restore completed successfully!');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ Error during restore:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

restoreFromBackup();

