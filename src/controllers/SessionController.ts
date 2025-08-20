import { Logger } from "winston";
import createHttpError from "http-errors";
import { NextFunction, Response } from "express";

import { AuthRequest } from "../types";
import { TokenServicePrisma } from "../services";

export class SessionController {
    private tokenService: TokenServicePrisma;
    private logger: Logger;

    constructor({
        tokenService,
        logger,
    }: {
        tokenService: TokenServicePrisma;
        logger: Logger;
    }) {
        this.tokenService = tokenService;
        this.logger = logger;
    }

    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.auth.sub;
            const refreshId = req.auth.refreshId;
            const data = await this.tokenService.getSessions(
                Number(userId),
                refreshId,
            );

            this.logger.silly("All sessions have been fetched");
            res.json({
                data: data,
            });
        } catch (err) {
            next(err);
        }
    }

    async destroy(req: AuthRequest, res: Response, next: NextFunction) {
        const tokenId = req.params.id;
        if (isNaN(Number(tokenId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tokenService.setdeleteTimeInRefreshToken(
                Number(tokenId),
            );
            this.logger.silly("Session has been deleted", {
                id: Number(tokenId),
            });
            res.json({ id: Number(tokenId) });
        } catch (err) {
            next(err);
        }
    }
}
