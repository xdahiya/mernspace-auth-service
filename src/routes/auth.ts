import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import passport from "passport";

import { AuthRequest } from "../types";

//validators import
import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";

//middlewares import
import authenticate from "../middlewares/authenticate";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import validateRefreshToken from "../middlewares/validateRefreshToken";

import {
    parseGithubData,
    parseGoogleData,
} from "../middlewares/parseSocialAuthData";

import configureContainer from "../container";

const router = express.Router();

const container = configureContainer();
const authController = container.resolve("authController");

router.get("/nonce", (req: Request, res: Response, next: NextFunction) => {
    authController.nonce(req, res, next);
});

router.post("/verify", (req: Request, res: Response, next: NextFunction) => {
    authController.verifySignature(req, res, next);
});

router.post(
    "/register",
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.register(req, res, next);
    },
);

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) => {
        authController.login(req, res, next);
    },
);

router.post(
    "/refresh",
    validateRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.refresh(req as AuthRequest, res, next);
    },
);

router.post(
    "/logout",
    authenticate as RequestHandler,
    parseRefreshToken as RequestHandler,
    validateRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.logout(req as AuthRequest, res, next);
    },
);

router.get(
    "/setupMfa",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.generateMFASetup(req, res, next);
    },
);

router.post(
    "/sendVerifyEmail",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.sendVerifyEmail(req, res, next);
    },
);

router.post(
    "/verifyEmail",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.verifyEmail(req, res, next);
    },
);

router.post(
    "/changePassword",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.changePassword(req, res, next);
    },
);

router.post(
    "/sendUserPasswordResetEmail",
    (req: Request, res: Response, next: NextFunction) => {
        authController.sendUserPasswordResetEmail(req, res, next);
    },
);

router.post(
    "/userPasswordReset",
    (req: Request, res: Response, next: NextFunction) => {
        authController.userPasswordReset(req, res, next);
    },
);

router.post(
    "/verifyMfa",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.verifyMFASetup(req, res, next);
    },
);

router.post(
    "/revokeMfa",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.revokeMFA(req, res, next);
    },
);

router.post(
    "/verifyLoginMfa",
    (req: Request, res: Response, next: NextFunction) => {
        authController.verifyMFAForLogin(req, res, next);
    },
);

router.get(
    "/self",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        authController.self(req as AuthRequest, res, next);
    },
);

router.post(
    "/googleOauth",
    (req: Request, res: Response, next: NextFunction) => {
        authController.googleOauth(req as AuthRequest, res, next);
    },
);

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
        session: false,
    }) as RequestHandler,
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: process.env.FRONTEND_URL + "/login",
    }) as RequestHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseGoogleData as any,
    (req: Request, res: Response, next: NextFunction) =>
        authController.socialAccount(req, res, next),
);

router.get(
    "/github",
    passport.authenticate("github", {
        scope: ["user:email"],
        session: false,
    }) as RequestHandler,
);

router.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "/login",
    }) as RequestHandler,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseGithubData as any,
    (req: Request, res: Response, next: NextFunction) =>
        authController.socialAccount(req, res, next),
);

export default router;
