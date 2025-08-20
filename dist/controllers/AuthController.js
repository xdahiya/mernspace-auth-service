"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const express_validator_1 = require("express-validator");
const config_1 = require("../config");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const index_1 = require("../constants/index");
const siwe_1 = require("siwe");
class AuthController {
    logger;
    mfaService;
    userService;
    tokenService;
    constructor({ logger, mfaService, userService, tokenService, }) {
        this.logger = logger;
        this.mfaService = mfaService;
        this.userService = userService;
        this.tokenService = tokenService;
    }
    setAuthCookies(res, { accessToken, refreshToken, }) {
        try {
            res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            res.cookie("accessToken", accessToken, {
                expires: new Date(Date.now() + 1000 * 60 * 15),
                // httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.cookie("refreshToken", refreshToken, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                // httpOnly: true,
                secure: true,
                sameSite: "none",
            });
        }
        catch (error) {
            throw new Error("Could not set authentication cookies");
        }
    }
    async nonce(req, res, next) {
        try {
            const nonce = (0, siwe_1.generateNonce)();
            res.json({ nonce });
        }
        catch (error) {
            next(error);
        }
    }
    async verifySignature(req, res, next) {
        try {
            try {
                const { message, signature } = req.body;
                const siweMessage = new siwe_1.SiweMessage(message);
                const { data } = await siweMessage.verify({
                    signature,
                });
                const user = await this.userService.upsertweb3({
                    email: data.address,
                    role: constants_1.Roles.CUSTOMER,
                });
                if (!user) {
                    return (0, http_errors_1.default)(400, "user not ezists");
                }
                const userAgent = req.headers["user-agent"] || index_1.CONSTANTS.userAgent;
                const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
                const payload = {
                    sub: String(user.id),
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    refreshId: newRefreshToken.id,
                };
                const accessToken = this.tokenService.generateAccessToken(payload);
                const refreshToken = this.tokenService.generateRefreshToken({
                    ...payload,
                    id: String(newRefreshToken.id),
                });
                this.setAuthCookies(res, { refreshToken, accessToken });
                res.send({ address: data.address, chainId: data.chainId });
            }
            catch {
                return (0, http_errors_1.default)(401, "web3 signature not verified");
            }
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async register(req, res, next) {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.silly("Request for register", req.body);
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: constants_1.Roles.CUSTOMER,
            });
            this.logger.silly("User have been registered", {
                email,
                userId: user.id,
            });
            const userAgent = req.headers["user-agent"] || index_1.CONSTANTS.userAgent;
            const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
            const payload = {
                sub: String(user.id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                refreshId: newRefreshToken.id,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            this.setAuthCookies(res, { refreshToken, accessToken });
            res.status(201).json({ id: user.id, accessToken, refreshToken });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async login(req, res, next) {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.silly("Request for login", req.body);
        try {
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const error = (0, http_errors_1.default)(400, "Email or password does not match.");
                next(error);
                return;
            }
            const passwordMatch = await this.userService.comparePassword(password, user.password);
            if (!passwordMatch) {
                const error = (0, http_errors_1.default)(400, "Email or password does not match.");
                next(error);
                return;
            }
            if (user.enable2FA) {
                const mfaToken = this.tokenService.generateMfaLoginToken(user.id);
                this.logger.silly("User has been logged in with mfa token", {
                    email,
                    userId: user.id,
                });
                return res.json({
                    id: user.id,
                    mfaRequired: true,
                    mfaToken: mfaToken,
                });
            }
            const userAgent = req.headers["user-agent"] || index_1.CONSTANTS.userAgent;
            const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
            const payload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant ? String(user.tenant.id) : "",
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                refreshId: newRefreshToken.id,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            this.setAuthCookies(res, { accessToken, refreshToken });
            this.logger.silly("User has been logged in directly", {
                id: user.id,
            });
            res.json({
                id: user.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async self(req, res, next) {
        try {
            const user = await this.userService.getById(Number(req.auth.sub));
            res.json({ ...user });
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const userId = Number(req.auth.sub);
            const user = await this.userService.getById(userId);
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User with the token could not find");
                next(error);
                return;
            }
            await this.tokenService.setdeleteTimeInRefreshToken(Number(req.auth.refreshId), userId);
            const userAgent = req.headers["user-agent"] || index_1.CONSTANTS.userAgent;
            const oldRefreshToken = await this.tokenService.getRefreshTokenById(Number(req.auth.refreshId));
            const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent, oldRefreshToken?.firstCreatedAt);
            const payload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant,
                firstName: req.auth.firstName,
                lastName: req.auth.lastName,
                email: req.auth.email,
                refreshId: newRefreshToken.id,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            this.setAuthCookies(res, { accessToken, refreshToken });
            res.json({
                user,
                id: userId,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async generateMFASetup(req, res, next) {
        try {
            const user = await this.userService.getByIdWithoutTenant(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User not authorized");
                next(error);
                return;
            }
            const { secret, qrImageUrl, message } = await this.mfaService.generateMFASetup(user);
            return res.status(200).json({
                message,
                secret,
                qrImageUrl,
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async verifyMFASetup(req, res, next) {
        try {
            const { code } = req.body;
            const user = await this.userService.getByIdWithoutTenant(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User not found");
                next(error);
                return;
            }
            const { userPreferences, message } = await this.mfaService.verifyMFASetup(user, code, user.twoFactorSecret);
            return res.status(200).json({
                message: message,
                userPreferences: userPreferences,
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async revokeMFA(req, res, next) {
        try {
            const user = await this.userService.getByIdWithoutTenant(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User not found");
                next(error);
                return;
            }
            const { message, userPreferences } = await this.mfaService.revokeMFA(user);
            return res.status(200).json({
                message,
                userPreferences,
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async verifyMFAForLogin(req, res, next) {
        try {
            const { code, id, mfaToken } = req.body;
            const user = await this.userService.getByIdWithoutTenant(id);
            const result = await this.tokenService.verifyMfaLoginToken(id, mfaToken);
            if (!user || !result) {
                const error = (0, http_errors_1.default)(400, "User not authorized");
                next(error);
                return;
            }
            const verified = await this.mfaService.verifyMFAForLogin(user, code);
            if (!verified) {
                return res.status(401).json({ logged: false });
            }
            const user2 = await this.userService.getById(user.id);
            const userAgent = req.headers["user-agent"] || "user-agent";
            const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
            const payload = {
                sub: String(user.id),
                role: user.role,
                tenant: user2.tenant ? String(user2.tenant.id) : "",
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                refreshId: newRefreshToken.id,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            this.setAuthCookies(res, { accessToken, refreshToken });
            this.logger.info("User has been logged in with mfa", {
                id: user.id,
            });
            res.json({
                id: user.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    async sendVerifyEmail(req, res, next) {
        try {
            const user = await this.userService.getByIdWithoutTenant(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User not found");
                next(error);
                return;
            }
            const otp = await (0, utils_1.generateOtp)();
            const ttl = 1000 * 60 * 2; // 2 min
            const expires = Date.now() + ttl;
            const data = `${user.email}.${otp}.${expires}`;
            const hash = this.tokenService.hashOtp(data);
            const finalHash = `${hash}.${expires}`;
            return res.status(200).json({
                message: "email send click to verify",
                email: user.email,
                finalHash,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const user = await this.userService.getByIdWithoutTenant(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "User not found");
                next(error);
                return;
            }
            const { otp, hash } = req.body;
            const [hashedOtp, expires] = hash.split(".");
            if (Date.now() > +expires) {
                throw new Error("Otp EXPIRED");
            }
            const data = `${user.email}.${otp}.${expires}`;
            const isValid = this.tokenService.verifyOtp(hashedOtp, data);
            if (!isValid) {
                throw new Error("Otp NOT VALID");
            }
            return res.status(200).json({
                message: "Email Verified",
                email: user.email,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { password, password_confirmation } = req.body;
            const user = await this.userService.getById(Number(req.auth.sub));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "Email or password does not match.");
                next(error);
                return;
            }
            this.userService.updatePassword(user.id, password);
            res.json({
                message: `password successfully changed of ${user?.email}`,
            });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async sendUserPasswordResetEmail(req, res, next) {
        try {
            const { email } = req.body;
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const error = (0, http_errors_1.default)(400, "Email or password does not match.");
                next(error);
                return;
            }
            const token = await this.tokenService.generateResetPasswordToken(user.id);
            const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user.id}/${token}`;
            this.logger.info(`reset link is : ${resetLink}`);
            res.json({
                message: `password reset link sent to ${email}`,
            });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async userPasswordReset(req, res, next) {
        try {
            const { password, password_confirmation } = req.body;
            const { id, token } = req.params;
            const user = await this.userService.getById(Number(id));
            if (!user) {
                const error = (0, http_errors_1.default)(400, "Email or password does not match.");
                next(error);
                return;
            }
            const result = this.tokenService.verifyResetPasswordToken(user.id, token);
            if (!result) {
                const error = (0, http_errors_1.default)(400, "token not verified");
                next(error);
                return;
            }
            await this.userService.updatePassword(user.id, password);
            res.json({
                message: `password successfully changed of`,
            });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async logout(req, res, next) {
        try {
            try {
                await this.tokenService.setdeleteTimeInRefreshToken(Number(req.auth.id));
                this.logger.info("Refresh token has been deleted", {
                    id: req.auth.id,
                });
            }
            catch (error) {
                this.logger.info("Refresh Token  is already deleted ", error.message);
            }
            this.logger.info("User has been logged out", { id: req.auth.sub });
            res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.json({ msg: "user logged out successfully" });
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async googleOauth(req, res, next) {
        try {
            const { code } = req.body;
            try {
                const { email, name } = await this.userService.getUserDetails(code);
                const user = await this.userService.createSocial({
                    firstName: name,
                    email,
                    lastName: name,
                });
                const userAgent = req.headers["user-agent"] || "user-agent";
                const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
                const payload = {
                    sub: String(user.id),
                    role: user?.role,
                    tenant: "",
                    firstName: name,
                    lastName: name,
                    email: email,
                    refreshId: newRefreshToken.id,
                };
                const accessToken = this.tokenService.generateAccessToken(payload);
                const refreshToken = this.tokenService.generateRefreshToken({
                    ...payload,
                    id: String(newRefreshToken.id),
                });
                this.setAuthCookies(res, { accessToken, refreshToken });
                return res.status(200).json({
                    message: "success",
                    accessToken,
                    refreshToken,
                });
            }
            catch (err) {
                next(err);
                return;
            }
        }
        catch (err) {
            next(err);
            return;
        }
    }
    async socialAccount(req, res, next) {
        const { email, firstName, lastName, } = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.user;
        if (!email) {
            res.redirect(config_1.Config.CLIENT_UI_DOMAIN);
            return;
        }
        try {
            const user = await this.userService.createSocial({
                firstName,
                email,
                lastName,
            });
            const payload = {
                sub: String(user.id),
                role: user?.role,
                tenant: "",
                // tenant: user.tenant ? String(user.tenant.id) : "",
                firstName: firstName,
                lastName: lastName,
                email: email,
            };
            // console.log(payload);
            const accessToken = this.tokenService.generateAccessToken(payload);
            const userAgent = req.headers["user-agent"] || "user-agent";
            const newRefreshToken = await this.tokenService.persistRefreshToken(user.id, userAgent);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            this.setAuthCookies(res, { accessToken, refreshToken });
            res.redirect(`${config_1.Config.CLIENT_UI_DOMAIN}/api/auth/socialLogin?accessToken=${accessToken}&refreshToken=${refreshToken}`);
            return res.json({ message: "success" });
        }
        catch (err) {
            next(err);
            return;
        }
    }
}
exports.AuthController = AuthController;
