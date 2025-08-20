"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const express_validator_1 = require("express-validator");
class UserController {
    userService;
    logger;
    constructor({ userService, logger, }) {
        this.userService = userService;
        this.logger = logger;
    }
    async create(req, res, next) {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return next((0, http_errors_1.default)(400, result.array()[0].msg));
        }
        const { firstName, lastName, email, password, tenantId, role } = req.body;
        this.logger.silly("Request for creating a user", req.body);
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            res.status(201).json({ id: user.id });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, role, email, tenantId } = req.body;
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        this.logger.silly("Request for updating a user", userId, req.body);
        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
                email,
                tenantId: Number(tenantId),
            });
            this.logger.info("User has been updated", { id: userId });
            res.json({ id: Number(userId) });
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        const validatedQuery = (0, express_validator_1.matchedData)(req, { onlyValidData: true });
        try {
            const { users, count } = await this.userService.getAll(validatedQuery);
            this.logger.silly("All users have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: users,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        try {
            const user = await this.userService.getById(Number(userId));
            if (!user) {
                next((0, http_errors_1.default)(400, "User does not exist."));
                return;
            }
            this.logger.silly("User has been fetched", { id: user.id });
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    }
    async destroy(req, res, next) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        try {
            await this.userService.deleteById(Number(userId));
            this.logger.silly("User has been deleted", {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
