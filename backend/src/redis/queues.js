
// redis/queues.js
import { Queue } from "bullmq";
import { sharedRedis } from "../config/redis.js";

export const resizeQueue = new Queue("resize-image", {
  createClient: (type) => {
    if (type === "bclient") {
      return new IORedis(process.env.REDIS_URL + "?family=0", {
        maxRetriesPerRequest: null,
      });
    }
    return sharedRedis;
  },
});
