import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { Config } from "../config";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";
// import { TokenPayload } from "../types";

export class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (err) {
            const error = createHttpError(
                500,
                "error while reading priavte key",
            );
            throw error;
        }

        const accessToken = sign(payload, privateKey, {
            expiresIn: "1h",
            algorithm: "RS256",
            issuer: "auth-service",
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            expiresIn: "1y",
            algorithm: "HS256",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = await this.refreshTokenRepo.save({
            user: user,
            expireAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return newRefreshToken;
    }
}
