import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { RefreshToken } from "../../src/entity/RefreshToken";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /auth/logout", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("ALL FIELDS GIVEN", () => {
        it.skip("should return 200 ", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const response2 = await request(app)
                .post("/auth/logout")
                .set("Cookie", [`accessToken=${accessToken}`]);

            expect(response2.statusCode).toBe(200);
        });

        it.skip("should remove refresh token from the database", async () => {
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

            await request(app)
                .post("/auth/logout")
                .set("Cookie", [
                    `accessToken=${accessToken}`,
                    `refreshToken=${refreshToken}`,
                ])
                .send(userreg);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(0);
        });

        it("should return 401 when incorrect token", async () => {
            const response2 = await request(app)
                .post("/auth/logout")
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
