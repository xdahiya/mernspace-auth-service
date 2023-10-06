import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRoutes from "./routes/auth";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ msg: "done" });
});

app.use("/auth", authRoutes);

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
