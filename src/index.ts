import { PrismaClient } from "@prisma/client";
import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

import configureContainer from "./container";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        const client = new PrismaClient();
        await client.$connect();
        configureContainer();
        logger.info("Database connected successfully.");
        app.listen(PORT, () =>
            logger.info(
                `Listening on port ${PORT} in  ${Config.NODE_ENV} Environment`,
            ),
        );
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void startServer();

export default app;
