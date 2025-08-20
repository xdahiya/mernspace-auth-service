"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
//validators import
const register_validator_1 = __importDefault(require("../validators/register-validator"));
const login_validator_1 = __importDefault(require("../validators/login-validator"));
//middlewares import
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const parseRefreshToken_1 = __importDefault(require("../middlewares/parseRefreshToken"));
const validateRefreshToken_1 = __importDefault(require("../middlewares/validateRefreshToken"));
const parseSocialAuthData_1 = require("../middlewares/parseSocialAuthData");
const container_1 = __importDefault(require("../container"));
const router = express_1.default.Router();
const container = (0, container_1.default)();
const authController = container.resolve("authController");
router.get("/nonce", (req, res, next) => {
    authController.nonce(req, res, next);
});
router.post("/verify", (req, res, next) => {
    authController.verifySignature(req, res, next);
});
router.post("/register", register_validator_1.default, async (req, res, next) => {
    await authController.register(req, res, next);
});
router.post("/login", login_validator_1.default, (req, res, next) => {
    authController.login(req, res, next);
});
router.post("/refresh", validateRefreshToken_1.default, (req, res, next) => {
    authController.refresh(req, res, next);
});
router.post("/logout", authenticate_1.default, parseRefreshToken_1.default, validateRefreshToken_1.default, (req, res, next) => {
    authController.logout(req, res, next);
});
router.get("/setupMfa", authenticate_1.default, (req, res, next) => {
    authController.generateMFASetup(req, res, next);
});
router.post("/sendVerifyEmail", authenticate_1.default, (req, res, next) => {
    authController.sendVerifyEmail(req, res, next);
});
router.post("/verifyEmail", authenticate_1.default, (req, res, next) => {
    authController.verifyEmail(req, res, next);
});
router.post("/changePassword", authenticate_1.default, (req, res, next) => {
    authController.changePassword(req, res, next);
});
router.post("/sendUserPasswordResetEmail", (req, res, next) => {
    authController.sendUserPasswordResetEmail(req, res, next);
});
router.post("/userPasswordReset", (req, res, next) => {
    authController.userPasswordReset(req, res, next);
});
router.post("/verifyMfa", authenticate_1.default, (req, res, next) => {
    authController.verifyMFASetup(req, res, next);
});
router.post("/revokeMfa", authenticate_1.default, (req, res, next) => {
    authController.revokeMFA(req, res, next);
});
router.post("/verifyLoginMfa", (req, res, next) => {
    authController.verifyMFAForLogin(req, res, next);
});
router.get("/self", authenticate_1.default, (req, res, next) => {
    authController.self(req, res, next);
});
router.post("/googleOauth", (req, res, next) => {
    authController.googleOauth(req, res, next);
});
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: process.env.FRONTEND_URL + "/login",
}), 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
parseSocialAuthData_1.parseGoogleData, (req, res, next) => authController.socialAccount(req, res, next));
router.get("/github", passport_1.default.authenticate("github", {
    scope: ["user:email"],
    session: false,
}));
router.get("/github/callback", passport_1.default.authenticate("github", {
    session: false,
    failureRedirect: "/login",
}), 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
parseSocialAuthData_1.parseGithubData, (req, res, next) => authController.socialAccount(req, res, next));
exports.default = router;
