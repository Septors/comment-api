/*
  Warnings:

  - Added the required column `fileName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "filePath" TEXT;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "fileName" TEXT NOT NULL;
