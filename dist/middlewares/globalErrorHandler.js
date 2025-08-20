"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../config/logger"));
const globalErrorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const errorId = (0, uuid_1.v4)();
    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === "production";
    // const message = isProduction ? "Internal server error" : err.message;
    /// todo: error message should be more user friendly if 400 then send to client
    let message = "";
    if (err.message) {
        message = err.message;
    }
    else {
        message = "Internal Server Error";
    }
    if (!(statusCode == 401)) {
        logger_1.default.error(err.message, {
            id: errorId,
            statusCode,
            error: err.stack,
            path: req.path,
            method: req.method,
        });
    }
    else {
        logger_1.default.info(`${req.method} ${req.path} not authenticated`);
    }
    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                location: "server",
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
exports.globalErrorHandler = globalErrorHandler;
