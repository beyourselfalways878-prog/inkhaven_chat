import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
    console.warn('Redis environment variables not found. Quick Match will not work.');
}

export const redis = (url && token)
    ? new Redis({ url, token })
    : null;
