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

// Function to register all models - crucial for serverless environments
async function registerModels() {
  // Import all models to ensure they are registered
  // This is critical for serverless deployments where models might not be
  // registered across different function invocations
  await import('../models/User')
  await import('../models/Address')
  await import('../models/Cart')
  await import('../models/CartDay')
  await import('../models/CartItem')
  await import('../models/FoodCategory')
  await import('../models/FoodItem')
  await import('../models/Orders')
  await import('../models/RefreshToken')
  await import('../models/Review')
  await import('../models/UpdateOrder')
  await import('../models/DeliveryBoy')
  await import('../models/WeeklyMenu')
  await import('../models/Zincode')

  console.log('✅ All models registered successfully')
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
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async () => {
      // Register all models after connection is established
      await registerModels()
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ Connected to MongoDB successfully!')
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB:', e)

    throw e
  }
  return cached.conn
}
