import Redis from "ioredis";

// Используем приватный URL, если доступен, иначе публичный (для разработки)
const redisUrl = process.env.RAILWAY_PRIVATE_DOMAIN 
  ? `redis://default:${process.env.REDIS_PASSWORD}@${process.env.RAILWAY_PRIVATE_DOMAIN}:6379`
  : process.env.REDIS_URL; // fallback (для локальной разработки)

if (!redisUrl) {
  throw new Error("Redis URL не указан!");
}

const redisClient = new Redis(redisUrl, {
  tls: process.env.RAILWAY_PRIVATE_DOMAIN ? {} : undefined, // Включаем TLS, если используем приватный домен
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redisClient;
