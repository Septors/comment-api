import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/gif", "image/png", "text/plain"];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Непідтримуваний тип файлу"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
