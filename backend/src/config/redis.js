import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://default:********@ballast.proxy.rlwy.net:49795";

const redisClient = new Redis(
  process.env.REDIS_URL + '?family=0',
  { maxRetriesPerRequest: null, enableReadyCheck: false, tls: redisUrl.startsWith('rediss://') ? {} : undefined }
);


// Логирование для отладки
console.log(`Connecting to Redis at: ${redisUrl.replace(/:.*@/, ':********@')}`);

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Successfully connected to Redis");
});

export default redisClient;
