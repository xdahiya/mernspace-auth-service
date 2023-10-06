import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
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

        it("content type shoul be json", async () => {
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
            // console.log("RESPONSE IS :", res.body);

            // const userRepo = connection.getRepository(User);
            // const users = await userRepo.find();
            // expect(users).toHaveLength(1);
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
    });

    // describe("NOT GIVEN ALL FIELDS",()=>{
    //     it("should return 201", async () => {
    //         const user = {
    //             firstName:"user",
    //             lastName:"1",
    //             email:"user1@gmail.com",
    //             passwor:"User1@123"
    //         }
    //         const response = await request(app).post("/auth/register").send(user);
    //         expect(response.statusCode).toBe(201);
    //     });
    // })
});
