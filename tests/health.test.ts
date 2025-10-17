import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../src/api/server";

describe("GET /health", () => {
    const app = createApp();

    it("returns status ok", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status", "ok");
        expect(typeof res.body.uptime).toBe("number");
    });
});