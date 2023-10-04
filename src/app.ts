import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import createError, { HttpError } from "http-errors";

const app = express();

app.get("/", (req, res) => {
    const err = createError(401, "manthan not allowed to view this page");
    throw err;
    res.json({ msg: "done" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                location: "",
                path: "",
            },
        ],
    });
});

export default app;
