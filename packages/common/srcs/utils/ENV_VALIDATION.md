# Environment Validation Utility

Simple utility to validate environment variables using Zod schemas.

## Usage

```typescript
import { z } from 'zod'
import { validateEnv } from '@ft_transcendence/common'

const envSchema = z.object({
  HOST: z.string().min(1),
  PORT: z.string().transform(Number),
  JWT_SECRET: z.string().min(1),
  AUTH_SERVICE_URL: z.string().min(1)
})

const env = validateEnv(envSchema)
// env.PORT is now a number
// env.HOST, JWT_SECRET, AUTH_SERVICE_URL are strings
```

## With Optional Values

```typescript
const envSchema = z.object({
  HOST: z.string().min(1),
  PORT: z.string().transform(Number),
  NODE_ENV: z.string().default('development'),  // optional with default
  DEBUG: z.string().optional()  // optional without default
})
```

## Error Handling

If validation fails, throws an error with details:

```
Environment validation failed:
  PORT: Expected number, received string
  JWT_SECRET: Required
```
