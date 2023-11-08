import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";

describe("POST /user/", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("ALL FIELDS GIVEN", () => {
        it("should return 201", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
                tenantId: "1",
            };
            const response2 = await request(app)
                .post("/user")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(user);
            expect(response2.statusCode).toBe(201);
        });

        it("tenant data should persist in databse", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
                tenantId: "1",
            };
            await request(app)
                .post("/user")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(user.firstName);
            expect(users[0].lastName).toBe(user.lastName);
            expect(users[0].email).toBe(user.email);
        });

        it("should create manager user ", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
                tenantId: "1",
            };
            await request(app)
                .post("/user")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it.skip("should return 401 if user not authenticated", async () => {
            const tenantData = {
                name: "tenant 1",
                address: "tenant 1 address",
            };
            const res = await request(app).post("/tenant").send(tenantData);
            expect(res.statusCode).toBe(401);

            const tenantRepo = connection.getRepository(Tenant);
            const tenants = await tenantRepo.find();

            expect(tenants).toHaveLength(0);
        });

        it.skip("should return 403 if user not admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });
            const tenantData = {
                name: "tenant 1",
                address: "tenant 1 address",
            };
            const response = await request(app)
                .post("/tenant")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(403);

            const tenantRepo = connection.getRepository(Tenant);
            const tenants = await tenantRepo.find();

            expect(tenants).toHaveLength(0);
        });

        it.skip("it should return id", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const res: { body: { id: number } } = await request(app)
                .post("/auth/register")
                .send(user);
            expect(res.body.id);
        });

        it.skip("it should return user role ", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it.skip("it should hash password ", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            expect(users[0].password).not.toBe(user.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it.skip("it should return error code 400 if email already exists ", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const userRepo = connection.getRepository(User);
            await userRepo.save({ ...user, role: Roles.CUSTOMER });

            const res = await request(app).post("/auth/register").send(user);
            const users = await userRepo.find();

            expect(res.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it.skip("it should return access token and refresh token cookies ", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

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

        it.skip("it should persist refresh token in db", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();
            // expect(refreshTokens).toHaveLength(1);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe.skip("NOT GIVEN ALL FIELDS", () => {
        it("should return 400 if email not provided", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.body).toHaveProperty("errors");

            expect((response.body as { errors: [] }).errors).toBeInstanceOf(
                Array,
            );

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 if firstname not provided", async () => {
            const user = {
                firstName: "",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 if lastname not provided", async () => {
            const user = {
                firstName: "user",
                lastName: "",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 if password not provided", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.statusCode).toBe(400);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(0);
        });
    });

    describe.skip("FIELDS ARE INPROPER FORMAT", () => {
        it("email should not contain whitespace", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: " user1@gmail.com ",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            const user0 = users[0];

            expect(user0.email).toBe("user1@gmail.com");
        });

        it("should return 400 if email is not valid", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.statusCode).toBe(400);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 if password length less than 8 chars", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            expect(response.statusCode).toBe(400);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            expect(users).toHaveLength(0);
        });
    });
});
