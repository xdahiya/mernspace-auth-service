import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";

const router = express.Router();

const userRepo = AppDataSource.getRepository(User);
const userService = new UserService(userRepo);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepo);
const authController = new AuthController(userService, tokenService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post(
    "/register",
    registerValidator,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
