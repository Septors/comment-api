import prisma from "../config/prisma.js";
import eventEmitter from "../events/index.js";
import ApiError from "../utils/apiError.js";
import * as imageUtils from "../utils/image.utils.js";

const maxWidth = 320;
const maxHeight = 240;


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
  const checkParentComment =await prisma.comment.findUnique({
    where:{id:data.parentId},
  });
  if(!checkParentComment){throw new ApiError(404,"Comment with this id not found")};
    console.log(checkParentComment)
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
    console.log(maxWidth);
      console.log( maxHeight)
  //Якщо це файловий текст,то створюємо коментар,файл,підвязуємо файл.
  if (typeFile === "TEXT") {
    await createComment(userId, data, fileData, typeFile);
    return;
  }
  const isSizeValid = await checkSizeFile(fileData.path); //Викликаємо перевірку розміру файлу.
  //Якщо в нормі то створюємо коментар,файл,підвязуємо файл під коментар,а якщо ні то створяємо коментар,передаємо в чергу для зміну черги.
  if (isSizeValid) {
    const newComment = await createComment(userId, data, fileData, typeFile);

  }else{
      const comments = await createCommentWithoutFile(userId, data, true);
      const { outputPath, outputFileResizeName } = await imageUtils.resizeImage(
        fileData.path,
        fileData.filename,
        maxWidth,
        maxHeight
      );
      const resizeFilePath = `uploads/${outputFileResizeName}`;
      await prisma.comment.update({
        where: { id: comments.id },
        data: {
          fileName: outputFileResizeName,
          filePath: resizeFilePath,
          isResizing: false,
        },
      });

      await prisma.file.create({
        data: {
          userId,
          commentId:comments.id,
          fileName: outputFileResizeName,
          type: "IMAGE",
          url: resizeFilePath,
        },
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

  return filteredComments;
};

export const getLifoComments = async () => {

  const newlifoCollection = await prisma.comment.findMany({
    where: {
      parentId: null,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      files: true,
      replies: true,
    },
  });
  return newlifoCollection;
};


