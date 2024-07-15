import express, { Application } from "express";
import { Server } from "http";
import { initDb, closeDb } from "../src/db";
import routes from "../src/routes/wishRoutes";
import { terminateWorkers } from "../src/services/wishServices";

const app: Application = express();
let server: Server | null = null;

app.use(express.json());
app.use(routes);

export const startServer = async (port: number) => {
  await initDb();
  return new Promise<void>((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
};

export const stopServer = async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close(async (err) => {
        if (err) {
          console.error("Error closing the server", err);
          reject(err);
        } else {
          await terminateWorkers();
          await closeDb();
          resolve();
        }
      });
    });
    server = null;
  }
};

export default app;
