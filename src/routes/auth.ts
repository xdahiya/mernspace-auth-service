import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import { CredentialsService } from "../services/CredentialsService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";

const router = express.Router();

const userRepo = AppDataSource.getRepository(User);
const userService = new UserService(userRepo);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepo);

const credentialsService = new CredentialsService();

const authController = new AuthController(
    userService,
    tokenService,
    credentialsService,
    logger,
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post(
    "/register",
    registerValidator,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post(
    "/login",
    loginValidator,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get(
    "/self",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    authenticate,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response) =>
        authController.self(req as AuthRequest, res),
);

export default router;
