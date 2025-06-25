// events/imageReady.subscriber.js
import Redis from "ioredis";
import eventEmitter from "./index.js"; // ← додай .js, якщо це ES-модулі

const redisSub = new Redis();

redisSub.subscribe("image-ready", (err) => {
  if (err) {
    console.error("Redis subscribe error:", err);
  } else {
    console.log(" Subscribed to 'image-ready'");
  }
});

redisSub.on("message", (channel, message) => {
  if (channel === "image-ready") {
    try {
      const data = JSON.parse(message);
      eventEmitter.emit("imageResized", data);
    } catch (err) {
      console.error(" Error parsing Redis message:", err);
    }
  }
});
