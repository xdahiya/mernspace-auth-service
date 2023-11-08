import express, { NextFunction, Request, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";
import logger from "../config/logger";

const router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
);

export default router;
