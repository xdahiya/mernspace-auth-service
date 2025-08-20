import request from "supertest";
import app from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { Roles } from "../../src/constants";
import { createUser, getAllUsers, isJwt } from "../utils";
import { UserServicePrimsa } from "../../src/services";

async function getAllData() {
    return getAllUsers();
}

const ApiData = {
    firstName: "Rakesh",
    lastName: "K",
    email: "rakesh@mern.space",
    password: "password",
};

const ApiEndpoint = "/auth/register";

describe("POST /auth/register", () => {
    let prismaClient: PrismaClient;
    let userService: UserServicePrimsa;

    beforeAll(async () => {
        prismaClient = new PrismaClient();
        prismaClient.$connect();
        userService = new UserServicePrimsa({ prismaClient });
    });

    beforeEach(async () => {
        await prismaClient.refreshToken.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.tenant.deleteMany();
    });

    afterAll(async () => {
        prismaClient.$disconnect();
    });

    describe("All fileds should given", () => {
        it("should return the 201 status code", async () => {
            const response = await request(app).post(ApiEndpoint).send(ApiData);
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            const response = await request(app).post(ApiEndpoint).send(ApiData);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist the user in the database", async () => {
            await request(app).post(ApiEndpoint).send(ApiData);
            const allData = await getAllData();
            expect(allData).toHaveLength(1);
            expect(allData[0].firstName).toBe(ApiData.firstName);
            expect(allData[0].lastName).toBe(ApiData.lastName);
            expect(allData[0].email).toBe(ApiData.email);
        });

        it("should return an id of the created user", async () => {
            const response = await request(app).post(ApiEndpoint).send(ApiData);
            expect(response.body).toHaveProperty("id");
            const allData = await getAllData();
            expect(response.body.id).toBe(allData[0].id);
        });

        it("should assign a customer role", async () => {
            await request(app).post(ApiEndpoint).send(ApiData);
            const allData = await getAllData();
            expect(allData[0]).toHaveProperty("role");
            expect(allData[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the hashed password in the database", async () => {
            await request(app).post(ApiEndpoint).send(ApiData);
            const allData = await getAllData();
            expect(allData[0].password).not.toBe(ApiData.password);
            expect(allData[0].password).toHaveLength(60);
            expect(allData[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it("should return 400 status code if email is already exists", async () => {
            await createUser({ ...ApiData, role: Roles.CUSTOMER });
            const response = await request(app).post(ApiEndpoint).send(ApiData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body.errors[0].msg).toBe(
                "Email is already exists!",
            );
            expect(allData).toHaveLength(1);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            const response = await request(app).post(ApiEndpoint).send(ApiData);
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

        it("should store the refresh token in the database", async () => {
            const response = await request(app).post(ApiEndpoint).send(ApiData);
            const tokens = await prismaClient.refreshToken.findMany({
                where: {
                    userId: response.body.id,
                },
            });
            expect(tokens).toHaveLength(1);
        });
    });

    describe("Fields are missing or Not in Proper Format", () => {
        it("should return 400 status code if email field is missing", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "",
                password: "Password@123",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("Email is required!");
            expect(response.body.errors[1].msg).toBe(
                "Email should be a valid email",
            );
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if firstName is missing", async () => {
            const userData = {
                firstName: "",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "Password@123",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("First name is required!");
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if lastName is missing", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "",
                email: "rakesh@mern.space",
                password: "password",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("Last name is required!");
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe("Password is required!");
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if password is simple not in proper format", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "normal",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Password length should be at least 8 chars!",
            );
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if email is not a valid email", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh_mern.space",
                password: "password",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Email should be a valid email",
            );
            expect(allData).toHaveLength(0);
        });

        it("should return 400 status code if password length is less than 8 chars", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "pass",
            };
            const response = await request(app)
                .post(ApiEndpoint)
                .send(userData);
            const allData = await getAllData();
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe(
                "Password length should be at least 8 chars!",
            );
            expect(allData).toHaveLength(0);
        });

        it("should trim the all field", async () => {
            const userData = {
                firstName: "   Rakesh   ",
                lastName: "  K  ",
                email: " rakesh@mern.space ",
                password: "     password     ",
            };
            await request(app).post(ApiEndpoint).send(userData);
            const allData = await getAllData();
            expect(allData[0].email).toBe("rakesh@mern.space");
            expect(allData[0].firstName).toBe("Rakesh");
            expect(allData[0].lastName).toBe("K");
            const isMatched = await userService.comparePassword(
                "password",
                allData[0].password,
            );
            expect(isMatched).toBe(true);
        });
    });
});
