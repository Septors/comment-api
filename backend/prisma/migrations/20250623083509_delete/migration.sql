/*
  Warnings:

  - You are about to drop the column `captcha` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `captchaId` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "captcha",
DROP COLUMN "captchaId";
