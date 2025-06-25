import { Worker } from "bullmq";
import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { lifoCashCommentList } from "../services/comment.service.js";
import { resizeImage } from "../utils/image.utils.js";

const resizeWorker = new Worker(
  "resize-image",
  async (job) => {
    try {
      const { filePath, outPutPath, width, height, commentId, userId } =
        job.data;
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

      await redisClient.publish("image-ready", JSON.stringify(commentWithFile));
      await lifoCashCommentList(newComment);
    } catch (err) {
      console.error(err);
    }
  },
  {
    connection: redisClient,
  }
);

resizeWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

resizeWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

resizeWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});
