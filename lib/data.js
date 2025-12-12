/**
 * Data Service for Next.js - Read-only MongoDB operations
 */
import { getCollection } from './mongodb.js';

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
 * Get all brands from MongoDB
 */
export async function getBrands() {
  const collection = await getCollection('brands');
  const brands = await collection.find({}).sort({ id: 1 }).toArray();
  return serializeDocs(brands);
}

/**
 * Get models filtered by brandId
 */
export async function getModels(brandId) {
  const collection = await getCollection('models');
  const models = await collection.find({ brandId: parseInt(brandId) }).sort({ id: 1 }).toArray();
  return serializeDocs(models);
}

/**
 * Get types/generations filtered by modelId
 */
export async function getTypes(modelId) {
  const collection = await getCollection('types');
  const types = await collection.find({ modelId: parseInt(modelId) }).sort({ id: 1 }).toArray();
  return serializeDocs(types);
}

/**
 * Get engines filtered by typeId
 */
export async function getEngines(typeId) {
  const collection = await getCollection('engines');
  const engines = await collection.find({ typeId: parseInt(typeId) }).sort({ id: 1 }).toArray();
  return serializeDocs(engines);
}

/**
 * Get stages filtered by engineId
 */
export async function getStages(engineId) {
  const collection = await getCollection('stages');
  const stages = await collection.find({ engineId: parseInt(engineId) }).sort({ id: 1 }).toArray();
  return serializeDocs(stages);
}

/**
 * Get engine by ID
 */
export async function getEngineById(engineId) {
  const collection = await getCollection('engines');
  const engine = await collection.findOne({ id: parseInt(engineId) });
  return serializeDoc(engine);
}

/**
 * Get brand by name (for SEO routing)
 */
export async function getBrandByName(name) {
  const collection = await getCollection('brands');
  const brand = await collection.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(brand);
}

/**
 * Get model by brandId and name (for SEO routing)
 */
export async function getModelByName(brandId, name) {
  const collection = await getCollection('models');
  const model = await collection.findOne({
    brandId: parseInt(brandId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(model);
}

/**
 * Get type by modelId and name (for SEO routing)
 */
export async function getTypeByName(modelId, name) {
  const collection = await getCollection('types');
  const type = await collection.findOne({
    modelId: parseInt(modelId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(type);
}

/**
 * Get all vehicles for sitemap generation
 */
export async function getAllVehicles() {
  const [brands, models, types, engines] = await Promise.all([
    getCollection('brands').then(c => c.find({}).toArray()),
    getCollection('models').then(c => c.find({}).toArray()),
    getCollection('types').then(c => c.find({}).toArray()),
    getCollection('engines').then(c => c.find({}).toArray())
  ]);

  return {
    brands: serializeDocs(brands),
    models: serializeDocs(models),
    types: serializeDocs(types),
    engines: serializeDocs(engines)
  };
}

