import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import logger from "../config/logger";
import { container } from "../container";
import { isPast } from "date-fns";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const prismaClient = container.resolve("prismaClient");
            const refreshToken = await prismaClient.refreshToken.findFirst({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });

            if (refreshToken && refreshToken.deletionTime) {
                if (isPast(Number(refreshToken.deletionTime))) {
                    return true;
                }
            }
            return refreshToken === null;
        } catch (error) {
            logger.error("Error while getting the refresh token" + error, {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    },
});
