import {z} from 'zod';
import dotenv from 'dotenv';

if (!process.env._ENV_LOADED) {
    dotenv.config();
    process.env._ENV_LOADED = '1';
}

const EnvSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    MONGO_URL: z.string().url().default('mongodb://root:r00t@localhost:27017/fmu?authSource=admin'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    return parsed.data;
}