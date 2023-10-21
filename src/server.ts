import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        const PORT = Config.PORT;
        logger.info("DATABASE CONNECTED SUCCESSFULLY ");
        app.listen(PORT, () => {
            logger.info(`START LISTENTING ON PORT : ${PORT}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

startServer()
    .then(() => {
        logger.info("STARTED");
    })
    .catch((err) => {
        logger.error("ERROR :", err);
    });
