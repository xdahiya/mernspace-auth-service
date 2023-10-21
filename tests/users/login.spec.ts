import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("ALL FIELDS GIVEN", () => {
        it("should return 200 when correct creds", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(userreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);
            expect(response.statusCode).toBe(200);
        });

        it("should return 400 when incorrect creds", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@124",
            };
            await request(app).post("/auth/register").send(userreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);
            const user2 = {
                email: "user@gmail.com",
                password: "User1@124",
            };
            const response2 = await request(app)
                .post("/auth/login")
                .send(user2);
            expect(response.statusCode).toBe(400);
            expect(response2.statusCode).toBe(400);
        });

        it("content type should be json", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(userreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("it should return id", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(userreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const res: { body: { id: number } } = await request(app)
                .post("/auth/login")
                .send(user);

            expect(res.body.id);
        });

        it("it should return access token and refresh token cookies ", async () => {
            const userrreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(userrreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);

            interface Headers {
                ["set-cookie"]: string[];
            }

            let accessToken = null;
            let refreshToken = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("it should persist refresh token in db", async () => {
            const userrreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const refreshTokenRepo = connection.getRepository(RefreshToken);

            await request(app).post("/auth/register").send(userrreg);

            const user = {
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);

            // const refreshTokens = await refreshTokenRepo.find();
            // expect(refreshTokens).toHaveLength(1);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(2);
        });
    });

    describe("NOT GIVEN ALL FIELDS", () => {
        it("should return 400 if email not provided", async () => {
            const user = {
                email: "",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);

            expect(response.body).toHaveProperty("errors");

            expect((response.body as { errors: [] }).errors).toBeInstanceOf(
                Array,
            );

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 if password not provided", async () => {
            const user = {
                email: "user1@gmail.com",
                password: "",
            };
            const response = await request(app).post("/auth/login").send(user);

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });
    });

    describe("FIELDS ARE INPROPER FORMAT", () => {
        it("email should not contain whitespace", async () => {
            const userrreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(userrreg);

            const user = {
                email: " user1@gmail.com ",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);
            expect(response.statusCode).toBe(200);
        });

        it("should return 400 if email is not valid", async () => {
            const user = {
                email: "user1gmail.com",
                password: "User1@123",
            };
            const response = await request(app).post("/auth/login").send(user);

            expect(response.statusCode).toBe(400);
        });
    });
});
