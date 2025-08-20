import "reflect-metadata";

import cors from "cors";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";

import { Config } from "./config";
import { initOauth } from "./passport/Oauth";
import { tenantRouter, userRouter, authRouter, sessionRouter } from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import configureContainer from "./container";

const app = express();

const ALLOWED_DOMAINS = [Config.CLIENT_UI_DOMAIN, Config.ADMIN_UI_DOMAIN];

initOauth();
app.use(passport.initialize());

app.use(
    cors({
        origin: [
            ...(ALLOWED_DOMAINS as string[]),
            "http://localhost:5174",
            "https://ms-admin-social-dashboard.vercel.app",
            "https://mernspace-own-client-ui.vercel.app",
            "http://mernspace-order-service.xdahiya.loseyourip.com/",
            "http://localhost:5173",
            "http://localhost:5050",
            "http://localhost:5175",
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        credentials: true,
    }),
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Welcome to PRISMA 1.0 Auth service");
});

configureContainer();

app.use("/auth", authRouter);
app.use("/sessions", sessionRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use(globalErrorHandler);

export default app;
