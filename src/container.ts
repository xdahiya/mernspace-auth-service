import { createContainer, asClass, InjectionMode, asValue } from "awilix";

import { PrismaClient } from "@prisma/client";

import {
    UserServicePrimsa,
    TokenServicePrisma,
    TenantServicePrimsa,
} from "./services";

import { AuthController } from "./controllers/AuthController";

import logger from "./config/logger";
import { UserController } from "./controllers/UserController";
import { TenantController } from "./controllers/TenantController";
import { MfaService } from "./services";
import { SessionController } from "./controllers/SessionController";
// const prismaClient = new PrismaClient();

let prismaClientInstance: PrismaClient;

// Create a singleton instance of PrismaClient
function getPrismaClient() {
    if (!prismaClientInstance) {
        prismaClientInstance = new PrismaClient();
        // prismaClientInstance.$on('beforeExit', async () => {
        //     await prismaClientInstance.$disconnect();
        // });
    }
    return prismaClientInstance;
}

const container = createContainer({
    strict: true,
    injectionMode: InjectionMode.PROXY,
});

let isConfigured = false;

export default function configureContainer() {
    if (!isConfigured) {
        const prismaClient = getPrismaClient();
        container.register({
            prismaClient: asValue(prismaClient),
            logger: asValue(logger),
            userService: asClass(UserServicePrimsa).singleton(),
            tenantService: asClass(TenantServicePrimsa).singleton(),
            tokenService: asClass(TokenServicePrisma).singleton(),
            mfaService: asClass(MfaService).singleton(),
            authController: asClass(AuthController).singleton(),
            userController: asClass(UserController).singleton(),
            tenantController: asClass(TenantController).singleton(),
            sessionController: asClass(SessionController).singleton(),
        });
        logger.info("dependency injected successfully");
        isConfigured = true;
    }
    return container;
}

export { container };
