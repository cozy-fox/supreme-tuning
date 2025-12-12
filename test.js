// test-mongo.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // loads .env.local for local testing

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI || !MONGODB_DB) {
  throw new Error("Please set MONGODB_URI and MONGODB_DB in .env.local");
}

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
    });
    console.log("✅ MongoDB connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

testConnection();