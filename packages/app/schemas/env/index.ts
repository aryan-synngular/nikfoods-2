// env.ts
import { z } from 'zod'

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
})

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),

  PRIVATE_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  FACEBOOK_CLIENT_ID: z.string(),
  FACEBOOK_CLIENT_SECRET: z.string(),

  APPLE_CLIENT_ID: z.string(),
  APPLE_CLIENT_SECRET: z.string(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_API_KEY: z.string(),

  GOOGLE_MAPS_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
