import mongoose from 'mongoose'
import { serverEnv } from 'data/env/server'

const MONGODB_URI = serverEnv.DATABASE_URL!

if (!MONGODB_URI) {
  throw new Error('DATABASE_URL is not defined')
}
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    }
     cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose.connection)

  }

  try {
    cached.conn = await cached.promise
    console.log("✅ Connected to MongoDB successfully!");

  } catch (e) {
    cached.promise = null
    console.error("❌ Failed to connect to MongoDB:", e);

    throw e
  }
  return cached.conn
}
