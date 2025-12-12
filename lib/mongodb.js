/**
 * MongoDB Connection Module
 * Handles connection pooling and database access
 */
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env file');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  tls: true,                       // enforce TLS
  tlsAllowInvalidCertificates: false // Atlas certificates must be valid
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  // across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get MongoDB client
 * @returns {Promise<MongoClient>}
 */
export async function getClient() {
  return clientPromise;
}

/**
 * Get database instance
 * @returns {Promise<Db>}
 */
export async function getDb() {
  const client = await clientPromise;
  return client.db('supremetuning');
}

/**
 * Get a collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>}
 */
export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

/**
 * Close MongoDB connection (for graceful shutdown)
 */
export async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
  });
}

export default clientPromise;

