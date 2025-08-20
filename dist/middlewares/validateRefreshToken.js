"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../config/logger"));
const container_1 = require("../container");
const date_fns_1 = require("date-fns");
exports.default = (0, express_jwt_1.expressjwt)({
    secret: config_1.Config.REFRESH_TOKEN_SECRET,
    algorithms: ["HS256"],
    getToken(req) {
        const { refreshToken } = req.cookies;
        return refreshToken;
    },
    async isRevoked(request, token) {
        try {
            const prismaClient = container_1.container.resolve("prismaClient");
            const refreshToken = await prismaClient.refreshToken.findFirst({
                where: {
                    id: Number((token?.payload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });
            if (refreshToken && refreshToken.deletionTime) {
                if ((0, date_fns_1.isPast)(Number(refreshToken.deletionTime))) {
                    return true;
                }
            }
            return refreshToken === null;
        }
        catch (error) {
            logger_1.default.error("Error while getting the refresh token" + error, {
                id: (token?.payload).id,
            });
        }
        return true;
    },
});
