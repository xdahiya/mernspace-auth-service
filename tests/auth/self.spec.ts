import request from "supertest";
import createJWKSMock from "mock-jwks";

import app from "../../src/app";
import { Roles } from "../../src/constants";
import { PrismaClient } from "@prisma/client";
import { createUser } from "../utils";

const ApiData = {
    firstName: "Rakesh",
    lastName: "K",
    email: "rakesh@mern.space",
    password: "password",
};

const ApiEndpoint = "/auth/self";

describe("GET /auth/self", () => {
    let prismaClient: PrismaClient;
    let jwks: ReturnType<typeof createJWKSMock>;

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
    });

    afterAll(async () => {
        prismaClient.$disconnect();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const userCreated = await createUser({
                ...ApiData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(userCreated.id),
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get(ApiEndpoint)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return valid json response", async () => {
            const userCreated = await createUser({
                ...ApiData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(userCreated.id),
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get(ApiEndpoint)
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return the user data and not user password", async () => {
            const userCreated = await createUser({
                ...ApiData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(userCreated.id),
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect(response.body.id).toBe(userCreated.id);
            expect(response.body.email).toBe(userCreated.email);
            expect(response.body.firstName).toBe(userCreated.firstName);
            expect(response.body.lastName).toBe(userCreated.lastName);
            expect(response.body.role).toBe(userCreated.role);
            expect(response.body).not.toHaveProperty("password");
        });

        it("should return 401 status code if token does not exists", async () => {
            await createUser({
                ...ApiData,
                role: Roles.CUSTOMER,
            });

            const response = await request(app).get(ApiEndpoint).send();
            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "No authorization token was found",
            );
        });
    });
});
