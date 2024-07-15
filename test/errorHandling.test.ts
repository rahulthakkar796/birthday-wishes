import request from "supertest";
import { clearDb } from "../src/db";
import app, { startServer, stopServer } from "./server";

const port = 3003;

beforeAll(async () => {
  await startServer(port);
});

afterAll(async () => {
  await clearDb();
  await stopServer();
});

describe("Error Handling", () => {
  it("should handle errors gracefully", async () => {
    const response = await request(app)
      .get("/non-existent-endpoint")
      .expect(404);

    expect(response.body).toEqual({ error: "Not Found" });
  });
});
