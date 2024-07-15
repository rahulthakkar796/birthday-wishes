import request from "supertest";
import app, { startServer, stopServer } from "./server";
import { clearDb } from "../src/db";

const port = 3001;

beforeAll(async () => {
  await startServer(port);
});

afterAll(async () => {
  await clearDb();
  await stopServer();
});

describe("Prepare Wishes Endpoint", () => {
  it("should prepare wishes and return a UUID", async () => {
    const response = await request(app)
      .post("/prepare-wishes")
      .send({ wishes: "Happy Birthday", from: "Alice", to: "Bob" })
      .expect(200);

    expect(response.body.uuid).toBeDefined();
  });
});
