import request from "supertest";
import { clearDb, insertWish, updateWish } from "../src/db";
import { terminateWorkers } from "../src/services/wishServices";
import { Wish } from "../src/types";
import app, { startServer, stopServer } from "./server";
import { v4 as uuidv4 } from "uuid";

const port = 3002;

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

describe("Check Wishes Status Endpoint", () => {
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

  it("should return queued status", async () => {
    const response = await request(app)
      .get(`/check-wishes-status/${uuid}`)
      .expect(200);

    console.log("Response body:", response.body);
    expect(response.body.status).toBe("queued");
  });

  it("should return in_progress status", async () => {
    await updateWish(uuid, {
      computation_started_at: new Date().toISOString(),
    });

    const response = await request(app)
      .get(`/check-wishes-status/${uuid}`)
      .expect(200);

    console.log("Response body:", response.body);
    expect(response.body.status).toBe("in_progress");
  });

  it("should return completed status", async () => {
    await updateWish(uuid, {
      computation_finished_at: new Date().toISOString(),
      pow_nonce: 12345,
      hash: "00abc123",
    });

    const response = await request(app)
      .get(`/check-wishes-status/${uuid}`)
      .expect(200);

    console.log("Response body:", response.body);
    expect(response.body.status).toBe("completed");
  });

  it("should return not_found status for invalid UUID", async () => {
    const response = await request(app)
      .get("/check-wishes-status/invalid-uuid")
      .expect(200);

    console.log("Response body:", response.body);
    expect(response.body.status).toBe("not_found");
  });
});
