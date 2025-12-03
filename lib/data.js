/**
 * Data Service for Next.js - Server-side data operations
 */
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'supreme-tuning-master.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

let dbCache = null;

export async function initDataLayer() {
  if (dbCache) return dbCache;
  
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    dbCache = JSON.parse(data);
    console.log(`📦 Data loaded: ${dbCache.brands?.length || 0} brands.`);
    return dbCache;
  } catch (e) {
    if (e.code === 'ENOENT' || e instanceof SyntaxError) {
      console.warn("⚠️ Data file not found. Initializing empty cache.");
      dbCache = { brands: [], models: [], types: [], engines: [], stages: [] };
      await saveData(dbCache);
      return dbCache;
    }
    throw e;
  }
}

export async function saveData(newData) {
  if (!newData || !newData.brands) {
    throw new Error("Invalid data structure provided for save operation.");
  }
  
  // Backup existing data
  if (dbCache) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      path.join(BACKUP_DIR, `backup-${timestamp}.json`),
      JSON.stringify(dbCache, null, 2)
    );
  }
  
  // Write new data
  await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));
  dbCache = newData;
  return true;
}

export async function getData() {
  if (!dbCache) await initDataLayer();
  return dbCache;
}

export async function getBrands() {
  const data = await getData();
  return data.brands || [];
}

export async function getModels(brandId) {
  const data = await getData();
  if (!brandId) return data.models || [];
  return (data.models || []).filter(m => m.brandId === parseInt(brandId));
}

export async function getTypes(modelId) {
  const data = await getData();
  if (!modelId) return data.types || [];
  return (data.types || []).filter(t => t.modelId === parseInt(modelId));
}

export async function getEngines(typeId) {
  const data = await getData();
  if (!typeId) return data.engines || [];
  return (data.engines || []).filter(e => e.typeId === parseInt(typeId));
}

export async function getStages(engineId) {
  const data = await getData();
  if (!engineId) return data.stages || [];
  return (data.stages || []).filter(s => s.engineId === parseInt(engineId));
}

// Helper functions for SEO - get items by name/slug
export async function getBrandByName(name) {
  const brands = await getBrands();
  return brands.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export async function getModelByName(brandId, name) {
  const models = await getModels(brandId);
  return models.find(m => m.name.toLowerCase() === name.toLowerCase());
}

export async function getTypeByName(modelId, name) {
  const types = await getTypes(modelId);
  return types.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export async function getEngineById(engineId) {
  const data = await getData();
  return (data.engines || []).find(e => e.id === parseInt(engineId));
}

// Get all data for sitemap generation
export async function getAllVehicles() {
  const data = await getData();
  return {
    brands: data.brands || [],
    models: data.models || [],
    types: data.types || [],
    engines: data.engines || [],
  };
}

