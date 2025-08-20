"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = exports.tenantRouter = exports.userRouter = exports.authRouter = void 0;
const auth_1 = __importDefault(require("./auth"));
exports.authRouter = auth_1.default;
const user_1 = __importDefault(require("./user"));
exports.userRouter = user_1.default;
const tenant_1 = __importDefault(require("./tenant"));
exports.tenantRouter = tenant_1.default;
const sessions_1 = __importDefault(require("./sessions"));
exports.sessionRouter = sessions_1.default;
