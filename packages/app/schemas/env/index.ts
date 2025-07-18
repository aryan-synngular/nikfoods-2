// env.ts
import { z } from 'zod'

export const clientEnvSchema = z.object({
})

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
