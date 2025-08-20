"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const express_validator_1 = require("express-validator");
class TenantController {
    tenantService;
    logger;
    constructor({ tenantService, logger, }) {
        this.tenantService = tenantService;
        this.logger = logger;
    }
    async create(req, res, next) {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, address } = req.body;
        this.logger.silly("Request for creating a tenant", req.body);
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.silly("Tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
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
        const { name, address } = req.body;
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        this.logger.silly("Request for updating a tenant", tenantId, req.body);
        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            this.logger.silly("Tenant has been updated", { id: tenantId });
            res.json({ id: Number(tenantId) });
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        const validatedQuery = (0, express_validator_1.matchedData)(req, { onlyValidData: true });
        try {
            const { tenants, count } = await this.tenantService.getAll(validatedQuery);
            this.logger.silly("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: tenants,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next((0, http_errors_1.default)(400, "Tenant does not exist."));
                return;
            }
            this.logger.silly("Tenant has been fetched");
            res.json(tenant);
        }
        catch (err) {
            next(err);
        }
    }
    async destroy(req, res, next) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next((0, http_errors_1.default)(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));
            this.logger.silly("Tenant has been deleted", {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TenantController = TenantController;
