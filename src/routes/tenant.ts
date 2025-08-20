import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";

import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenant-validator";
import { CreateTenantRequest } from "../types";
import listUsersValidator from "../validators/list-users-validator";

import configureContainer from "../container";

const router = express.Router();
const container = configureContainer();
const tenantController = container.resolve("tenantController");

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.create(req, res, next);
    },
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.update(req, res, next);
    },
);
router.get(
    "/",
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) => {
        tenantController.getAll(req, res, next);
    },
);
router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => {
        tenantController.getOne(req, res, next);
    },
);
router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => {
        tenantController.destroy(req, res, next);
    },
);

export default router;
