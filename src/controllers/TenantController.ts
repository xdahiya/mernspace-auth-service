import { Logger } from "winston";
import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

import { CreateTenantRequest, TenantQueryParams } from "../types";
import { TenantServicePrimsa } from "../services/TenantServicePrisma";

export class TenantController {
    private tenantService: TenantServicePrimsa;
    private logger: Logger;

    constructor({
        tenantService,
        logger,
    }: {
        tenantService: TenantServicePrimsa;
        logger: Logger;
    }) {
        this.tenantService = tenantService;
        this.logger = logger;
    }

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, address } = req.body;
        this.logger.silly("Request for creating a tenant", req.body);
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.silly("Tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (err) {
            next(err);
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, address } = req.body;
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
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
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const { tenants, count } = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams,
            );
            this.logger.silly("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, "Tenant does not exist."));
                return;
            }
            this.logger.silly("Tenant has been fetched");
            res.json(tenant);
        } catch (err) {
            next(err);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));
            this.logger.silly("Tenant has been deleted", {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
}
