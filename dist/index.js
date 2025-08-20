"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("./config/logger"));
const container_1 = __importDefault(require("./container"));
const startServer = async () => {
    const PORT = config_1.Config.PORT;
    try {
        const client = new client_1.PrismaClient();
        await client.$connect();
        (0, container_1.default)();
        logger_1.default.info("Database connected successfully.");
        app_1.default.listen(PORT, () => logger_1.default.info(`Listening on port ${PORT} in  ${config_1.Config.NODE_ENV} Environment`));
    }
    catch (err) {
        if (err instanceof Error) {
            logger_1.default.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};
void startServer();
exports.default = app_1.default;
