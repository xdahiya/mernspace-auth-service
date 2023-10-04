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
// function test(username: string): string {
//     const user = {
//         name: "rakesh",
//     };
//     console.log("hii");
//     return username + user.name;
// }

// test("anas");
