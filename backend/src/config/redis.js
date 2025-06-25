// config/redis.js
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL + '?family=0';

export const sharedRedis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.startsWith('rediss://') ? {} : undefined,
});

sharedRedis.on('connect', () =>
  console.log('✅ Connected to Redis:', redisUrl)
);
sharedRedis.on('error', err =>
  console.error('Redis error:', err)
);

