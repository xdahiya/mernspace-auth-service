import crypto from "crypto";
import createHttpError from "http-errors";
import { PrismaClient } from "@prisma/client";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { isPast } from "date-fns";

import { Config } from "../config";

export class TokenServicePrisma {
    private prismaClient: PrismaClient;

    constructor({ prismaClient }: { prismaClient: PrismaClient }) {
        this.prismaClient = prismaClient;
    }

    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        try {
            privateKey = Config.PRIVATE_KEY!;
        } catch (err) {
            const error = createHttpError(
                500,
                "Error while reading private key" + err,
            );
            throw error;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            // expiresIn: "10s",
            expiresIn: "60s",
            // expiresIn: "15m",
            issuer: "auth-service",
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            // expiresIn: "20s",
            expiresIn: "24h",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    generateResetPasswordToken(id: number) {
        const token = sign(
            { userID: id },
            `${id}${Config.REFRESH_TOKEN_SECRET!}`,
            {
                algorithm: "HS256",
                expiresIn: "15m",
                issuer: "auth-service",
                jwtid: String(id),
            },
        );
        return token;
    }

    generateMfaLoginToken(id: number) {
        const token = sign(
            { userID: id },
            `${id}${Config.REFRESH_TOKEN_SECRET!}`,
            {
                algorithm: "HS256",
                expiresIn: "1m",
                issuer: "auth-service",
                jwtid: String(id),
            },
        );
        return token;
    }

    verifyResetPasswordToken(id: number, token: string) {
        return verify(token, `${id}${Config.REFRESH_TOKEN_SECRET!}`);
    }

    verifyMfaLoginToken(id: number, token: string) {
        return verify(token, `${id}${Config.REFRESH_TOKEN_SECRET!}`);
    }

    hashOtp(data: string) {
        return crypto
            .createHmac("sha256", Config.REFRESH_TOKEN_SECRET!)
            .update(data)
            .digest("hex");
    }

    verifyOtp(hashed: string, data: string) {
        const prevhash = this.hashOtp(data);
        return prevhash === hashed;
    }

    async persistRefreshToken(
        userId: number,
        userAgent: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firstCreatedAt?: any,
    ) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daata: any = {
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

    async getSessions(userId: number, refreshId: number) {
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
                } else {
                    newSessionsList.push({
                        ...sessionsList[i],
                        isCurrent: false,
                    });
                }
            }
        }

        return newSessionsList;
    }

    async getRefreshTokenById(refresTokenhId: number) {
        const refeshtokn = await this.prismaClient.refreshToken.findFirst({
            where: {
                id: refresTokenhId,
            },
        });
        return refeshtokn;
    }

    async setdeleteTimeInRefreshToken(tokenId: number, userId?: number) {
        if (userId) {
            const deletionTime = new Date(Date.now() + 30000);
            const sessionsList = await this.prismaClient.refreshToken.findMany({
                where: {
                    userId: userId,
                },
            });

            for (let i = 0; i < sessionsList.length; i++) {
                if (sessionsList[i].deletionTime) {
                    if (isPast(Number(sessionsList[i].deletionTime))) {
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
        } else {
            await this.prismaClient.refreshToken.delete({
                where: { id: tokenId },
            });
        }
    }
}
