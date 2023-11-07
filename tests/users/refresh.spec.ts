import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/refresh", () => {
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
        it("should return 200 ", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userreg);

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

            const response2 = await request(app)
                .post("/auth/refresh")
                .set("Cookie", [
                    `accessToken=${accessToken}`,
                    `refreshToken=${refreshToken}`,
                ])
                .send(userreg);

            expect(response2.statusCode).toBe(200);
            // expect(accessToken).not.toBeNull();
            // expect(refreshToken).not.toBeNull();
        });

        it("should return new refreshtoken and accesstoken and delete old ", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userreg);

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

            const refreshTokenRepo = connection.getRepository(RefreshToken);

            const response2 = await request(app)
                .post("/auth/refresh")
                .set("Cookie", [
                    `accessToken=${accessToken}`,
                    `refreshToken=${refreshToken}`,
                ])
                .send(userreg);

            let accessToken2 = null;
            let refreshToken2 = null;
            const cookies2 = (response2.headers as Headers)["set-cookie"] || [];

            cookies2.forEach((cookie) => {
                if (cookie.startsWith("accessToken")) {
                    accessToken2 = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken")) {
                    refreshToken2 = cookie.split(";")[0].split("=")[1];
                }
            });

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);

            expect(accessToken2).not.toBeNull();
            expect(refreshToken2).not.toBeNull();
            expect(isJwt(accessToken2)).toBeTruthy();
            expect(isJwt(refreshToken2)).toBeTruthy();
            expect(refreshToken).not.toBe(refreshToken2);
        });

        it("should return 401 when incorrect token", async () => {
            const response2 = await request(app)
                .post("/auth/refresh")
                .set("Cookie", [
                    `accessToken=frfgt3gbfhkjrefgwhrfvgrhf`,
                    `refreshToken=f4bferfbwherbfwrehfwerfher `,
                ]);

            expect(response2.statusCode).toBe(401);
        });
    });

    describe.skip("NOT GIVEN ALL FIELDS", () => {
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

    describe.skip("FIELDS ARE INPROPER FORMAT", () => {
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
