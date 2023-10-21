import { NextFunction, Response } from "express";
import { LoginUserRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
// import fs from "fs";
// import path from "path";
// import createHttpError from "http-errors";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialsService } from "../services/CredentialsService";

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private credentialsService: CredentialsService,
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

        this.logger.debug("REQUEST TO REGISTER A USER", {
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

    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;

        this.logger.debug("NEW REQUEST TO LOGIN A USER", {
            email,
            password: "*******",
        });

        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email Or Password dont match",
                );
                return next(error);
            }

            const matchedPassword =
                await this.credentialsService.comparePassword(
                    password,
                    user.password,
                );

            if (!matchedPassword) {
                const error = createHttpError(
                    400,
                    "Email Or Password dont match",
                );
                return next(error);
            }

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

            this.logger.info("user has been logged in  ", { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (error) {
            return next(error);
        }
    }
}
