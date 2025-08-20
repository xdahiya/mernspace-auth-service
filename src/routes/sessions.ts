import express, { NextFunction, RequestHandler, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { Request } from "express-jwt";
import configureContainer from "../container";

const router = express.Router();

const container = configureContainer();
const sessionsController = container.resolve("sessionController");

router.get(
    "/",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) => {
        sessionsController.getAll(req, res, next);
    },
);

router.delete("/:id", authenticate as RequestHandler, (req, res, next) => {
    sessionsController.destroy(req, res, next);
});

export default router;
