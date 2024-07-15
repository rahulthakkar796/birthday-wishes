import { parentPort, workerData } from "worker_threads";
import crypto from "crypto";
import { WishRequest, WorkerResult } from "./types";

const { wishes, from, to }: WishRequest = workerData;
let pow_nonce = Math.floor(Math.random() * 100000);
let hash = "";

console.log(
  `Worker started for wishes: ${wishes}, from: ${from}, to: ${to}, starting nonce: ${pow_nonce}`
);

while (!hash.startsWith("00")) {
  pow_nonce++;
  const obj = { wishes, from, to, pow_nonce };
  hash = crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
  if (pow_nonce % 10000 === 0) {
    console.log(`Nonce: ${pow_nonce}, Hash: ${hash}`);
  }
}

console.log(`Worker finished. Nonce: ${pow_nonce}, Hash: ${hash}`);

const result: WorkerResult = { pow_nonce, hash };
parentPort?.postMessage(result);
