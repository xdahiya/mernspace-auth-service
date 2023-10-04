import app from "./app";
import { Config } from "./config";

const startServer = () => {
    try {
        const PORT = Config.PORT;
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log("STAR LISTENTING ON PORT :", PORT);
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
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
