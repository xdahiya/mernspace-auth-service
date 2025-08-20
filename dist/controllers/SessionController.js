"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
class SessionController {
    tokenService;
    logger;
    constructor({ tokenService, logger, }) {
        this.tokenService = tokenService;
        this.logger = logger;
    }
    async getAll(req, res, next) {
        try {
            const userId = req.auth.sub;
            const refreshId = req.auth.refreshId;
            const data = await this.tokenService.getSessions(Number(userId), refreshId);
            this.logger.silly("All sessions have been fetched");
            res.json({
                data: data,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async destroy(req, res, next) {
        const tokenId = req.params.id;
        if (isNaN(Number(tokenId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        try {
            await this.tokenService.setdeleteTimeInRefreshToken(Number(tokenId));
            this.logger.silly("Session has been deleted", {
                id: Number(tokenId),
            });
            res.json({ id: Number(tokenId) });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SessionController = SessionController;
