import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
// import fs from "fs";
// import path from "path";
// import createHttpError from "http-errors";
import { TokenService } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;

        this.logger.debug({
            firstName,
            lastName,
            email,
            password: "*******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("user has been registered ", { id: user.id });

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            return next(error);
        }
    }
}
