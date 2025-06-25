/*
  Warnings:

  - You are about to drop the column `userName` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "userName";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userName" TEXT NOT NULL DEFAULT 'Anonymous';
