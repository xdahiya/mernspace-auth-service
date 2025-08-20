"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenServicePrisma = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = require("jsonwebtoken");
const date_fns_1 = require("date-fns");
const config_1 = require("../config");
class TokenServicePrisma {
    prismaClient;
    constructor({ prismaClient }) {
        this.prismaClient = prismaClient;
    }
    generateAccessToken(payload) {
        let privateKey;
        try {
            privateKey = config_1.Config.PRIVATE_KEY;
        }
        catch (err) {
            const error = (0, http_errors_1.default)(500, "Error while reading private key" + err);
            throw error;
        }
        const accessToken = (0, jsonwebtoken_1.sign)(payload, privateKey, {
            algorithm: "RS256",
            // expiresIn: "10s",
            expiresIn: "60s",
            // expiresIn: "15m",
            issuer: "auth-service",
        });
        return accessToken;
    }
    generateRefreshToken(payload) {
        const refreshToken = (0, jsonwebtoken_1.sign)(payload, config_1.Config.REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            // expiresIn: "20s",
            expiresIn: "24h",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }
    generateResetPasswordToken(id) {
        const token = (0, jsonwebtoken_1.sign)({ userID: id }, `${id}${config_1.Config.REFRESH_TOKEN_SECRET}`, {
            algorithm: "HS256",
            expiresIn: "15m",
            issuer: "auth-service",
            jwtid: String(id),
        });
        return token;
    }
    generateMfaLoginToken(id) {
        const token = (0, jsonwebtoken_1.sign)({ userID: id }, `${id}${config_1.Config.REFRESH_TOKEN_SECRET}`, {
            algorithm: "HS256",
            expiresIn: "1m",
            issuer: "auth-service",
            jwtid: String(id),
        });
        return token;
    }
    verifyResetPasswordToken(id, token) {
        return (0, jsonwebtoken_1.verify)(token, `${id}${config_1.Config.REFRESH_TOKEN_SECRET}`);
    }
    verifyMfaLoginToken(id, token) {
        return (0, jsonwebtoken_1.verify)(token, `${id}${config_1.Config.REFRESH_TOKEN_SECRET}`);
    }
    hashOtp(data) {
        return crypto_1.default
            .createHmac("sha256", config_1.Config.REFRESH_TOKEN_SECRET)
            .update(data)
            .digest("hex");
    }
    verifyOtp(hashed, data) {
        const prevhash = this.hashOtp(data);
        return prevhash === hashed;
    }
    async persistRefreshToken(userId, userAgent, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firstCreatedAt) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daata = {
            userId: userId,
            userAgent: userAgent,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        };
        if (firstCreatedAt) {
            daata.firstCreatedAt = new Date(firstCreatedAt);
        }
        const newRefreshToken = await this.prismaClient.refreshToken.create({
            data: daata,
        });
        return newRefreshToken;
    }
    async getSessions(userId, refreshId) {
        const sessionsList = await this.prismaClient.refreshToken.findMany({
            where: {
                userId: userId,
            },
        });
        const newSessionsList = [];
        for (let i = 0; i < sessionsList.length; i++) {
            if (!sessionsList[i].deletionTime) {
                if (sessionsList[i].id == refreshId) {
                    newSessionsList.push({
                        ...sessionsList[i],
                        isCurrent: true,
                    });
                }
                else {
                    newSessionsList.push({
                        ...sessionsList[i],
                        isCurrent: false,
                    });
                }
            }
        }
        return newSessionsList;
    }
    async getRefreshTokenById(refresTokenhId) {
        const refeshtokn = await this.prismaClient.refreshToken.findFirst({
            where: {
                id: refresTokenhId,
            },
        });
        return refeshtokn;
    }
    async setdeleteTimeInRefreshToken(tokenId, userId) {
        if (userId) {
            const deletionTime = new Date(Date.now() + 30000);
            const sessionsList = await this.prismaClient.refreshToken.findMany({
                where: {
                    userId: userId,
                },
            });
            for (let i = 0; i < sessionsList.length; i++) {
                if (sessionsList[i].deletionTime) {
                    if ((0, date_fns_1.isPast)(Number(sessionsList[i].deletionTime))) {
                        await this.prismaClient.refreshToken.delete({
                            where: { id: sessionsList[i].id },
                        });
                    }
                }
            }
            await this.prismaClient.refreshToken.update({
                where: {
                    id: tokenId,
                    userId: userId,
                },
                data: {
                    deletionTime: deletionTime,
                },
            });
        }
        else {
            await this.prismaClient.refreshToken.delete({
                where: { id: tokenId },
            });
        }
    }
}
exports.TokenServicePrisma = TokenServicePrisma;
