import request from "supertest";
import createJWKSMock from "mock-jwks";

import app from "../../src/app";
import { Roles } from "../../src/constants";
import { createTenant } from "../utils";
import { PrismaClient, Tenant } from "@prisma/client";

let ApiData = {
    firstName: "Rakesh",
    lastName: "K",
    email: "rakesh@mern.space",
    password: "password",
    tenantId: 1,
    role: Roles.MANAGER,
};
const ApiEndpoint = "/users";

describe("POST /users", () => {
    let prismaClient: PrismaClient;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken = "";
    let tenant: Tenant;

    beforeAll(async () => {
        prismaClient = new PrismaClient();
        prismaClient.$connect();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        await prismaClient.refreshToken.deleteMany();
        await prismaClient.tenant.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.tenant.deleteMany();
        jwks.start();

        tenant = await createTenant();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });

        ApiData = {
            firstName: "Rakesh",
            lastName: "K",
            email: "rakesh@mern.space",
            password: "password",
            tenantId: tenant.id,
            role: Roles.MANAGER,
        };
    });

    afterAll(async () => {
        prismaClient.$disconnect();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            const response = await request(app)
                .post(ApiEndpoint)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            // Add token to cookie
            const response = await request(app)
                .post(ApiEndpoint)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(ApiData);

            // Assert application/json utf-8
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist the user in the database", async () => {
            // Add token to cookie
            await request(app)
                .post(ApiEndpoint)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(ApiData);

            const users = await prismaClient.user.findMany();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(ApiData.email);
        });

        it("should create a manager user", async () => {
            // Add token to cookie
            await request(app)
                .post(ApiEndpoint)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(ApiData);
            const users = await prismaClient.user.findMany();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it("should return 403 if non admin user tries to create a user", async () => {
            // Create tenant first
            const nonAdminToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            // Add token to cookie
            const response = await request(app)
                .post(ApiEndpoint)
                .set("Cookie", [`accessToken=${nonAdminToken}`])
                .send(ApiData);

            expect(response.statusCode).toBe(403);

            const users = await prismaClient.user.findMany();

            expect(users).toHaveLength(0);
        });
    });
});
