import { serverEnvSchema } from 'app/schemas/env'

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL!,
})
