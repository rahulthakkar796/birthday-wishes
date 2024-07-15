import request from "supertest";
import { clearDb, insertWish, updateWish } from "../src/db";
import { terminateWorkers } from "../src/services/wishServices";
import { Wish } from "../src/types";
import app, { startServer, stopServer } from "./server";
import { v4 as uuidv4 } from "uuid";

const port = 3004;

beforeAll(async () => {
  await startServer(port);
});

afterAll(async () => {
  await clearDb();
  await stopServer();
});

afterEach(async () => {
  await terminateWorkers();
});

describe("Get Result Endpoint", () => {
  let uuid: string;

  beforeEach(async () => {
    uuid = uuidv4();
    const wish: Wish = {
      uuid,
      wishes: "Test Wish",
      from: "Alice",
      to: "Bob",
      computation_started_at: undefined,
      hash: undefined,
      pow_nonce: undefined,
      computation_finished_at: undefined,
    };
    await insertWish(wish);
  });

  it("should return the result for the completed UUID", async () => {
    await updateWish(uuid, {
      computation_finished_at: new Date().toISOString(),
      pow_nonce: 12345,
      hash: "00abc123",
    });

    const response = await request(app).get(`/get-result/${uuid}`).expect(200);

    console.log("Response body:", response.body);
    expect(response.body.pow_nonce).toBe(12345);
    expect(response.body.hash).toBe("00abc123");
  });

  it("should return not found error for invalid UUID", async () => {
    const response = await request(app)
      .get("/get-result/invalid-uuid")
      .expect(404);

    console.log("Response body:", response.body);
    expect(response.body.error).toBe("Result not found");
  });
});
