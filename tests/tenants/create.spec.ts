import request from "supertest";
import app from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";

describe("POST /tenants", () => {
    let prismaClient: PrismaClient;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        prismaClient = new PrismaClient();
        prismaClient.$connect();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        await prismaClient.refreshToken.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.tenant.deleteMany();
        jwks.start();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        prismaClient.$disconnect();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Given all fields", () => {
        it("should return a 201 status code", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            //Arrange
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            //Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);

            // Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should create a tenant in the database", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenants = await prismaClient.tenant.findMany();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it("should return 401 if user is not autheticated", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .send(tenantData);
            expect(response.statusCode).toBe(401);

            const tenants = await prismaClient.tenant.findMany();

            expect(tenants).toHaveLength(0);
        });

        it("should return 403 if user is not an admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);
            expect(response.statusCode).toBe(403);

            const tenants = await prismaClient.tenant.findMany();

            expect(tenants).toHaveLength(0);
        });
    });
});
