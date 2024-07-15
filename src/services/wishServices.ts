import { Worker } from "worker_threads";
import { insertWish, updateWish, getWish } from "../db";
import { Wish, WorkerResult } from "../types";

const queue: Wish[] = [];
const MAX_WORKERS = 10;
let activeWorkers = 0;
const workers: Worker[] = [];

export const addToQueue = async (wish: Wish): Promise<void> => {
  try {
    console.log(`Adding wish to queue: ${JSON.stringify(wish)}`);
    await insertWish(wish);
    queue.push(wish);
    processQueue();
  } catch (err) {
    console.error("Error adding to queue:", err);
    throw new Error("Failed to add to queue");
  }
};

export const getActiveWorkersCount = (): number => {
  return activeWorkers;
};

const incrementActiveWorkers = (): void => {
  activeWorkers++;
  console.log(`Incremented active workers: ${activeWorkers}`);
};

const decrementActiveWorkers = (): void => {
  if (activeWorkers > 0) {
    activeWorkers--;
    console.log(`Decremented active workers: ${activeWorkers}`);
  } else {
    console.warn(
      "Active workers count is already zero. Cannot decrement further."
    );
  }
};

const processQueue = (): void => {
  console.log(
    `Active workers: ${activeWorkers}, Queue length: ${queue.length}`
  );
  if (activeWorkers < MAX_WORKERS && queue.length > 0) {
    const wish = queue.shift()!;
    console.log(`Processing wish from queue: ${JSON.stringify(wish)}`);
    incrementActiveWorkers();
    const worker = new Worker(require.resolve("../worker.ts"), {
      execArgv: ["-r", "ts-node/register"],
      workerData: wish,
    });

    workers.push(worker);

    updateWish(wish.uuid, {
      computation_started_at: new Date().toISOString(),
    }).catch((err) => {
      console.error("Error updating wish on start:", err);
    });

    worker.on("message", async (result: WorkerResult) => {
      try {
        console.log(`Worker finished for wish: ${JSON.stringify(wish)}`);
        await updateWish(wish.uuid, {
          computation_finished_at: new Date().toISOString(),
          pow_nonce: result.pow_nonce,
          hash: result.hash,
          done_by_worker_id: worker.threadId.toString(),
        });
      } catch (err) {
        console.error("Error updating wish on finish:", err);
      }
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      decrementActiveWorkers();
      processQueue();
    });

    worker.on("error", (error: Error) => {
      console.error("Worker error:", error);
      worker.terminate().then(() => {
        decrementActiveWorkers();
        processQueue();
      });
    });
  }
};

export const terminateWorkers = async () => {
  await Promise.all(workers.map((worker) => worker.terminate()));
};

export const getStatus = async (uuid: string): Promise<string> => {
  console.log(`Checking status for UUID: ${uuid}`);
  const wish = await getWish(uuid);
  if (!wish) {
    console.log(`Wish not found for UUID: ${uuid}`);
    return "not_found";
  }
  if (wish.computation_finished_at) {
    return "completed";
  }
  if (wish.computation_started_at) {
    return "in_progress";
  }
  return "queued";
};

export const getResultFromDb = async (
  uuid: string
): Promise<WorkerResult | null> => {
  try {
    console.log(`Fetching result from DB for UUID: ${uuid}`);
    const wish = await getWish(uuid);
    if (
      !wish ||
      !wish.computation_finished_at ||
      wish.pow_nonce === undefined ||
      wish.hash === undefined
    ) {
      return null;
    }
    return { pow_nonce: wish.pow_nonce, hash: wish.hash };
  } catch (err) {
    console.error("Error getting result from DB:", err);
    throw new Error("Failed to get result from DB");
  }
};
