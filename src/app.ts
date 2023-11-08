import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRoutes from "./routes/auth";
import tenantRoutes from "./routes/tenant";
import userRoutes from "./routes/user";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ msg: "done" });
});

app.use("/auth", authRoutes);
app.use("/tenant", tenantRoutes);
app.use("/user", userRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || err.status || 500;

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
