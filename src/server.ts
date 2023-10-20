import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
    try {
        const PORT = Config.PORT;
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

startServer();
