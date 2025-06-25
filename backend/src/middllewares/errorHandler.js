import { Prisma } from "@prisma/client";
import ApiError from "../utils/apiError.js";

export const handleErrorMidlleware = (err, req, res, next) => {
  console.error("Error:", err.stack);
  if (res.headersSent) {
    // Если ответ уже отправлен, передаём ошибку дальше в express
    return next(err);
  }
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    const fields = err.meta?.target?.join(", ") || "поле";
    return res.status(409).json({
      status: "error",
      message: `Значення для поля "${fields}" вже використовується`,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("ERROR:", err.message, err.stack);

  res.status(500).json({
    status: "error",
    message: "Внутрішня помилка сервера",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
