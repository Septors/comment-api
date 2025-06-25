import fs from "fs/promises";

export const checkTxtFileSize = async (req, res, next) => {
  if (!req.file) return next();

  const isTextFile = req.file.mimetype === "text/plain";
  if (!isTextFile) return next();

  try {
    const stats = await fs.stat(req.file.path);
    if (stats.size > 100 * 1024) {
      // видаляємо файл, якщо перевищено
      await fs.unlink(req.file.path);
      return res
        .status(400)
        .json({ message: "TXT не повинен перевищувати 100КБ" });
    }
    next();
  } catch (err) {
    return next(err);
  }
};
