import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("health endpoints", () => {
  it("returns a live success envelope without checking dependencies", async () => {
    const checkReadiness = vi.fn(async () => false);
    const response = await request(createApp({ checkReadiness })).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/i);
    expect(response.body).toEqual({
      success: true,
      message: "Service is live",
      data: { status: "live" },
    });
    expect(checkReadiness).not.toHaveBeenCalled();
  });

  it("returns 503 when a required dependency is not ready", async () => {
    const response = await request(createApp({ checkReadiness: async () => false })).get(
      "/health/ready",
    );

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      message: "Service is not ready",
      errors: [{ dependency: "database", status: "not_ready" }],
    });
  });

  it("returns a success envelope when dependencies are ready", async () => {
    const response = await request(createApp({ checkReadiness: async () => true })).get(
      "/health/ready",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Service is ready",
      data: { status: "ready" },
    });
  });
});

describe("API response conventions", () => {
  it("keeps the versioned namespace available without inventing business routes", async () => {
    const response = await request(createApp()).get("/api/v1/example");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
      errors: [],
    });
  });

  it("returns the standard JSON 404 envelope for unknown paths", async () => {
    const response = await request(createApp()).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
      errors: [],
    });
  });
});
