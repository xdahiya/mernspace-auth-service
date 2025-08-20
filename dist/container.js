"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
exports.default = configureContainer;
const awilix_1 = require("awilix");
const client_1 = require("@prisma/client");
const services_1 = require("./services");
const AuthController_1 = require("./controllers/AuthController");
const logger_1 = __importDefault(require("./config/logger"));
const UserController_1 = require("./controllers/UserController");
const TenantController_1 = require("./controllers/TenantController");
const services_2 = require("./services");
const SessionController_1 = require("./controllers/SessionController");
// const prismaClient = new PrismaClient();
let prismaClientInstance;
// Create a singleton instance of PrismaClient
function getPrismaClient() {
    if (!prismaClientInstance) {
        prismaClientInstance = new client_1.PrismaClient();
        // prismaClientInstance.$on('beforeExit', async () => {
        //     await prismaClientInstance.$disconnect();
        // });
    }
    return prismaClientInstance;
}
const container = (0, awilix_1.createContainer)({
    strict: true,
    injectionMode: awilix_1.InjectionMode.PROXY,
});
exports.container = container;
let isConfigured = false;
function configureContainer() {
    if (!isConfigured) {
        const prismaClient = getPrismaClient();
        container.register({
            prismaClient: (0, awilix_1.asValue)(prismaClient),
            logger: (0, awilix_1.asValue)(logger_1.default),
            userService: (0, awilix_1.asClass)(services_1.UserServicePrimsa).singleton(),
            tenantService: (0, awilix_1.asClass)(services_1.TenantServicePrimsa).singleton(),
            tokenService: (0, awilix_1.asClass)(services_1.TokenServicePrisma).singleton(),
            mfaService: (0, awilix_1.asClass)(services_2.MfaService).singleton(),
            authController: (0, awilix_1.asClass)(AuthController_1.AuthController).singleton(),
            userController: (0, awilix_1.asClass)(UserController_1.UserController).singleton(),
            tenantController: (0, awilix_1.asClass)(TenantController_1.TenantController).singleton(),
            sessionController: (0, awilix_1.asClass)(SessionController_1.SessionController).singleton(),
        });
        logger_1.default.info("dependency injected successfully");
        isConfigured = true;
    }
    return container;
}
