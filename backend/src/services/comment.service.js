import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import eventEmitter from "../events/index.js";
import { resizeQueue } from "../redis/queues.js";
import ApiError from "../utils/apiError.js";
import * as imageUtils from "../utils/image.utils.js";

const maxWidth = parseInt(process.env.MAX_WIDTH_IMAGE);
const maxHeight = parseInt(process.env.MAX_HEIGHT_IMAGE);

/*Перевіряє розміри файлу за рахунок функці cheImageSize,
вона приймає обьект файлу з multer.middleware,отримує його мета данні,та звіряє з потрібнимию.*/
export const checkSizeFile = async (filePath) => {
  const { width, height } = await imageUtils.checkImageSize(filePath);
  return width <= maxWidth && height <= maxHeight;
};

//створює комментар за рахунок айді користувача який ми отрумуємо через токен доступу та данних с тіла запиту.
export const createCommentWithoutFile = async (
  userId,
  data,
  isResizing = false
) => {
  const comment = await prisma.comment.create({
    data: {
      ...data,
      userId,
      isResizing,
    },
  });
  return comment;
};

//створює коментар без файлу,створюємо файл,підвязуємо файл до коментарю
export const createComment = async (userId, data, fileData, fileType) => {
  const comment = await createCommentWithoutFile(userId, data);
  const filePath = `uploads/${fileData.filename}`;
  const newComment = await prisma.file.create({
    data: {
      userId: userId,
      commentId: comment.id,
      fileName: fileData.filename,
      type: fileType,
      url: filePath,
    },
  });
  await addFileToComment(userId, comment.id, fileData.filename, fileData.path);
  const commentWithFile = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: { files: true },
  });

  eventEmitter.emit("commentCreated", commentWithFile);
  return newComment;
};

//за рахунок того що створення коментаря універсальне,при наявності файлу ми його  підвязуємо до коментаря.
export const addFileToComment = async (userId, commentId, fileName) => {
  const filePath = `uploads/${fileName}`;
  await prisma.comment.update({
    where: {
      id: commentId,
      userId,
    },
    data: {
      fileName,
      filePath: filePath,
    },
  });
};

//створення коментарю в залежності від типу файла,а також його розміру.
export const createCommentWithFile = async (userId, data, fileData) => {
  const typeFile = fileData.mimetype === "text/plain" ? "TEXT" : "IMAGE"; //Перевіряємо типу файлу.

  //Якщо це файловий текст,то створюємо коментар,файл,підвязуємо файл.
  if (typeFile === "TEXT") {
    await createComment(userId, data, fileData, typeFile);
    return;
  }

  const isSizeValid = await checkSizeFile(fileData.path); //Викликаємо перевірку розміру файлу.
  //Якщо в нормі то створюємо коментар,файл,підвязуємо файл під коментар,а якщо ні то створяємо коментар,передаємо в чергу для зміну черги.
  if (isSizeValid) {
    const newComment = await createComment(userId, data, fileData, typeFile);

    await lifoCashCommentList(newComment);
  } else {
    const comment = await createCommentWithoutFile(userId, data, true);
    await resizeQueue.add("resize-image", {
      filePath: fileData.path,
      outPutPath: fileData.filename,
      width: maxWidth,
      height: maxHeight,
      commentId: comment.id,
      userId,
    });
  }
};

//перевірка вхідних данних для фільрації
export const checkQuerySelect = (querySelect) => {
  const limit = querySelect.limit === "25" ? parseInt(querySelect.limit) : 25;
  const page = parseInt(querySelect.page) > 0 ? parseInt(querySelect.page) : 1;
  const skip = (page - 1) * limit;
  const validSortBy = ["userName", "email", "createdAt"];
  const sortBy = validSortBy.includes(querySelect.sortBy)
    ? querySelect.sortBy
    : "createdAt";
  const orderBy = querySelect.orderBy === "desc" ? "desc" : "asc";

  const userId = parseInt(querySelect.userId)
    ? parseInt(querySelect.userId)
    : null;

  return { limit, page, skip, sortBy, orderBy, userId };
};

//фільтрація та отримання  коментарів
export const getFilterComments = async (querySelect) => {
  const { limit, page, skip, sortBy, orderBy, userId } =
    checkQuerySelect(querySelect);

  const filterKey = `comment:filter:${sortBy}:order:${orderBy}:page:${page}:userId:${userId}`;

  const cachedComments = await redisClient.get(filterKey);

  if (cachedComments) {
    return JSON.parse(cachedComments);
  }
  const filteredComments = await prisma.comment.findMany({
    where: {
      parentId: null,
      ...(userId && { userId }),
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: orderBy,
    },
    include: {
      replies: true,
    },
  });

  await redisClient.set(filterKey, JSON.stringify(filteredComments), "EX", 60);
  return filteredComments;
};

export const getLifoComments = async () => {
  const lifoCashKey = "comments:lifo";
  const lifoCashFilter = await redisClient.lrange(lifoCashKey, 0, -1);

  if (lifoCashFilter.length > 0) {
    return lifoCashFilter
      .filter((comm) => !!comm && comm.trim() !== "")
      .map((comm) => {
        try {
          return JSON.parse(comm);
        } catch (e) {
          console.warn("⚠️ Invalid JSON in Redis:", comm);
          return null;
        }
      })
      .filter((comm) => comm !== null);
  }

  const newlifoCollection = await prisma.comment.findMany({
    where: {
      parentId: null,
    },
    take: 25,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      files: true,
      replies: true,
    },
  });

  await redisClient.del(lifoCashKey);
  if (newlifoCollection.length > 0) {
    await redisClient.rpush(
      lifoCashKey,
      ...newlifoCollection.map((comm) => JSON.stringify(comm))
    );
    return newlifoCollection;
  } else {
    throw new ApiError(404, "User comment not found in base");
  }
};

export const lifoCashCommentList = async (newComment) => {
  const lifoKey = "comments:lifo";
  const lifoCacheLength = await redisClient.llen(lifoKey);
  const lifoCashFilter = await redisClient.lrange(lifoKey, 0, -1);

  if (lifoCacheLength) {
    await redisClient.lpush(lifoKey, JSON.stringify(newComment));
    await redisClient.ltrim(lifoKey, 0, 24);
  } else {
    const lifoCollection = await prisma.comment.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        replies: true,
      },
      take: 25,
    });

    const listLifoComment = lifoCollection.map((comm) => JSON.stringify(comm));

    if (listLifoComment.length) {
      await redisClient.lpush(lifoKey, ...listLifoComment);
    }
  }
};
