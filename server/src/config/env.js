import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z
    .string()
    .min(1)
    .refine((uri) => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'), {
      message: 'must start with mongodb:// or mongodb+srv://',
    }),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print only variable names and messages, never values (they may be secrets).
  const problems = parsed.error.issues.map(
    (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
  );
  console.error(`Invalid environment configuration:\n${problems.join('\n')}`);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);