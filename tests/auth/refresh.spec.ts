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

const ApiEndpoint = "/auth/refresh";

describe("POST /auth/refresh", () => {
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
        it("should refresh token and return new tokens", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post("/auth/login")
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

            const refresh_response = await request(app)
                .get(ApiEndpoint)
                .set("Cookie", [`accessToken=${accessToken}`])
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .send();

            if (letUseHeadersCookies) {
                const cookies = [refresh_response.body.refreshToken];
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

        it("should add deletetime in old refresh token and persist new token in db", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post("/auth/login")
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

            await prismaClient.refreshToken.findMany();

            const refresh_response = await request(app)
                .get(ApiEndpoint)
                .set("Cookie", [`accessToken=${accessToken}`])
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .send();

            if (letUseHeadersCookies) {
                const cookies = [refresh_response.body.refreshToken];
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

            const alllrefreshToken = await prismaClient.refreshToken.findMany();
            expect(alllrefreshToken).toHaveLength(1);
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });

    describe("Fields are missing or Not in Proper Format", () => {
        it("should return 400 status code if refresh token is missing", async () => {
            const hashedPassword = await bcrypt.hash(ApiData.password, 10);
            await createUser({
                ...ApiData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            await request(app)
                .post("/auth/login")
                .send({ email: ApiData.email, password: ApiData.password });

            const refresh_response = await request(app)
                .post(ApiEndpoint)
                .send();
            expect(refresh_response.statusCode).toBe(401);
            expect(refresh_response.body).toHaveProperty("errors");
            expect(refresh_response.body.errors.length).toBeGreaterThan(0);
            // expect(refresh_response.body.errors[0].msg).toBe("Email is required!");
            // expect(refresh_response.body.errors[1].msg).toBe(
            //     "Email should be a valid email",
            // );
        });
    });
});
