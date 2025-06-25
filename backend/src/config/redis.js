import Redis from "ioredis";

const redisClient =  new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
 

redisClient.on("error", (err) => {
  console.error("Redis client error", err);
});

redisClient.on("ready", () => {
  console.log("Redis client connected and ready");
});

export default redisClient;
