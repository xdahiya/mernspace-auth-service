import express, { NextFunction, Request, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);
router.post(
    "/",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    authenticate,
    canAccess([Roles.ADMIN]),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

export default router;
