import { discount } from "./utils";
import request from "supertest";
import app from "./app";

describe("APP", () => {
    it("should calculate discount", () => {
        const result = discount(100, 10);
        expect(result).toBe(10);
    });

    it("should return 200", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
