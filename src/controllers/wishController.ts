import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Wish } from "../types";
import {
  addToQueue,
  getResultFromDb,
  getStatus,
} from "../services/wishServices";
export const prepareWishes = async (req: Request, res: Response) => {
  try {
    const { wishes, from, to } = req.body;
    const wish: Wish = {
      uuid: uuidv4(),
      wishes,
      from,
      to,
      computation_started_at: undefined,
      hash: undefined,
      pow_nonce: undefined,
      computation_finished_at: undefined,
    };
    await addToQueue(wish);
    res.status(200).json({ uuid: wish.uuid });
  } catch (err) {
    console.error("Error in prepareWishes:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkWishesStatus = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const status = await getStatus(uuid);
    res.status(200).json({ status });
  } catch (err) {
    console.error("Error in checkWishesStatus:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getResult = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const result = await getResultFromDb(uuid);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: "Result not found" });
    }
  } catch (err) {
    console.error("Error in getResult:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleNotFound = (req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
};
