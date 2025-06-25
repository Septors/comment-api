import { createClient } from 'redis'

// Connect to your Key Value instance using the REDIS_URL environment variable
// The REDIS_URL is set to the internal connection URL e.g. redis://red-343245ndffg023:6379
export const sharedRedis = createClient({ url: process.env.REDIS_URL })
await sharedRedis.connect()

sharedRedis.on('connect', () => console.log('✅ Redis connected:', redisUrl));
sharedRedis.on('error', err => console.error('Redis error:', err));
