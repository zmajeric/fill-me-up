import pino from 'pino';
import {loadEnv} from './config.js';

const env = loadEnv();

export const logger = pino({
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === 'development' ? {target: 'pino-pretty'} : undefined,
});