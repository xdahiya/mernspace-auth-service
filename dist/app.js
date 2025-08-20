"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const Oauth_1 = require("./passport/Oauth");
const routes_1 = require("./routes");
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const container_1 = __importDefault(require("./container"));
const app = (0, express_1.default)();
const ALLOWED_DOMAINS = [config_1.Config.CLIENT_UI_DOMAIN, config_1.Config.ADMIN_UI_DOMAIN];
(0, Oauth_1.initOauth)();
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: [
        ...ALLOWED_DOMAINS,
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
}));
app.use(express_1.default.static("public"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Welcome to PRISMA 1.0 Auth service");
});
(0, container_1.default)();
app.use("/auth", routes_1.authRouter);
app.use("/sessions", routes_1.sessionRouter);
app.use("/tenants", routes_1.tenantRouter);
app.use("/users", routes_1.userRouter);
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
