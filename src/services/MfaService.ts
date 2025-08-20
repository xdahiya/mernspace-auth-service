import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { PrismaClient, User } from "@prisma/client";

export class MfaService {
    private prismaClient: PrismaClient;
    constructor({ prismaClient }: { prismaClient: PrismaClient }) {
        this.prismaClient = prismaClient;
    }

    public async generateMFASetup(user: User) {
        if (user.enable2FA) {
            return {
                message: "MFA already enabled",
            };
        }

        let secretKey = user.twoFactorSecret;
        if (!secretKey) {
            const secret = speakeasy.generateSecret({ name: "Auth Service" });
            secretKey = secret.base32;

            await this.prismaClient.user.update({
                where: { id: user.id },
                data: {
                    twoFactorSecret: secretKey,
                },
            });
        }

        const url = speakeasy.otpauthURL({
            secret: secretKey,
            label: `${user.firstName} ${user.lastName}`,
            issuer: "mernspace.com",
            encoding: "base32",
        });

        const qrImageUrl = await qrcode.toDataURL(url);
        return {
            message: "Scan the QR code or use the setup key.",
            secret: secretKey,
            qrImageUrl,
        };
    }

    public async verifyMFASetup(user: User, code: string, secretKey: string) {
        if (user.enable2FA) {
            return {
                message: "MFA is already enabled",
                userPreferences: {
                    enable2FA: user.enable2FA,
                },
            };
        }

        const isValid = speakeasy.totp.verify({
            secret: secretKey,
            encoding: "base32",
            token: code,
        });

        if (!isValid) {
            throw new Error("Invalid MFA code. Please try again.");
        }

        await this.prismaClient.user.update({
            where: { id: user.id },
            data: {
                enable2FA: true,
            },
        });

        return {
            message: "MFA setup completed successfully",
            userPreferences: {
                enable2FA: user.enable2FA,
            },
        };
    }

    public async revokeMFA(user: User) {
        if (!user) {
            throw new Error("User not authorized");
        }

        if (!user.enable2FA) {
            return {
                message: "MFA is not enabled",
                userPreferences: {
                    enable2FA: user.enable2FA,
                },
            };
        }

        await this.prismaClient.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: null,
                enable2FA: false,
            },
        });

        return {
            message: "MFA revoke successfully",
            userPreferences: {
                enable2FA: false,
            },
        };
    }

    public async verifyMFAForLogin(user: User, code: string) {
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.enable2FA && !user.twoFactorSecret) {
            throw new Error("MFA not enabled for this user");
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: "base32",
            token: code,
        });

        if (!isValid) {
            throw new Error("Invalid MFA code. Please try again.");
        }

        return true;
    }
}
