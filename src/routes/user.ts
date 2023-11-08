import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";

import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";

const router = express.Router();

const userRepo = AppDataSource.getRepository(User);
const userService = new UserService(userRepo);
const userController = new UserController(userService, logger);
router.post(
    "/",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    authenticate,
    canAccess([Roles.ADMIN]),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;
