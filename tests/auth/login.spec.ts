import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";
import { createUser, isJwt } from "../utils";

const ApiData = {
    firstName: "Rakesh",
    lastName: "K",
    email: "rakesh@mern.space",
    password: "password",
};

const ApiEndpoint = "/auth/login";

describe("POST /auth/login", () => {
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

    describe("All fileds should given", () => {
        it("should return the 200 status code", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post(ApiEndpoint)
                .send({ email: ApiData.email, password: ApiData.password });
            expect(response.statusCode).toBe(200);
        });

        it("should return valid json response", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post(ApiEndpoint)
                .send({ email: ApiData.email, password: ApiData.password });
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return the access token and refresh token", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post(ApiEndpoint)
                .send({ email: ApiData.email, password: ApiData.password });

            let accessToken = null;
            let refreshToken = null;

            const letUseHeadersCookies = false;

            if (letUseHeadersCookies) {
                const cookies = [response.body.refreshToken];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (cookies as any).forEach((cookie: any) => {
                    if (cookie.startsWith("accessToken=")) {
                        accessToken = cookie.split(";")[0].split("=")[1];
                    }
                    if (cookie.startsWith("refreshToken=")) {
                        refreshToken = cookie.split(";")[0].split("=")[1];
                    }
                });
            } else {
                accessToken = response.body.accessToken;
                refreshToken = response.body.refreshToken;
            }
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should return the 400 if email or password is wrong", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post(ApiEndpoint)
                .send({ email: ApiData.email, password: "wrongPassword" });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Email or password does not match.",
            );
        });
    });

    describe("Fields are missing or Not in Proper Format", () => {
        it("should return 400 status code if email field is missing", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: "",
                password: "Password@123",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("Email is required!");
            expect(response.body.errors[1].msg).toBe(
                "Email should be a valid email",
            );
        });

        it("should return 400 status code if password is missing", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: "rakesh@mern.space",
                password: "",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("Password is required!");
        });

        it("should return 400 status code if password is simple not in proper format", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: "rakesh@mern.space",
                password: "normal",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Password length should be at least 8 chars!",
            );
        });

        it("should return 400 status code if email is not a valid email", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: "rakesh_mern.space",
                password: "password",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Email should be a valid email",
            );
        });

        it("should return 400 status code if password length is less than 8 chars", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: "rakesh@mern.space",
                password: "pass",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Password length should be at least 8 chars!",
            );
        });

        it("should trim the all field", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const userData = {
                email: ` ${ApiData.email} `,
                password: ` ${ApiData.password} `,
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            expect(response.statusCode).toBe(200);
        });
    });
});
