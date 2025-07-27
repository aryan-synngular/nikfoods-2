import { clientEnvSchema } from 'app/schemas/env'

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
})
