"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
class MfaService {
    prismaClient;
    constructor({ prismaClient }) {
        this.prismaClient = prismaClient;
    }
    async generateMFASetup(user) {
        if (user.enable2FA) {
            return {
                message: "MFA already enabled",
            };
        }
        let secretKey = user.twoFactorSecret;
        if (!secretKey) {
            const secret = speakeasy_1.default.generateSecret({ name: "Auth Service" });
            secretKey = secret.base32;
            await this.prismaClient.user.update({
                where: { id: user.id },
                data: {
                    twoFactorSecret: secretKey,
                },
            });
        }
        const url = speakeasy_1.default.otpauthURL({
            secret: secretKey,
            label: `${user.firstName} ${user.lastName}`,
            issuer: "mernspace.com",
            encoding: "base32",
        });
        const qrImageUrl = await qrcode_1.default.toDataURL(url);
        return {
            message: "Scan the QR code or use the setup key.",
            secret: secretKey,
            qrImageUrl,
        };
    }
    async verifyMFASetup(user, code, secretKey) {
        if (user.enable2FA) {
            return {
                message: "MFA is already enabled",
                userPreferences: {
                    enable2FA: user.enable2FA,
                },
            };
        }
        const isValid = speakeasy_1.default.totp.verify({
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
    async revokeMFA(user) {
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
    async verifyMFAForLogin(user, code) {
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.enable2FA && !user.twoFactorSecret) {
            throw new Error("MFA not enabled for this user");
        }
        const isValid = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: code,
        });
        if (!isValid) {
            throw new Error("Invalid MFA code. Please try again.");
        }
        return true;
    }
}
exports.MfaService = MfaService;
