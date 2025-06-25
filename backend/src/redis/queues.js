import { Queue } from "bullmq";
import redisClient from "../config/redis.js";

export const resizeQueue = new Queue("resize-image", {
  connection: redisClient,
});
