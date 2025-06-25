// config/redis.js
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL + "?family=0";

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
});

redisClient.on("connect", () => console.log("✅ Connected to Redis:", redisUrl));
redisClient.on("error", err => console.error("Redis error:", err));

export default redisClient;
