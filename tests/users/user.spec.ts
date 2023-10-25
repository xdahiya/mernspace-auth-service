import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

// import { isJwt } from "../utils";
// import { RefreshToken } from "../../src/entity/RefreshToken";

describe("GET /auth/self", () => {
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
        it("should return 200 status code", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it("should return user", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@124",
            };

            const userRepo = connection.getRepository(User);
            const data = await userRepo.save({
                ...userreg,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should return not return password", async () => {
            const userreg = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                password: "User1@124",
            };

            const userRepo = connection.getRepository(User);
            const data = await userRepo.save({
                ...userreg,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
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
