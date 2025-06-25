// workers/resize.worker.js
import { Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import prisma from "../config/prisma.js";
import { sharedRedis } from "../config/redis.js";
import { lifoCashCommentList } from "../services/comment.service.js";
import { resizeImage } from "../utils/image.utils.js";

const queueName = "resize-image";

// ✔ Планировщик задач (обеспечивает работу отложенных / повторяющихся задач)
new QueueScheduler(queueName, {
  createClient: (type) => {
    if (type === "bclient") {
      return new IORedis(process.env.REDIS_URL + "?family=0", {
        maxRetriesPerRequest: null,
      });
    }
    return sharedRedis;
  },
});

// ✔ Основной воркер
export const resizeWorker = new Worker(
  queueName,
  async (job) => {
    try {
      const { filePath, outPutPath, width, height, commentId, userId } = job.data;

      const { outputPath, outputFileResizeName } = await resizeImage(
        filePath,
        outPutPath,
        width,
        height
      );
      const resizeFilePath = `uploads/${outputFileResizeName}`;

      const newComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          fileName: outputFileResizeName,
          filePath: resizeFilePath,
          isResizing: false,
        },
      });

      await prisma.file.create({
        data: {
          userId,
          commentId,
          fileName: outputFileResizeName,
          type: "IMAGE",
          url: resizeFilePath,
        },
      });

      const commentWithFile = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { files: true },
      });

      console.log(newComment);

      await sharedRedis.publish("image-ready", JSON.stringify(commentWithFile));
      await lifoCashCommentList(newComment);
    } catch (err) {
      console.error("Error processing job:", err);
    }
  },
  {
    createClient: (type) => {
      if (type === "bclient") {
        return new IORedis(process.env.REDIS_URL + "?family=0", {
          maxRetriesPerRequest: null,
        });
      }
      return sharedRedis;
    },
  }
);

// 🛡️ Обработка ошибок и логирование
resizeWorker.on("error", (err) => console.error("Worker error:", err));
resizeWorker.on("failed", (job, err) =>
  console.error(`Job ${job.id} failed:`, err)
);
resizeWorker.on("completed", (job) =>
  console.log(`Job ${job.id} completed`)
);

