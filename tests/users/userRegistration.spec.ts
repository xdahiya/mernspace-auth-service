import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
// import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();
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
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);
            expect(response.statusCode).toBe(201);
        });

        it("content type should be json", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("data should persist in databse", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@123",
            };
            await request(app).post("/auth/register").send(user);

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(user.firstName);
            expect(users[0].lastName).toBe(user.lastName);
            expect(users[0].email).toBe(user.email);
        });

        it("it should return id", async () => {
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

        it("it should return user role ", async () => {
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

        it("it should hash password ", async () => {
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

        it("it should return error code 400 if email already exists ", async () => {
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

        it("it should return access token and refresh token cookies ", async () => {
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
    });

    describe("NOT GIVEN ALL FIELDS", () => {
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

    describe("FIELDS ARE INPROPER FORMAT", () => {
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
