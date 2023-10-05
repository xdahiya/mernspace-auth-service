import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
    describe("ALL FIELDS GIVEN", () => {
        it("should return 201", async () => {
            const user = {
                firstName: "user",
                lastName: "1",
                email: "user1@gmail.com",
                passwor: "User1@123",
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
                passwor: "User1@123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(user);
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
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
