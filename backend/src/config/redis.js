import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD, // если требуется
  maxRetriesPerRequest: null, // важно для BullMQ
  enableReadyCheck: false,
};

const redisClient = new Redis(redisConfig);

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

export default redisClient;
