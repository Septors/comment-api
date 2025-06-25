import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const resizeImage = async (filePath, outputFileName, width, height) => {
  const ext = path.extname(outputFileName);
  const baseName = path.basename(outputFileName, ext);
  const outputFileResizeName = `resize-${baseName}${ext}`;

  const uploadDir = path.resolve("uploads");
  const outputPath = path.join(uploadDir, outputFileResizeName);

  await sharp(filePath)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  await fs.unlink(filePath);

  return { outputPath, outputFileResizeName };
};

export const checkImageSize = async (filePath) => {
  const { width, height } = await sharp(filePath).metadata();
  return { width, height };
};
