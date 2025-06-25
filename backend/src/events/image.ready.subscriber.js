import { sharedRedis } from "../config/redis.js"; // изменил export
import eventEmitter from "./index.js";

const redisSub = sharedRedis.duplicate(); // создаёт подписчик на том же подключении

redisSub.subscribe("image-ready", err => {
  if (err) console.error("Redis subscribe error:", err);
  else console.log("✅ Subscribed to 'image-ready'");
});

redisSub.on("message", (channel, message) => {
  if (channel === "image-ready") {
    try {
      const data = JSON.parse(message);
      eventEmitter.emit("imageResized", data);
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  }
});

