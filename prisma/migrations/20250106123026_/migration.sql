/*
  Warnings:

  - Added the required column `twoFactorSecret` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enable2FA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT NOT NULL;
